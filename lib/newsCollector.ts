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
    '영화 개봉',
    '드라마 시청률',
    '예능 화제',
    '아이돌 컴백',
    'K팝 차트',
    '넷플릭스 신작',
    '디즈니플러스',
    '티빙 오리지널',
    '유튜브 쇼츠',
    '웹예능',
    
    // ⚽ 스포츠 (8개)
    '트렌드',
    '손흥민',
    '프리미어리그',
    'NBA',
    'MLB',
    '토트넘',
    '양키스',
    '피겨스케이팅',
    'e스포츠',
    
    // 🍔 음식/맛집 (10개)
    '맛집 오픈',
    '편의점 신상',
    'GS25 디저트',
    'CU 신메뉴',
    '카페 신상',
    '스타벅스 신메뉴',
    '배달 앱',
    '요즘 핫한 맛집',
    '팝업스토어 음식',
    '미슐랭',
    
    // 📱 IT/테크/게임 (12개)
    '아이폰 17',
    '갤럭시 S25',
    '애플 신제품',
    '삼성 신제품',
    '게임 출시',
    '롤 업데이트',
    '배그 이벤트',
    'AI 기술',
    '챗GPT',
    '앱 추천',
    '인스타 기능',
    '틱톡 트렌드',
    '트렌드',
    
    // 🎨 라이프스타일/트렌드 (20개)
    '트렌드',
    'MZ세대 트렌드',
    'Z세대 문화',
    '요즘 유행',
    '인스타 릴스',
    'SNS 챌린지',
    '밈 문화',
    '숏폼 콘텐츠',
    '버킷리스트',
    '반려동물',
    '강아지 카페',
    '고양이 집사',
    '러닝 크루',
    '홈카페',
    '홈트레이닝',
    '필라테스',
    '요가',
    '캠핑',
    '차박',
    '등산 명소',
    '사진 맛집',
    
    // 🛍️ 패션/뷰티 (5개)
    '트렌드',
    '무신사 트렌드',
    '올리브영 추천',
    '패션 트렌드',
    '스트릿 패션',
    '뷰티 루틴',
    
    // ✈️ 여행 (5개)
    '트렌드',
    '국내 여행지',
    '제주도 핫플',
    '부산 맛집',
    '서울 데이트',
    '주말 여행',
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