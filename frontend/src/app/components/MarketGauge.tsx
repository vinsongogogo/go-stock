import { TrendingUp, TrendingDown, Activity, RefreshCw } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

// Wails Go bridge
const getApp = () => (window as any)?.go?.main?.App;

// 多维度情绪数据结构
interface MarketSentimentData {
  totalScore: number;
  limitUpDown: {
    limitUpCount: number;
    limitDownCount: number;
    score: number;
    weight: number;
  };
  upDownCount: {
    upCount: number;
    downCount: number;
    flatCount: number;
    ratio: number;
    score: number;
    weight: number;
  };
  northFund: {
    netInflow: number;
    shInflow: number;
    szInflow: number;
    score: number;
    weight: number;
  };
  nlpSentiment: {
    score: number;
    normalizedScore: number;
    description: string;
    weight: number;
  };
  updateTime: string;
}

interface StockIndex {
  name: string;
  zxj: number;
  zdf: number;
  img: string;
  location: string;
}

interface GlobalIndexes {
  common: StockIndex[];
  america: StockIndex[];
  europe: StockIndex[];
  asia: StockIndex[];
  other: StockIndex[];
}

// Sentiment gauge labels (matching Vue component)
const SENTIMENT_LABELS: Record<string, string> = {
  '100': '极热',
  '50': '乐观',
  '0': '中性',
  '-50': '谨慎',
  '-100': '冰点',
};

function getSentimentLabel(value: number): string {
  // value 范围是 -100~100
  if (value >= 60) return SENTIMENT_LABELS['100'];   // 极热
  if (value >= 20) return SENTIMENT_LABELS['50'];    // 乐观
  if (value >= -20) return SENTIMENT_LABELS['0'];    // 中性
  if (value >= -60) return SENTIMENT_LABELS['-50'];  // 谨慎
  return SENTIMENT_LABELS['-100'];                   // 冰点
}

function getSentimentColor(value: number): string {
  if (value >= 50) return 'text-red-400';
  if (value >= 0) return 'text-yellow-400';
  if (value >= -50) return 'text-blue-400';
  return 'text-green-400';
}

export function MarketGauge() {
  const [data, setData] = useState<MarketSentimentData | null>(null);
  const [mainIndexes, setMainIndexes] = useState<StockIndex[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch sentiment data - 使用新的多维度评分接口
  const fetchSentiment = useCallback(async () => {
    const App = getApp();
    if (!App) return;
    setLoading(true);
    try {
      const res: MarketSentimentData = await App.GetMarketSentimentScore();
      if (res) {
        setData(res);
        setLastUpdate(new Date());
      }
    } catch (e) {
      console.error('Failed to fetch market sentiment:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch global stock indexes
  const fetchIndexes = useCallback(async () => {
    const App = getApp();
    if (!App) return;
    try {
      const res: GlobalIndexes = await App.GlobalStockIndexes();
      if (res) {
        // Filter main indexes (matching Vue logic)
        const mainLocations = ['上海', '深圳', '香港', '台湾', '北京', '东京', '首尔', '纽约', '纳斯达克'];
        const asiaMain = (res.asia || []).filter(item => mainLocations.includes(item.location));
        const americaMain = (res.america || []).filter(item => mainLocations.includes(item.location));
        setMainIndexes([...asiaMain, ...americaMain].slice(0, 6));
      }
    } catch (e) {
      console.error('Failed to fetch indexes:', e);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchSentiment();
    fetchIndexes();
  }, [fetchSentiment, fetchIndexes]);

  // Auto refresh every 1 minute for sentiment, every 2 seconds for indexes
  useEffect(() => {
    const sentimentTimer = setInterval(fetchSentiment, 60 * 1000);
    const indexTimer = setInterval(fetchIndexes, 2 * 1000);
    return () => {
      clearInterval(sentimentTimer);
      clearInterval(indexTimer);
    };
  }, [fetchSentiment, fetchIndexes]);

  // 使用新数据结构的总分
  const sentimentScore = data?.totalScore || 0;
  const percentage = Math.min(Math.max((sentimentScore + 100) / 2, 0), 100);

  // 基于涨跌家数计算看涨/中性/看跌占比
  const upCount = data?.upDownCount?.upCount || 0;
  const downCount = data?.upDownCount?.downCount || 0;
  const flatCount = data?.upDownCount?.flatCount || 0;
  const totalStocksNum = upCount + downCount + flatCount || 1;

  const bullishPct = Math.round((upCount / totalStocksNum) * 100) || 0;
  const bearishPct = Math.round((downCount / totalStocksNum) * 100) || 0;
  const neutralPct = Math.max(0, 100 - bullishPct - bearishPct);

  return (
    <div className="bg-card dark:bg-slate-900 rounded-2xl border border-border p-3 sm:p-4 shadow-md hover:border-cyan-500/30 transition-all">
      {/* Main Indexes Ticker */}
      {/* {mainIndexes.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {mainIndexes.map((idx, i) => (
            <div
              key={i}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] border ${
                idx.zdf > 0
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-green-500/10 border-green-500/30 text-green-400'
              }`}
            >
              {idx.img && (
                <img src={idx.img} alt={idx.name} className="w-4 h-4 rounded" />
              )}
              <span className="font-medium">{idx.name}</span>
              <span>{typeof idx.zxj === 'number' ? idx.zxj.toFixed(2) : parseFloat(String(idx.zxj || 0)).toFixed(2)}</span>
              <span>{(typeof idx.zdf === 'number' ? idx.zdf : parseFloat(String(idx.zdf || 0))) > 0 ? '+' : ''}{typeof idx.zdf === 'number' ? idx.zdf.toFixed(2) : parseFloat(String(idx.zdf || 0)).toFixed(2)}%</span>
            </div>
          ))}
        </div>
      )} */}

      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h3 className="text-sm text-cyan-400 tracking-wide flex items-center gap-2">
          <Activity className="w-4 h-4" />
          市场情绪强弱
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500">
            {lastUpdate.toLocaleTimeString('zh-CN', { hour12: false })}
          </span>
          <button
            onClick={fetchSentiment}
            disabled={loading}
            className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-cyan-400 transition-all disabled:opacity-40"
            title="刷新"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      {/* Gauge */}
      <div className="relative w-full aspect-square max-w-[200px] sm:max-w-[240px] mx-auto">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
          {/* Background track */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="rgba(148, 163, 184, 0.1)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          
          {/* Progress gradient */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#03fb6a" />
              <stop offset="33%" stopColor="#58e1f9" />
              <stop offset="66%" stopColor="#ef5922" />
              <stop offset="100%" stopColor="#f11d29" />
            </linearGradient>
          </defs>
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={`${(percentage / 100) * 502} 502`}
            className="transition-all duration-1000"
            style={{ filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))' }}
          />
          
          {/* Inner decoration */}
          <circle
            cx="100"
            cy="100"
            r="65"
            fill="none"
            stroke="rgba(6, 182, 212, 0.2)"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="animate-spin"
            style={{ animationDuration: '20s' }}
          />
        </svg>
        
        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-3xl sm:text-4xl font-light mb-0.5 sm:mb-1 ${getSentimentColor(sentimentScore)}`} 
               style={{ textShadow: '0 0 20px rgba(6, 182, 212, 0.5)' }}>
            {sentimentScore.toFixed(2)}
          </div>
          <div className="text-xs text-gray-400 tracking-widest">{getSentimentLabel(sentimentScore)}</div>
        </div>
        
        {/* Corner indicators */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2">
          <TrendingDown className="w-4 h-4 text-red-400" />
        </div>
      </div>

      {/* 新增：迷你指标卡片区域 */}
      {data && (
        <div className="mt-2 sm:mt-3 grid grid-cols-2 gap-1.5 sm:gap-2">
          {/* 涨停/跌停 */}
          <div className="bg-slate-800/40 rounded-lg p-2 text-center border border-white/5">
            <div className="text-[9px] sm:text-[10px] text-gray-500">涨停/跌停</div>
            <div className="text-sm sm:text-base">
              <span className="text-red-400 font-medium">{data.limitUpDown?.limitUpCount || 0}</span>
              <span className="text-gray-500 mx-1">/</span>
              <span className="text-green-400 font-medium">{data.limitUpDown?.limitDownCount || 0}</span>
            </div>
          </div>
          
          {/* 涨跌家数 */}
          <div className="bg-slate-800/40 rounded-lg p-2 text-center border border-white/5">
            <div className="text-[9px] sm:text-[10px] text-gray-500">涨跌家数</div>
            <div className="text-sm sm:text-base">
              <span className="text-red-400 font-medium">{data.upDownCount?.upCount || 0}</span>
              <span className="text-gray-500 mx-1">/</span>
              <span className="text-green-400 font-medium">{data.upDownCount?.downCount || 0}</span>
            </div>
          </div>
          
          {/* 北向资金 */}
          <div className="bg-slate-800/40 rounded-lg p-2 text-center col-span-2 border border-white/5">
            <div className="text-[9px] sm:text-[10px] text-gray-500">北向资金净流入</div>
            <div className={`text-sm sm:text-base font-medium ${(data.northFund?.netInflow || 0) >= 0 ? 'text-red-400' : 'text-green-400'}`}>
              {(data.northFund?.netInflow || 0) >= 0 ? '+' : ''}{(data.northFund?.netInflow || 0).toFixed(2)}亿
            </div>
          </div>
        </div>
      )}

      {/* Bottom stats - 看涨/中性/看跌占比 */}
      <div className="mt-2 sm:mt-3 grid grid-cols-3 gap-1.5 sm:gap-2">
        <div className="bg-red-500/10 rounded-lg p-2 sm:p-3 border border-red-500/20">
          <div className="text-[10px] sm:text-xs text-gray-400 mb-0.5">看涨</div>
          <div className="text-sm sm:text-base text-red-400">{bullishPct}%</div>
        </div>
        <div className="bg-yellow-500/10 rounded-lg p-2 sm:p-3 border border-yellow-500/20">
          <div className="text-[10px] sm:text-xs text-gray-400 mb-0.5">中性</div>
          <div className="text-sm sm:text-base text-yellow-400">{neutralPct}%</div>
        </div>
        <div className="bg-green-500/10 rounded-lg p-2 sm:p-3 border border-green-500/20">
          <div className="text-[10px] sm:text-xs text-gray-400 mb-0.5">看跌</div>
          <div className="text-sm sm:text-base text-green-400">{bearishPct}%</div>
        </div>
      </div>
    </div>
  );
}
