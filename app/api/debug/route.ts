import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  // 1. 직접 변수 확인 (이걸로 Vercel 로그에서 주소 대조 가능)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY!; // 마스터키 사용

  // 2. 마스터키를 사용하는 클라이언트 생성
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { data, error, count } = await supabase
      .from('talks')
      .select('*', { count: 'exact' });

    return NextResponse.json({
      success: !error,
      // 🧐 여기서 URL이 님 프로젝트 주소와 일치하는지 꼭 보세요!
      projectUrl: supabaseUrl, 
      count: count,
      data: data,
      error: error ? error.message : null
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}