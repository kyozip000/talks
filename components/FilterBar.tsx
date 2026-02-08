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
  { value: 'all', label: '전체', icon: '🌐' },
  { value: 'company', label: '회사', icon: '🏢' },
  { value: 'date', label: '소개팅', icon: '💑' },
  { value: 'friend', label: '친구', icon: '👥' },
];

const ageGroups = [
  { value: 'all', label: '전체', icon: '🌐' },
  { value: '20s', label: '20대', icon: '👶' },
  { value: '30s', label: '30대', icon: '👔' },
  { value: '40s', label: '40대', icon: '👨‍💼' },
];

const categories = [
  { value: 'all', label: '전체', icon: '🌐' },
  { value: 'entertain', label: '요즘 핫한', icon: '🎬' },
  { value: 'sports', label: '스포츠', icon: '⚽' },
  { value: 'food', label: '맛집/음식', icon: '🍔' },
  { value: 'tech', label: '테크', icon: '📱' },
  { value: 'life', label: '일상', icon: '☕' },
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
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
      {/* 상황별 필터 */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">📍 상황</h3>
        <div className="flex flex-wrap gap-2">
          {situations.map((situation) => (
            <button
              key={situation.value}
              onClick={() => onSituationChange(situation.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedSituation === situation.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{situation.icon}</span>
              {situation.label}
            </button>
          ))}
        </div>
      </div>

      {/* 연령대별 필터 */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">👥 연령대</h3>
        <div className="flex flex-wrap gap-2">
          {ageGroups.map((age) => (
            <button
              key={age.value}
              onClick={() => onAgeGroupChange(age.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedAgeGroup === age.value
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{age.icon}</span>
              {age.label}
            </button>
          ))}
        </div>
      </div>

      {/* 카테고리별 필터 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">🏷️ 카테고리</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => onCategoryChange(category.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.value
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}