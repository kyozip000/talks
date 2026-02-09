'use client';

import { Share2, Copy, Check, MessageCircle } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonsProps {
  talkTopic: string;
  talkId: string;
}

declare global {
  interface Window {
    Kakao: any;
  }
}

export default function ShareButtons({ talkTopic, talkId }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    const url = `${window.location.origin}?talk=${talkId}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      alert('복사에 실패했습니다.');
    }
  };

  const handleKakaoShare = () => {
    if (!window.Kakao) {
      alert('카카오톡 공유 기능을 불러오는 중입니다.');
      return;
    }

    const shareUrl = `${window.location.origin}?talk=${talkId}`;

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '토크스 - 대화 주제 추천',
        description: talkTopic,
        imageUrl: 'https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=TALKSS',
        link: {
          mobileWebUrl: shareUrl,
          webUrl: shareUrl,
        },
      },
      buttons: [
        {
          title: '대화 주제 보기',
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
      ],
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: '토크스',
      text: `대화 주제 추천: ${talkTopic}`,
      url: `${window.location.origin}?talk=${talkId}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // 사용자 취소
      }
    } else {
      handleCopyUrl();
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleKakaoShare}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FEE500] text-[#000000] rounded-xl hover:bg-[#FDD835] transition-colors text-sm font-medium border border-[#FEE500]"
      >
        <MessageCircle size={16} />
        카카오톡
      </button>

      <button
        onClick={handleShare}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors text-sm font-medium"
      >
        <Share2 size={16} />
        공유
      </button>

      <button
        onClick={handleCopyUrl}
        className={`flex items-center justify-center px-4 py-2.5 rounded-xl transition-colors text-sm font-medium border ${
          copied
            ? 'bg-green-50 text-green-600 border-green-200'
            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
        }`}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
}