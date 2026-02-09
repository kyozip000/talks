import Header from '@/components/Header';
import TalksClient from '@/components/TalksClient';
import { supabase } from '@/lib/supabase';
import { Talk } from '@/lib/types';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

async function getTalks(): Promise<Talk[]> {
  const { data, error } = await supabase
    .from('talks')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

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
        {/* 소개 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            어색한 순간, 가벼운 화제
          </h2>
          <p className="text-sm text-gray-600">
            회사, 소개팅, 모임에서 자연스럽게 꺼낼 수 있는 최신 대화 주제
          </p>
        </div>

        <TalksClient initialTalks={talks} />
      </main>

      <footer className="border-t border-gray-200 mt-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-xs text-gray-500">
          <p>© 2026 토크스. 모든 권리 보유.</p>
        </div>
      </footer>
    </div>
  );
}