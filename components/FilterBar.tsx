'use client';

interface FilterBarProps {
  selectedSituation: string;
  selectedAgeGroup: string;
  selectedCategory: string;
  onSituationChange: (situation: string) => void;
  onAgeGroupChange: (ageGroup: string) => void;
  onCategoryChange: (category: string) => void;
}

const situations = [
  { value: 'all', label: '전체' },
  { value: 'company', label: '회사' },
  { value: 'date', label: '소개팅' },
  { value: 'friend', label: '친구' },
];

const ageGroups = [
  { value: 'all', label: '전체' },
  { value: '20s', label: '20대' },
  { value: '30s', label: '30대' },
  { value: '40s', label: '40대' },
];

const categories = [
  { value: 'all', label: '전체' },
  { value: 'entertain', label: '요즘 핫한' },
  { value: 'sports', label: '스포츠' },
  { value: 'food', label: '맛집' },
  { value: 'tech', label: '테크' },
  { value: 'life', label: '일상' },
];

export default function FilterBar({
  selectedSituation,
  selectedAgeGroup,
  selectedCategory,
  onSituationChange,
  onAgeGroupChange,
  onCategoryChange,
}: FilterBarProps) {
  return (
    <div className="sticky top-16 z-40 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* 상황 */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">상황</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {situations.map((situation) => (
              <button
                key={situation.value}
                onClick={() => onSituationChange(situation.value)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  selectedSituation === situation.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                {situation.label}
              </button>
            ))}
          </div>
        </div>

        {/* 연령대 */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">연령대</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {ageGroups.map((age) => (
              <button
                key={age.value}
                onClick={() => onAgeGroupChange(age.value)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  selectedAgeGroup === age.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                {age.label}
              </button>
            ))}
          </div>
        </div>

        {/* 카테고리 */}
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">카테고리</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => onCategoryChange(category.value)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  selectedCategory === category.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}