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
  { value: 'all', label: '전체', emoji: '🌐' },
  { value: 'company', label: '회사', emoji: '🏢' },
  { value: 'date', label: '소개팅', emoji: '💑' },
  { value: 'friend', label: '친구', emoji: '👥' },
];

const ageGroups = [
  { value: 'all', label: '전체', emoji: '🌐' },
  { value: '20s', label: '20대', emoji: '👶' },
  { value: '30s', label: '30대', emoji: '👔' },
  { value: '40s', label: '40대', emoji: '👨‍💼' },
];

const categories = [
  { value: 'all', label: '전체', emoji: '🌐' },
  { value: 'entertain', label: '요즘 핫한', emoji: '🎬' },
  { value: 'sports', label: '스포츠', emoji: '⚽' },
  { value: 'food', label: '맛집', emoji: '🍔' },
  { value: 'tech', label: '테크', emoji: '📱' },
  { value: 'life', label: '일상', emoji: '☕' },
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
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-700 mb-2.5">📍 상황</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {situations.map((situation) => (
              <button
                key={situation.value}
                onClick={() => onSituationChange(situation.value)}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  selectedSituation === situation.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                <span>{situation.emoji}</span>
                {situation.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs font-bold text-gray-700 mb-2.5">👥 연령대</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {ageGroups.map((age) => (
              <button
                key={age.value}
                onClick={() => onAgeGroupChange(age.value)}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  selectedAgeGroup === age.value
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                <span>{age.emoji}</span>
                {age.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-gray-700 mb-2.5">🏷️ 카테고리</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => onCategoryChange(category.value)}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  selectedCategory === category.value
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                <span>{category.emoji}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}