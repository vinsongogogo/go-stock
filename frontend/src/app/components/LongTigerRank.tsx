import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { TrendingUp, Calendar, Filter, Loader2 } from 'lucide-react';
import { LongTigerRank as getLongTigerRank } from '../../../wailsjs/go/main/App';
import { KLineChart } from './KLineChart';
import { MoneyTrend } from './MoneyTrend';
import type { LongTigerRankData } from '../types/longtiger';

// 格式化日期为 YYYY-MM-DD
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 获取前一天日期
function getPreviousDate(dateStr: string): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - 1);
  return formatDate(date);
}

// 将 SECUCODE 转换为显示格式
function formatStockCode(secuCode: string): string {
  const parts = secuCode.split('.');
  if (parts.length === 2) {
    return parts[1].toLowerCase() + parts[0];
  }
  return secuCode.toLowerCase();
}

// 格式化金额（转换为万/亿）
function formatAmount(amount: number): string {
  if (amount >= 100000000) {
    return (amount / 100000000).toFixed(2) + '亿';
  }
  return (amount / 10000).toFixed(2) + '万';
}

export function LongTigerRank() {
  const today = useMemo(() => formatDate(new Date()), []);
  const [date, setDate] = useState<string>(today);
  const [data, setData] = useState<LongTigerRankData[]>([]);
  const [filteredData, setFilteredData] = useState<LongTigerRankData[]>([]);
  const [explanations, setExplanations] = useState<string[]>([]);
  const [selectedExplanation, setSelectedExplanation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [hoveredStock, setHoveredStock] = useState<{code: string; name: string; type: 'kline' | 'money'} | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });

  // 获取数据（含自动回退逻辑）
  const fetchData = useCallback(async (currentDate: string, retryCount = 0) => {
    if (retryCount > 7) {
      setData([]);
      setFilteredData([]);
      setExplanations([]);
      return;
    }
    
    setLoading(true);
    try {
      const result = await getLongTigerRank(currentDate) as LongTigerRankData[];
      if (result.length === 0) {
        // 递归查询前一日
        const prevDate = getPreviousDate(currentDate);
        fetchData(prevDate, retryCount + 1);
      } else {
        setData(result);
        setFilteredData(result);
        // 提取唯一的上榜原因
        const uniqueExplanations = [...new Set(result.map(item => item.EXPLANATION))].filter(Boolean);
        setExplanations(uniqueExplanations);
      }
    } catch (error) {
      console.error('获取龙虎榜数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    fetchData(today);
  }, [fetchData, today]);

  // 日期变化时重新获取数据
  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    setSelectedExplanation('');
    fetchData(newDate);
  };

  // 筛选逻辑
  const handleFilterChange = (explanation: string) => {
    setSelectedExplanation(explanation);
    if (explanation) {
      setFilteredData(data.filter(item => item.EXPLANATION === explanation));
    } else {
      setFilteredData(data);
    }
  };

  // 悬停延迟关闭 timer
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };

  // 触发元素：鼠标进入
  const handleMouseEnter = (item: LongTigerRankData, type: 'kline' | 'money', e: React.MouseEvent) => {
    clearHideTimer();
    setHoveredStock({
      code: item.SECUCODE,
      name: item.SECURITY_NAME_ABBR,
      type
    });
    setPopoverPosition({ x: e.clientX, y: e.clientY });
  };

  // 触发元素：鼠标离开（延迟 150ms 再关闭，给用户时间移到弹窗上）
  const handleMouseLeave = () => {
    clearHideTimer();
    hideTimer.current = setTimeout(() => {
      setHoveredStock(null);
    }, 150);
  };

  // 弹窗：鼠标进入（取消关闭）
  const handlePopoverEnter = () => {
    clearHideTimer();
  };

  // 弹窗：鼠标离开（关闭弹窗）
  const handlePopoverLeave = () => {
    setHoveredStock(null);
  };

  // 颜色常量
  const upColor = 'text-red-400';
  const downColor = 'text-green-400';
  const upBg = 'bg-red-500/10';
  const downBg = 'bg-green-500/10';

  return (
    <div className="space-y-3">
      {/* 标题卡片 */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/50">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl text-white font-light">龙虎榜</h2>
            <p className="text-xs text-gray-400">Long Tiger Rank · Market Movers</p>
          </div>
        </div>
      </div>

      {/* 筛选区域 */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-2xl">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm text-gray-300">筛选条件</h3>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <label className="text-xs text-gray-400">日期:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">上榜原因:</label>
            <select
              value={selectedExplanation}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all min-w-[200px]"
            >
              <option value="">全部</option>
              {explanations.map((exp) => (
                <option key={exp} value={exp}>{exp}</option>
              ))}
            </select>
          </div>
          
          <div className="text-xs text-amber-400/80 ml-auto">
            *当天的龙虎榜数据通常在收盘结束后一小时左右更新
          </div>
        </div>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            <span className="ml-2 text-cyan-400">正在获取龙虎榜数据...</span>
          </div>
        </div>
      )}

      {/* 数据表格 */}
      {!loading && filteredData.length > 0 && (
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-400">代码</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-400">名称</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">收盘价</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">涨跌幅</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">龙虎榜净买额</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">龙虎榜买入额</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">龙虎榜卖出额</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">龙虎榜成交额</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">换手率</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">流通市值</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-400">上榜原因</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr 
                    key={`${item.SECUCODE}-${index}`}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-3 py-2.5">
                      <span className="text-xs text-cyan-400 font-mono">
                        {formatStockCode(item.SECUCODE)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        className={`text-xs font-medium hover:underline ${item.CHANGE_RATE > 0 ? upColor : downColor}`}
                        onMouseEnter={(e) => handleMouseEnter(item, 'kline', e)}
                        onMouseLeave={handleMouseLeave}
                      >
                        {item.SECURITY_NAME_ABBR}
                      </button>
                    </td>
                    <td className={`px-3 py-2.5 text-right text-xs font-medium ${item.CHANGE_RATE > 0 ? upColor : downColor}`}>
                      {item.CLOSE_PRICE.toFixed(2)}
                    </td>
                    <td className={`px-3 py-2.5 text-right text-xs font-medium ${item.CHANGE_RATE > 0 ? upColor : downColor}`}>
                      {item.CHANGE_RATE > 0 ? '+' : ''}{item.CHANGE_RATE.toFixed(2)}%
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        className={`text-xs hover:underline ${item.BILLBOARD_NET_AMT > 0 ? upColor : downColor}`}
                        onMouseEnter={(e) => handleMouseEnter(item, 'money', e)}
                        onMouseLeave={handleMouseLeave}
                      >
                        {formatAmount(item.BILLBOARD_NET_AMT)}
                      </button>
                    </td>
                    <td className={`px-3 py-2.5 text-right text-xs ${upColor}`}>
                      {formatAmount(item.BILLBOARD_BUY_AMT)}
                    </td>
                    <td className={`px-3 py-2.5 text-right text-xs ${downColor}`}>
                      {formatAmount(item.BILLBOARD_SELL_AMT)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs text-blue-400">
                      {formatAmount(item.BILLBOARD_DEAL_AMT)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs text-gray-300">
                      {item.TURNOVERRATE.toFixed(2)}%
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs text-gray-300">
                      {(item.FREE_MARKET_CAP / 100000000).toFixed(2)}亿
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-300 max-w-[200px] truncate" title={item.EXPLANATION}>
                      {item.EXPLANATION}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 无数据提示 */}
      {!loading && filteredData.length === 0 && (
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl">
          <div className="flex items-center justify-center py-12 text-gray-500">
            暂无数据，请切换日期
          </div>
        </div>
      )}

      {/* 悬停弹窗 - K 线图 */}
      {hoveredStock && hoveredStock.type === 'kline' && (
        <div 
          className="fixed z-50 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4"
          style={{
            left: Math.min(popoverPosition.x + 20, window.innerWidth - 820),
            top: Math.min(popoverPosition.y, window.innerHeight - 520),
            width: '800px',
            height: '500px'
          }}
          onMouseEnter={handlePopoverEnter}
          onMouseLeave={handlePopoverLeave}
        >
          <KLineChart 
            code={hoveredStock.code}
            stockName={hoveredStock.name}
            kDays={20}
            chartHeight={460}
            darkTheme={true}
          />
        </div>
      )}

      {/* 悬停弹窗 - 资金流向 */}
      {hoveredStock && hoveredStock.type === 'money' && (
        <div 
          className="fixed z-50 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4"
          style={{
            left: Math.min(popoverPosition.x + 20, window.innerWidth - 820),
            top: Math.min(popoverPosition.y, window.innerHeight - 520),
            width: '800px',
            height: '500px'
          }}
          onMouseEnter={handlePopoverEnter}
          onMouseLeave={handlePopoverLeave}
        >
          <MoneyTrend 
            code={hoveredStock.code}
            name={hoveredStock.name}
            days={360}
            chartHeight={460}
            darkTheme={true}
          />
        </div>
      )}
    </div>
  );
}
