'use client';

import { useState } from 'react';

export default function TestCronPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runCron = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/cron/daily-update', {
        headers: {
          'Authorization': 'Bearer my-super-secret-key-12345',
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🔧 크론잡 테스트</h1>
          <p className="text-gray-600">자동 뉴스 수집 시스템을 수동으로 실행해봅니다</p>
        </div>

        <button
          onClick={runCron}
          disabled={loading}
          className="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-lg transition-colors"
        >
          {loading ? '⏳ 실행 중... (10-15초 소요)' : '▶️ 크론잡 실행하기'}
        </button>

        {result && (
          <div className="mt-8">
            <div className={`p-4 rounded-lg mb-4 ${
              result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <h2 className="text-xl font-bold mb-2">
                {result.success ? '✅ 성공!' : '❌ 에러 발생'}
              </h2>
              {result.success && (
                <div className="text-sm text-gray-700 space-y-1">
                  <p>📰 수집한 뉴스: {result.collected}개</p>
                  <p>✅ 필터링 통과: {result.filtered}개</p>
                  <p>💾 DB에 저장: {result.saved}개</p>
                  <p>⏱️ 소요 시간: {(result.duration_ms / 1000).toFixed(1)}초</p>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-3">📋 상세 결과</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-3">ℹ️ 안내사항</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
            <li>이 페이지는 크론잡을 수동으로 테스트하는 페이지입니다</li>
            <li>실제로는 <strong>매일 오전 9시</strong>에 자동으로 실행됩니다</li>
            <li>네이버 뉴스 수집 → Gemini AI 필터링 → Supabase 저장 과정이 진행됩니다</li>
            <li>처음 실행 시 10-15초 정도 소요됩니다</li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <a 
            href="/"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← 메인 페이지로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
}