import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('talks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    // UTF-8 헤더 명시
    return new NextResponse(
      JSON.stringify({
        success: true,
        data: data,
        count: data?.length || 0
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}