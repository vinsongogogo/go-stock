import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { TrendingUp, Calendar as CalendarIcon, Filter, Loader2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { LongTigerRank as getLongTigerRank } from '../../../wailsjs/go/main/App';
import { KLineChart } from './KLineChart';
import { MoneyTrend } from './MoneyTrend';
import type { LongTigerRankData } from '../types/longtiger';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as Popover from '@radix-ui/react-popover';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

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
  const [selectedExplanation, setSelectedExplanation] = useState<string>('__all__');
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
    setSelectedExplanation('__all__');
    fetchData(newDate);
  };

  // 筛选逻辑
  const handleFilterChange = (explanation: string) => {
    setSelectedExplanation(explanation);
    if (explanation && explanation !== '__all__') {
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

  // 日期选择器弹窗控制
  const [calendarOpen, setCalendarOpen] = useState(false);
  const selectedDate = useMemo(() => date ? new Date(date) : undefined, [date]);

  return (
    <div className="space-y-6">
      {/* 标题卡片 */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-5 shadow-2xl">
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
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-5 shadow-2xl mt-2.5">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm text-gray-300">筛选条件</h3>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-gray-400" />
            <label className="text-xs text-gray-400">日期:</label>
            <Popover.Root open={calendarOpen} onOpenChange={setCalendarOpen}>
              <Popover.Trigger asChild>
                <button
                  className="flex items-center justify-between gap-2 px-3 py-2 min-w-[160px] bg-slate-800/80 border border-cyan-500/50 rounded-lg text-sm text-white hover:border-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30 transition-all backdrop-blur-sm shadow-lg shadow-cyan-500/10"
                >
                  <span>{date || '选择日期'}</span>
                  <CalendarIcon className="w-4 h-4 text-cyan-400" />
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  className="z-50 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/20 p-4"
                  sideOffset={8}
                  align="start"
                >
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={(day) => {
                      if (day) {
                        handleDateChange(format(day, 'yyyy-MM-dd'));
                      }
                      setCalendarOpen(false);
                    }}
                    locale={zhCN}
                    className="text-white"
                    classNames={{
                      months: "flex flex-col",
                      month: "space-y-4",
                      caption: "flex justify-center pt-1 relative items-center mb-4",
                      caption_label: "text-base font-medium text-white",
                      nav: "flex items-center",
                      nav_button: "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 flex items-center justify-center rounded-md hover:bg-slate-700/50 transition-colors",
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse",
                      head_row: "flex",
                      head_cell: "text-slate-400 rounded-md w-9 font-normal text-sm",
                      row: "flex w-full mt-2",
                      cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 h-9 w-9",
                      day: "h-9 w-9 p-0 font-normal text-slate-300 hover:bg-slate-700/50 rounded-lg transition-colors flex items-center justify-center cursor-pointer",
                      day_selected: "bg-cyan-500 text-white hover:bg-cyan-400 rounded-lg shadow-lg shadow-cyan-500/50",
                      day_today: "text-cyan-400 font-semibold",
                      day_outside: "text-slate-600 opacity-50",
                      day_disabled: "text-slate-600 opacity-30",
                      day_hidden: "invisible",
                    }}
                    components={{
                      IconLeft: () => <ChevronLeft className="h-4 w-4 text-slate-300" />,
                      IconRight: () => <ChevronRight className="h-4 w-4 text-slate-300" />,
                    }}
                  />
                  <div className="flex gap-3 mt-4 pt-4 border-t border-slate-700/50">
                    <button
                      onClick={() => {
                        handleDateChange(formatDate(new Date()));
                        setCalendarOpen(false);
                      }}
                      className="flex-1 py-2 px-4 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-cyan-500/30"
                    >
                      今天
                    </button>
                    <button
                      onClick={() => {
                        handleDateChange('');
                        setCalendarOpen(false);
                      }}
                      className="flex-1 py-2 px-4 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border border-cyan-500/30 rounded-lg text-sm font-medium transition-colors"
                    >
                      清除
                    </button>
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">上榜原因:</label>
            <SelectPrimitive.Root value={selectedExplanation} onValueChange={handleFilterChange}>
              <SelectPrimitive.Trigger
                className="flex items-center justify-between gap-2 px-3 py-2 min-w-[200px] bg-slate-800/80 border border-cyan-500/50 rounded-lg text-sm text-white hover:border-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30 transition-all backdrop-blur-sm shadow-lg shadow-cyan-500/10 data-[state=open]:border-cyan-400"
              >
                <SelectPrimitive.Value placeholder="全部" />
                <SelectPrimitive.Icon>
                  <ChevronDown className="w-4 h-4 text-cyan-400 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
                </SelectPrimitive.Icon>
              </SelectPrimitive.Trigger>
              <SelectPrimitive.Portal>
                <SelectPrimitive.Content
                  className="z-50 overflow-hidden bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/20"
                  position="popper"
                  sideOffset={8}
                >
                  <SelectPrimitive.Viewport className="p-2">
                    <SelectPrimitive.Item
                      value="__all__"
                      className="relative flex items-center px-3 py-2 text-sm text-white rounded-lg cursor-pointer outline-none hover:bg-slate-700/50 focus:bg-slate-700/50 data-[state=checked]:bg-cyan-500/20 data-[state=checked]:text-cyan-400 transition-colors"
                    >
                      <SelectPrimitive.ItemText>全部</SelectPrimitive.ItemText>
                      <SelectPrimitive.ItemIndicator className="absolute right-2">
                        <Check className="w-4 h-4 text-cyan-400" />
                      </SelectPrimitive.ItemIndicator>
                    </SelectPrimitive.Item>
                    {explanations.map((exp) => (
                      <SelectPrimitive.Item
                        key={exp}
                        value={exp}
                        className="relative flex items-center px-3 py-2 text-sm text-white rounded-lg cursor-pointer outline-none hover:bg-slate-700/50 focus:bg-slate-700/50 data-[state=checked]:bg-cyan-500/20 data-[state=checked]:text-cyan-400 transition-colors"
                      >
                        <SelectPrimitive.ItemText>{exp}</SelectPrimitive.ItemText>
                        <SelectPrimitive.ItemIndicator className="absolute right-2">
                          <Check className="w-4 h-4 text-cyan-400" />
                        </SelectPrimitive.ItemIndicator>
                      </SelectPrimitive.Item>
                    ))}
                  </SelectPrimitive.Viewport>
                </SelectPrimitive.Content>
              </SelectPrimitive.Portal>
            </SelectPrimitive.Root>
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
