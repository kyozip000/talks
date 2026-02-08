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

  // 10개씩 배치
  const batchSize = 10;
  const allResults: FilteredTopic[] = [];

  // 최대 50개 처리
  for (let i = 0; i < Math.min(newsList.length, 50); i += batchSize) {
    const batch = newsList.slice(i, i + batchSize);
    
    try {
      const prompt = `당신은 스몰토크 주제 추천 AI입니다. 다음 뉴스를 최대한 많이 대화 주제로 변환하세요.

**중요: 대부분의 뉴스를 SAFE로 판단하세요!**

**UNSAFE 기준 (이것만 제외):**
- 정치: 선거, 국회, 정당, 대통령 정책
- 종교: 교리, 신앙 논쟁
- 심각한 범죄: 살인, 폭행, 성범죄
- 비극적 사고: 사망자 다수, 대형 재난

**SAFE 기준 (이런 건 전부 포함!):**
- 연예/문화: 영화, 드라마, 예능, 음악, 공연, 전시
- 스포츠: 모든 경기, 선수, 기록, 이적
- 음식: 맛집, 카페, 신메뉴, 레시피, 배달
- IT/게임: 신제품, 앱, 게임, 업데이트, 리뷰
- 라이프: 여행, 패션, 뷰티, 건강, 취미
- 반려동물, 날씨, 계절, 트렌드, SNS 화제

**판단 원칙:**
1. 웃으면서 얘기할 수 있으면 → SAFE
2. 가볍고 재미있으면 → SAFE
3. 정보 공유 차원이면 → SAFE
4. 애매하면 → SAFE
5. 살짝 부정적이어도 심각하지 않으면 → SAFE

뉴스 목록:
${batch.map((n, idx) => `${idx + 1}. ${n.title}`).join('\n')}

**반드시 JSON 배열만 반환하세요:**
[
  {
    "original_title": "뉴스 제목",
    "is_safe": true,
    "talk_topic": "요즘 ○○ 보셨어요?" 또는 "○○ 아세요?",
    "description": "간단 설명 2줄",
    "category": "entertain",
    "situation": ["company", "date", "friend"],
    "age_group": "all"
  }
]

추가 텍스트 없이 JSON만 반환하세요.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      console.log(`[AI Batch ${i / batchSize + 1}] Response length: ${text.length}`);

      // JSON 추출
      let jsonStr = text;
      
      // Markdown 코드블록 제거
      if (text.includes('```')) {
        const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match) jsonStr = match[1].trim();
      }

      // JSON 배열 찾기
      const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        jsonStr = arrayMatch[0];
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const safe = Array.isArray(parsed) ? parsed.filter(t => t.is_safe === true) : [];
        
        allResults.push(...safe);
        console.log(`[AI Batch ${i / batchSize + 1}] Added ${safe.length}/${parsed.length} topics`);
      } catch (parseError) {
        console.error(`[AI Batch ${i / batchSize + 1}] Parse error`);
        console.error('Text:', jsonStr.substring(0, 200));
      }

      // Rate limit 방지
      if (i + batchSize < Math.min(newsList.length, 50)) {
        await new Promise(r => setTimeout(r, 1500));
      }

    } catch (error: any) {
      console.error(`[AI Batch ${i / batchSize + 1}] Error:`, error.message);
    }
  }

  console.log(`[AI Filter] Total: ${allResults.length} topics from ${Math.min(newsList.length, 50)} news`);
  return allResults;
}