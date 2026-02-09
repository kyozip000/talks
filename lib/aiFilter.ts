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

  const allResults: FilteredTopic[] = [];
  const batchSize = 5;

  for (let i = 0; i < Math.min(newsList.length, 50); i += batchSize) {
    const batch = newsList.slice(i, i + batchSize);
    
    try {
      const prompt = `뉴스를 간결한 대화 주제로 변환하세요.

**제외:** 정치(선거,국회), 범죄(살인), 사고(사망)

**카테고리:**
- entertain: 영화, 드라마, 예능, 음악, 연예인
- sports: 축구, 야구, 농구, 스포츠
- food: 맛집, 카페, 음식, 디저트
- tech: 스마트폰, 앱, 게임, IT
- life: 여행, 패션, 건강, 반려동물

**중요 규칙:**
1. talk_topic: 간결하고 자연스러운 제목만! "~~ 아세요?", "~~ 보셨어요?" 같은 질문형 금지!
   예시: "영화 왕사남", "손흥민 해트트릭", "GS25 신상 디저트"
2. description: 핵심만 1-2문장, 숫자/구체적 정보 포함
3. 애매하면 SAFE

뉴스:
${batch.map((n, idx) => `${idx + 1}. ${n.title}`).join('\n')}

JSON만 반환:
[{"original_title":"","is_safe":true,"talk_topic":"영화 왕사남","description":"개봉 5일 만에 100만 관객 돌파","category":"entertain","situation":["company","friend"],"age_group":"all"}]`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      let jsonStr = text;
      if (text.includes('```')) {
        const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match) jsonStr = match[1].trim();
      }

      const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
      if (arrayMatch) jsonStr = arrayMatch[0];

      try {
        const parsed = JSON.parse(jsonStr);
        const safe = Array.isArray(parsed) ? parsed.filter(t => t.is_safe === true) : [];
        
        allResults.push(...safe);
        console.log(`[AI Batch ${i / batchSize + 1}] +${safe.length} topics`);
      } catch (parseError) {
        console.error(`[AI Batch ${i / batchSize + 1}] Parse error`);
      }

      if (i + batchSize < Math.min(newsList.length, 50)) {
        await new Promise(r => setTimeout(r, 1500));
      }

    } catch (error: any) {
      console.error(`[AI Batch ${i / batchSize + 1}] Error:`, error.message);
    }
  }

  console.log(`[AI Total] ${allResults.length} topics`);
  return allResults;
}