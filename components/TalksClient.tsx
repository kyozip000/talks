'use client';

import { useState, useMemo } from 'react';
import { Talk } from '@/lib/types';
import TalkCard from './TalkCard';
import KeywordCloud from './KeywordCloud';
import { extractKeywords } from '@/lib/keywordExtractor';

interface TalksClientProps {
  initialTalks: Talk[];
}

export default function TalksClient({ initialTalks }: TalksClientProps) {
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);

  // 키워드 추출
  const keywords = useMemo(() => {
    return extractKeywords(initialTalks);
  }, [initialTalks]);

  // 키워드 필터링
  const filteredTalks = useMemo(() => {
    if (!selectedKeyword) return initialTalks;

    return initialTalks.filter(talk => {
      const text = `${talk.talk_topic} ${talk.description}`;
      return text.includes(selectedKeyword);
    });
  }, [initialTalks, selectedKeyword]);

  return (
    <>
      {/* 키워드 클라우드 */}
      <KeywordCloud 
        keywords={keywords}
        selectedKeyword={selectedKeyword}
        onKeywordSelect={setSelectedKeyword}
      />

      {/* 결과 개수 */}
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          총 <span className="font-bold text-indigo-600">{filteredTalks.length}</span>개의 대화 주제
        </p>
      </div>

      {/* 토크 카드 그리드 */}
      {filteredTalks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTalks.map((talk) => (
            <TalkCard key={talk.id} talk={talk} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl">
          <p className="text-gray-500 text-lg mb-2">😢</p>
          <p className="text-gray-500 text-lg">
            "{selectedKeyword}" 관련 주제가 없습니다.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            다른 키워드를 선택해보세요!
          </p>
        </div>
      )}
    </>
  );
}