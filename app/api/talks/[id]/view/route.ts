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
      .select('view_count')
      .eq('id', id)
      .single();

    if (error) throw error;

    const newViewCount = (data.view_count || 0) + 1;

    const { error: updateError } = await supabaseAdmin
      .from('talks')
      .update({ view_count: newViewCount })
      .eq('id', id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}