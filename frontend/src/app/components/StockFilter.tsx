import { useState } from 'react';
import { Search, Filter, TrendingUp, BarChart2 } from 'lucide-react';
import { SubMenu } from './SubMenu';
import { Pagination } from './Pagination';

interface StockData {
  code: string;
  name: string;
  price: number;
  change: number;
  high: number;
  low: number;
  volume: number;
  amount: number;
  turnover: number;
  trend: number[];
}

// 模拟数据
const generateMockData = (): StockData[] => {
  const stocks = [
    { code: '300981.SZ', name: '中红医疗' },
    { code: '300185.SZ', name: '通裕重工' },
    { code: '300677.SZ', name: '英科医疗' },
    { code: '300505.SZ', name: '川金诺' },
    { code: '300720.SZ', name: '海川智能' },
    { code: '300035.SZ', name: '中科电气' },
    { code: '002429.SZ', name: '兆驰股份' },
    { code: '002056.SZ', name: '横店东磁' },
    { code: '603659.SH', name: '璞泰来' },
    { code: '002463.SZ', name: '沪电股份' },
    { code: '600519.SH', name: '贵州茅台' },
    { code: '000858.SZ', name: '五粮液' },
    { code: '000001.SZ', name: '平安银行' },
    { code: '600036.SH', name: '招商银行' },
    { code: '300059.SZ', name: '东方财富' },
    { code: '600030.SH', name: '中信证券' },
    { code: '002594.SZ', name: '比亚迪' },
    { code: '601318.SH', name: '中国平安' },
    { code: '000333.SZ', name: '美的集团' },
    { code: '600276.SH', name: '恒瑞医药' },
    { code: '002475.SZ', name: '立讯精密' },
    { code: '601888.SH', name: '中国中免' },
    { code: '300760.SZ', name: '迈瑞医疗' },
    { code: '688981.SH', name: '中芯国际' },
    { code: '002371.SZ', name: '北方华创' },
  ];

  return stocks.map((stock) => ({
    code: stock.code,
    name: stock.name,
    price: parseFloat((Math.random() * 100 + 5).toFixed(2)),
    change: parseFloat((Math.random() * 30 - 5).toFixed(2)),
    high: parseFloat((Math.random() * 110 + 10).toFixed(2)),
    low: parseFloat((Math.random() * 90 + 3).toFixed(2)),
    volume: parseFloat((Math.random() * 200).toFixed(2)),
    amount: parseFloat((Math.random() * 100).toFixed(2)),
    turnover: parseFloat((Math.random() * 60).toFixed(2)),
    trend: Array.from({ length: 20 }, () => Math.random() * 100),
  }));
};

export function StockFilter() {
  const [activeSubMenu, setActiveSubMenu] = useState('股票信息筛选');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockData] = useState(generateMockData());
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const subMenuItems = ['AI分析报告', '股票推荐记录', '提示消息板', '股票信息筛选', '定时任务'];

  // 技术指标筛选条件
  const technicalFilters = [
    'MACD金叉', 'RSI金叉', '资金流入', '红三兵金不换', '黄昏金星形', '早晨金星形',
    '下跌三方法', '上升三方法', 'KDJ金叉', 'KDJ死叉', '底部放量突破', '顶部放量突破',
    '均线多头排列', '均线空头排列', '三线合一上涨', '三线合一下跌', '成交量突破', '价格突破'
  ];

  // 基本面筛选条件
  const fundamentalFilters = [
    { label: '大市值(总市值>=3000亿)', value: 'large_cap_3000' },
    { label: '大市值(总市值>=2000亿)', value: 'large_cap_2000' },
    { label: '大市值(总市值>=1000亿)', value: 'large_cap_1000' },
    { label: '小市值及蓝筹股', value: 'small_blue_chip' },
    { label: '加大资金流不动的比例', value: 'fund_flow' },
    { label: '蓝筹&资金流不动比例', value: 'blue_fund' },
    { label: '主营业务>=5-100万以上', value: 'business_5_100' },
    { label: '主营业务>=10万以上', value: 'business_10' },
    { label: '主营业务>=15万以上', value: 'business_15' },
  ];

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const filteredStocks = stockData.filter(stock => 
    stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 分页逻辑
  const totalItems = filteredStocks.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedStocks = filteredStocks.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // 重置到第一页
  };

  // 迷你趋势图
  const MiniTrendChart = ({ data, change }: { data: number[], change: number }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / (max - min)) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width="80" height="30" viewBox="0 0 100 100" preserveAspectRatio="none" className="w-20 h-8">
        <defs>
          <linearGradient id={`gradient-${change}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={change >= 0 ? '#ef4444' : '#22c55e'} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={change >= 0 ? '#ef4444' : '#22c55e'} stopOpacity="0.05"/>
          </linearGradient>
        </defs>
        <polyline
          points={points}
          fill="none"
          stroke={change >= 0 ? '#ef4444' : '#22c55e'}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <polygon
          points={`0,100 ${points} 100,100`}
          fill={`url(#gradient-${change})`}
        />
      </svg>
    );
  };

  return (
    <div className="space-y-3">
      {/* 头部 */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
            <Filter className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl text-white font-light">股票筛选</h2>
            <p className="text-xs text-gray-400">Stock Filter · Advanced Screening</p>
          </div>
        </div>
      </div>

      {/* 子菜单 */}
      <SubMenu 
        items={subMenuItems} 
        activeItem={activeSubMenu} 
        onItemClick={setActiveSubMenu}
      />

      {/* 筛选条件 */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-2xl space-y-4">
        {/* 技术指标筛选 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm text-gray-300">技术指标筛选</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {technicalFilters.map((filter) => (
              <label
                key={filter}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800/40 rounded-lg border border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedFilters.includes(filter)}
                  onChange={() => toggleFilter(filter)}
                  className="w-3.5 h-3.5 rounded border-gray-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-gray-300 group-hover:text-white transition-colors">{filter}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 基本面筛选 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm text-gray-300">基本面筛选</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {fundamentalFilters.map((filter) => (
              <label
                key={filter.value}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800/40 rounded-lg border border-white/10 hover:border-purple-500/30 transition-all cursor-pointer group"
              >
                <input
                  type="radio"
                  name="fundamental"
                  value={filter.value}
                  className="w-3.5 h-3.5 border-gray-600 bg-slate-700 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-gray-300 group-hover:text-white transition-colors">{filter.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 搜索框 */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="输入股票名称或代码..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>
          <button className="px-6 py-2.5 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-sm text-cyan-400 hover:bg-cyan-500/30 transition-all">
            搜索
          </button>
          <button className="px-6 py-2.5 bg-slate-700/50 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-slate-700 transition-all">
            重置
          </button>
        </div>

        {/* 已选筛选条件 */}
        {selectedFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
            <span className="text-xs text-gray-400">已选条件：</span>
            {selectedFilters.map((filter) => (
              <span
                key={filter}
                className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded text-xs text-cyan-400 flex items-center gap-1"
              >
                {filter}
                <button
                  onClick={() => toggleFilter(filter)}
                  className="hover:text-cyan-300"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 数据表格 */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-400">股票代码</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-400">股票名称</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">最新价</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">涨跌幅(%)</th>
                <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-400">分时图</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">最高价</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">最低价</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">成交量</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">成交额</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">换手率(%)</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStocks.map((stock) => (
                <tr 
                  key={stock.code}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-3 py-2.5">
                    <span className="text-xs text-cyan-400 font-mono">{stock.code}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-xs text-white">{stock.name}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`text-xs font-medium ${stock.change >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {stock.price.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`text-xs font-medium ${stock.change >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex justify-center">
                      <MiniTrendChart data={stock.trend} change={stock.change} />
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-xs text-red-400">{stock.high.toFixed(2)}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-xs text-green-400">{stock.low.toFixed(2)}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-xs text-gray-300">{stock.volume.toFixed(2)}万</span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-xs text-gray-300">{stock.amount.toFixed(2)}亿</span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-xs text-blue-400">{stock.turnover.toFixed(2)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 分页组件 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* 底部统计 */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-2xl mt-3">
        <div className="flex items-center justify-between text-xs">
          <div className="text-gray-400">
            共找到 <span className="text-cyan-400 font-medium">{filteredStocks.length}</span> 只股票
          </div>
          <div className="flex gap-4">
            <div className="text-gray-400">
              上涨: <span className="text-red-400 font-medium">{filteredStocks.filter(s => s.change > 0).length}</span>
            </div>
            <div className="text-gray-400">
              下跌: <span className="text-green-400 font-medium">{filteredStocks.filter(s => s.change < 0).length}</span>
            </div>
            <div className="text-gray-400">
              平盘: <span className="text-gray-300 font-medium">{filteredStocks.filter(s => s.change === 0).length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}