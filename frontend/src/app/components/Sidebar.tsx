import { TrendingUp, MessageSquare, Settings, ChevronDown, Filter, Brain, History, Star, Trophy } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  /** true：抽屉式侧边栏；false：常驻桌面侧栏 */
  compactLayout: boolean;
  isOpen: boolean;
  onClose: () => void;
  onDashboardClick?: () => void;
  onWatchlistClick?: () => void;
  onAboutClick?: () => void;
  onMoneyFlowClick?: () => void;
  onStockFilterClick?: () => void;
  onSettingsClick?: () => void;
  onAIAnalysisClick?: () => void;
  onLongTigerClick?: () => void;
  onAnalysisHistoryClick?: () => void;
  currentView?: string;
}

export function Sidebar({ compactLayout, isOpen, onClose, onDashboardClick, onWatchlistClick, onAboutClick, onMoneyFlowClick, onStockFilterClick, onSettingsClick, onAIAnalysisClick, onLongTigerClick, onAnalysisHistoryClick, currentView }: SidebarProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('行情中心');

  const menuItems = [
    {
      icon: Star,
      label: '自选列表',
      view: 'watchlist',
      submenu: []
    },
    {
      icon: TrendingUp,
      label: '行情中心',
      view: 'dashboard',
      submenu: []
    },
    {
      icon: Filter,
      label: '股票筛选',
      view: 'stockfilter',
      submenu: []
    },
    {
      icon: Trophy,
      label: '龙虎榜',
      view: 'longtiger',
      submenu: []
    },
    {
      icon: Brain,
      label: 'AI股票分析',
      view: 'aianalysis' as const,
      submenu: []
    },
    {
      icon: History,
      label: '分析历史',
      view: 'analysisHistory' as const,
      submenu: []
    }
  ];

  // PC（非 compact）：侧栏参与 flex 流、始终可见；移动：fixed 抽屉，默认收起
  const offscreen = compactLayout && !isOpen;

  return (
    <div className={`
      w-64 shrink-0 min-h-0 bg-slate-900/50 backdrop-blur-xl border-r border-white/10 flex flex-col
      top-0 bottom-0 left-0 z-50
      ${compactLayout ? 'fixed' : 'static'}
      transform transition-transform duration-300 ease-in-out
      ${offscreen ? '-translate-x-full' : 'translate-x-0'}
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

      {/* 菜单项 */}
      <div className="flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedSection === item.label;
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isActive = item.view ? currentView === item.view : false;

          return (
            <div key={item.label}>
              <button
                onClick={() => {
                  if (hasSubmenu) {
                    setExpandedSection(isExpanded ? null : item.label);
                  } else if (item.label === '自选列表') {
                    onWatchlistClick?.();
                  } else if (item.label === '行情中心') {
                    onDashboardClick?.();
                  } else if (item.label === '资金流向') {
                    onMoneyFlowClick?.();
                  } else if (item.label === '股票筛选') {
                    onStockFilterClick?.();
                  } else if (item.label === '龙虎榜') {
                    onLongTigerClick?.();
                  } else if (item.label === 'AI股票分析') {
                    onAIAnalysisClick?.();
                  } else if (item.label === '分析历史') {
                    onAnalysisHistoryClick?.();
                  }
                }}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-all group ${
                  isActive ? 'bg-white/5 border-l-2 border-cyan-400' : ''
                }`}
              >
                <Icon className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-gray-400 group-hover:text-cyan-400'
                }`} />
                <span className={`flex-1 text-left text-sm ${
                  isActive ? 'text-cyan-400' : ''
                }`}>{item.label}</span>
                {item.submenu.length > 0 && (
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`} />
                )}
              </button>
              {isExpanded && item.submenu.length > 0 && (
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
        <div className="pt-2 text-xs text-gray-500 text-center">
          隐藏到托盘区
        </div>
      </div>
    </div>
  );
}