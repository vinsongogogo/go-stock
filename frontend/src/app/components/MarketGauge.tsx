import { TrendingUp, TrendingDown, Activity, RefreshCw } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

// Wails Go bridge
const getApp = () => (window as any)?.go?.main?.App;

interface WordFreq {
  Word: string;
  Frequency: number;
  Weight: number;
  Score: number;
}

interface SentimentResult {
  Score: number;
  Sentiment: string;
  Confidence: number;
}

interface SentimentData {
  result: SentimentResult;
  frequencies: WordFreq[];
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
  if (value >= 75) return SENTIMENT_LABELS['100'];
  if (value >= 25) return SENTIMENT_LABELS['50'];
  if (value >= -25) return SENTIMENT_LABELS['0'];
  if (value >= -75) return SENTIMENT_LABELS['-50'];
  return SENTIMENT_LABELS['-100'];
}

function getSentimentColor(value: number): string {
  if (value >= 50) return 'text-red-400';
  if (value >= 0) return 'text-yellow-400';
  if (value >= -50) return 'text-blue-400';
  return 'text-green-400';
}

export function MarketGauge() {
  const [sentiment, setSentiment] = useState<SentimentResult | null>(null);
  const [frequencies, setFrequencies] = useState<WordFreq[]>([]);
  const [mainIndexes, setMainIndexes] = useState<StockIndex[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch sentiment data
  const fetchSentiment = useCallback(async () => {
    const App = getApp();
    if (!App) return;
    setLoading(true);
    try {
      const res: SentimentData = await App.AnalyzeSentimentWithFreqWeight('');
      if (res) {
        setSentiment(res.result);
        setFrequencies(res.frequencies?.slice(0, 10) || []);
        setLastUpdate(new Date());
      }
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

  const sentimentScore = sentiment ? sentiment.Score * 0.2 : 0;
  const percentage = Math.min(Math.max((sentimentScore + 100) / 2, 0), 100);

  // Calculate bull/bear/neutral percentages from frequencies
  const totalFreq = frequencies.reduce((sum, f) => sum + f.Frequency, 0) || 1;
  const bullish = frequencies.filter(f => f.Score > 0).reduce((sum, f) => sum + f.Frequency, 0);
  const bearish = frequencies.filter(f => f.Score < 0).reduce((sum, f) => sum + f.Frequency, 0);
  const neutral = frequencies.filter(f => f.Score === 0).reduce((sum, f) => sum + f.Frequency, 0);

  const bullishPct = Math.round((bullish / totalFreq) * 100) || 62;
  const bearishPct = Math.round((bearish / totalFreq) * 100) || 15;
  const neutralPct = 100 - bullishPct - bearishPct || 23;

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 p-3 sm:p-4 shadow-2xl hover:border-cyan-500/30 transition-all">
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

      {/* Bottom stats */}
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

      {/* Top keywords */}
      {/* {frequencies.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="text-[10px] text-gray-500 mb-2">热词</div>
          <div className="flex flex-wrap gap-1">
            {frequencies.slice(0, 8).map((word, i) => (
              <span
                key={i}
                className={`px-1.5 py-0.5 rounded text-[9px] border ${
                  word.Score > 0
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : word.Score < 0
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : 'bg-white/5 border-white/10 text-gray-400'
                }`}
              >
                {word.Word}
              </span>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
}
