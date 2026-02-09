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
  
  // 매우 짧고 명확한 프롬프트
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
  });

  const allResults: FilteredTopic[] = [];

  // 한 번에 3개씩만 처리 (안정성 최우선)
  const batchSize = 3;

  for (let i = 0; i < Math.min(newsList.length, 30); i += batchSize) {
    const batch = newsList.slice(i, i + batchSize);
    
    try {
      // 극도로 단순화된 프롬프트
      const newsText = batch.map((n, idx) => 
        `${idx + 1}. ${n.title}`
      ).join('\n');

      const prompt = `다음 뉴스를 대화 주제로 만들어줘.

뉴스:
${newsText}

규칙:
- 정치, 범죄, 사고만 제외
- 나머지는 전부 포함
- 각 뉴스마다 질문 형태로 변환

예시:
입력: "아이폰 17 출시"
출력: {"is_safe":true,"talk_topic":"아이폰 17 나왔다는데 아세요?","description":"애플 신제품 출시","category":"tech"}

이제 위 뉴스들을 JSON 배열로:
[{"is_safe":true,"talk_topic":"...","description":"...","category":"entertain"}]`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      console.log(`[AI ${i / batchSize + 1}/${Math.ceil(Math.min(newsList.length, 30) / batchSize)}] Raw response:`, text.substring(0, 100));

      // JSON 추출
      let jsonStr = text.trim();
      
      // 모든 마크다운 제거
      jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
      
      // [ ] 찾기
      const match = jsonStr.match(/\[[\s\S]*\]/);
      if (match) {
        jsonStr = match[0];
      }

      try {
        const parsed = JSON.parse(jsonStr);
        
        if (Array.isArray(parsed)) {
          // 각 항목 보완
          const topics = parsed
            .filter(t => t.is_safe === true)
            .map((t, idx) => ({
              original_title: batch[idx]?.title || t.talk_topic,
              is_safe: true,
              talk_topic: t.talk_topic || batch[idx]?.title,
              description: t.description || batch[idx]?.description?.substring(0, 100) || '최근 화제',
              conversation_tip: undefined,
              category: t.category || 'life',
              situation: ['company', 'friend'] as ('company' | 'date' | 'friend')[],
              age_group: 'all' as const,
            }));
          
          allResults.push(...topics);
          console.log(`[AI ${i / batchSize + 1}] ✅ ${topics.length}개 추가`);
        }
      } catch (parseError) {
        console.error(`[AI ${i / batchSize + 1}] ❌ Parse failed`);
        
        // 파싱 실패 시 수동 변환
        const manual = batch.map(n => ({
          original_title: n.title,
          is_safe: true,
          talk_topic: `${n.title.substring(0, 30)}... 아세요?`,
          description: n.description.substring(0, 100),
          conversation_tip: undefined,
          category: 'life' as const,
          situation: ['company', 'friend'] as ('company' | 'date' | 'friend')[],
          age_group: 'all' as const,
        }));
        
        allResults.push(...manual);
        console.log(`[AI ${i / batchSize + 1}] ⚠️ Fallback: ${manual.length}개`);
      }

      // Rate limit
      if (i + batchSize < Math.min(newsList.length, 30)) {
        await new Promise(r => setTimeout(r, 1500));
      }

    } catch (error: any) {
      console.error(`[AI ${i / batchSize + 1}] Error:`, error.message);
      
      // 에러 시에도 수동 변환
      const manual = batch.map(n => ({
        original_title: n.title,
        is_safe: true,
        talk_topic: `${n.title.substring(0, 30)}... 아세요?`,
        description: n.description.substring(0, 100),
        conversation_tip: undefined,
        category: 'life' as const,
        situation: ['company', 'friend'] as ('company' | 'date' | 'friend')[],
        age_group: 'all' as const,
      }));
      
      allResults.push(...manual);
      console.log(`[AI ${i / batchSize + 1}] 🔧 Error fallback: ${manual.length}개`);
    }
  }

  console.log(`[AI Total] ${allResults.length}개 필터링 완료`);
  return allResults;
}