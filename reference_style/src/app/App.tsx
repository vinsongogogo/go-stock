import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { MarketGauge } from './components/MarketGauge';
import { TreeMap } from './components/TreeMap';
import { NewsFeed } from './components/NewsFeed';
import { MarketTicker } from './components/MarketTicker';

export default function App() {
  const [activeTab, setActiveTab] = useState('快讯');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative flex h-screen">
        {/* 侧边栏 */}
        <Sidebar />

        {/* 主内容区 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 顶部导航 */}
          <TopNav activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* 市场指数滚动条 */}
          <MarketTicker />

          {/* 主要内容 */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-[1600px] mx-auto space-y-6">
              {/* 最近24小时热词 */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-light tracking-wide text-cyan-400 mb-2">
                  最近24小时热词
                </h2>
                <div className="flex items-center justify-center gap-3">
                  <button className="p-2 rounded-full hover:bg-white/5 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <button className="p-2 rounded-full hover:bg-white/5 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button className="p-2 rounded-full hover:bg-white/5 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                  <button className="p-2 rounded-full hover:bg-white/5 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 仪表盘和树图 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MarketGauge />
                <TreeMap />
              </div>

              {/* 新闻板块 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NewsFeed 
                  title="财联社电报"
                  newsItems={[
                    {
                      time: '12:02:05',
                      title: '财联社3月12日午间新闻播报',
                      tags: ['金融圈大事', '早晚']
                    },
                    {
                      time: '12:02:05',
                      title: '财联社3月12日午间新闻播报',
                      tags: ['金融圈大事', '早晚']
                    },
                    {
                      time: '12:02:05',
                      title: '财联社3月12日午间新闻播报',
                      tags: ['金融圈大事', '早晚']
                    },
                    {
                      time: '12:00:20',
                      title: '财联社3月12日电，港股午间收盘，恒生指数跌1.23%，恒生科技指数跌1.21%，石油股票跌幅靠前，科创板集成电路跌2%，恒生集成电路跌2%。',
                      tags: ['金融圈大事', '早晚']
                    }
                  ]}
                  accentColor="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30"
                />
                <NewsFeed 
                  title="新浪财经"
                  newsItems={[
                    {
                      time: '12:04:49',
                      title: '正美电讯2营收 暴增长回归"爱乐特计划"单独针对2027年"',
                      tags: ['公司', '中延']
                    },
                    {
                      time: '12:04:08',
                      title: '比亚迪法国兰克"让正蓝天蓝"倡导',
                      tags: ['其他', '中延']
                    },
                    {
                      time: '12:03:32',
                      title: '科大讯飞AWE 2026宣展在车机人交车成装管客机人入',
                      tags: ['公司', '中延']
                    },
                    {
                      time: '12:03:26',
                      title: '太古集团：预计今午净收益港股增总政应所用房房房房长在。',
                      tags: ['公司', '早晚', '成绩', '创报']
                    }
                  ]}
                  accentColor="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
