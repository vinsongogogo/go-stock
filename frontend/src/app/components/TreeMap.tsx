import { Flame, TrendingUp, Zap } from 'lucide-react';

export function TreeMap() {
  const hotWords = [
    { word: '科技股', heat: 95, trend: 'up', change: '+12%' },
    { word: '新能源', heat: 88, trend: 'up', change: '+8%' },
    { word: '半导体', heat: 82, trend: 'down', change: '-3%' },
    { word: '人工智能', heat: 78, trend: 'up', change: '+15%' },
    { word: '医药', heat: 65, trend: 'up', change: '+5%' },
    { word: '银行', heat: 58, trend: 'down', change: '-2%' },
    { word: '房地产', heat: 45, trend: 'down', change: '-6%' },
    { word: '白酒', heat: 42, trend: 'up', change: '+3%' },
  ];

  const sectors = [
    { name: '科技', value: 2847, change: '+3.2%', color: 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20', borderColor: 'border-cyan-500/30', textColor: '#06b6d4', glowColor: 'rgba(6, 182, 212, 0.3)', positive: true, trendColor: 'text-green-400', volume: '28.4亿' },
    { name: '金融', value: 1923, change: '-1.1%', color: 'bg-gradient-to-br from-purple-500/20 to-pink-600/20', borderColor: 'border-purple-500/30', textColor: '#a855f7', glowColor: 'rgba(168, 85, 247, 0.3)', positive: false, trendColor: 'text-red-400', volume: '19.2亿' },
    { name: '消费', value: 1654, change: '+2.4%', color: 'bg-gradient-to-br from-orange-500/20 to-red-600/20', borderColor: 'border-orange-500/30', textColor: '#f97316', glowColor: 'rgba(249, 115, 22, 0.3)', positive: true, trendColor: 'text-green-400', volume: '16.5亿' },
    { name: '医疗', value: 1432, change: '+1.8%', color: 'bg-gradient-to-br from-green-500/20 to-emerald-600/20', borderColor: 'border-green-500/30', textColor: '#10b981', glowColor: 'rgba(16, 185, 129, 0.3)', positive: true, trendColor: 'text-green-400', volume: '14.3亿' },
    { name: '能源', value: 1287, change: '-0.8%', color: 'bg-gradient-to-br from-yellow-500/20 to-orange-600/20', borderColor: 'border-yellow-500/30', textColor: '#eab308', glowColor: 'rgba(234, 179, 8, 0.3)', positive: false, trendColor: 'text-red-400', volume: '12.8亿' },
    { name: '工业', value: 1156, change: '+0.5%', color: 'bg-gradient-to-br from-indigo-500/20 to-purple-600/20', borderColor: 'border-indigo-500/30', textColor: '#6366f1', glowColor: 'rgba(99, 102, 241, 0.3)', positive: true, trendColor: 'text-green-400', volume: '11.5亿' },
  ];

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 p-3 sm:p-4 shadow-2xl hover:border-cyan-500/30 transition-all h-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 h-full">
        {/* 左侧：行业热力 */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="text-sm text-cyan-400 tracking-wide flex items-center gap-2">
              <Flame className="w-4 h-4" />
              行业热力图
            </h3>
            <span className="text-xs text-gray-500">LIVE</span>
          </div>
          
          {/* 数据流式布局 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
            {sectors.map((sector, index) => (
              <div
                key={index}
                className={`relative rounded-xl p-2 sm:p-3 backdrop-blur border border-white/10 hover:scale-105 transition-all cursor-pointer group overflow-hidden ${sector.color}`}
                style={{
                  boxShadow: `0 0 20px ${sector.glowColor}`,
                }}
              >
                {/* 动态光效 */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-100%] group-hover:translate-x-[100%] duration-700"></div>
                
                {/* 文字内容 */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] sm:text-xs text-gray-300">{sector.name}</span>
                    <TrendingUp className={`w-3 h-3 ${sector.trendColor}`} />
                  </div>
                  <div className="text-base sm:text-lg font-light mb-0.5" style={{ color: sector.textColor }}>
                    {sector.change}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500">{sector.volume}</div>
                </div>

                {/* 进度条 */}
                <div className="relative h-0.5 sm:h-1 bg-slate-700/50 rounded-full overflow-hidden mt-1">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000"
                    style={{ width: `${(sector.value / 3000) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* 小板块快速视图 */}
          <div className="mt-2 sm:mt-3 grid grid-cols-4 sm:grid-cols-6 gap-1 sm:gap-1.5">
            {['芯片', '5G', 'AI', '新零售', '云计算', '区块链', '物联网', '大数据', '自动驾驶', '机器人', '生物科技', '量子'].map((item, index) => (
              <div
                key={index}
                className="bg-slate-800/40 backdrop-blur rounded-lg p-1 sm:p-1.5 text-center hover:bg-cyan-500/20 hover:border-cyan-500/50 border border-white/5 transition-all cursor-pointer group"
              >
                <span className="text-[9px] sm:text-[10px] text-gray-400 group-hover:text-cyan-400">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧：24小时热词 */}
        <div className="md:border-l md:border-white/10 md:pl-3 xl:pl-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="text-sm text-cyan-400 tracking-wide flex items-center gap-2">
              <Zap className="w-4 h-4" />
              24H热词
            </h3>
            <span className="text-[10px] sm:text-xs text-gray-500">TOP 8</span>
          </div>

          <div className="space-y-1 sm:space-y-1.5">
            {hotWords.map((item, index) => (
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
                  <span className={`text-[10px] sm:text-xs ${item.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                    {item.change}
                  </span>
                </div>
                {/* 热度进度条 */}
                <div className="relative h-0.5 sm:h-1 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.trend === 'up' ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gradient-to-r from-red-500 to-orange-500'} transition-all duration-1000`}
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
