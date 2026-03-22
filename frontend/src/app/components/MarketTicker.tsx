import { TrendingUp, TrendingDown } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

// Wails Go bridge
const getApp = () => (window as any)?.go?.main?.App;

interface StockIndex {
  name: string;
  zxj: number | string;
  zdf: number | string;
  img?: string;
  location: string;
}

interface GlobalIndexes {
  common?: StockIndex[];
  america?: StockIndex[];
  europe?: StockIndex[];
  asia?: StockIndex[];
  other?: StockIndex[];
}

export function MarketTicker() {
  const [mainIndexes, setMainIndexes] = useState<StockIndex[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchIndexes = useCallback(async () => {
    const App = getApp();
    if (!App) return;
    setLoading(true);
    try {
      const res: GlobalIndexes = await App.GlobalStockIndexes();
      if (res) {
        // Filter main indexes (matching Vue component logic)
        const mainLocations = ['上海', '深圳', '香港', '台湾', '北京', '东京', '首尔', '纽约', '纳斯达克'];
        const asiaMain = (res.asia || []).filter(item => mainLocations.includes(item.location));
        const americaMain = (res.america || []).filter(item => mainLocations.includes(item.location));
        const combined = [...asiaMain, ...americaMain];
        setMainIndexes(combined);
      }
    } catch (e) {
      console.error('Failed to fetch indexes:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchIndexes();
  }, [fetchIndexes]);

  // Auto refresh every 2 seconds (matching Vue component)
  useEffect(() => {
    const timer = setInterval(fetchIndexes, 2000);
    return () => clearInterval(timer);
  }, [fetchIndexes]);

  const formatNumber = (val: number | string): string => {
    const num = typeof val === 'number' ? val : parseFloat(String(val || 0));
    return num.toFixed(2);
  };

  const getChangePercent = (val: number | string): string => {
    const num = typeof val === 'number' ? val : parseFloat(String(val || 0));
    return (num > 0 ? '+' : '') + num.toFixed(2) + '%';
  };

  const isPositive = (val: number | string): boolean => {
    const num = typeof val === 'number' ? val : parseFloat(String(val || 0));
    return num >= 0;
  };

  // Duplicate data for seamless scrolling animation
  const displayData = mainIndexes.length > 0 ? [...mainIndexes, ...mainIndexes] : [];

  if (mainIndexes.length === 0) {
    return (
      <div className="bg-muted dark:bg-slate-900 border-b border-border overflow-hidden hidden sm:block">
        <div className="flex items-center justify-center py-2 sm:py-3">
          <span className="text-xs text-muted-foreground">{loading ? '加载中...' : '暂无数据'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted dark:bg-slate-900 border-b border-border overflow-hidden hidden sm:block">
      <div className="flex animate-scroll">
        {displayData.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 whitespace-nowrap border-r border-border"
          >
            {item.img && (
              <img src={item.img} alt={item.name} className="w-4 h-4 rounded" />
            )}
            <span className="text-xs text-muted-foreground">{item.name}</span>
            <span className="text-xs sm:text-sm font-mono text-foreground">{formatNumber(item.zxj)}</span>
            <span className={`text-xs flex items-center gap-1 ${
              isPositive(item.zdf) ? 'text-red-400' : 'text-green-400'
            }`}>
              {isPositive(item.zdf) ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {getChangePercent(item.zdf)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
