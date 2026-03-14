export function MarketGauge() {
  return (
    <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl hover:border-cyan-500/30 transition-all">
      <h3 className="text-sm text-gray-400 mb-6 tracking-wide">中性</h3>
      
      <div className="relative w-full aspect-square max-w-sm mx-auto">
        {/* 外圈装饰 */}
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-pulse"></div>
        
        {/* 仪表盘背景 */}
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* 背景弧 */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          
          {/* 刻度线 */}
          {[...Array(21)].map((_, i) => {
            const angle = -120 + (i * 12);
            const rad = (angle * Math.PI) / 180;
            const x1 = 100 + 75 * Math.cos(rad);
            const y1 = 100 + 75 * Math.sin(rad);
            const x2 = 100 + 85 * Math.cos(rad);
            const y2 = 100 + 85 * Math.sin(rad);
            
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={i % 5 === 0 ? '#06b6d4' : '#334155'}
                strokeWidth={i % 5 === 0 ? '2' : '1'}
                strokeLinecap="round"
              />
            );
          })}
          
          {/* 彩色弧线 */}
          <path
            d="M 30 130 A 80 80 0 1 1 170 130"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.3"
          />
          
          {/* 指针 */}
          <g transform="rotate(16 100 100)">
            <path
              d="M 100 100 L 95 95 L 100 25 L 105 95 Z"
              fill="url(#pointerGradient)"
              filter="drop-shadow(0 0 8px rgba(6, 182, 212, 0.8))"
            />
            <defs>
              <linearGradient id="pointerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0891b2" />
              </linearGradient>
            </defs>
          </g>
          
          {/* 中心圆 */}
          <circle cx="100" cy="100" r="8" fill="#0891b2" />
          <circle cx="100" cy="100" r="4" fill="#22d3ee" />
        </svg>
        
        {/* 中心数值 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-light text-cyan-400 mt-8" style={{ textShadow: '0 0 20px rgba(6, 182, 212, 0.5)' }}>
            16.10
          </div>
          <div className="text-sm text-gray-400 mt-2 tracking-wider">市场情绪强弱</div>
        </div>
        
        {/* 刻度标签 */}
        <div className="absolute left-2 bottom-12 text-xs text-green-400 font-light">弱势</div>
        <div className="absolute right-2 bottom-12 text-xs text-red-400 font-light">强势</div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 text-xs text-cyan-400 font-light">中性</div>
      </div>
    </div>
  );
}
