import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { MarketGauge } from './components/MarketGauge';
import { TreeMap } from './components/TreeMap';
import { NewsFeed } from './components/NewsFeed';
import { MarketTicker } from './components/MarketTicker';
import { useAppData } from './hooks/useAppData';

export default function App() {
  const [activeTab, setActiveTab] = useState('快讯');
  const { tickerItems, loading, loadingMsg, config, groupList } = useAppData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative flex h-screen">
        {/* 侧边栏：可传入 config / groupList 用于后续菜单与自选 */}
        <Sidebar config={config} groupList={groupList} />

        {/* 主内容区 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 顶部导航 */}
          <TopNav activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* 市场指数滚动条：使用后端 GlobalStockIndexes + telegraph 数据 */}
          <MarketTicker items={tickerItems} />

          {/* 首屏加载遮罩（与 frontend 一致） */}
          {loading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                <p className="mt-3 text-sm text-gray-400">{loadingMsg}</p>
              </div>
            </div>
          )}

          {/* 主要内容 */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-[1600px] mx-auto space-y-6">
              {/* 市场数据和热词 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <MarketGauge />
                <div className="lg:col-span-2">
                  <TreeMap />
                </div>
              </div>

              {/* 新闻板块 */}
              <NewsFeed />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}