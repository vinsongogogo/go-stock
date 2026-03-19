import { Radio, Newspaper, Globe, Clock, ChevronRight, Sparkles, RefreshCw } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

// Wails Go bridge
const getApp = () => (window as any)?.go?.main?.App;
const getRuntime = () => (window as any)?.runtime;

function EventsOn(eventName: string, callback: (...args: any[]) => void) {
  getRuntime()?.EventsOn?.(eventName, callback);
}
function EventsOff(...eventNames: string[]) {
  getRuntime()?.EventsOff?.(...eventNames);
}

interface Telegraph {
  ID: number;
  time: string;
  dataTime: string;
  title: string;
  content: string;
  subjects: string[];
  isRed: boolean;
  url: string;
  source: string;
  sentimentResult: string;
}

const CHANNELS = [
  { source: '财联社电报', label: '财联社电报', icon: Radio,     color: 'from-green-500 to-emerald-600', event: 'newTelegraph' },
  { source: '新浪财经',   label: '新浪财经',   icon: Newspaper, color: 'from-blue-500 to-cyan-600',    event: 'newSinaNews' },
  { source: '外媒',       label: '外媒资讯',   icon: Globe,     color: 'from-purple-500 to-pink-600',  event: 'tradingViewNews' },
];

function ChannelCard({ source, label, icon: Icon, color, event }: typeof CHANNELS[0]) {
  const [items, setItems] = useState<Telegraph[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback((refresh = false) => {
    const App = getApp();
    if (!App) return;
    setLoading(true);
    const fn = refresh ? App.ReFleshTelegraphList : App.GetTelegraphList;
    fn(source)
      .then((res: Telegraph[] | null) => {
        if (res) setItems(res);
      })
      .finally(() => setLoading(false));
  }, [source]);

  useEffect(() => { load(false); }, [load]);

  // Listen for real-time news updates from backend
  useEffect(() => {
    const handler = (data: Telegraph[]) => {
      // Only update if data is for this source
      if (data && data.length > 0 && data[0]?.source === source) {
        setItems(data);
      }
    };
    EventsOn(event, handler);
    return () => { EventsOff(event); };
  }, [event, source]);

  const getSentimentStyle = (s: string) => {
    if (s === '看涨') return 'text-red-400 border-red-500/30 bg-red-500/10';
    if (s === '看跌') return 'text-green-400 border-green-500/30 bg-green-500/10';
    return 'text-gray-400 border-white/10 bg-white/5';
  };

  return (
    <div className="bg-slate-800/30 backdrop-blur rounded-xl border border-white/5 p-2.5 sm:p-3 hover:border-cyan-500/30 transition-all flex flex-col">
      {/* 频道标题 */}
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-gradient-to-r ${color}`}></div>
          <Icon className="w-3.5 h-3.5 text-gray-400" />
          <h4 className="text-xs sm:text-sm font-medium text-gray-300">{label}</h4>
          <span className="text-[10px] text-gray-500">{items.length}条</span>
        </div>
        <button
          onClick={() => load(true)}
          disabled={loading}
          className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-cyan-400 transition-all disabled:opacity-40"
          title="刷新"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 新闻列表 */}
      <div className="space-y-0.5 sm:space-y-1 flex-1 overflow-y-auto max-h-72">
        {items.length === 0 && !loading && (
          <p className="text-[10px] text-gray-500 text-center py-4">暂无数据</p>
        )}
        {loading && items.length === 0 && (
          <p className="text-[10px] text-gray-500 text-center py-4">加载中...</p>
        )}
        {items.map((item) => (
          <div
            key={item.ID}
            className="p-1.5 rounded-lg hover:bg-slate-700/30 transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-1.5">
              <span className={`text-[9px] sm:text-[10px] font-mono flex-shrink-0 mt-0.5 ${item.isRed ? 'text-red-400' : 'text-cyan-400'}`}>
                {item.time}
              </span>
              <div className="flex-1 min-w-0">
                {item.title ? (
                  <p className={`text-[10px] sm:text-[11px] font-medium leading-snug line-clamp-1 md:line-clamp-none group-hover:text-white transition-colors ${
                    item.isRed ? 'text-red-300' : 'text-gray-200'
                  }`}>
                    {item.title}
                  </p>
                ) : null}
                <p className="text-[10px] sm:text-[11px] text-gray-400 leading-relaxed line-clamp-2 md:line-clamp-none group-hover:text-gray-300 transition-colors mt-0.5">
                  {item.content}
                </p>
                {/* 标签行 */}
                {((item.subjects && item.subjects.length > 0) || item.sentimentResult || item.url) && (
                  <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                    {item.subjects?.slice(0, 3).map((tag, i) => (
                      <span key={i} className="px-1 py-0.5 bg-white/5 rounded text-[8px] sm:text-[9px] text-gray-400 border border-white/10">
                        {tag}
                      </span>
                    ))}
                    {item.sentimentResult && (
                      <span className={`px-1 py-0.5 rounded text-[8px] sm:text-[9px] border ${getSentimentStyle(item.sentimentResult)}`}>
                        {item.sentimentResult}
                      </span>
                    )}
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-1 py-0.5 bg-white/5 rounded text-[8px] sm:text-[9px] text-cyan-500 border border-white/10 hover:text-cyan-300"
                        onClick={e => e.stopPropagation()}
                      >
                        原文
                      </a>
                    )}
                  </div>
                )}
              </div>
              <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NewsFeed() {
  const [now, setNow] = useState(() => new Date().toLocaleString('zh-CN', { hour12: false }));

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date().toLocaleString('zh-CN', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-5 shadow-2xl">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg text-cyan-400 tracking-wide flex items-center gap-2">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          实时资讯流
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-[10px] sm:text-xs">{now}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {CHANNELS.map(ch => (
          <ChannelCard key={ch.source} {...ch} />
        ))}
      </div>
    </div>
  );
}
