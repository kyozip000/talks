'use client';

import { Heart } from 'lucide-react';
import { useState } from 'react';

interface LikeButtonProps {
  talkId: string;
  initialLikes: number;
}

export default function LikeButton({ talkId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isLiked || isLoading) return;

    setIsLoading(true);
    setIsLiked(true);
    setLikes(prev => prev + 1);

    try {
      const response = await fetch(`/api/talks/${talkId}/like`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to like');

      const data = await response.json();
      setLikes(data.like_count);

    } catch (error) {
      console.error('Like error:', error);
      setIsLiked(false);
      setLikes(prev => prev - 1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLiked || isLoading}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
        isLiked
          ? 'bg-red-50 text-red-600 border-red-200'
          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
      } disabled:opacity-50`}
    >
      <Heart size={16} className={isLiked ? 'fill-current' : ''} />
      <span>{likes}</span>
    </button>
  );
}