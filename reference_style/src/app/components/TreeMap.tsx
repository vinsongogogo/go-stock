export function TreeMap() {
  const sectors = [
    { name: '中性', color: 'bg-indigo-600', size: 'col-span-3 row-span-4', textColor: 'text-white' },
    { name: '银行', color: 'bg-red-500', size: 'col-span-3 row-span-3', textColor: 'text-white' },
    { name: '券商', color: 'bg-purple-500', size: 'col-span-2 row-span-3', textColor: 'text-white' },
    { name: '半导体', color: 'bg-yellow-500', size: 'col-span-2 row-span-2', textColor: 'text-gray-900' },
    { name: '保险', color: 'bg-pink-500', size: 'col-span-2 row-span-2', textColor: 'text-white' },
    { name: 'PB', color: 'bg-green-600', size: 'col-span-2 row-span-3', textColor: 'text-white' },
    { name: '机械', color: 'bg-cyan-500', size: 'col-span-2 row-span-2', textColor: 'text-gray-900' },
    { name: '信息技术', color: 'bg-orange-500', size: 'col-span-2 row-span-2', textColor: 'text-white' },
    { name: '人工智能', color: 'bg-blue-500', size: 'col-span-2 row-span-2', textColor: 'text-white' },
    { name: '化工', color: 'bg-pink-400', size: 'col-span-1 row-span-2', textColor: 'text-white' },
    { name: '芯片', color: 'bg-red-400', size: 'col-span-2 row-span-2', textColor: 'text-white' },
    { name: '网安建设', color: 'bg-teal-500', size: 'col-span-2 row-span-2', textColor: 'text-white' },
    { name: '白酒', color: 'bg-amber-600', size: 'col-span-1 row-span-1', textColor: 'text-white' },
    { name: '港口', color: 'bg-blue-400', size: 'col-span-2 row-span-2', textColor: 'text-white' },
    { name: '汽车零部件', color: 'bg-green-500', size: 'col-span-2 row-span-1', textColor: 'text-white' },
    { name: '房地产', color: 'bg-orange-400', size: 'col-span-1 row-span-1', textColor: 'text-white' },
  ];

  // 生成更多小板块
  const smallSectors = [
    { name: '白酒-2', color: 'bg-red-500' },
    { name: '白酒-3', color: 'bg-pink-600' },
    { name: '日化', color: 'bg-cyan-600' },
    { name: '日化-2', color: 'bg-teal-600' },
    { name: '医疗', color: 'bg-purple-600' },
    { name: '医药', color: 'bg-indigo-500' },
    { name: '其他', color: 'bg-green-700' },
    { name: '医药-2', color: 'bg-blue-600' },
    { name: '教育', color: 'bg-yellow-600' },
    { name: '制药', color: 'bg-orange-600' },
    { name: '新能源', color: 'bg-lime-600' },
    { name: '环保', color: 'bg-emerald-600' },
    { name: '食品', color: 'bg-rose-500' },
    { name: '纺织', color: 'bg-violet-500' },
    { name: '家电', color: 'bg-fuchsia-500' },
    { name: '建材', color: 'bg-sky-500' },
    { name: '其他-2', color: 'bg-amber-500' },
    { name: '其他-3', color: 'bg-lime-500' },
    { name: '医药-3', color: 'bg-teal-400' },
    { name: '化肥', color: 'bg-cyan-700' },
  ];

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl hover:border-cyan-500/30 transition-all">
      <div className="grid grid-cols-12 gap-1 h-[400px]">
        {/* 大板块 */}
        <div className="col-span-3 row-span-4 bg-indigo-600/80 backdrop-blur rounded-lg p-3 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer border border-indigo-400/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-white font-light text-lg relative z-10">中性</span>
        </div>
        
        <div className="col-span-3 row-span-3 bg-red-500/80 backdrop-blur rounded-lg p-3 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer border border-red-400/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-white font-light relative z-10">银行</span>
        </div>
        
        <div className="col-span-3 row-span-3 bg-purple-500/80 backdrop-blur rounded-lg p-3 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer border border-purple-400/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-white font-light relative z-10">券商</span>
        </div>
        
        <div className="col-span-3 row-span-3 bg-yellow-500/80 backdrop-blur rounded-lg p-3 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer border border-yellow-400/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-gray-900 font-light relative z-10">半导体</span>
        </div>
        
        {/* 中等板块 */}
        <div className="col-span-3 row-span-2 bg-pink-500/80 backdrop-blur rounded-lg p-2 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer border border-pink-400/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-white text-sm font-light relative z-10">保险</span>
        </div>
        
        <div className="col-span-2 row-span-3 bg-green-600/80 backdrop-blur rounded-lg p-2 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer border border-green-500/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-white text-sm font-light relative z-10">PB</span>
        </div>
        
        <div className="col-span-2 row-span-2 bg-cyan-500/80 backdrop-blur rounded-lg p-2 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer border border-cyan-400/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-gray-900 text-sm font-light relative z-10">机械</span>
        </div>
        
        <div className="col-span-2 row-span-2 bg-orange-500/80 backdrop-blur rounded-lg p-2 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer border border-orange-400/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-white text-sm font-light relative z-10">信息技术</span>
        </div>
        
        <div className="col-span-2 row-span-2 bg-blue-500/80 backdrop-blur rounded-lg p-2 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer border border-blue-400/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-white text-sm font-light relative z-10">人工智能</span>
        </div>
        
        {/* 网格中的其他小板块 */}
        {smallSectors.slice(0, 12).map((sector, index) => (
          <div
            key={index}
            className={`${sector.color}/80 backdrop-blur rounded p-1.5 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer border border-white/20 relative overflow-hidden group`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="text-white text-[10px] font-light relative z-10 text-center leading-tight">
              {sector.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
