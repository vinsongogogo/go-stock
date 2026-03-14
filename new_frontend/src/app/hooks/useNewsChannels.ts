import { useState, useEffect, useCallback } from 'react';

function isWailsEnv(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as unknown as { go?: { main?: { App?: unknown } }; runtime?: unknown };
  return !!(w.go?.main?.App && w.runtime);
}

/** 后端 GetTelegraphList 返回的单条快讯 */
export interface TelegraphItem {
  ID?: number;
  time?: string;
  dataTime?: string;
  title?: string;
  content?: string;
  subjects?: string[];
  stocks?: string[];
  isRed?: boolean;
  url?: string;
  source?: string;
  sentimentResult?: string;
}

/** 首页资讯流单个频道配置（与 frontend market.vue 三个 tab 一致） */
export interface NewsChannelConfig {
  source: string;       // 展示名称
  apiSource: string;    // 接口参数：财联社电报 | 新浪财经 | 外媒
  icon: 'radio' | 'newspaper' | 'trending';
  color: string;
}

export const NEWS_CHANNELS: NewsChannelConfig[] = [
  { source: '财联社', apiSource: '财联社电报', icon: 'radio', color: 'from-green-500 to-emerald-600' },
  { source: '新浪财经', apiSource: '新浪财经', icon: 'newspaper', color: 'from-blue-500 to-cyan-600' },
  { source: '外媒', apiSource: '外媒', icon: 'trending', color: 'from-purple-500 to-pink-600' },
];

/** 用于 UI 展示的单条资讯 */
export interface NewsFeedItem {
  time: string;
  title: string;
  content: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  url?: string;
  dataTime?: string;
}

function mapTelegraphToFeedItem(t: TelegraphItem): NewsFeedItem {
  const title = t.title || t.content || '';
  const content = t.content || '';
  const tags = Array.isArray(t.subjects) ? t.subjects : [];
  let priority: 'high' | 'medium' | 'low' = 'medium';
  if (t.isRed) priority = 'high';
  else if (t.sentimentResult === '看涨' || t.sentimentResult === '看跌') priority = 'high';
  return {
    time: t.time || '',
    title: title.length > 80 ? title.slice(0, 80) + '...' : title,
    content,
    tags,
    priority,
    url: t.url,
    dataTime: t.dataTime,
  };
}

export interface ChannelState {
  items: NewsFeedItem[];
  loading: boolean;
  error: boolean;
}

export interface UseNewsChannelsResult {
  channels: { config: NewsChannelConfig; items: NewsFeedItem[]; loading: boolean; error: boolean }[];
  refreshChannel: (apiSource: string) => Promise<void>;
  liveTime: Date;
}

const MOCK_CHANNELS: { config: NewsChannelConfig; items: NewsFeedItem[] }[] = [
  {
    config: NEWS_CHANNELS[0],
    items: [
      { time: '12:06:31', title: '财联社3月12日午间新闻播报：港股午间收盘，恒生指数跌1.23%', content: '', tags: ['金融圈', '快讯'], priority: 'high' },
      { time: '12:05:18', title: '中国央行今日进行500亿元7天期逆回购操作，中标利率为1.80%', content: '', tags: ['货币政策'], priority: 'medium' },
      { time: '12:04:32', title: '工信部：推动新能源汽车产业高质量发展，加快充电基础设施建设', content: '', tags: ['政策', '新能源'], priority: 'high' },
    ],
  },
  {
    config: NEWS_CHANNELS[1],
    items: [
      { time: '12:04:49', title: '比亚迪发布新一代刀片电池技术，能量密度提升20%', content: '', tags: ['公司', '新能源'], priority: 'high' },
      { time: '12:04:08', title: '美联储官员：需要更多数据来判断是否需要调整利率政策', content: '', tags: ['国际'], priority: 'medium' },
    ],
  },
  {
    config: NEWS_CHANNELS[2],
    items: [
      { time: '12:05:42', title: '监管层密集发声，强调坚持房住不炒定位', content: '', tags: ['政策', '房地产'], priority: 'high' },
      { time: '12:04:55', title: '创业板指跌幅收窄至0.5%，医药生物板块表现活跃', content: '', tags: ['市场'], priority: 'low' },
    ],
  },
];

export function useNewsChannels(): UseNewsChannelsResult {
  const [liveTime, setLiveTime] = useState(() => new Date());
  const [channels, setChannels] = useState<UseNewsChannelsResult['channels']>(() =>
    MOCK_CHANNELS.map(({ config, items }) => ({
      config,
      items,
      loading: false,
      error: false,
    }))
  );

  const refreshChannel = useCallback(async (apiSource: string) => {
    if (!isWailsEnv()) return;
    setChannels((prev) =>
      prev.map((ch) =>
        ch.config.apiSource === apiSource ? { ...ch, loading: true, error: false } : ch
      )
    );
    try {
      const { ReFleshTelegraphList } = await import('../../../wailsjs/go/main/App');
      const raw = await ReFleshTelegraphList(apiSource);
      const list = Array.isArray(raw) ? (raw as TelegraphItem[]) : [];
      const items = list.map(mapTelegraphToFeedItem);
      setChannels((prev) =>
        prev.map((ch) =>
          ch.config.apiSource === apiSource
            ? { ...ch, items, loading: false, error: false }
            : ch
        )
      );
    } catch {
      setChannels((prev) =>
        prev.map((ch) =>
          ch.config.apiSource === apiSource ? { ...ch, loading: false, error: true } : ch
        )
      );
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isWailsEnv()) return;
    let cancelled = false;
    const load = async () => {
      const [
        { GetTelegraphList },
      ] = await Promise.all([import('../../../wailsjs/go/main/App')]);
      const results = await Promise.allSettled(
        NEWS_CHANNELS.map((config) =>
          GetTelegraphList(config.apiSource).then((raw: unknown) => {
            const list = Array.isArray(raw) ? (raw as TelegraphItem[]) : [];
            return list.map(mapTelegraphToFeedItem);
          })
        )
      );
      if (cancelled) return;
      setChannels((prev) =>
        prev.map((ch, i) => {
          const r = results[i];
          if (r.status === 'fulfilled')
            return { ...ch, items: r.value, loading: false, error: false };
          return { ...ch, loading: false, error: true };
        })
      );
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return { channels, refreshChannel, liveTime };
}
