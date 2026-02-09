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

// 정치 관련 키워드 (강력 차단)
const politicalKeywords = [
  '이재명', '한동훈', '트럼프', '바이든', '푸틴', '시진핑',
  '대통령', '국회', '의원', '장관', '정부', '여당', '야당',
  '민주당', '국민의힘', '정치', '선거', '투표', '공약',
  '탄핵', '특검', '검찰', '법원', '재판', '기소',
  '국정', '정책', '법안', '국회의원', '청와대', '당대표',
];

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
    
    // 정치 키워드 필터링 (AI 전에 먼저)
    const filteredBatch = batch.filter(news => {
      const text = `${news.title} ${news.description}`.toLowerCase();
      return !politicalKeywords.some(keyword => 
        text.includes(keyword.toLowerCase())
      );
    });

    if (filteredBatch.length === 0) continue;
    
    try {
      const prompt = `뉴스를 간결한 대화 주제로 변환하세요.

**절대 제외 (UNSAFE):**
- 정치: 선거, 국회, 의원, 대통령, 장관, 정당, 정책
- 범죄: 살인, 폭행, 성범죄, 절도
- 사고: 사망, 화재, 붕괴, 추락
- 인명: 정치인 이름 (이재명, 한동훈, 트럼프 등)

**포함 (SAFE):**
- 연예: 영화, 드라마, 예능, 음악, 연예인
- 스포츠: 축구, 야구, 농구, 경기
- 음식: 맛집, 카페, 신메뉴, 레시피
- IT: 스마트폰, 앱, 게임, 신제품
- 라이프: 여행, 패션, 건강, 반려동물

**제목 규칙 (매우 중요!):**
- 간결하고 자연스러운 제목만 사용
- "아세요?", "보셨어요?", "하시나요?" 같은 질문형 절대 금지!
- 예시 (좋음): "영화 왕사남", "손흥민 해트트릭", "GS25 신상 디저트"
- 예시 (나쁨): "영화 왕사남 보셨어요?", "손흥민 아세요?"

뉴스:
${filteredBatch.map((n, idx) => `${idx + 1}. ${n.title}`).join('\n')}

JSON만:
[{"original_title":"","is_safe":true,"talk_topic":"영화 왕사남","description":"개봉 5일 만에 100만 돌파","category":"entertain","situation":["company","friend"],"age_group":"all"}]`;

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
        let safe = Array.isArray(parsed) ? parsed.filter(t => t.is_safe === true) : [];
        
        // 추가 필터링: "아세요?" 포함된 제목 제거
        safe = safe.filter(t => 
          !t.talk_topic.includes('아세요') &&
          !t.talk_topic.includes('보셨어요') &&
          !t.talk_topic.includes('하시나요') &&
          !t.talk_topic.includes('하셨나요')
        );
        
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