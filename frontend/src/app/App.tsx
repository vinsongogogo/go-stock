import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { MarketTicker } from './components/MarketTicker';
import { Dashboard } from './components/Dashboard';
import { Watchlist } from './components/Watchlist';
import { AboutUs } from './components/AboutUs';
import { MoneyFlow } from './components/MoneyFlow';
import { StockFilter } from './components/StockFilter';
import { Settings } from './components/Settings';
import { AIAnalysis } from './components/AIAnalysis';
import { Menu } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('快讯');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'watchlist', 'about', 'moneyflow', 'stockfilter', 'settings', 'aianalysis'

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
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* 侧边栏 */}
        <Sidebar 
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
          currentView={currentView}
        />

        {/* 主内容区 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 移动端顶部栏 */}
          <div className="lg:hidden bg-slate-900/50 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-light">金融看板</h1>
            <div className="w-10" /> {/* 占位平衡 */}
          </div>

          {/* 顶部导航 */}
          {/* <TopNav activeTab={activeTab} setActiveTab={setActiveTab} /> */}

          {/* 市场指数滚动条 */}
          <MarketTicker />

          {/* 主要内容 */}
          <div className="flex-1 overflow-auto p-3 sm:p-6">
            <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6">
            {currentView === 'dashboard' && <Dashboard />}
            {currentView === 'watchlist' && <Watchlist />}
            {currentView === 'about' && <AboutUs />}
            {currentView === 'moneyflow' && <MoneyFlow />}
            {currentView === 'stockfilter' && <StockFilter />}
            {currentView === 'settings' && <Settings />}
            {currentView === 'aianalysis' && <AIAnalysis />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}