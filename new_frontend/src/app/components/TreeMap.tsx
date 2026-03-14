import { TrendingUp, Zap } from 'lucide-react';

export function TreeMap() {
  const hotWords = [
    { word: '科技股', heat: 95, trend: 'up' },
    { word: '新能源', heat: 88, trend: 'up' },
    { word: '半导体', heat: 82, trend: 'down' },
    { word: '人工智能', heat: 78, trend: 'up' },
    { word: '医药', heat: 65, trend: 'up' },
    { word: '银行', heat: 58, trend: 'down' },
    { word: '房地产', heat: 45, trend: 'down' },
    { word: '白酒', heat: 42, trend: 'up' },
  ];

  const sectors = [
    { name: '科技', value: 2847, change: '+3.2%', color: 'from-cyan-500 to-blue-600', positive: true },
    { name: '金融', value: 1923, change: '-1.1%', color: 'from-purple-500 to-pink-600', positive: false },
    { name: '消费', value: 1654, change: '+2.4%', color: 'from-orange-500 to-red-600', positive: true },
    { name: '医疗', value: 1432, change: '+1.8%', color: 'from-green-500 to-emerald-600', positive: true },
    { name: '能源', value: 1287, change: '-0.8%', color: 'from-yellow-500 to-orange-600', positive: false },
    { name: '工业', value: 1156, change: '+0.5%', color: 'from-indigo-500 to-purple-600', positive: true },
  ];

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl hover:border-cyan-500/30 transition-all h-full">
      <div className="grid grid-cols-3 gap-6 h-full">
        {/* 左侧：行业热力 */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm text-cyan-400 tracking-wide flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              行业热力图
            </h3>
            <span className="text-xs text-gray-500">LIVE</span>
          </div>
          
          {/* 数据流式布局 */}
          <div className="grid grid-cols-3 gap-3">
            {sectors.map((sector, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${sector.color} bg-opacity-20 rounded-xl p-4 border border-white/10 hover:scale-105 transition-all cursor-pointer group relative overflow-hidden`}
              >
                {/* 动态光效 */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-100%] group-hover:translate-x-[100%] duration-700"></div>
                
                <div className="relative z-10">
                  <div className="text-xs text-gray-300 mb-2">{sector.name}</div>
                  <div className="text-2xl font-light text-white mb-1">{sector.value}</div>
                  <div className={`text-xs flex items-center gap-1 ${sector.positive ? 'text-green-400' : 'text-red-400'}`}>
                    <span>{sector.change}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${sector.positive ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
                  </div>
                </div>

                {/* 进度条 */}
                <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${sector.color} transition-all duration-1000`}
                    style={{ width: `${(sector.value / 3000) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* 小板块快速视图 */}
          <div className="mt-4 grid grid-cols-6 gap-2">
            {['芯片', '5G', 'AI', '新零售', '云计算', '区块链', '物联网', '大数据', '自动驾驶', '机器人', '生物科技', '量子'].map((item, index) => (
              <div
                key={index}
                className="bg-slate-800/40 backdrop-blur rounded-lg p-2 text-center hover:bg-cyan-500/20 hover:border-cyan-500/50 border border-white/5 transition-all cursor-pointer group"
              >
                <span className="text-[10px] text-gray-400 group-hover:text-cyan-400">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧：24小时热词 */}
        <div className="border-l border-white/10 pl-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm text-cyan-400 tracking-wide flex items-center gap-2">
              <Zap className="w-4 h-4" />
              24H 热词
            </h3>
          </div>

          <div className="space-y-2">
            {hotWords.map((item, index) => (
              <div
                key={index}
                className="bg-slate-800/30 backdrop-blur rounded-lg p-3 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-cyan-400">#{index + 1}</span>
                    <span className="text-sm text-white">{item.word}</span>
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${item.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                    {item.trend === 'up' ? '↑' : '↓'}
                  </div>
                </div>
                
                {/* 热度条 */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.trend === 'up' ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gradient-to-r from-red-500 to-orange-500'} transition-all duration-1000`}
                      style={{ width: `${item.heat}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">{item.heat}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 更新时间 */}
          <div className="mt-4 text-center">
            <span className="text-xs text-gray-600">实时更新中...</span>
            <div className="flex justify-center gap-1 mt-2">
              <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse"></div>
              <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse delay-75"></div>
              <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse delay-150"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
