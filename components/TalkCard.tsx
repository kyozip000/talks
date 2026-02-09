'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Talk } from '@/lib/types';
import ShareButtons from './ShareButtons';
import LikeButton from './LikeButton';
import { Eye } from 'lucide-react';

interface TalkCardProps {
  talk: Talk;
}

export default function TalkCard({ talk }: TalkCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);

  useEffect(() => {
    if (isFlipped && !hasViewed) {
      setHasViewed(true);
      fetch(`/api/talks/${talk.id}/view`, { method: 'POST' })
        .catch(err => console.error('View count error:', err));
    }
  }, [isFlipped, hasViewed, talk.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-80"
    >
      <div
        className="relative w-full h-full cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="absolute w-full h-full"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* 앞면 */}
          <div
            className="absolute w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-gray-200 p-6 flex flex-col justify-center hover:border-gray-300 transition-all"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="flex-1 flex items-center justify-center px-4">
              <h3 className="text-lg font-bold text-gray-900 text-center leading-relaxed">
                {talk.talk_topic}
              </h3>
            </div>

            <div className="text-center">
              <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-medium">
                탭하여 자세히 보기 →
              </div>
            </div>
          </div>

          {/* 뒷면 */}
          <div
            className="absolute w-full h-full bg-white rounded-2xl border border-gray-200 p-6 flex flex-col"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="flex-1 overflow-y-auto">
              <h3 className="text-base font-bold text-gray-900 mb-4">
                {talk.talk_topic}
              </h3>

              <div className="space-y-3 mb-4">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-1.5">📝 배경 설명</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {talk.description}
                  </p>
                </div>

                {talk.conversation_tip && (
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <p className="text-xs font-semibold text-blue-600 mb-1.5">💡 대화 팁</p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {talk.conversation_tip}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Eye size={12} />
                <span>{talk.view_count || 0}회 조회</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex gap-2 mb-3">
                <LikeButton talkId={talk.id} initialLikes={talk.like_count || 0} />
              </div>
              <ShareButtons talkTopic={talk.talk_topic} talkId={talk.id} />
              <p className="text-xs text-center text-gray-400 mt-3">
                탭하여 닫기
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}