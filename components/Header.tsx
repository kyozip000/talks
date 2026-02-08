// components/Header.tsx
export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 로고 */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🗣️</span>
            <h1 className="text-2xl font-bold text-gray-900">토크스</h1>
          </div>
          
          {/* 태그라인 */}
          <p className="hidden md:block text-sm text-gray-600">
            어색한 순간, 가벼운 화제
          </p>
        </div>
      </div>
    </header>
  );
}
