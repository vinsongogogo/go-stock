import { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { SubMenu } from './SubMenu';
import { Pagination } from './Pagination';
import { useLayoutShell } from '../context/LayoutShellContext';
import { cn } from './ui/utils';

interface StockFlowData {
  code: string;
  name: string;
  price: number;
  change: number;
  turnover: number;
  volume: number;
  inflow: number;
  outflow: number;
  netInflow: number;
  netInflowRate: number;
  mainInflow: number;
  mainOutflow: number;
  mainNetInflow: number;
  retailInflow: number;
  retailOutflow: number;
}

// 模拟数据
const generateMockData = (): StockFlowData[] => {
  const stocks = [
    { code: 'sh601669', name: '中国电建' },
    { code: 'sz300502', name: '新易盛' },
    { code: 'sh601611', name: '中国核建' },
    { code: 'sz002429', name: '兆驰股份' },
    { code: 'sz001309', name: '德明利' },
    { code: 'sh511360', name: '中证500' },
    { code: 'sz300185', name: '通裕重工' },
    { code: 'sz002056', name: '横店东磁' },
    { code: 'sz002165', name: '红宝丽' },
    { code: 'sh603659', name: '璞泰来' },
    { code: 'sz002463', name: '沪电股份' },
    { code: 'sz002273', name: '水晶光电' },
    { code: 'sz300750', name: '宁德时代' },
    { code: 'sh600519', name: '贵州茅台' },
    { code: 'sz000858', name: '五粮液' },
    { code: 'sz000001', name: '平安银行' },
    { code: 'sh600036', name: '招商银行' },
    { code: 'sz300059', name: '东方财富' },
    { code: 'sh600030', name: '中信证券' },
    { code: 'sz002594', name: '比亚迪' },
    { code: 'sh601318', name: '中国平安' },
    { code: 'sz000333', name: '美的集团' },
    { code: 'sh600276', name: '恒瑞医药' },
    { code: 'sz002475', name: '立讯精密' },
    { code: 'sh601888', name: '中国中免' },
    { code: 'sz300760', name: '迈瑞医疗' },
    { code: 'sh688981', name: '中芯国际' },
    { code: 'sz002371', name: '北方华创' },
    { code: 'sh603259', name: '药明康德' },
    { code: 'sz300014', name: '亿纬锂能' },
  ];

  return stocks.map((stock) => ({
    code: stock.code,
    name: stock.name,
    price: parseFloat((Math.random() * 500 + 10).toFixed(3)),
    change: parseFloat((Math.random() * 20 - 5).toFixed(2)),
    turnover: parseFloat((Math.random() * 80).toFixed(2)),
    volume: parseFloat((Math.random() * 1000000 + 100000).toFixed(2)),
    inflow: parseFloat((Math.random() * 500000 + 50000).toFixed(2)),
    outflow: parseFloat((Math.random() * 500000 + 50000).toFixed(2)),
    netInflow: parseFloat((Math.random() * 300000 - 100000).toFixed(2)),
    netInflowRate: parseFloat((Math.random() * 100 - 30).toFixed(2)),
    mainInflow: parseFloat((Math.random() * 300000 + 30000).toFixed(2)),
    mainOutflow: parseFloat((Math.random() * 300000 + 30000).toFixed(2)),
    mainNetInflow: parseFloat((Math.random() * 200000 - 80000).toFixed(2)),
    retailInflow: parseFloat((Math.random() * 200000 + 20000).toFixed(2)),
    retailOutflow: parseFloat((Math.random() * 200000 + 20000).toFixed(2)),
  }));
};

export function MoneyFlow() {
  const { compactLayout } = useLayoutShell();
  const [activeSubMenu, setActiveSubMenu] = useState('净流入额排名');
  const [stockData] = useState(generateMockData());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const subMenuItems = [
    '净流入额排名',
    '流出资金排名',
    '净流入人气排名',
    '主力净流入额排名',
    '主力流出排名',
    '主力净流入人气排名',
    '散户净流入额排名',
    '散户流入排名',
  ];

  // 根据活动子菜单排序数据
  const sortedData = [...stockData].sort((a, b) => {
    switch (activeSubMenu) {
      case '净流入额排名':
        return b.netInflow - a.netInflow;
      case '流出资金排名':
        return b.outflow - a.outflow;
      case '净流入人气排名':
        return b.netInflowRate - a.netInflowRate;
      case '主力净流入额排名':
        return b.mainNetInflow - a.mainNetInflow;
      case '主力流出排名':
        return b.mainOutflow - a.mainOutflow;
      default:
        return b.netInflow - a.netInflow;
    }
  });

  // 分页逻辑
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // 重置到第一页
  };

  const formatNumber = (num: number) => {
    if (Math.abs(num) >= 10000) {
      return (num / 10000).toFixed(2) + '万';
    }
    return num.toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-5 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/50">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl text-white font-light">个股资金流向</h2>
            <p className="text-xs text-gray-400">Stock Money Flow · Real-time Data</p>
          </div>
        </div>
      </div>

      {/* 子菜单 */}
      <div className="mt-2.5">
        <SubMenu
          items={subMenuItems}
          activeItem={activeSubMenu}
          onItemClick={setActiveSubMenu}
        />
      </div>

      {/* 数据表格 */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-400">代码</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-400">名称</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">最新价</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">涨跌幅</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">换手率</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">成交额/万</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">流出资金/万</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">流入资金/万</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">净流入/万</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">净流入率</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">主力净流入</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((stock, index) => (
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
                      {stock.price.toFixed(3)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {stock.change >= 0 ? (
                        <ArrowUpRight className="w-3 h-3 text-red-400" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-green-400" />
                      )}
                      <span className={`text-xs font-medium ${stock.change >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.change}%
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-xs text-blue-400">{stock.turnover.toFixed(2)}%</span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-xs text-gray-300">{formatNumber(stock.volume)}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-xs text-green-400">{formatNumber(stock.outflow)}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-xs text-red-400">{formatNumber(stock.inflow)}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`text-xs font-medium ${stock.netInflow >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {stock.netInflow >= 0 ? '+' : ''}{formatNumber(stock.netInflow)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="flex-1 max-w-[60px] h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${stock.netInflowRate >= 0 ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(Math.abs(stock.netInflowRate), 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium min-w-[45px] text-right ${stock.netInflowRate >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {stock.netInflowRate >= 0 ? '+' : ''}{stock.netInflowRate.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`text-xs font-medium ${stock.mainNetInflow >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {stock.mainNetInflow >= 0 ? '+' : ''}{formatNumber(stock.mainNetInflow)}
                    </span>
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

      {/* 底部说明 */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-5 shadow-2xl mt-3">
        <div
          className={cn(
            "grid gap-3 text-xs",
            compactLayout ? "grid-cols-1 md:grid-cols-3" : "grid-cols-3",
          )}
        >
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" />
            <div>
              <div className="text-gray-400 mb-1">主力资金</div>
              <div className="text-gray-500">超大单和大单资金的总和，代表机构和大户的资金动向</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
            <div>
              <div className="text-gray-400 mb-1">散户资金</div>
              <div className="text-gray-500">中单和小单资金的总和，代表散户的资金流向</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
            <div>
              <div className="text-gray-400 mb-1">净流入率</div>
              <div className="text-gray-500">净流入金额占成交额的比例，反映资金流向强度</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}