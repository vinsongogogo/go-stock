import { ChevronRight, Clock } from 'lucide-react';

interface NewsItem {
  time: string;
  title: string;
  tags: string[];
}

interface NewsFeedProps {
  title: string;
  newsItems: NewsItem[];
  accentColor: string;
}

export function NewsFeed({ title, newsItems, accentColor }: NewsFeedProps) {
  return (
    <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl hover:border-cyan-500/30 transition-all">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-1 h-6 ${accentColor.split(' ')[0]} rounded-full`}></div>
          <h3 className="text-lg font-light tracking-wide">{title}</h3>
        </div>
        <button className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
          <Clock className="w-4 h-4" />
          <span>2026-03-12 12:06:31</span>
        </button>
      </div>

      {/* 新闻列表 */}
      <div className="space-y-4">
        {newsItems.map((item, index) => (
          <div
            key={index}
            className={`${accentColor} rounded-xl p-4 hover:scale-[1.02] transition-all cursor-pointer group border`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-cyan-400 font-mono">{item.time}</span>
                  <span className="text-xs text-gray-400">
                    {item.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {item.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-0.5 bg-white/10 rounded text-xs text-gray-300 border border-white/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* 查看更多 */}
      <button className="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-gray-400 hover:text-cyan-400 transition-all border border-white/10 hover:border-cyan-500/30">
        查看更多新闻
      </button>
    </div>
  );
}
