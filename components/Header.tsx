export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-lg font-bold">T</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">토크스</h1>
        </div>
        
        <p className="text-sm text-gray-500 hidden sm:block">
          가벼운 대화 주제
        </p>
      </div>
    </header>
  );
}