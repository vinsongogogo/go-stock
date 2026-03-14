import { TrendingUp, BarChart3, LineChart, Activity, Building2, Globe, FileText, Code, MessageSquare, Settings, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function Sidebar() {
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
    <div className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-white/10 flex flex-col">
      {/* 头部 */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="ml-2 text-sm font-light tracking-wide">大盘阴</span>
        </div>
      </div>

      {/* 自选列表 */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-sm">自选列表</span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* 菜单项 */}
      <div className="flex-1 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.label}>
            <button
              onClick={() => setExpandedSection(expandedSection === item.label ? null : item.label)}
              className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-all group ${
                expandedSection === item.label ? 'bg-white/5 border-l-2 border-cyan-400' : ''
              }`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${
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
        ))}
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
        <button className="w-full px-4 py-2 flex items-center gap-3 hover:bg-white/5 rounded-lg transition-all">
          <MessageSquare className="w-5 h-5 text-gray-400" />
          <span className="text-sm">关于我们</span>
        </button>
        <div className="pt-2 text-xs text-gray-500 text-center">
          隐藏到托盘区
        </div>
      </div>
    </div>
  );
}
