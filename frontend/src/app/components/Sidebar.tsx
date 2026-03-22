import {
  TrendingUp,
  MessageSquare,
  Settings,
  Filter,
  Brain,
  Star,
  Trophy,
  Wallet,
  BarChart3,
  Globe,
  FileText,
} from 'lucide-react';
import type { MoneyFlowMainTab } from './MoneyFlow';

interface SidebarProps {
  onDashboardClick?: () => void;
  onWatchlistClick?: () => void;
  onAboutClick?: () => void;
  onMoneyFlowNavigate?: (tab: MoneyFlowMainTab) => void;
  moneyFlowTab?: MoneyFlowMainTab;
  onStockFilterClick?: () => void;
  onSettingsClick?: () => void;
  onAIAnalysisClick?: () => void;
  onLongTigerClick?: () => void;
  currentView?: string;
}

type MenuRow =
  | {
      kind: 'route';
      icon: typeof Star;
      label: string;
      view: string;
    }
  | {
      kind: 'moneyflow';
      icon: typeof Wallet;
      label: string;
      tab: MoneyFlowMainTab;
    };

export function Sidebar({
  onDashboardClick,
  onWatchlistClick,
  onAboutClick,
  onMoneyFlowNavigate,
  moneyFlowTab = 'flow',
  onStockFilterClick,
  onSettingsClick,
  onAIAnalysisClick,
  onLongTigerClick,
  currentView,
}: SidebarProps) {
  const menuItems: MenuRow[] = [
    { kind: 'route', icon: Star, label: '自选列表', view: 'watchlist' },
    { kind: 'route', icon: TrendingUp, label: '行情中心', view: 'dashboard' },
    { kind: 'route', icon: Filter, label: '股票筛选', view: 'stockfilter' },
    { kind: 'route', icon: Trophy, label: '龙虎榜', view: 'longtiger' },
    { kind: 'route', icon: Brain, label: 'AI股票分析', view: 'aianalysis' },
    { kind: 'moneyflow', icon: Wallet, label: '个股资金流向', tab: 'flow' },
    { kind: 'moneyflow', icon: BarChart3, label: '行业排名', tab: 'industry' },
    { kind: 'moneyflow', icon: Globe, label: '全球指数', tab: 'global' },
    { kind: 'moneyflow', icon: FileText, label: '个股公告', tab: 'notice' },
  ];

  return (
    <div className="w-64 shrink-0 min-h-0 bg-slate-900/50 backdrop-blur-xl border-r border-white/10 flex flex-col">
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

      <div className="flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.kind === 'route'
              ? currentView === item.view
              : currentView === 'moneyflow' && moneyFlowTab === item.tab;

          return (
            <button
              key={item.kind === 'route' ? `${item.view}-${item.label}` : `mf-${item.tab}`}
              type="button"
              onClick={() => {
                if (item.kind === 'moneyflow') {
                  onMoneyFlowNavigate?.(item.tab);
                  return;
                }
                if (item.label === '自选列表') onWatchlistClick?.();
                else if (item.label === '行情中心') onDashboardClick?.();
                else if (item.label === '股票筛选') onStockFilterClick?.();
                else if (item.label === '龙虎榜') onLongTigerClick?.();
                else if (item.label === 'AI股票分析') onAIAnalysisClick?.();
              }}
              className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-all group ${
                isActive ? 'bg-white/5 border-l-2 border-cyan-400' : ''
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-gray-400 group-hover:text-cyan-400'
                }`}
              />
              <span className={`flex-1 text-left text-sm ${isActive ? 'text-cyan-400' : ''}`}>{item.label}</span>
            </button>
          );
        })}
      </div>

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
      </div>
    </div>
  );
}
