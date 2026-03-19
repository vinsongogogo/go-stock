import { Plus, TrendingUp, RefreshCw, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';

// Wails Go bridge — accessed lazily so Wails has time to inject into window
const getApp = () => (window as any)?.go?.main?.App;
const getRuntime = () => (window as any)?.runtime;

function EventsOn(eventName: string, callback: (...args: any[]) => void) {
  getRuntime()?.EventsOn?.(eventName, callback);
}
function EventsOff(...eventNames: string[]) {
  getRuntime()?.EventsOff?.(...eventNames);
}

interface FollowedStock {
  StockCode: string;
  Name: string;
  Sort: number;
  [key: string]: any;
}

interface Stock {
  code: string;
  name: string;
  price: number;
  changePercent: number;
  changePrice: number;
  high: string;
  highRate: number;
  low: string;
  lowRate: number;
  yesterday: string;
  open: string;
  updateTime: string;
  sort: number;
  [key: string]: any;
}

export function Watchlist() {
  const [stocks, setStocks] = useState<Record<string, Stock>>({});
  const [followList, setFollowList] = useState<FollowedStock[]>([]);
  const [stockCodes, setStockCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStockCode, setNewStockCode] = useState('');
  const [searchOptions, setSearchOptions] = useState<{ label: string; value: string }[]>([]);
  const [adding, setAdding] = useState(false);
  const stockCodesRef = useRef<string[]>([]);
  const stocksRef = useRef<Record<string, Stock>>({});

  stockCodesRef.current = stockCodes;
  stocksRef.current = stocks;

  const updateData = useCallback((result: any, overrideCode?: string) => {
    if (!result) return;
    // Greet returns data.StockInfo with Chinese JSON tags;
    // real-time event pushes the same struct. Use overrideCode for US stocks
    // where the display code (gb_xxx) differs from the DB code (usXXX).
    const rawCode: string = result['股票代码'] ?? '';
    const code: string = overrideCode || rawCode;
    if (!code) return;

    const price = parseFloat(result['当前价格']) || parseFloat(result['卖一报价']) || 0;
    const yesterday = parseFloat(result['昨日收盘价']) || 0;
    const high = result['今日最高价'] ?? '0';
    const low = result['今日最低价'] ?? '0';
    const open = result['今日开盘价'] ?? '0';
    const time = `${result['日期'] ?? ''} ${result['时间'] ?? ''}`.trim();

    const stock: Stock = {
      code,
      name: result['股票名称'] ?? result.Name ?? code,
      price,
      changePercent: result.changePercent ?? 0,
      changePrice: result.changePrice ?? 0,
      high,
      highRate: result.highRate ?? 0,
      low,
      lowRate: result.lowRate ?? 0,
      yesterday: yesterday.toString(),
      open,
      updateTime: time,
      sort: result.sort ?? 0,
    };

    setStocks(prev => {
      if (!stockCodesRef.current.includes(code)) return prev;
      return { ...prev, [code]: stock };
    });
  }, []);

  const fetchFollowList = useCallback(() => {
    const App = getApp();
    if (!App) return;
    App.GetFollowList(0).then((result: FollowedStock[]) => {
      if (!result) return;
      setFollowList(result);
      const codes: string[] = [];
      // Map display code → original DB code for the Greet call
      const displayToOriginal: Record<string, string> = {};
      result.forEach((item: FollowedStock) => {
        const originalCode = item.StockCode;
        let displayCode = originalCode;
        if (originalCode.startsWith('us') || originalCode.startsWith('US')) {
          displayCode = 'gb_' + originalCode.replace(/^[Uu][Ss]/, '').toLowerCase();
        }
        if (!codes.includes(displayCode)) codes.push(displayCode);
        displayToOriginal[displayCode] = originalCode;
      });
      setStockCodes(codes);
      // Fetch price for each stock using the original DB code
      codes.forEach((displayCode) => {
        const originalCode = displayToOriginal[displayCode] ?? displayCode;
        App.Greet(originalCode).then((res: any) => {
          updateData(res, displayCode);
        });
      });
    }).finally(() => setLoading(false));
  }, [updateData]);

  useEffect(() => {
    fetchFollowList();

    // Listen to real-time price updates
    EventsOn('stock_price', (data: any) => {
      updateData(data);
    });

    // Listen to follow list refresh events
    EventsOn('refreshFollowList', () => {
      fetchFollowList();
    });

    return () => {
      EventsOff('stock_price', 'refreshFollowList');
    };
  }, [fetchFollowList, updateData]);

  const removeStock = useCallback((code: string) => {
    const App = getApp();
    if (!App) return;
    App.UnFollow(code)
      .then((result: string) => {
        if (result.includes('成功')) {
          setStockCodes(prev => prev.filter(c => c !== code));
          setStocks(prev => {
            const next = { ...prev };
            delete next[code];
            return next;
          });
          setFollowList(prev => prev.filter(s => s.StockCode !== code));
        } else {
          alert('取消关注失败: ' + result);
        }
      })
      .catch((err: any) => {
        alert('取消关注失败: ' + (err?.message || '未知错误'));
      });
  }, []);

  const handleSearchInput = useCallback((value: string) => {
    setNewStockCode(value);
    const App = getApp();
    if (!App || !value.trim()) {
      setSearchOptions([]);
      return;
    }
    App.GetStockList(value).then((result: any[]) => {
      if (!result) return;
      const filtered = result
        .filter((item: any) => item.name?.includes(value) || item.ts_code?.includes(value))
        .slice(0, 10)
        .map((item: any) => ({ label: `${item.name} - ${item.ts_code}`, value: item.ts_code }));
      setSearchOptions(filtered);
    });
  }, []);

  const addStock = useCallback((code?: string) => {
    const targetCode = code || newStockCode.trim();
    const App = getApp();
    if (!targetCode || !App) {
      console.error('App not ready or no code provided');
      return;
    }
    if (stockCodesRef.current.includes(targetCode)) {
      alert('该股票已在关注列表中');
      return;
    }
    setAdding(true);
    console.log('Calling Follow with:', targetCode);
    App.Follow(targetCode)
      .then((result: string) => {
        console.log('Follow result:', result);
        if (result === '关注成功') {
          let displayCode = targetCode;
          if (displayCode.startsWith('us')) {
            displayCode = 'gb_' + displayCode.replace('us', '').toLowerCase();
          }
          setStockCodes(prev => [...prev, displayCode]);
          setNewStockCode('');
          setSearchOptions([]);
          setShowAddForm(false);
          // Refresh follow list and fetch price
          fetchFollowList();
        } else {
          // Use setTimeout to ensure alert shows after React render cycle
          setTimeout(() => {
            alert('关注失败: ' + result);
          }, 0);
        }
      })
      .catch((err: any) => {
        console.error('Follow error:', err);
        setTimeout(() => {
          alert('关注失败: ' + (err?.message || '未知错误'));
        }, 0);
      })
      .finally(() => setAdding(false));
  }, [newStockCode, fetchFollowList]);

  // Sorted stocks list derived from state
  const sortedStocks = stockCodes
    .map(code => stocks[code])
    .filter(Boolean)
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));

  // For codes that are tracked but no price data yet, show skeleton entries
  const displayList = stockCodes.map(code => stocks[code] ?? {
    code,
    name: followList.find(f => f.StockCode === code || f.StockCode.replace('us', '').toLowerCase() === code.replace('gb_', ''))?.Name ?? code,
    price: 0,
    changePercent: 0,
    changePrice: 0,
    high: '0',
    highRate: 0,
    low: '0',
    lowRate: 0,
    yesterday: '0',
    open: '0',
    updateTime: '',
    sort: 0,
  } as Stock);

  return (
    <div className="space-y-4 sm:space-y-6">
    <div className="space-y-3">
      {/* 头部：z-10 保证展开的筛选项浮在下方列表之上 */}
      <div className="relative z-10 bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-3 sm:p-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg text-white font-light">自选列表</h2>
              <p className="text-[10px] text-gray-400">Watchlist · {stockCodes.length} 只股票</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {loading && <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />}
            <button
              onClick={fetchFollowList}
              className="p-1 text-gray-400 hover:text-cyan-400 transition-all"
              title="刷新"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-2 py-1 sm:px-3 sm:py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg border border-cyan-500/30 text-cyan-400 text-[10px] sm:text-xs flex items-center gap-1 transition-all"
            >
              <Plus className="w-3 h-3" />
              添加股票
            </button>
          </div>
        </div>

        {/* 添加股票表单 */}
        {showAddForm && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newStockCode}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  placeholder="输入股票代码或名称..."
                  className="w-full px-2 py-1.5 bg-slate-700/50 border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                  onKeyDown={(e) => e.key === 'Enter' && addStock()}
                />
                {searchOptions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-white/10 rounded-lg overflow-hidden z-[100] max-h-40 overflow-y-auto shadow-xl">
                    {searchOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setNewStockCode(opt.value); setSearchOptions([]); }}
                        className="w-full text-left px-2 py-1.5 text-[10px] text-gray-300 hover:bg-cyan-500/20 hover:text-cyan-400 transition-all"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => addStock()}
                disabled={adding}
                className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 rounded-lg text-white text-xs transition-all flex items-center gap-1"
              >
                {adding ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                确定
              </button>
              <button
                onClick={() => { setShowAddForm(false); setSearchOptions([]); setNewStockCode(''); }}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-xs transition-all"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 股票列表 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">
        {displayList.map((stock) => (
          <div
            key={stock.code}
            className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-2 sm:p-3 hover:border-cyan-500/30 transition-all group relative shadow-2xl"
          >
            {/* 取消关注按钮 */}
            <button
              onClick={() => removeStock(stock.code)}
              className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-cyan-500/20 hover:bg-red-500/20 border border-cyan-500/30 hover:border-red-500/30 rounded text-[9px] text-cyan-400 hover:text-red-400 transition-all"
            >
              取消关注
            </button>

            {/* 股票名称 */}
            <div className="mb-1.5">
              <h3 className="text-sm sm:text-base text-white font-medium">{stock.name}</h3>
              <span className="text-[9px] text-gray-500">{stock.code}</span>
            </div>

            {/* 价格和涨跌 */}
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className={`text-xl sm:text-2xl font-light ${
                stock.changePercent >= 0 ? 'text-red-400' : 'text-green-400'
              }`}>
                {stock.price > 0 ? stock.price.toFixed(2) : '--'}
              </span>
              <span className={`text-xs ${stock.changePercent >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                {stock.price > 0 ? `${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(3)}%` : ''}
              </span>
            </div>

            {/* 数据指标 */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-gray-500">最高</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-cyan-400">{stock.high || '--'}</span>
                  {stock.highRate !== 0 && (
                    <span className={`text-[9px] ${stock.highRate >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {stock.highRate >= 0 ? '+' : ''}{stock.highRate.toFixed(3)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-gray-500">最低</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-cyan-400">{stock.low || '--'}</span>
                  {stock.lowRate !== 0 && (
                    <span className={`text-[9px] ${stock.lowRate >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {stock.lowRate >= 0 ? '+' : ''}{stock.lowRate.toFixed(3)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-gray-500">昨收</span>
                <span className="text-[10px] text-gray-300">{stock.yesterday || '--'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-gray-500">今开</span>
                <span className="text-[10px] text-gray-300">{stock.open || '--'}</span>
              </div>
            </div>

            {/* 时间和操作按钮 */}
            <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
              <span className="text-[9px] text-gray-500">{stock.updateTime || '加载中...'}</span>
              <div className="flex gap-1">
                {/* <button className="px-1.5 py-0.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded text-[9px] text-cyan-400 transition-all">
                  盘口
                </button>
                <button className="px-1.5 py-0.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded text-[9px] text-green-400 transition-all">
                  分时
                </button>
                <button className="px-1.5 py-0.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-[9px] text-red-400 transition-all">
                  日K
                </button>
                <button className="px-1.5 py-0.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded text-[9px] text-yellow-400 transition-all">
                  详情
                </button> */}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 空状态 */}
      {!loading && stockCodes.length === 0 && (
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-12 text-center shadow-2xl">
          <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">还没有添加自选股票</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-3 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg border border-cyan-500/30 text-cyan-400 text-xs flex items-center gap-2 mx-auto transition-all"
          >
            <Plus className="w-3 h-3" />
            添加第一只股票
          </button>
        </div>
      )}

      {/* 加载状态 */}
      {loading && stockCodes.length === 0 && (
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-12 text-center shadow-2xl">
          <Loader2 className="w-10 h-10 text-cyan-400 mx-auto mb-3 animate-spin" />
          <p className="text-gray-400 text-sm">正在加载自选股票...</p>
        </div>
      )}
    </div>
    </div>
  );
}