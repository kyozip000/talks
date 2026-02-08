import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { collectNaverNews } from '@/lib/newsCollector';
import { filterTopicsWithAI } from '@/lib/aiFilter';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'dev-secret-12345';

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('🚀 [Daily Update] Started');

    // 1. 네이버 뉴스 수집
    const news = await collectNaverNews(20); // 일단 20개만
    console.log(`📰 Collected ${news.length} news`);

    if (news.length === 0) {
      throw new Error('No news collected');
    }

    // 2. AI 필터링
    let filtered = [];
    try {
      filtered = await filterTopicsWithAI(news);
      console.log(`✅ Filtered ${filtered.length} topics`);
    } catch (aiError: any) {
      console.error('AI filtering failed:', aiError.message);
      
      // AI 실패 시 수동 필터링 (임시)
      filtered = news.slice(0, 3).map(n => ({
        original_title: n.title,
        is_safe: true,
        talk_topic: n.title.endsWith('?') ? n.title : `${n.title.substring(0, 30)}... 아세요?`,
        description: n.description || '최근 화제가 되고 있는 뉴스입니다.',
        category: 'life' as const,
        situation: ['company', 'friend'] as const,
        age_group: 'all' as const,
      }));
      console.log(`⚠️ Used fallback: ${filtered.length} topics`);
    }

    // 3. 중복 체크
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: existingTopics } = await supabaseAdmin
      .from('talks')
      .select('talk_topic')
      .gte('created_at', sevenDaysAgo.toISOString());

    const existingSet = new Set(
      existingTopics?.map(t => t.talk_topic.toLowerCase()) || []
    );

    const newTopics = filtered
      .filter(t => !existingSet.has(t.talk_topic.toLowerCase()))
      .map(t => ({
        talk_topic: t.talk_topic,
        description: t.description,
        conversation_tip: t.conversation_tip || null,
        category: t.category,
        situation: t.situation,
        age_group: t.age_group,
        source: 'naver_news',
        is_verified: true,
      }));

    console.log(`💾 Saving ${newTopics.length} new topics`);

    // 4. DB 저장
    let savedCount = 0;
    if (newTopics.length > 0) {
      const { error } = await supabaseAdmin.from('talks').insert(newTopics);
      if (error) throw error;
      savedCount = newTopics.length;
    }

    // 5. 로그 저장
    const duration = Date.now() - startTime;
    await supabaseAdmin.from('cron_logs').insert({
      status: 'success',
      news_collected: news.length,
      topics_filtered: filtered.length,
      topics_saved: savedCount,
      duration_ms: duration,
    });

    console.log(`✨ Completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      collected: news.length,
      filtered: filtered.length,
      saved: savedCount,
      duration_ms: duration,
    });

  } catch (error: any) {
    console.error('❌ Error:', error);

    const duration = Date.now() - startTime;
    await supabaseAdmin.from('cron_logs').insert({
      status: 'error',
      error_message: error.message,
      duration_ms: duration,
    });

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}