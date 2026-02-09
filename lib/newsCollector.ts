export interface NaverNewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  originallink?: string;
}

export async function collectNaverNews(count: number = 100): Promise<NaverNewsItem[]> {
  // 범용 키워드 (카테고리 구분 없이 다양하게!)
  const searchQueries = [
    // 트렌드/화제
    '요즘',
    '화제',
    '인기',
    '뜨는',
    '유행',
    '핫한',
    '대박',
    '신기록',
    '최고',
    '역대급',
    '신상',
    '출시',
    
    // 연예/문화
    '영화',
    '드라마',
    '예능',
    '음악',
    '공연',
    '전시',
    '신곡',
    '컴백',
    '데뷔',
    '1위',
    
    // 스포츠
    '승리',
    '우승',
    '경기',
    '득점',
    '기록',
    '시즌',
    '결승',
    '메달',
    
    // 음식
    '맛집',
    '카페',
    '신메뉴',
    '디저트',
    '레시피',
    '베이커리',
    '편의점',
    '배달',
    
    // IT/테크
    '출시',
    '신제품',
    '업데이트',
    '앱',
    '게임',
    '기능',
    '스마트폰',
    '인공지능',
    
    // 라이프
    '여행',
    '패션',
    '뷰티',
    '건강',
    '취미',
    '반려동물',
    '인테리어',
    '꿀팁',
    
    // 추가 범용
    '추천',
    '핫한',
    '유행',
    '붐',
    'mz',
    '트렌드',
    '신규',
    '베스트',
    '오픈',
    '론칭',
    '화제작',
    '시즌',
    '이벤트',
    '축제',
    '체험',
    '방문',
  ];

  const allNews: NaverNewsItem[] = [];
  const seenTitles = new Set<string>();

  // 각 키워드당 2-3개씩
  const itemsPerQuery = 3;

  for (const query of searchQueries) {
    try {
      const url = 'https://openapi.naver.com/v1/search/news.json';
      const params = new URLSearchParams({
        query: query,
        display: itemsPerQuery.toString(),
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
        console.error(`[${query}] ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        let added = 0;
        
        for (const item of data.items) {
          const cleanTitle = removeHtmlTags(item.title);
          const cleanDesc = removeHtmlTags(item.description);
          
          // 너무 짧거나 중복이면 스킵
          if (cleanTitle.length < 15 || seenTitles.has(cleanTitle)) {
            continue;
          }
          
          // 비슷한 제목 체크
          let isDuplicate = false;
          for (const existing of seenTitles) {
            const similarity = calculateSimilarity(cleanTitle, existing);
            if (similarity > 0.7) { // 70% 이상 유사하면 중복
              isDuplicate = true;
              break;
            }
          }
          
          if (isDuplicate) continue;
          
          seenTitles.add(cleanTitle);
          allNews.push({
            ...item,
            title: cleanTitle,
            description: cleanDesc,
          });
          added++;
        }
        
        if (added > 0) {
          console.log(`[${query}] +${added}`);
        }
      }

      // API Rate Limit 방지
      await new Promise(resolve => setTimeout(resolve, 150));

    } catch (error) {
      console.error(`[${query}] Error`);
    }
  }

  console.log(`📊 Total: ${allNews.length} unique news`);

  // 날짜순 정렬
  allNews.sort((a, b) => 
    new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  return allNews.slice(0, count);
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

// 문자열 유사도 계산 (간단 버전)
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = str1.split(' ');
  const words2 = str2.split(' ');
  
  let matchCount = 0;
  words1.forEach(word => {
    if (words2.includes(word)) matchCount++;
  });
  
  return matchCount / Math.max(words1.length, words2.length);
}