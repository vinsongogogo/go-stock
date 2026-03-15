import { TrendingUp, BarChart3, LineChart, Activity, Building2, Globe, FileText, Code, MessageSquare, Settings, ChevronDown, Filter, Brain } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onWatchlistClick?: () => void;
  onAboutClick?: () => void;
  onMoneyFlowClick?: () => void;
  onStockFilterClick?: () => void;
  onSettingsClick?: () => void;
  onAIAnalysisClick?: () => void;
  currentView?: string;
}

export function Sidebar({ isOpen, onClose, onWatchlistClick, onAboutClick, onMoneyFlowClick, onStockFilterClick, onSettingsClick, onAIAnalysisClick, currentView }: SidebarProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('行情中心');

  const menuItems = [
    {
      icon: TrendingUp,
      label: '行情中心',
      submenu: ['快讯', '指数', '核心指数']
    },
    {
      icon: BarChart3,
      label: '指数',
      submenu: []
    },
    {
      icon: LineChart,
      label: '核心指数',
      submenu: []
    },
    {
      icon: Activity,
      label: '行业榜',
      submenu: []
    },
    {
      icon: Globe,
      label: '资金流向',
      submenu: []
    },
    {
      icon: Building2,
      label: '龙虎榜',
      submenu: []
    },
    {
      icon: FileText,
      label: '研报',
      submenu: []
    },
    {
      icon: Code,
      label: '公告',
      submenu: []
    },
    {
      icon: Filter,
      label: '股票筛选',
      submenu: []
    },
    {
      icon: MessageSquare,
      label: '行业研究',
      submenu: []
    },
    {
      icon: FileText,
      label: '热门',
      submenu: []
    },
    {
      icon: Activity,
      label: '选股',
      submenu: []
    },
    {
      icon: BarChart3,
      label: '精选',
      submenu: []
    }
  ];

  return (
    <div className={`
      w-64 bg-slate-900/50 backdrop-blur-xl border-r border-white/10 flex flex-col
      fixed lg:static top-0 bottom-0 left-0 z-50
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* 头部 Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-light tracking-wide text-white">金融看板</h1>
            <p className="text-xs text-gray-400">Financial Dashboard</p>
          </div>
        </div>
      </div>

      {/* 自选列表 */}
      <div className="p-4 border-b border-white/10">
        <button 
          onClick={onWatchlistClick}
          className={`w-full flex items-center justify-between hover:bg-white/5 rounded-lg p-2 transition-all group ${
            currentView === 'watchlist' ? 'bg-white/10' : ''
          }`}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-4 h-4 group-hover:scale-110 transition-transform ${
              currentView === 'watchlist' ? 'text-cyan-400' : 'text-cyan-400'
            }`} />
            <span className={`text-sm group-hover:text-cyan-400 transition-colors ${
              currentView === 'watchlist' ? 'text-cyan-400' : ''
            }`}>自选列表</span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* 菜单项 */}
      <div className="flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedSection === item.label;
          const hasSubmenu = item.submenu && item.submenu.length > 0;

          return (
            <div key={item.label}>
              <button
                onClick={() => {
                  if (hasSubmenu) {
                    setExpandedSection(isExpanded ? null : item.label);
                  } else if (item.label === '资金流向') {
                    onMoneyFlowClick?.();
                  } else if (item.label === '股票筛选') {
                    onStockFilterClick?.();
                  }
                }}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-all group ${
                  expandedSection === item.label ? 'bg-white/5 border-l-2 border-cyan-400' : ''
                }`}
              >
                <Icon className={`w-5 h-5 transition-colors ${
                  expandedSection === item.label ? 'text-cyan-400' : 'text-gray-400 group-hover:text-cyan-400'
                }`} />
                <span className="flex-1 text-left text-sm">{item.label}</span>
                {item.submenu.length > 0 && (
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                    expandedSection === item.label ? 'rotate-180' : ''
                  }`} />
                )}
              </button>
              {expandedSection === item.label && item.submenu.length > 0 && (
                <div className="bg-slate-800/30">
                  {item.submenu.map((subItem) => (
                    <button
                      key={subItem}
                      className="w-full px-12 py-2 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-cyan-400 transition-colors"
                    >
                      {subItem}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 底部 */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <button className="w-full px-4 py-2 flex items-center gap-3 hover:bg-white/5 rounded-lg transition-all">
          <BarChart3 className="w-5 h-5 text-gray-400" />
          <span className="text-sm">研究</span>
          <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
        </button>
        <button className="w-full px-4 py-2 flex items-center gap-3 hover:bg-white/5 rounded-lg transition-all">
          <Settings className="w-5 h-5 text-gray-400" />
          <span className="text-sm">宿舍设置</span>
        </button>
        <button 
          onClick={onSettingsClick}
          className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-white/5 rounded-lg transition-all ${
            currentView === 'settings' ? 'bg-white/10' : ''
          }`}
        >
          <Settings className={`w-5 h-5 ${currentView === 'settings' ? 'text-cyan-400' : 'text-gray-400'}`} />
          <span className={`text-sm ${currentView === 'settings' ? 'text-cyan-400' : ''}`}>系统设置</span>
        </button>
        <button 
          onClick={onAboutClick}
          className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-white/5 rounded-lg transition-all ${
            currentView === 'about' ? 'bg-white/10' : ''
          }`}
        >
          <MessageSquare className={`w-5 h-5 ${currentView === 'about' ? 'text-cyan-400' : 'text-gray-400'}`} />
          <span className={`text-sm ${currentView === 'about' ? 'text-cyan-400' : ''}`}>关于我们</span>
        </button>
        <button 
          onClick={onStockFilterClick}
          className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-white/5 rounded-lg transition-all ${
            currentView === 'stockfilter' ? 'bg-white/10' : ''
          }`}
        >
          <Filter className={`w-5 h-5 ${currentView === 'stockfilter' ? 'text-cyan-400' : 'text-gray-400'}`} />
          <span className={`text-sm ${currentView === 'stockfilter' ? 'text-cyan-400' : ''}`}>股票筛选</span>
        </button>
        <button 
          onClick={onAIAnalysisClick}
          className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-white/5 rounded-lg transition-all ${
            currentView === 'aianalysis' ? 'bg-white/10' : ''
          }`}
        >
          <Brain className={`w-5 h-5 ${currentView === 'aianalysis' ? 'text-cyan-400' : 'text-gray-400'}`} />
          <span className={`text-sm ${currentView === 'aianalysis' ? 'text-cyan-400' : ''}`}>AI股票分析</span>
        </button>
        <div className="pt-2 text-xs text-gray-500 text-center">
          隐藏到托盘区
        </div>
      </div>
    </div>
  );
}