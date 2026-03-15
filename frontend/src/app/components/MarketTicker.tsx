import { TrendingUp, TrendingDown } from 'lucide-react';

export function MarketTicker() {
  const marketData = [
    { name: '上证指数', code: '4106.96', change: '-0.64%', isUp: false },
    { name: '深证指数', code: '14270.35', change: '+1.36%', isUp: true },
    { name: '富时中国A50指数', code: '14751.28', change: '-0.77%', isUp: false },
    { name: '恒生指数', code: '25579.950', change: '+1.23%', isUp: true },
    { name: '日经225指数', code: '54092.17', change: '+1.67%', isUp: true },
    { name: '韩国综合指数', code: '5550.29', change: '-1.08%', isUp: false },
    { name: '台湾加权指数', code: '33846.35', change: '-1.37%', isUp: false },
    { name: '道琼斯指数', code: '42716.13', change: '-0.08%', isUp: false },
    { name: '纳指500', code: '6775.80', change: '-0.08%', isUp: false },
    { name: '道指600', code: '47417.27', change: '-0.61%', isUp: false },
    { name: '主要股指', code: '', change: '', isUp: true }
  ];

  return (
    <div className="bg-slate-900/20 backdrop-blur-sm border-b border-white/5 overflow-hidden hidden sm:block">
      <div className="flex animate-scroll">
        {[...marketData, ...marketData].map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 whitespace-nowrap border-r border-white/5"
          >
            <span className="text-xs text-gray-400">{item.name}</span>
            {item.code && (
              <>
                <span className="text-xs sm:text-sm font-mono">{item.code}</span>
                <span className={`text-xs flex items-center gap-1 ${
                  item.isUp ? 'text-green-400' : 'text-red-400'
                }`}>
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
