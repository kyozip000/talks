'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Talk } from '@/lib/types';
import ShareButtons from './ShareButtons';
import LikeButton from './LikeButton';
import { Eye, Sparkles } from 'lucide-react';

interface TalkCardProps {
  talk: Talk;
}

export default function TalkCard({ talk }: TalkCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isFlipped && !hasViewed) {
      setHasViewed(true);
      fetch(`/api/talks/${talk.id}/view`, { method: 'POST' })
        .catch(err => console.error('View count error:', err));
    }
  }, [isFlipped, hasViewed, talk.id]);

  // 랜덤 그라디언트 색상
  const gradients = [
    'from-pink-100 to-purple-100',
    'from-blue-100 to-cyan-100',
    'from-green-100 to-teal-100',
    'from-orange-100 to-red-100',
    'from-yellow-100 to-orange-100',
    'from-indigo-100 to-blue-100',
  ];
  
  const randomGradient = gradients[talk.id.charCodeAt(0) % gradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
      className="h-80"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
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
          transition={{ duration: 0.5, type: "spring" }}
        >
          {/* 앞면 */}
          <motion.div
            className={`absolute w-full h-full bg-gradient-to-br ${randomGradient} rounded-3xl border-2 border-gray-200 p-6 flex flex-col justify-between transition-all ${
              isHovered ? 'border-indigo-400 shadow-2xl' : 'shadow-md'
            }`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* 반짝이는 아이콘 */}
            <motion.div
              animate={isHovered ? { 
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.2, 1]
              } : {}}
              transition={{ duration: 0.5 }}
              className="self-end"
            >
              <Sparkles size={24} className="text-indigo-500" />
            </motion.div>

            <div className="flex-1 flex items-center justify-center px-4">
              <motion.h3 
                className="text-xl font-bold text-gray-900 text-center leading-relaxed"
                animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
              >
                {talk.talk_topic}
              </motion.h3>
            </div>

            <div className="text-center">
              <motion.div 
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border-2 border-indigo-600 text-indigo-600 text-sm font-bold shadow-md"
                animate={isHovered ? { 
                  scale: [1, 1.1, 1],
                  boxShadow: ["0 4px 6px rgba(0,0,0,0.1)", "0 10px 20px rgba(79, 70, 229, 0.3)", "0 4px 6px rgba(0,0,0,0.1)"]
                } : {}}
                transition={{ duration: 0.8, repeat: isHovered ? Infinity : 0 }}
              >
                👆 탭해서 보기
              </motion.div>
            </div>
          </motion.div>

          {/* 뒷면 */}
          <div
            className="absolute w-full h-full bg-white rounded-3xl border-2 border-gray-300 p-6 flex flex-col shadow-xl"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="flex-1 overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {talk.talk_topic}
              </h3>

              <div className="space-y-3 mb-4">
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200"
                >
                  <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1">
                    📝 배경 설명
                  </p>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {talk.description}
                  </p>
                </motion.div>

                {talk.conversation_tip && (
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200"
                  >
                    <p className="text-xs font-bold text-blue-700 mb-2 flex items-center gap-1">
                      💡 대화 팁
                    </p>
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {talk.conversation_tip}
                    </p>
                  </motion.div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Eye size={14} />
                <span className="font-medium">{talk.view_count || 0}명이 봤어요</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex gap-2 mb-3">
                <LikeButton talkId={talk.id} initialLikes={talk.like_count || 0} />
              </div>
              <ShareButtons talkTopic={talk.talk_topic} talkId={talk.id} />
              <p className="text-xs text-center text-gray-400 mt-3">
                👆 다시 탭하면 닫혀요
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}