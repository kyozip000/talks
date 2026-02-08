'use client';

import { useState, useMemo } from 'react';
import { Talk } from '@/lib/types';
import TalkCard from './TalkCard';
import FilterBar from './FilterBar';

interface TalksClientProps {
  initialTalks: Talk[];
}

export default function TalksClient({ initialTalks }: TalksClientProps) {
  const [selectedSituation, setSelectedSituation] = useState('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 필터링된 토크 주제
  const filteredTalks = useMemo(() => {
    return initialTalks.filter((talk) => {
      // 상황 필터
      const situationMatch =
        selectedSituation === 'all' ||
        talk.situation.includes(selectedSituation as any);

      // 연령대 필터
      const ageGroupMatch =
        selectedAgeGroup === 'all' ||
        talk.age_group === selectedAgeGroup ||
        talk.age_group === 'all';

      // 카테고리 필터
      const categoryMatch =
        selectedCategory === 'all' || talk.category === selectedCategory;

      return situationMatch && ageGroupMatch && categoryMatch;
    });
  }, [initialTalks, selectedSituation, selectedAgeGroup, selectedCategory]);

  return (
    <>
      {/* 필터 바 */}
      <FilterBar
        selectedSituation={selectedSituation}
        selectedAgeGroup={selectedAgeGroup}
        selectedCategory={selectedCategory}
        onSituationChange={setSelectedSituation}
        onAgeGroupChange={setSelectedAgeGroup}
        onCategoryChange={setSelectedCategory}
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
            해당 조건의 대화 주제가 없습니다.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            다른 필터를 선택해보세요!
          </p>
        </div>
      )}
    </>
  );
}