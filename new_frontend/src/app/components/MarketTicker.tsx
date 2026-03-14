import { TrendingUp, TrendingDown } from 'lucide-react';
import type { TickerItem } from '../hooks/useAppData';

const FALLBACK_ITEMS: TickerItem[] = [
  { name: '上证指数', value: '4106.96', change: '-0.64%', isUp: false },
  { name: '深证指数', value: '14270.35', change: '+1.36%', isUp: true },
  { name: '富时中国A50指数', value: '14751.28', change: '-0.77%', isUp: false },
  { name: '恒生指数', value: '25579.950', change: '+1.23%', isUp: true },
  { name: '日经225指数', value: '54092.17', change: '+1.67%', isUp: true },
  { name: '韩国综合指数', value: '5550.29', change: '-1.08%', isUp: false },
  { name: '台湾加权指数', value: '33846.35', change: '-1.37%', isUp: false },
  { name: '道琼斯指数', value: '42716.13', change: '-0.08%', isUp: false },
  { name: '纳指500', value: '6775.80', change: '-0.08%', isUp: false },
  { name: '道指600', value: '47417.27', change: '-0.61%', isUp: false },
  { name: '主要股指', value: '', change: '', isUp: true },
];

interface MarketTickerProps {
  /** 由 useAppData 提供的 tickerItems（指数 + 快讯）；不传或空则使用本地占位数据 */
  items?: TickerItem[];
}

export function MarketTicker({ items }: MarketTickerProps) {
  const list = items && items.length > 0 ? items : FALLBACK_ITEMS;
  const doubled = [...list, ...list];

  return (
    <div className="bg-slate-900/20 backdrop-blur-sm border-b border-white/5 overflow-hidden">
      <div className="flex animate-scroll">
        {doubled.map((item, index) => (
          <div
            key={`${index}-${item.name}`}
            className={`flex items-center gap-2 px-6 py-3 whitespace-nowrap border-r border-white/5 ${
              item.isTelegraph ? 'text-cyan-400/90' : ''
            }`}
          >
            <span className="text-xs text-gray-400">{item.name}</span>
            {!item.isTelegraph && item.value && (
              <>
                <span className="text-sm font-mono">{item.value}</span>
                <span
                  className={`text-xs flex items-center gap-1 ${
                    item.isUp ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {item.isUp ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {item.change}
                </span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
