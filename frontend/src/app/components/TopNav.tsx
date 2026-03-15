interface TopNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function TopNav({ activeTab, setActiveTab }: TopNavProps) {
  const tabs = [
    '快讯', '指数', '核心指数', '行业榜', '资金流向', '龙虎榜', 
    '研报', '公告', '行业研究', '热门', '选股', '精选'
  ];

  return (
    <div className="bg-slate-900/30 backdrop-blur-xl border-b border-white/10 hidden lg:block">
      <div className="flex items-center overflow-x-auto scrollbar-hide px-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm whitespace-nowrap transition-all relative ${
              activeTab === tab
                ? 'text-cyan-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
