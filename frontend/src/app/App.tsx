import { useState, useEffect } from 'react';
import { useCompactLayout } from './hooks/useCompactLayout';
import { Sidebar } from './components/Sidebar';
import { MarketTicker } from './components/MarketTicker';
import { Dashboard } from './components/Dashboard';
import { Watchlist } from './components/Watchlist';
import { AboutUs } from './components/AboutUs';
import { MoneyFlow } from './components/MoneyFlow';
import { StockFilter } from './components/StockFilter';
import { Settings } from './components/Settings';
import { AIAnalysis } from './components/AIAnalysis';
import { LongTigerRank } from './components/LongTigerRank';
import { Menu } from 'lucide-react';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'watchlist', 'about', 'moneyflow', 'stockfilter', 'settings', 'aianalysis', 'longtiger'
  const compactLayout = useCompactLayout();

  // Keep-Alive: 追踪已访问的页面
  const [visitedViews, setVisitedViews] = useState<Set<string>>(() => new Set(['dashboard']));

  // 当 currentView 变化时，将新视图加入 visitedViews
  useEffect(() => {
    setVisitedViews(prev => {
      if (prev.has(currentView)) return prev;
      const next = new Set(prev);
      next.add(currentView);
      return next;
    });
  }, [currentView]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative flex h-screen">
        {/* 移动端遮罩层 */}
        {sidebarOpen && compactLayout && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* 侧边栏 */}
        <Sidebar 
          compactLayout={compactLayout}
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          onDashboardClick={() => {
            setCurrentView('dashboard');
            setSidebarOpen(false);
          }}
          onWatchlistClick={() => {
            setCurrentView('watchlist');
            setSidebarOpen(false); // 移动端关闭侧边栏
          }}
          onAboutClick={() => {
            setCurrentView('about');
            setSidebarOpen(false);
          }}
          onMoneyFlowClick={() => {
            setCurrentView('moneyflow');
            setSidebarOpen(false);
          }}
          onStockFilterClick={() => {
            setCurrentView('stockfilter');
            setSidebarOpen(false);
          }}
          onSettingsClick={() => {
            setCurrentView('settings');
            setSidebarOpen(false);
          }}
          onAIAnalysisClick={() => {
            setCurrentView('aianalysis');
            setSidebarOpen(false);
          }}
          onLongTigerClick={() => {
            setCurrentView('longtiger');
            setSidebarOpen(false);
          }}
          currentView={currentView}
        />

        {/* 主内容区 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 紧凑布局顶部栏（窄屏或手持设备） */}
          {compactLayout && (
            <div className="bg-slate-900/50 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between">
              <button 
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-lg font-light">金融看板</h1>
              <div className="w-10" aria-hidden /> {/* 占位平衡 */}
            </div>
          )}

          {/* 市场指数滚动条 */}
          <MarketTicker />

          {/* 主要内容 */}
          <div className="flex-1 overflow-auto p-3 sm:p-6">
            <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6">
              {/* Keep-Alive 渲染：通过 display 控制可见性，已访问的页面保持挂载 */}
              <div style={{ display: currentView === 'dashboard' ? 'block' : 'none' }}>
                {visitedViews.has('dashboard') && <Dashboard />}
              </div>
              <div style={{ display: currentView === 'watchlist' ? 'block' : 'none' }}>
                {visitedViews.has('watchlist') && <Watchlist />}
              </div>
              <div style={{ display: currentView === 'about' ? 'block' : 'none' }}>
                {visitedViews.has('about') && <AboutUs />}
              </div>
              <div style={{ display: currentView === 'moneyflow' ? 'block' : 'none' }}>
                {visitedViews.has('moneyflow') && <MoneyFlow />}
              </div>
              <div style={{ display: currentView === 'stockfilter' ? 'block' : 'none' }}>
                {visitedViews.has('stockfilter') && <StockFilter />}
              </div>
              <div style={{ display: currentView === 'settings' ? 'block' : 'none' }}>
                {visitedViews.has('settings') && <Settings />}
              </div>
              <div style={{ display: currentView === 'aianalysis' ? 'block' : 'none' }}>
                {visitedViews.has('aianalysis') && <AIAnalysis />}
              </div>
              <div style={{ display: currentView === 'longtiger' ? 'block' : 'none' }}>
                {visitedViews.has('longtiger') && <LongTigerRank />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}