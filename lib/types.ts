// lib/types.ts

export interface Talk {
  id: string;
  talk_topic: string;
  description: string | null;
  conversation_tip: string | null;
  category: 'entertain' | 'sports' | 'food' | 'tech' | 'life';
  situation: ('company' | 'date' | 'friend')[];
  age_group: '20s' | '30s' | '40s' | 'all';
  source: string;
  source_url: string | null;
  published_at: string | null;
  created_at: string;
  is_verified: boolean;
  report_count: number;
  view_count: number;
  share_count: number;
  like_count: number;
}

export interface CronLog {
  id: string;
  run_at: string;
  status: 'success' | 'error';
  error_message: string | null;
  news_collected: number | null;
  topics_filtered: number | null;
  topics_saved: number | null;
  duration_ms: number | null;
  created_at: string;
}
