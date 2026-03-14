import { useState } from 'react';
import { Star, FlaskConical, Settings, Github, Menu, Power } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('行业排名');
  const [activeRankingTab, setActiveRankingTab] = useState('行业涨幅排名');

  const tabs = ['市场快讯', '全球股指', '重大指数', '行业排名', '个股资金流向', '龙虎榜', '个股研报', '公告'];
  const rankingTabs = [
    '行业涨幅排名',
    '行业资金排名',
    '证监会行业资金排名',
    '概念板块资金排名'
  ];

  const industryData = [
    {
      name: '煤炭开采',
      rate: '4.33%',
      rate5: '6.25%',
      rate20: '17.14%',
      leadStock: '郑州煤电',
      leadCode: 'sh600121',
      leadRate: '10.06%',
      latest: '5.14'
    },
    {
      name: '风电设备',
      rate: '4.26%',
      rate5: '9.71%',
      rate20: '9.02%',
      leadStock: '双一科技',
      leadCode: 'sz300690',
      leadRate: '19.99%',
      latest: '37.4'
    },
    {
      name: '焦炭II',
      rate: '3.00%',
      rate5: '2.30%',
      rate20: '5.49%',
      leadStock: '陕西黑猫',
      leadCode: 'sh601015',
      leadRate: '10.00%',
      latest: '5.44'
    },
    {
      name: '燃气II',
      rate: '2.64%',
      rate5: '-1.20%',
      rate20: '7.15%',
      leadStock: '德龙汇能',
      leadCode: 'sz000593',
      leadRate: '9.98%',
      latest: '9.98'
    },
    {
      name: '养殖业',
      rate: '2.07%',
      rate5: '7.75%',
      rate20: '7.36%',
      leadStock: '天邦食品',
      leadCode: 'sz002124',
      leadRate: '3.95%',
      latest: '2.63'
    }
  ];

  return (
    <div className="size-full flex bg-[#0a0e1a]">
      {/* 侧边栏 */}
      <div className="w-[228px] bg-[#0d1117] border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-white text-lg">大聪明</h1>
        </div>
        
        <nav className="flex-1">
          <div className="py-2">
            <button className="w-full px-4 py-3 flex items-center gap-3 text-gray-400 hover:bg-gray-800/50 transition-colors">
              <Star className="w-5 h-5" />
              <span>股票自选</span>
            </button>
            
            <button className="w-full px-4 py-3 flex items-center gap-3 bg-[#1a2332] text-emerald-400 border-l-2 border-emerald-400">
              <span className="text-xl">📊</span>
              <span>市场行情</span>
            </button>
            
            <button className="w-full px-4 py-3 flex items-center gap-3 text-gray-400 hover:bg-gray-800/50 transition-colors">
              <FlaskConical className="w-5 h-5" />
              <span>研究中心</span>
            </button>
            
            <button className="w-full px-4 py-3 flex items-center gap-3 text-gray-400 hover:bg-gray-800/50 transition-colors">
              <Settings className="w-5 h-5" />
              <span>设置</span>
            </button>
            
            <button className="w-full px-4 py-3 flex items-center gap-3 text-gray-400 hover:bg-gray-800/50 transition-colors">
              <Github className="w-5 h-5" />
              <span>关于</span>
            </button>
            
            <button className="w-full px-4 py-3 flex items-center gap-3 text-gray-400 hover:bg-gray-800/50 transition-colors">
              <Menu className="w-5 h-5" />
              <span>隐藏到托盘区</span>
            </button>
            
            <button className="w-full px-4 py-3 flex items-center gap-3 text-gray-400 hover:bg-gray-800/50 transition-colors">
              <Power className="w-5 h-5" />
              <span>退出程序</span>
            </button>
          </div>
        </nav>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部数据栏 */}
        <div className="bg-[#0d1117] border-b border-gray-800 px-6 py-3 flex items-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">上证指数</span>
            <span className="text-white">3216.13</span>
            <span className="text-emerald-400">+0.08%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">标普500</span>
            <span className="text-white">6775.80</span>
            <span className="text-red-400">-0.08%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">上证指数</span>
            <span className="text-white">4129.10</span>
            <span className="text-red-400">-0.10%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">深证成指</span>
            <span className="text-white">14374.87</span>
            <span className="text-red-400">-0.6%</span>
          </div>
        </div>

        {/* 标签页导航 */}
        <div className="bg-[#0d1117] border-b border-gray-800 px-6">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-2 text-sm transition-colors relative ${
                  activeTab === tab
                    ? 'text-emerald-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 排名类型选择 */}
        <div className="bg-[#0a0e1a] px-6 py-4">
          <div className="flex gap-3">
            {rankingTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveRankingTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors border ${
                  activeRankingTab === tab
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-[#1a2332] text-gray-400 border-gray-700 hover:border-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* 表格区域 */}
        <div className="flex-1 overflow-auto px-6 pb-6">
          <div className="bg-[#0d1117] rounded-lg border border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#161b22] border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">行业名称</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                    行业涨幅 <span className="text-gray-500">▼</span>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">行业5日涨幅</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">行业20日涨幅</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">领涨股</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">涨幅</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">最新价</th>
                </tr>
              </thead>
              <tbody>
                {industryData.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-800 hover:bg-[#161b22] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="inline-block px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-sm">
                        {item.name}
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-sm ${
                      parseFloat(item.rate) >= 0 ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {item.rate}
                    </td>
                    <td className={`px-4 py-3 text-sm ${
                      parseFloat(item.rate5) >= 0 ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {item.rate5}
                    </td>
                    <td className={`px-4 py-3 text-sm ${
                      parseFloat(item.rate20) >= 0 ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {item.rate20}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-red-400 text-sm">{item.leadStock}</span>
                        <span className="text-blue-400 text-xs">{item.leadCode}</span>
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-sm ${
                      parseFloat(item.leadRate) >= 0 ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {item.leadRate}
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{item.latest}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
