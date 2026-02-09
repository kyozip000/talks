import { Talk } from './types';

export interface KeywordTag {
  keyword: string;
  count: number;
  color: string;
}

// 한국어 불용어 (제외할 단어들)
const stopWords = new Set([
  '하다', '되다', '있다', '없다', '이다', '아니다',
  '그', '저', '이', '것', '수', '등', '및', '을', '를', '이', '가', '은', '는',
  '에서', '으로', '부터', '까지', '에게', '한테', '보다', '처럼',
  '요즘', '아세요', '보셨어요', '해보셨어요', '아시나요',
  '대화', '주제', '이야기', '얘기',
]);

// 색상 팔레트
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
    // 토크 주제와 설명에서 키워드 추출
    const text = `${talk.talk_topic} ${talk.description}`;
    
    // 공백, 특수문자 기준으로 분리
    const words = text
      .replace(/[?,!.'"]/g, ' ')
      .split(/\s+/)
      .map(word => word.trim())
      .filter(word => 
        word.length >= 2 && // 2글자 이상
        word.length <= 10 && // 10글자 이하
        !stopWords.has(word) && // 불용어 제외
        /[가-힣]/.test(word) // 한글 포함
      );

    words.forEach(word => {
      keywordCounts.set(word, (keywordCounts.get(word) || 0) + 1);
    });
  });

  // 빈도수 높은 순으로 정렬
  const sortedKeywords = Array.from(keywordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30) // 상위 30개만
    .filter(([_, count]) => count >= 2); // 2번 이상 등장한 것만

  // 색상 배정
  return sortedKeywords.map(([keyword, count], index) => ({
    keyword,
    count,
    color: colorPalette[index % colorPalette.length],
  }));
}