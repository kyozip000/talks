// app/page.tsx
import Header from '@/components/Header';
import TalkCard from '@/components/TalkCard';
import { supabase } from '@/lib/supabase';
import { Talk } from '@/lib/types';

// 서버 컴포넌트: 데이터 미리 가져오기
async function getTalks(): Promise<Talk[]> {
  const { data, error } = await supabase
    .from('talks')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching talks:', error);
    return [];
  }

  return data || [];
}

export default async function HomePage() {
  const talks = await getTalks();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 소개 섹션 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            어색한 순간, 가벼운 화제
          </h2>
          <p className="text-gray-600">
            회사, 소개팅, 모임에서 자연스럽게 꺼낼 수 있는 최신 대화 주제
          </p>
        </div>

        {/* 토크 카드 그리드 */}
        {talks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {talks.map((talk) => (
              <TalkCard key={talk.id} talk={talk} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              아직 토크 주제가 없습니다.
            </p>
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-600 text-sm">
          <p>© 2026 토크스. 모든 권리 보유.</p>
        </div>
      </footer>
    </div>
  );
}
