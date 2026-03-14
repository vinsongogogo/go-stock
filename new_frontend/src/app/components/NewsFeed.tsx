import { Radio, Newspaper, TrendingUp, Clock, ChevronRight, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { useNewsChannels, type NewsFeedItem } from '../hooks/useNewsChannels';
import { isWails } from '../hooks/useAppData';

const CHANNEL_ICONS = { radio: Radio, newspaper: Newspaper, trending: TrendingUp } as const;

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high': return 'border-l-red-500 bg-red-500/5';
    case 'medium': return 'border-l-yellow-500 bg-yellow-500/5';
    default: return 'border-l-gray-500 bg-gray-500/5';
  }
}

function formatLiveTime(d: Date) {
  return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

export function NewsFeed() {
  const { channels, refreshChannel, liveTime } = useNewsChannels();

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg text-cyan-400 tracking-wide flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          实时资讯流
        </h3>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-xs text-gray-500">{formatLiveTime(liveTime)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {channels.map((channel, channelIndex) => {
          const Icon = CHANNEL_ICONS[channel.config.icon];
          return (
            <div key={channel.config.apiSource} className="space-y-2">
              {/* 来源标签 + 刷新 */}
              <div className={`bg-gradient-to-r ${channel.config.color} bg-opacity-20 rounded-lg px-3 py-2 flex items-center gap-2 border border-white/10`}>
                <Icon className="w-4 h-4 text-white" />
                <span className="text-sm text-white font-light">{channel.config.source}</span>
                <div className="ml-auto flex items-center gap-1">
                  {channel.error && <AlertCircle className="w-4 h-4 text-amber-400" title="加载失败" />}
                  {isWails() && (
                    <button
                      onClick={() => refreshChannel(channel.config.apiSource)}
                      disabled={channel.loading}
                      className="p-1 rounded hover:bg-white/10 disabled:opacity-50"
                      title="刷新"
                    >
                      <RefreshCw className={`w-4 h-4 text-white ${channel.loading ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </div>
              </div>

              {/* 新闻列表 */}
              <div className="space-y-2">
                {channel.loading && channel.items.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-500">加载中...</div>
                ) : channel.items.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-500">暂无资讯</div>
                ) : (
                  channel.items.map((item: NewsFeedItem, itemIndex: number) => (
                    <div
                      key={`${item.time}-${itemIndex}`}
                      className={`${getPriorityColor(item.priority)} border-l-2 rounded-r-lg p-3 hover:bg-white/5 transition-all cursor-pointer group`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-mono text-cyan-400 flex-shrink-0 mt-0.5">{item.time}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-300 leading-relaxed line-clamp-2 group-hover:text-white transition-colors">
                            {item.title}
                          </p>
                          {item.tags.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                              {item.tags.map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] text-gray-400 border border-white/10"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {isWails() && (
                <button
                  onClick={() => refreshChannel(channel.config.apiSource)}
                  disabled={channel.loading}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-500 hover:text-cyan-400 transition-all border border-white/5 hover:border-cyan-500/30 disabled:opacity-50"
                >
                  {channel.loading ? '刷新中...' : `刷新 ${channel.config.source}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 底部统计 */}
      <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">今日资讯</div>
          <div className="text-lg text-cyan-400">1,247</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">重要公告</div>
          <div className="text-lg text-yellow-400">89</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">研报更新</div>
          <div className="text-lg text-purple-400">156</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">实时监控</div>
          <div className="text-lg text-green-400 flex items-center justify-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            ON
          </div>
        </div>
      </div>
    </div>
  );
}
