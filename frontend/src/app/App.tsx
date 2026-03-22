import { useState, useEffect, useCallback } from 'react';
import { useCompactLayout } from './hooks/useCompactLayout';
import { LayoutShellProvider } from './context/LayoutShellContext';
import { Sidebar } from './components/Sidebar';
import { MarketTicker } from './components/MarketTicker';
import { Dashboard } from './components/Dashboard';
import { Watchlist } from './components/Watchlist';
import { AboutUs } from './components/AboutUs';
import { MoneyFlow, type MoneyFlowMainTab } from './components/MoneyFlow';
import { StockFilter } from './components/StockFilter';
import { Settings } from './components/Settings';
import { AIAnalysis } from './components/AIAnalysis';
import { LongTigerRank } from './components/LongTigerRank';

export default function App() {
  const compactLayout = useCompactLayout();
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'watchlist', 'about', 'moneyflow', 'stockfilter', 'settings', 'aianalysis', 'longtiger'
  const [moneyFlowTab, setMoneyFlowTab] = useState<MoneyFlowMainTab>('flow');
  const [pendingAnalysisStock, setPendingAnalysisStock] = useState<{ code: string; name: string } | null>(null);

  const handleNavigateToAIAnalysis = useCallback((stockCode: string, stockName: string) => {
    setPendingAnalysisStock({ code: stockCode, name: stockName });
    setCurrentView('aianalysis');
  }, []);

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
    <LayoutShellProvider compactLayout={compactLayout}>
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative flex h-screen">
        {/* 侧边栏 */}
        <Sidebar 
          onDashboardClick={() => setCurrentView('dashboard')}
          onWatchlistClick={() => setCurrentView('watchlist')}
          onAboutClick={() => setCurrentView('about')}
          onMoneyFlowNavigate={(tab) => {
            setCurrentView('moneyflow');
            setMoneyFlowTab(tab);
          }}
          moneyFlowTab={moneyFlowTab}
          onStockFilterClick={() => setCurrentView('stockfilter')}
          onSettingsClick={() => setCurrentView('settings')}
          onAIAnalysisClick={() => setCurrentView('aianalysis')}
          onLongTigerClick={() => setCurrentView('longtiger')}
          currentView={currentView}
        />

        {/* 主内容区 */}
        <div className="flex-1 flex flex-col overflow-hidden">
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
                {visitedViews.has('watchlist') && <Watchlist onNavigateToAIAnalysis={handleNavigateToAIAnalysis} />}
              </div>
              <div style={{ display: currentView === 'about' ? 'block' : 'none' }}>
                {visitedViews.has('about') && <AboutUs />}
              </div>
              <div style={{ display: currentView === 'moneyflow' ? 'block' : 'none' }}>
                {visitedViews.has('moneyflow') && <MoneyFlow activeTab={moneyFlowTab} />}
              </div>
              <div style={{ display: currentView === 'stockfilter' ? 'block' : 'none' }}>
                {visitedViews.has('stockfilter') && <StockFilter />}
              </div>
              <div style={{ display: currentView === 'settings' ? 'block' : 'none' }}>
                {visitedViews.has('settings') && <Settings />}
              </div>
              <div style={{ display: currentView === 'aianalysis' ? 'block' : 'none' }}>
                {visitedViews.has('aianalysis') && <AIAnalysis pendingStock={pendingAnalysisStock} onPendingStockConsumed={() => setPendingAnalysisStock(null)} />}
              </div>
              <div style={{ display: currentView === 'longtiger' ? 'block' : 'none' }}>
                {visitedViews.has('longtiger') && <LongTigerRank />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </LayoutShellProvider>
  );
}