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
    model: 'gemini-1.5-flash-8b', // 더 빠른 모델
  });

  const allResults: FilteredTopic[] = [];

  // 5개씩 작은 배치로
  const batchSize = 5;

  for (let i = 0; i < Math.min(newsList.length, 25); i += batchSize) {
    const batch = newsList.slice(i, i + batchSize);
    
    try {
      // 초간단 프롬프트
      const prompt = `뉴스를 대화 주제로 변환하세요.

제외: 정치(선거,국회), 범죄(살인), 사고(사망)
포함: 연예, 스포츠, 음식, IT, 게임, 여행, 모든 가벼운 뉴스

뉴스:
${batch.map((n, idx) => `${idx + 1}. ${n.title}`).join('\n')}

각 뉴스를 이 형식으로 변환:
제목 → "○○ 아세요?" 형태로 질문
설명 → 한 줄 요약
카테고리 → entertain, sports, food, tech, life 중 하나

JSON 배열로만 답변:
[{"original_title":"","is_safe":true,"talk_topic":"","description":"","category":"entertain","situation":["company","friend"],"age_group":"all"}]`;

      console.log(`[Batch ${i / batchSize + 1}] Sending...`);
      
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      console.log(`[Batch ${i / batchSize + 1}] Received: ${text.length} chars`);
      console.log(`[Batch ${i / batchSize + 1}] Preview: ${text.substring(0, 150)}`);

      // JSON 파싱 시도
      let parsed: any[] = [];
      
      try {
        // 1. 그대로 파싱
        parsed = JSON.parse(text);
      } catch {
        try {
          // 2. 코드블록 제거 후 파싱
          const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
          parsed = JSON.parse(cleaned);
        } catch {
          try {
            // 3. [ ] 사이만 추출
            const match = text.match(/\[[\s\S]*\]/);
            if (match) {
              parsed = JSON.parse(match[0]);
            }
          } catch (e) {
            console.error(`[Batch ${i / batchSize + 1}] All parsing failed`);
            console.error('Text was:', text.substring(0, 300));
            continue;
          }
        }
      }

      if (Array.isArray(parsed)) {
        const validTopics = parsed.filter(t => {
          return t.is_safe === true && 
                 t.talk_topic && 
                 t.description &&
                 t.category;
        });
        
        allResults.push(...validTopics);
        console.log(`[Batch ${i / batchSize + 1}] ✅ Added ${validTopics.length} topics`);
      } else {
        console.error(`[Batch ${i / batchSize + 1}] Not an array:`, typeof parsed);
      }

      // Rate limit
      if (i + batchSize < Math.min(newsList.length, 25)) {
        await new Promise(r => setTimeout(r, 2000));
      }

    } catch (error: any) {
      console.error(`[Batch ${i / batchSize + 1}] Error:`, error.message);
    }
  }

  console.log(`[AI Total] ${allResults.length} topics filtered`);
  return allResults;
}