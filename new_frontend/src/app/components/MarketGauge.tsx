import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

export function MarketGauge() {
  const sentiment = 16.10; // 0-100
  const percentage = sentiment;

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl hover:border-cyan-500/30 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm text-cyan-400 tracking-wide flex items-center gap-2">
          <Activity className="w-4 h-4" />
          市场情绪强弱
        </h3>
        <span className="text-xs text-gray-500">REALTIME</span>
      </div>
      
      {/* 六边形环形进度 */}
      <div className="relative w-full aspect-square max-w-[280px] mx-auto">
        {/* 外圈装饰环 */}
        <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
          {/* 背景六边形轨道 */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="rgba(148, 163, 184, 0.1)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          
          {/* 渐变进度环 */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
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
            style={{ 
              filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))',
            }}
          />
          
          {/* 内圈装饰 */}
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
        
        {/* 中心数值 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-light text-cyan-400 mb-1" style={{ textShadow: '0 0 20px rgba(6, 182, 212, 0.5)' }}>
            {sentiment}
          </div>
          <div className="text-xs text-gray-400 tracking-widest">SENTIMENT</div>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            <span className="text-xs text-gray-500">中性偏强</span>
          </div>
        </div>
        
        {/* 角标指示器 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2">
          <TrendingDown className="w-4 h-4 text-red-400" />
        </div>
      </div>

      {/* 底部数据指标 */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
          <div className="text-xs text-gray-400 mb-1">看涨</div>
          <div className="text-lg text-green-400">62%</div>
        </div>
        <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20">
          <div className="text-xs text-gray-400 mb-1">中性</div>
          <div className="text-lg text-yellow-400">23%</div>
        </div>
        <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
          <div className="text-xs text-gray-400 mb-1">看跌</div>
          <div className="text-lg text-red-400">15%</div>
        </div>
      </div>
    </div>
  );
}
