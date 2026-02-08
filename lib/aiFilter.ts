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

  const batchSize = 10;
  const allResults: FilteredTopic[] = [];

  for (let i = 0; i < Math.min(newsList.length, 50); i += batchSize) {
    const batch = newsList.slice(i, i + batchSize);
    
    try {
      const prompt = `다음 뉴스를 스몰토크 주제로 변환해주세요.

**제외:** 정치(선거,국회), 종교, 범죄(살인,폭행), 사고, 사망, 심각한 논란

**포함:** 연예, 스포츠, 음식, IT, 게임, 여행, 취미, 패션, 건강

**기준:** 회사나 소개팅에서 가볍게 얘기할 수 있으면 SAFE. 애매하면 SAFE.

뉴스:
${batch.map((n, idx) => `${idx + 1}. ${n.title}`).join('\n')}

JSON만 반환:
[{"original_title":"","is_safe":true,"talk_topic":"~아세요?","description":"","category":"entertain","situation":["company"],"age_group":"all"}]`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      let jsonStr = text;
      if (text.includes('```')) {
        const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match) jsonStr = match[1];
      }

      const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
      if (arrayMatch) jsonStr = arrayMatch[0];

      try {
        const parsed = JSON.parse(jsonStr);
        const safe = Array.isArray(parsed) ? parsed.filter(t => t.is_safe === true) : [];
        allResults.push(...safe);
        console.log(`Batch ${i / batchSize + 1}: +${safe.length} topics`);
      } catch (parseError) {
        console.error(`Parse error batch ${i / batchSize + 1}`);
      }

      if (i + batchSize < Math.min(newsList.length, 50)) {
        await new Promise(r => setTimeout(r, 1500));
      }

    } catch (error: any) {
      console.error(`Batch ${i / batchSize + 1} error:`, error.message);
    }
  }

  console.log(`Total: ${allResults.length} topics`);
  return allResults;
}