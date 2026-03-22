import { Flame, TrendingUp, TrendingDown, Zap, RefreshCw } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useLayoutShell } from '../context/LayoutShellContext';
import { cn } from './ui/utils';

// Wails Go bridge
const getApp = () => (window as any)?.go?.main?.App;

// 行业数据结构
interface IndustryItem {
  name: string;
  code: string;
  change: number;
  volume: string;
  netInflow: number;
  flowDirection: string;
}

// 热词数据结构
interface HotWordItem {
  word: string;
  heat: number;
  trend: string;
  change: string;
}

export function TreeMap() {
  const { compactLayout } = useLayoutShell();
  const [industries, setIndustries] = useState<IndustryItem[]>([]);
  const [topConcepts, setTopConcepts] = useState<string[]>([]);
  const [hotWords, setHotWords] = useState<HotWordItem[]>([]);
  const [industryLoading, setIndustryLoading] = useState(false);
  const [hotWordsLoading, setHotWordsLoading] = useState(false);

  // 获取行业热力数据
  const fetchIndustry = useCallback(async () => {
    const App = getApp();
    if (!App) return;
    setIndustryLoading(true);
    try {
      const res = await App.GetIndustryHeatMap();
      if (res) {
        setIndustries(res.industries || []);
        setTopConcepts(res.topConcepts || []);
      }
    } catch (e) {
      console.error('fetchIndustry error:', e);
    } finally {
      setIndustryLoading(false);
    }
  }, []);

  // 获取热词数据
  const fetchHotWords = useCallback(async () => {
    const App = getApp();
    if (!App) return;
    setHotWordsLoading(true);
    try {
      const res = await App.GetHotWords();
      if (res) setHotWords(res);
    } catch (e) {
      console.error('fetchHotWords error:', e);
    } finally {
      setHotWordsLoading(false);
    }
  }, []);

  // 初始加载和定时刷新
  useEffect(() => {
    fetchIndustry();
    fetchHotWords();
    
    // 行业数据 5 分钟刷新，热词 60 分钟刷新
    const industryTimer = setInterval(fetchIndustry, 5 * 60 * 1000);
    const hotWordsTimer = setInterval(fetchHotWords, 60 * 60 * 1000);
    
    return () => {
      clearInterval(industryTimer);
      clearInterval(hotWordsTimer);
    };
  }, [fetchIndustry, fetchHotWords]);

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 p-3 sm:p-4 shadow-2xl hover:border-cyan-500/30 transition-all h-full">
      <div
        className={cn(
          "grid gap-3 sm:gap-4 h-full",
          compactLayout ? "grid-cols-1 md:grid-cols-3" : "grid-cols-3",
        )}
      >
        {/* 左侧：行业热力 - 动态数据 */}
        <div className={cn(compactLayout ? "md:col-span-2" : "col-span-2")}>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="text-sm text-cyan-400 tracking-wide flex items-center gap-2">
              <Flame className="w-4 h-4" />
              行业热力图
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">LIVE</span>
              <button
                onClick={fetchIndustry}
                disabled={industryLoading}
                className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-cyan-400 transition-all disabled:opacity-40"
                title="刷新行业数据"
              >
                <RefreshCw className={`w-3 h-3 ${industryLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          
          {/* 行业卡片网格 - 动态数据 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
            {industries.length === 0 && !industryLoading && (
              <div className="col-span-full text-center py-8 text-gray-500 text-xs">暂无行业数据</div>
            )}
            {industryLoading && industries.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500 text-xs">加载中...</div>
            )}
            {industries.slice(0, 6).map((sector, index) => {
              const isPositive = sector.change > 0;
              const colorClass = isPositive 
                ? 'bg-gradient-to-br from-red-500/10 to-red-600/20' 
                : 'bg-gradient-to-br from-green-500/10 to-green-600/20';
              const glowColor = isPositive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)';
              const textColor = isPositive ? '#ef4444' : '#22c55e';
              
              return (
                <div
                  key={sector.code || index}
                  className={`relative rounded-xl p-2 sm:p-3 backdrop-blur border border-white/10 hover:scale-105 transition-all cursor-pointer group overflow-hidden ${colorClass}`}
                  style={{ boxShadow: `0 0 20px ${glowColor}` }}
                >
                  {/* 动态光效 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-100%] group-hover:translate-x-[100%] duration-700"></div>
                  
                  {/* 文字内容 */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] sm:text-xs text-gray-300 truncate">{sector.name}</span>
                      <span className={`text-[10px] ${sector.flowDirection === 'in' ? 'text-red-400' : 'text-green-400'}`}>
                        {sector.flowDirection === 'in' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      </span>
                    </div>
                    <div className="text-base sm:text-lg font-light mb-0.5" style={{ color: textColor }}>
                      {isPositive ? '+' : ''}{sector.change.toFixed(2)}%
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-500">{sector.volume || '-'}</div>
                  </div>

                  {/* 资金流向进度条 */}
                  <div className="relative h-0.5 sm:h-1 bg-slate-700/50 rounded-full overflow-hidden mt-1">
                    <div 
                      className={`h-full ${sector.flowDirection === 'in' ? 'bg-gradient-to-r from-red-400 to-red-500' : 'bg-gradient-to-r from-green-400 to-green-500'} transition-all duration-1000`}
                      style={{ width: `${Math.min(Math.abs(sector.netInflow || 0) / 10, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 概念标签 - 动态展示涨幅Top8行业 */}
          <div className="mt-2 sm:mt-3 grid grid-cols-4 sm:grid-cols-8 gap-1 sm:gap-1.5">
            {topConcepts.length === 0 && (
              // 默认占位
              Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-slate-800/40 backdrop-blur rounded-lg p-1 sm:p-1.5 text-center border border-white/5"
                >
                  <span className="text-[9px] sm:text-[10px] text-gray-600">--</span>
                </div>
              ))
            )}
            {topConcepts.map((item, index) => (
              <div
                key={index}
                className="bg-slate-800/40 backdrop-blur rounded-lg p-1 sm:p-1.5 text-center hover:bg-cyan-500/20 hover:border-cyan-500/50 border border-white/5 transition-all cursor-pointer group"
              >
                <span className="text-[9px] sm:text-[10px] text-gray-400 group-hover:text-cyan-400 truncate block">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧：24小时热词 - 动态数据 */}
        <div
          className={cn(
            compactLayout
              ? "md:border-l md:border-white/10 md:pl-3 xl:pl-4"
              : "border-l border-white/10 pl-4",
          )}
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="text-sm text-cyan-400 tracking-wide flex items-center gap-2">
              <Zap className="w-4 h-4" />
              24H热词
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs text-gray-500">TOP 8</span>
              <button
                onClick={fetchHotWords}
                disabled={hotWordsLoading}
                className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-cyan-400 transition-all disabled:opacity-40"
                title="刷新热词"
              >
                <RefreshCw className={`w-3 h-3 ${hotWordsLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="space-y-1 sm:space-y-1.5">
            {hotWords.length === 0 && !hotWordsLoading && (
              <div className="text-center py-8 text-gray-500 text-xs">暂无热词数据</div>
            )}
            {hotWordsLoading && hotWords.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-xs">加载中...</div>
            )}
            {hotWords.slice(0, 8).map((item, index) => (
              <div
                key={index}
                className="bg-slate-800/30 backdrop-blur rounded-lg p-1.5 sm:p-2 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center text-[10px] sm:text-xs font-bold ${
                      index < 3 ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' : 'bg-slate-700 text-gray-400'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-300 group-hover:text-cyan-400 transition-colors">{item.word}</span>
                  </div>
                  <span className={`text-[10px] sm:text-xs ${item.trend === 'up' ? 'text-red-400' : item.trend === 'down' ? 'text-green-400' : 'text-gray-400'}`}>
                    {item.change}
                  </span>
                </div>
                {/* 热度进度条 */}
                <div className="relative h-0.5 sm:h-1 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.trend === 'up' ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : item.trend === 'down' ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-gray-500 to-gray-400'} transition-all duration-1000`}
                    style={{ width: `${item.heat}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* 更新时间 */}
          <div className="mt-3 sm:mt-4 text-center">
            <span className="text-[10px] sm:text-xs text-gray-600">实时更新中...</span>
            <div className="flex justify-center gap-1 mt-1.5">
              <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse"></div>
              <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
