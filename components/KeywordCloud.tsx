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
    <div className="sticky top-16 z-40 bg-gradient-to-b from-white to-gray-50 border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-4 text-center">
          <h3 className="text-lg font-bold text-gray-800 mb-1">
            💬 어떤 얘기 할까요?
          </h3>
          <p className="text-xs text-gray-500">
            키워드를 눌러서 관련 주제를 찾아보세요!
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {/* 전체 보기 - 특별한 스타일 */}
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onKeywordSelect(null)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-all ${
              selectedKeyword === null
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg'
                : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
            }`}
          >
            ✨ 전체보기
          </motion.button>

          {/* 키워드 태그들 - 물결 애니메이션 */}
          {keywords.map(({ keyword, count, color }, index) => (
            <motion.button
              key={keyword}
              initial={{ scale: 0, y: 20 }}
              animate={{ 
                scale: 1, 
                y: 0,
                rotate: selectedKeyword === keyword ? [0, -3, 3, 0] : 0
              }}
              transition={{ 
                delay: index * 0.03,
                type: "spring",
                stiffness: 300
              }}
              whileHover={{ 
                scale: 1.15, 
                rotate: [0, -5, 5, -5, 0],
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onKeywordSelect(keyword)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all shadow-sm ${
                selectedKeyword === keyword
                  ? 'ring-3 ring-offset-2 ring-gray-400 scale-110'
                  : ''
              } ${color}`}
            >
              {keyword}
              <motion.span 
                className="ml-1.5 text-xs font-bold"
                animate={{ scale: selectedKeyword === keyword ? [1, 1.2, 1] : 1 }}
                transition={{ repeat: selectedKeyword === keyword ? Infinity : 0, duration: 1 }}
              >
                {count}
              </motion.span>
            </motion.button>
          ))}
        </div>

        {/* 선택된 키워드 - 귀여운 말풍선 */}
        {selectedKeyword && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 text-center"
          >
            <div className="inline-block bg-indigo-100 text-indigo-700 px-4 py-2 rounded-2xl text-sm font-medium border-2 border-indigo-300">
              💭 <span className="font-bold">"{selectedKeyword}"</span> 관련 주제를 찾았어요!
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}