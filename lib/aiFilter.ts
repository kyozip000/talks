import { GoogleGenerativeAI } from '@google/generative-ai';
import { NaverNewsItem } from './newsCollector';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface FilteredTopic {
  original_title: string;
  is_safe: boolean;
  talk_topic: string;
  description: string;
  conversation_tip?: string;
  category: 'entertain' | 'sports' | 'food' | 'tech' | 'life';
  situation: ('company' | 'date' | 'friend')[];
  age_group: '20s' | '30s' | '40s' | 'all';
}

export async function filterTopicsWithAI(
  newsList: NaverNewsItem[]
): Promise<FilteredTopic[]> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
  });

  // 10개씩 배치 처리 (5 → 10)
  const batchSize = 10;
  const allResults: FilteredTopic[] = [];

  // 처리할 뉴스 개수 늘리기 (20 → 50)
  for (let i = 0; i < Math.min(newsList.length, 50); i += batchSize) {
    const batch = newsList.slice(i, i + batchSize);
    
    try {
      const prompt = `다음 뉴스를 분석하여 스몰토크 주제로 변환해주세요.

**제외:** 정치, 종교, 사건사고, 논란
**포함:** 연예, 스포츠, 음식, IT, 라이프

뉴스:
${batch.map((n, idx) => `${idx + 1}. ${n.title}`).join('\n')}

반드시 다음 JSON 형식으로만 답변:
[{"original_title":"제목","is_safe":true,"talk_topic":"질문형태","description":"설명","category":"entertain","situation":["company"],"age_group":"all"}]

JSON만 반환. 추가 설명 금지.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      console.log(`Batch ${i / batchSize + 1} response:`, text.substring(0, 200));

      // JSON 추출
      let jsonStr = text;
      
      // Markdown 코드블록 제거
      if (text.includes('```')) {
        const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match) {
          jsonStr = match[1];
        }
      }

      // JSON 배열 찾기
      const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        jsonStr = arrayMatch[0];
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const safe = Array.isArray(parsed) 
          ? parsed.filter(t => t.is_safe === true)
          : [];
        
        allResults.push(...safe);
        console.log(`Batch ${i / batchSize + 1}: Added ${safe.length} topics`);
      } catch (parseError) {
        console.error(`Parse error in batch ${i / batchSize + 1}:`, parseError);
        console.error('Text was:', jsonStr.substring(0, 500));
      }

      // Rate limit 방지
      if (i + batchSize < Math.min(newsList.length, 20)) {
        await new Promise(r => setTimeout(r, 2000));
      }

    } catch (error: any) {
      console.error(`Batch ${i / batchSize + 1} error:`, error.message);
    }
  }

  console.log(`Total filtered: ${allResults.length} topics`);
  
  // 최소한 몇 개는 반환하도록 (테스트용)
  if (allResults.length === 0) {
    console.log('No topics filtered, creating fallback');
    return [{
      original_title: newsList[0]?.title || 'Test',
      is_safe: true,
      talk_topic: '요즘 뉴스 보셨어요?',
      description: '최근 화제가 되고 있는 뉴스에 대한 대화 주제입니다.',
      category: 'life',
      situation: ['company', 'date', 'friend'],
      age_group: 'all',
    }];
  }

  return allResults;
}