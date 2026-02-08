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
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json', // JSON 강제
    },
  });

  // 뉴스를 10개씩 나눠서 처리 (안정성 향상)
  const batchSize = 10;
  const allResults: FilteredTopic[] = [];

  for (let i = 0; i < newsList.length; i += batchSize) {
    const batch = newsList.slice(i, i + batchSize);
    
    try {
      const prompt = `
당신은 스몰토크 주제 큐레이터입니다. 다음 뉴스를 분석하여 JSON 배열로만 응답하세요.

**제외 기준 (UNSAFE):**
정치, 종교, 젠더, 범죄, 사고, 사망, 질병, 논란, 갈등

**포함 기준 (SAFE):**
연예, 스포츠, 음식, IT/테크, 라이프스타일

**JSON 형식 (배열만 반환):**
[
  {
    "original_title": "원본 제목",
    "is_safe": true,
    "talk_topic": "요즘 ○○ 해보셨어요?",
    "description": "간단한 설명 2-3줄",
    "category": "entertain",
    "situation": ["company", "date"],
    "age_group": "all"
  }
]

뉴스 목록:
${batch.map((n, idx) => `${idx + 1}. ${n.title}`).join('\n')}

JSON 배열만 반환하세요. 다른 텍스트 없이 [ 로 시작해서 ] 로 끝나야 합니다.
`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text().trim();

      console.log(`[Batch ${i / batchSize + 1}] AI Response:`, text.substring(0, 100));

      // JSON 추출 시도
      let parsed: FilteredTopic[] = [];
      
      try {
        // 1. 직접 파싱 시도
        parsed = JSON.parse(text);
      } catch (e) {
        // 2. JSON 부분만 추출 시도
        const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          console.error(`[Batch ${i / batchSize + 1}] Failed to parse JSON`);
          continue;
        }
      }

      // SAFE한 주제만 필터링
      const safeTopics = parsed.filter(t => t.is_safe);
      allResults.push(...safeTopics);

      // API Rate Limit 방지 (1초 대기)
      if (i + batchSize < newsList.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      console.error(`[Batch ${i / batchSize + 1}] Error:`, error);
      // 에러나도 계속 진행
      continue;
    }
  }

  console.log(`Total filtered topics: ${allResults.length}`);
  return allResults;
}