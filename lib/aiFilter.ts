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

  // 카테고리별로 뉴스 분배
  const categoryTargets = {
    entertain: Math.ceil(newsList.length * 0.25), // 25%
    sports: Math.ceil(newsList.length * 0.20),    // 20%
    food: Math.ceil(newsList.length * 0.20),      // 20%
    tech: Math.ceil(newsList.length * 0.20),      // 20%
    life: Math.ceil(newsList.length * 0.15),      // 15%
  };

  for (let i = 0; i < Math.min(newsList.length, 50); i += batchSize) {
    const batch = newsList.slice(i, i + batchSize);
    
    try {
      const prompt = `뉴스를 대화 주제로 변환하세요.

**제외:** 정치(선거,국회), 범죄(살인), 사고(사망)

**카테고리 분류 (정확히!):**
- entertain: 영화, 드라마, 예능, 음악, 아이돌, 연예인
- sports: 축구, 야구, 농구, 올림픽, 스포츠 경기
- food: 맛집, 카페, 레시피, 음식, 디저트, 편의점
- tech: 스마트폰, 앱, 게임, IT, 신제품, 가젯
- life: 여행, 패션, 건강, 취미, 반려동물, 날씨

**중요 규칙:**
1. talk_topic: "~~ 아세요?" 또는 "~~ 보셨어요?" 형태로, 완전한 문장으로
2. description: 핵심만 1-2문장으로 요약. 숫자나 구체적 정보 포함. 문장 중간에 자르지 말 것
3. category: 위 5개 중 가장 정확한 것 선택
4. 애매하면 SAFE로 판단

뉴스:
${batch.map((n, idx) => `${idx + 1}. ${n.title}`).join('\n')}

JSON만 반환:
[{"original_title":"","is_safe":true,"talk_topic":"영화 왕사남 보셨어요?","description":"개봉 5일 만에 100만 관객 돌파한 화제작","category":"entertain","situation":["company","friend"],"age_group":"all"}]`;

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
  
  // 카테고리 분포 확인
  const categoryCount: Record<string, number> = {
    entertain: 0,
    sports: 0,
    food: 0,
    tech: 0,
    life: 0,
  };
  
  allResults.forEach(t => {
    if (categoryCount[t.category] !== undefined) {
      categoryCount[t.category]++;
    }
  });
  
  console.log('[AI Categories]', categoryCount);

  return allResults;
}