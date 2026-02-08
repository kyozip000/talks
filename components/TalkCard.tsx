// components/TalkCard.tsx
'use client';

import { Talk } from '@/lib/types';
import { useState } from 'react';

interface TalkCardProps {
  talk: Talk;
}

// 카테고리별 아이콘
const categoryIcons: Record<string, string> = {
  entertain: '🎬',
  sports: '⚽',
  food: '🍔',
  tech: '📱',
  life: '☕',
};

// 카테고리별 한글명
const categoryNames: Record<string, string> = {
  entertain: '요즘 핫한',
  sports: '스포츠',
  food: '맛집/음식',
  tech: '테크/가젯',
  life: '일상 공감',
};

// 카테고리별 색상
const categoryColors: Record<string, string> = {
  entertain: 'bg-pink-100 text-pink-700',
  sports: 'bg-blue-100 text-blue-700',
  food: 'bg-orange-100 text-orange-700',
  tech: 'bg-purple-100 text-purple-700',
  life: 'bg-green-100 text-green-700',
};

export default function TalkCard({ talk }: TalkCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      {/* 카테고리 뱃지 */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{categoryIcons[talk.category]}</span>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColors[talk.category]}`}>
          {categoryNames[talk.category]}
        </span>
      </div>

      {!isFlipped ? (
        // 앞면: 토크 주제
        <>
          <h3 className="text-xl font-bold text-gray-900 mb-4 min-h-[60px]">
            {talk.talk_topic}
          </h3>
          
          <p className="text-sm text-gray-500 text-center">
            탭하여 자세히 보기 →
          </p>
        </>
      ) : (
        // 뒷면: 설명
        <>
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">📝 배경 설명</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {talk.description}
            </p>
          </div>

          {talk.conversation_tip && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">💬 대화 팁</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {talk.conversation_tip}
              </p>
            </div>
          )}

          <p className="text-sm text-gray-400 text-center mt-4">
            탭하여 닫기
          </p>
        </>
      )}
    </div>
  );
}