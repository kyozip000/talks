import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 환경변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Key exists:', !!supabaseKey);

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: 'Missing environment variables',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
      });
    }

    // 직접 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 데이터 조회
    const { data, error, count } = await supabase
      .from('talks')
      .select('*', { count: 'exact' })
      .limit(5);

    return NextResponse.json({
      success: !error,
      environment: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        urlPreview: supabaseUrl?.substring(0, 30) + '...',
      },
      query: {
        error: error?.message,
        count: count,
        dataLength: data?.length,
        data: data,
      },
    });

  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    });
  }
}