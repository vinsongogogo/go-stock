import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, BarChart2, Loader2 } from 'lucide-react';
import { SubMenu } from './SubMenu';
import { Pagination } from './Pagination';
import { useLayoutShell } from '../context/LayoutShellContext';
import { cn } from './ui/utils';
import { GetAllStocks, GetAllStockInfoList } from '../../../wailsjs/go/main/App';
import { models, data } from '../../../wailsjs/go/models';

// 技术指标 checkbox 配置：label -> API 字段名
const TECHNICAL_CHECKBOXES: { label: string; key: keyof models.TechnicalIndicators }[] = [
  { label: 'MACD金叉', key: 'MACD_GOLDEN_FORK' },
  { label: 'KDJ金叉', key: 'KDJ_GOLDEN_FORK' },
  { label: '放量突破', key: 'BREAK_THROUGH' },
  { label: '低位资金净流入', key: 'LOW_FUNDS_INFLOW' },
  { label: '高位资金净流出', key: 'HIGH_FUNDS_OUTFLOW' },
  { label: '向上突破5日均线', key: 'BREAKUP_MA_5DAYS' },
  { label: '均线多头排列', key: 'LONG_AVG_ARRAY' },
  { label: '均线空头排列', key: 'SHORT_AVG_ARRAY' },
  { label: '连涨放量', key: 'UPPER_LARGE_VOLUME' },
  { label: '下跌无量', key: 'DOWN_NARROW_VOLUME' },
  { label: '一根大阳线', key: 'ONE_DAYANG_LINE' },
  { label: '两根大阳线', key: 'TWO_DAYANG_LINES' },
  { label: '旭日东升', key: 'RISE_SUN' },
  { label: '强势多方炮', key: 'POWER_FULGUN' },
  { label: '拨云见日', key: 'RESTORE_JUSTICE' },
  { label: '七仙女下凡(七连阴)', key: 'DOWN_7DAYS' },
  { label: '八仙过海(八连阳)', key: 'UPPER_8DAYS' },
  { label: '九阳神功(九连阳)', key: 'UPPER_9DAYS' },
  { label: '四串阳', key: 'UPPER_4DAYS' },
  { label: '天量法则', key: 'HEAVEN_RULE' },
  { label: '放量上攻', key: 'UPSIDE_VOLUME' },
  { label: '穿头破脚', key: 'BEARISH_ENGULFING' },
  { label: '倒转锤头', key: 'REVERSING_HAMMER' },
  { label: '射击之星', key: 'SHOOTING_STAR' },
  { label: '黄昏之星', key: 'EVENING_STAR' },
  { label: '曙光初现', key: 'FIRST_DAWN' },
  { label: '身怀六甲', key: 'PREGNANT' },
  { label: '乌云盖顶', key: 'BLACK_CLOUD_TOPS' },
  { label: '早晨之星', key: 'MORNING_STAR' },
  { label: '窄幅整理', key: 'NARROW_FINISH' },
];

const createEmptyTechnicalIndicators = (): models.TechnicalIndicators =>
  ({
    MACD_GOLDEN_FORK: false,
    KDJ_GOLDEN_FORK: false,
    BREAK_THROUGH: false,
    LOW_FUNDS_INFLOW: false,
    HIGH_FUNDS_OUTFLOW: false,
    BREAKUP_MA_5DAYS: false,
    LONG_AVG_ARRAY: false,
    SHORT_AVG_ARRAY: false,
    UPPER_LARGE_VOLUME: false,
    DOWN_NARROW_VOLUME: false,
    ONE_DAYANG_LINE: false,
    TWO_DAYANG_LINES: false,
    RISE_SUN: false,
    POWER_FULGUN: false,
    RESTORE_JUSTICE: false,
    DOWN_7DAYS: false,
    UPPER_8DAYS: false,
    UPPER_9DAYS: false,
    UPPER_4DAYS: false,
    HEAVEN_RULE: false,
    UPSIDE_VOLUME: false,
    BEARISH_ENGULFING: false,
    REVERSING_HAMMER: false,
    SHOOTING_STAR: false,
    EVENING_STAR: false,
    FIRST_DAWN: false,
    PREGNANT: false,
    BLACK_CLOUD_TOPS: false,
    MORNING_STAR: false,
    NARROW_FINISH: false,
    UPP_DAYS: 0,
    CONCERN_RANK_7DAYS: 0,
    UPNDAY: 0,
    DOWNNDAY: 0,
  } as models.TechnicalIndicators);

// 表格行数据类型（与 GetAllStocks 返回的 result.data 项一致）
interface StockRow {
  SECUCODE: string;
  SECURITY_NAME_ABBR: string;
  NEW_PRICE?: unknown;
  CHANGE_RATE?: unknown;
  HIGH_PRICE?: unknown;
  LOW_PRICE?: unknown;
  VOLUME?: unknown;
  DEAL_AMOUNT?: unknown;
  TURNOVERRATE?: unknown;
  VOLUME_RATIO?: unknown;
  INDUSTRY?: string;
  CONCEPT?: string | string[];
  PRE_CLOSE_PRICE?: unknown;
}

function isNumeric(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return false;
  return !isNaN(Number(value));
}

function toNumber(value: unknown, defaultValue = 0): number {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

function formatVolume(volume: unknown): string {
  const v = toNumber(volume, 0);
  if (v >= 100000000) return (v / 100000000).toFixed(2) + '亿';
  if (v >= 10000) return (v / 10000).toFixed(2) + '万';
  return String(v);
}

function formatAmount(amount: unknown): string {
  const a = toNumber(amount, 0);
  if (a >= 100000000) return (a / 100000000).toFixed(2) + '亿';
  if (a >= 10000) return (a / 10000).toFixed(2) + '万';
  return String(a);
}

export function StockFilter() {
  const { compactLayout } = useLayoutShell();
  const [activeSubMenu, setActiveSubMenu] = useState('股票信息筛选');
  const [keyword, setKeyword] = useState('');
  const [stockData, setStockData] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchOptions, setSearchOptions] = useState<{ label: string; value: string }[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [technicalIndicators, setTechnicalIndicators] = useState<models.TechnicalIndicators>(
    createEmptyTechnicalIndicators
  );

  const subMenuItems: string[] = [];

  const loadStocks = useCallback(
    (page: number, size: number, keywordOverride?: string) => {
      const searchKey = keywordOverride !== undefined ? keywordOverride : keyword;
      setLoading(true);
      setError(null);
      GetAllStocks(page, size, searchKey, technicalIndicators)
        .then((res) => {
          if (res?.result?.data) {
            setStockData(res.result.data as StockRow[]);
            setTotalCount(res.result.count ?? 0);
            setCurrentPage(page);
          } else {
            setStockData([]);
            setTotalCount(0);
            setError('获取股票数据失败');
          }
        })
        .catch((err: Error) => {
          setError('获取股票数据失败: ' + (err?.message ?? String(err)));
          setStockData([]);
          setTotalCount(0);
        })
        .finally(() => setLoading(false));
    },
    [keyword, technicalIndicators]
  );

  useEffect(() => {
    loadStocks(1, pageSize);
  }, []);

  const handlePageChange = (page: number) => {
    loadStocks(page, pageSize);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    loadStocks(1, size);
  };

  const handleSearch = () => {
    loadStocks(1, pageSize);
  };

  const handleSearchInput = (value: string) => {
    setKeyword(value);
    if (!value.trim()) {
      setSearchOptions([]);
      return;
    }
    GetAllStockInfoList({ searchKeyWord: value } as data.AllStockInfoQuery)
      .then((res) => {
        if (res?.list?.length) {
          setSearchOptions(
            res.list.map((item: models.AllStockInfo) => ({
              label: item.SECURITY_NAME_ABBR,
              value: item.SECURITY_NAME_ABBR,
            }))
          );
          setSearchOpen(true);
        } else {
          setSearchOptions([]);
        }
      })
      .catch(() => setSearchOptions([]));
  };

  const handleReset = () => {
    setKeyword('');
    setTechnicalIndicators(createEmptyTechnicalIndicators());
    setSearchOptions([]);
    setSearchOpen(false);
    loadStocks(1, pageSize);
  };

  const toggleTechnical = (key: keyof models.TechnicalIndicators, value?: boolean) => {
    setTechnicalIndicators((prev) => ({
      ...prev,
      [key]: value ?? !(prev[key] as boolean),
    }));
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const upCount = stockData.filter((r) => toNumber(r.CHANGE_RATE, 0) > 0).length;
  const downCount = stockData.filter((r) => toNumber(r.CHANGE_RATE, 0) < 0).length;
  const flatCount = stockData.filter((r) => toNumber(r.CHANGE_RATE, 0) === 0).length;

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-5 shadow-2xl">
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

      <div className="mt-2.5">
        <SubMenu
          items={subMenuItems}
          activeItem={activeSubMenu}
          onItemClick={setActiveSubMenu}
        />
      </div>

      <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-5 shadow-2xl space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm text-gray-300">技术指标筛选</h3>
          </div>
          <div
            className={cn(
              "grid gap-2",
              compactLayout
                ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-6"
                : "grid-cols-6",
            )}
          >
            {TECHNICAL_CHECKBOXES.map(({ label, key }) => (
              <label
                key={key}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800/40 rounded-lg border border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={!!(technicalIndicators[key] as boolean)}
                  onChange={() => toggleTechnical(key)}
                  className="w-3.5 h-3.5 rounded border-gray-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-gray-300 group-hover:text-white transition-colors">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">人气排名连涨:</span>
            {[3, 5, 7].map((v) => (
              <label key={v} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="UPP_DAYS"
                  checked={technicalIndicators.UPP_DAYS === v}
                  onChange={() => setTechnicalIndicators((p) => ({ ...p, UPP_DAYS: v }))}
                  className="w-3.5 h-3.5 text-cyan-500"
                />
                <span className="text-xs text-gray-300">{v}天及以上</span>
              </label>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">7日关注排名:</span>
            {[10, 50, 100].map((v) => (
              <label key={v} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="CONCERN_RANK_7DAYS"
                  checked={technicalIndicators.CONCERN_RANK_7DAYS === v}
                  onChange={() => setTechnicalIndicators((p) => ({ ...p, CONCERN_RANK_7DAYS: v }))}
                  className="w-3.5 h-3.5 text-cyan-500"
                />
                <span className="text-xs text-gray-300">前{v}名</span>
              </label>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">连涨天数:</span>
            {[3, 5, 8].map((v) => (
              <label key={v} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="UPNDAY"
                  checked={technicalIndicators.UPNDAY === v}
                  onChange={() => setTechnicalIndicators((p) => ({ ...p, UPNDAY: v }))}
                  className="w-3.5 h-3.5 text-cyan-500"
                />
                <span className="text-xs text-gray-300">{v}天及以上</span>
              </label>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">连跌天数:</span>
            {[3, 5, 8, 10, 14].map((v) => (
              <label key={v} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="DOWNNDAY"
                  checked={technicalIndicators.DOWNNDAY === v}
                  onChange={() => setTechnicalIndicators((p) => ({ ...p, DOWNNDAY: v }))}
                  className="w-3.5 h-3.5 text-cyan-500"
                />
                <span className="text-xs text-gray-300">{v}天及以上</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2 relative">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
            <input
              type="text"
              placeholder="输入搜索关键词（股票名称或代码）"
              value={keyword}
              onChange={(e) => handleSearchInput(e.target.value)}
              onFocus={() => searchOptions.length > 0 && setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
            />
            {searchOpen && searchOptions.length > 0 && (
              <ul className="absolute left-0 right-0 top-full mt-1 py-1 bg-slate-800 border border-white/10 rounded-lg shadow-xl z-20 max-h-48 overflow-auto">
                {searchOptions.map((opt) => (
                  <li
                    key={opt.value}
                    className="px-4 py-2 text-sm text-gray-300 hover:bg-white/10 cursor-pointer"
                    onMouseDown={() => {
                      setKeyword(opt.value);
                      setSearchOpen(false);
                      loadStocks(1, pageSize, opt.value);
                    }}
                  >
                    {opt.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2.5 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-sm text-cyan-400 hover:bg-cyan-500/30 transition-all"
          >
            搜索
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-2.5 bg-slate-700/50 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-slate-700 transition-all"
          >
            重置
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

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
                <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">量比</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-400">所属行业</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-400">所属概念</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={14} className="px-3 py-8 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin inline-block" />
                    <span className="ml-2">加载中...</span>
                  </td>
                </tr>
              ) : stockData.length === 0 ? (
                <tr>
                  <td colSpan={14} className="px-3 py-8 text-center text-gray-500">
                    暂无数据
                  </td>
                </tr>
              ) : (
                stockData.map((row) => {
                  const changeRate = toNumber(row.CHANGE_RATE, 0);
                  const isUp = changeRate >= 0;
                  const concept =
                    row.CONCEPT == null
                      ? '无'
                      : Array.isArray(row.CONCEPT)
                        ? row.CONCEPT.join(', ')
                        : String(row.CONCEPT);
                  return (
                    <tr
                      key={row.SECUCODE}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-3 py-2.5">
                        <span className="text-xs text-cyan-400 font-mono">{row.SECUCODE}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-xs text-white">{row.SECURITY_NAME_ABBR}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={`text-xs font-medium ${isUp ? 'text-red-400' : 'text-green-400'}`}>
                          {isNumeric(row.NEW_PRICE) ? Number(row.NEW_PRICE) : '-'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={`text-xs font-medium ${isUp ? 'text-red-400' : 'text-green-400'}`}>
                          {isUp ? '+' : ''}{changeRate.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="text-xs text-gray-500">—</span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-xs text-red-400">
                          {isNumeric(row.HIGH_PRICE) ? row.HIGH_PRICE : '-'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-xs text-green-400">
                          {isNumeric(row.LOW_PRICE) ? row.LOW_PRICE : '-'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-xs text-gray-300">{formatVolume(row.VOLUME)}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-xs text-gray-300">{formatAmount(row.DEAL_AMOUNT)}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-xs text-blue-400">
                          {isNumeric(row.TURNOVERRATE) ? row.TURNOVERRATE : '-'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-xs text-gray-300">
                          {isNumeric(row.VOLUME_RATIO) ? row.VOLUME_RATIO : '-'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-xs text-gray-300">{row.INDUSTRY ?? '-'}</span>
                      </td>
                      <td className="px-3 py-2.5 max-w-[120px] truncate" title={concept}>
                        <span className="text-xs text-gray-400">{concept}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalCount}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        extra={
          <div className="flex items-center gap-4 pl-4 border-l border-white/10">
            <span className="text-gray-400">上涨: <span className="text-red-400 font-medium">{upCount}</span></span>
            <span className="text-gray-400">下跌: <span className="text-green-400 font-medium">{downCount}</span></span>
            <span className="text-gray-400">平盘: <span className="text-gray-300 font-medium">{flatCount}</span></span>
          </div>
        }
      />
    </div>
  );
}
