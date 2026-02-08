export interface NaverNewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  originallink?: string;
}

export async function collectNaverNews(count: number = 100): Promise<NaverNewsItem[]> {
  // 트렌디하고 다양한 검색어 60개!
  const searchQueries = [
    // 🎬 연예/엔터 (10개)
    '트렌드',
    '개봉',
    '드라마',
    '예능',
    '아이돌',
    '차트',
    '넷플릭스',
    '신작',
    '1위',
    '유튜브',
    '인기',
    
    // ⚽ 스포츠 (8개)
    '트렌드',
    '인기',
    '최신',
    '트렌디',
    '상륙',
    '1위',
    '우승',
    '경기',
    '행보',
    
    // 🍔 음식/맛집 (10개)
    '맛집',
    '신상',
    '유행,
    '신메뉴',
    '카페',
    '스타벅스',
    '배달,
    '요즘',
    '팝업스토어',
    '미슐랭',
    
    // 📱 IT/테크/게임 (12개)
    '아이폰',
    '갤럭시',
    '애플',
    '삼성',
    '게임',
    '신상',
    '이벤트',
    'AI',
    '앱',
    '유행',
    '인스타',
    '틱톡',
    '트렌드',
    
    // 🎨 라이프스타일/트렌드 (20개)
    '트렌드',
    'MZ',
    'Z세대',
    '요즘',
    '인스타',
    'SNS',
    '밈',
    '숏폼',
    '버킷리스트',
    '반려동물',
    '강아지',
    '고양이',
    '러닝',
    '홈카페',
    '홈트레이닝',
    '필라테스',
    '요가',
    '캠핑',
    '차박',
    '등산',
    '사진',
    
    // 🛍️ 패션/뷰티 (5개)
    '트렌드',
    '무신사',
    '올리브영',
    '패션',
    '스트릿',
    '뷰티',
    
    // ✈️ 여행 (5개)
    '트렌드',
    '국내',
    '제주도',
    '부산',
    '서울',
    '주말',
  ];

  const allNews: NaverNewsItem[] = [];
  const seenTitles = new Set<string>();

  // 각 검색어당 2-3개씩
  const itemsPerQuery = Math.max(2, Math.ceil(count / searchQueries.length));

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
        console.error(`[${query}] API error: ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        let added = 0;
        
        for (const item of data.items) {
          const cleanTitle = removeHtmlTags(item.title);
          const cleanDesc = removeHtmlTags(item.description);
          
          // 필터링: 너무 짧거나 중복이면 스킵
          if (cleanTitle.length < 10 || seenTitles.has(cleanTitle)) {
            continue;
          }
          
          // 너무 비슷한 제목도 스킵
          const titleWords = cleanTitle.split(' ').slice(0, 3).join(' ');
          let isDuplicate = false;
          for (const existing of seenTitles) {
            if (existing.includes(titleWords) || titleWords.includes(existing.split(' ').slice(0, 3).join(' '))) {
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

      // Rate limit 방지
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`[${query}] Error:`, error);
    }
  }

  console.log(`📊 Total collected: ${allNews.length} unique news`);

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