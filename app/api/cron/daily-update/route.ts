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
    const news = await collectNaverNews(100);
    console.log(`📰 Collected ${news.length} news`);

    if (news.length === 0) {
      throw new Error('No news collected');
    }

    // 2. AI 필터링
    const filtered = await filterTopicsWithAI(news);
    console.log(`✅ AI Filtered ${filtered.length} topics`);

    // AI가 하나도 못 거르면 키워드 필터링 fallback
    if (filtered.length === 0) {
      console.log('⚠️ AI returned 0 topics, using keyword fallback');
      
      const excludeKeywords = ['정치', '선거', '국회', '살인', '폭행', '사망'];
      const fallbackTopics = news
        .filter(n => !excludeKeywords.some(kw => n.title.includes(kw)))
        .slice(0, 10)
        .map(n => ({
          talk_topic: n.title.length > 40 
            ? `${n.title.substring(0, 37)}... 아세요?`
            : `${n.title} 아세요?`,
          description: n.description.substring(0, 100),
          conversation_tip: null,
          category: 'life' as const,
          situation: ['company', 'friend'] as ('company' | 'date' | 'friend')[],
          age_group: 'all' as const,
          source: 'naver_news',
          is_verified: false,
        }));
      
      console.log(`📝 Fallback: ${fallbackTopics.length} topics`);

      if (fallbackTopics.length > 0) {
        await supabaseAdmin.from('talks').insert(fallbackTopics);
        
        await supabaseAdmin.from('cron_logs').insert({
          status: 'success',
          news_collected: news.length,
          topics_filtered: 0,
          topics_saved: fallbackTopics.length,
          duration_ms: Date.now() - startTime,
        });

        return NextResponse.json({
          success: true,
          collected: news.length,
          filtered: 0,
          saved: fallbackTopics.length,
          mode: 'fallback',
          duration_ms: Date.now() - startTime,
        });
      }
    }

    // 3. 중복 체크 (6시간)
    const sixHoursAgo = new Date();
    sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);

    const { data: existingTopics } = await supabaseAdmin
      .from('talks')
      .select('talk_topic')
      .gte('created_at', sixHoursAgo.toISOString());

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
      mode: 'ai',
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

    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}