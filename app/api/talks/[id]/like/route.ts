import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // await 추가!

    const { data, error } = await supabaseAdmin
      .from('talks')
      .select('like_count')
      .eq('id', id)
      .single();

    if (error) throw error;

    const newLikeCount = (data.like_count || 0) + 1;

    const { error: updateError } = await supabaseAdmin
      .from('talks')
      .update({ like_count: newLikeCount })
      .eq('id', id);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      like_count: newLikeCount,
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}