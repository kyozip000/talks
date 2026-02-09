import Header from '@/components/Header';
import SajuClient from '@/components/SajuClient';

export default function SajuPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            🔮 사주토크
          </h2>
          <p className="text-gray-600">
            팀원들의 생년월일로 궁합과 오행 밸런스를 확인해보세요
          </p>
        </div>

        <SajuClient />
      </main>
    </div>
  );
}