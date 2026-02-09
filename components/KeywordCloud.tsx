'use client';

import { motion } from 'framer-motion';

interface KeywordCloudProps {
  keywords: { keyword: string; count: number; color: string }[];
  selectedKeyword: string | null;
  onKeywordSelect: (keyword: string | null) => void;
}

export default function KeywordCloud({ 
  keywords, 
  selectedKeyword, 
  onKeywordSelect 
}: KeywordCloudProps) {
  return (
    <div className="sticky top-16 z-40 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-gray-700">
            🏷️ 키워드로 찾기
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* 전체 보기 버튼 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onKeywordSelect(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
              selectedKeyword === null
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
            }`}
          >
            🌐 전체보기
          </motion.button>

          {/* 키워드 태그들 */}
          {keywords.map(({ keyword, count, color }) => (
            <motion.button
              key={keyword}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onKeywordSelect(keyword)}
              className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                selectedKeyword === keyword
                  ? 'ring-2 ring-offset-2 ring-gray-400'
                  : ''
              } ${color}`}
            >
              {keyword}
              <span className="ml-1.5 text-xs opacity-60">
                {count}
              </span>
            </motion.button>
          ))}
        </div>

        {/* 선택된 키워드 표시 */}
        {selectedKeyword && (
          <div className="mt-4 text-sm text-gray-600">
            <span className="font-semibold">"{selectedKeyword}"</span> 관련 주제를 보고 있어요
          </div>
        )}
      </div>
    </div>
  );
}