export interface NaverNewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  originallink?: string;
}

export async function collectNaverNews(count: number = 50): Promise<NaverNewsItem[]> {
  const categories = [
    { query: '연예 뉴스', weight: 0.25 },
    { query: '맛집 음식', weight: 0.25 },
    { query: 'IT 신제품', weight: 0.2 },
    { query: '스포츠 뉴스', weight: 0.15 },
    { query: '라이프 트렌드', weight: 0.15 },
  ];

  const allNews: NaverNewsItem[] = [];

  for (const cat of categories) {
    const display = Math.ceil(count * cat.weight);
    
    try {
      const url = 'https://openapi.naver.com/v1/search/news.json';
      const params = new URLSearchParams({
        query: cat.query,
        display: display.toString(),
        sort: 'date',
        start: '1',
      });

      const response = await fetch(`${url}?${params}`, {
        headers: {
          'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID!,
          'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET!,
        },
      });

      if (!response.ok) {
        console.error(`Naver API error for ${cat.query}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        allNews.push(...data.items);
      }
    } catch (error) {
      console.error(`Error fetching news for ${cat.query}:`, error);
    }
  }

  const cleanedNews = allNews.map(item => ({
    ...item,
    title: removeHtmlTags(item.title),
    description: removeHtmlTags(item.description),
  }));

  const uniqueNews = Array.from(
    new Map(cleanedNews.map(item => [item.title, item])).values()
  );

  return uniqueNews.slice(0, count);
}

function removeHtmlTags(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}