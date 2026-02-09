import { Talk } from './types';

export interface KeywordTag {
  keyword: string;
  count: number;
  color: string;
}

// 제외할 단어들 (대폭 강화!)
const stopWords = new Set([
  // 기본 불용어
  '하다', '되다', '있다', '없다', '이다', '아니다', '같다', '보다', '하는', '있는', '없는',
  '그', '저', '이', '것', '수', '등', '및', '을', '를', '이', '가', '은', '는', '의', '에', '도',
  '에서', '으로', '부터', '까지', '에게', '한테', '처럼', '만큼', '위해', '위한',
  
  // 질문 표현
  '요즘', '아세요', '보셨어요', '해보셨어요', '아시나요', '하시나요', '하셨나요',
  
  // 시간 표현
  '오늘', '어제', '내일', '이번', '지난', '다음', '최근', '올해', '작년', '내년',
  '시간', '때', '동안', '일', '월', '년',
  
  // 숫자
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
  '1일', '2일', '3일', '4일', '5일', '6일', '7일', '8일', '9일',
  '하나', '둘', '셋', '넷', '다섯',
  
  // 동사/형용사
  '말했다', '밝혔다', '전했다', '열린', '열렸다', '진행', '시작', '끝',
  '발표', '공개', '출시', '개최', '예정',
  
  // 기타
  '대화', '주제', '이야기', '얘기', '관련', '통해', '대한', '대표', '해당', '이후', '이날',
  '경기는', '경기가', '기록했다', '위를', '등을', '가장', '글로벌', '핵심',
  '국내', '해외', '한국', '우리나라',
]);

// 한 글자도 제외
const singleCharExclusions = new Set([
  '일', '월', '화', '수', '목', '금', '토', '중', '후', '전', '상', '하', '좌', '우',
]);

const colorPalette = [
  'bg-red-100 text-red-700 border-red-300 hover:bg-red-200',
  'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200',
  'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200',
  'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200',
  'bg-lime-100 text-lime-700 border-lime-300 hover:bg-lime-200',
  'bg-green-100 text-green-700 border-green-300 hover:bg-green-200',
  'bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200',
  'bg-teal-100 text-teal-700 border-teal-300 hover:bg-teal-200',
  'bg-cyan-100 text-cyan-700 border-cyan-300 hover:bg-cyan-200',
  'bg-sky-100 text-sky-700 border-sky-300 hover:bg-sky-200',
  'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200',
  'bg-indigo-100 text-indigo-700 border-indigo-300 hover:bg-indigo-200',
  'bg-violet-100 text-violet-700 border-violet-300 hover:bg-violet-200',
  'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200',
  'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300 hover:bg-fuchsia-200',
  'bg-pink-100 text-pink-700 border-pink-300 hover:bg-pink-200',
  'bg-rose-100 text-rose-700 border-rose-300 hover:bg-rose-200',
];

export function extractKeywords(talks: Talk[]): KeywordTag[] {
  const keywordCounts = new Map<string, number>();

  talks.forEach(talk => {
    const text = `${talk.talk_topic} ${talk.description}`;
    
    const words = text
      .replace(/[?,!.'"()]/g, ' ')
      .replace(/\d+/g, '') // 숫자 제거
      .split(/\s+/)
      .map(word => word.trim())
      .filter(word => {
        // 필터링 조건
        if (word.length < 2 || word.length > 8) return false; // 2-8글자만
        if (stopWords.has(word)) return false; // 불용어 제외
        if (singleCharExclusions.has(word)) return false; // 한글자 제외
        if (!/^[가-힣]+$/.test(word)) return false; // 순수 한글만
        if (/^[0-9]+$/.test(word)) return false; // 숫자만 있는 것 제외
        
        // 동사형 제외 (-다, -ㄴ다, -는다 등)
        if (word.endsWith('다') || word.endsWith('ㄴ다') || word.endsWith('는다')) return false;
        
        return true;
      });

    words.forEach(word => {
      keywordCounts.set(word, (keywordCounts.get(word) || 0) + 1);
    });
  });

  // 빈도수 높은 순으로 정렬
  const sortedKeywords = Array.from(keywordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25) // 상위 25개
    .filter(([_, count]) => count >= 3); // 3번 이상 등장

  return sortedKeywords.map(([keyword, count], index) => ({
    keyword,
    count,
    color: colorPalette[index % colorPalette.length],
  }));
}