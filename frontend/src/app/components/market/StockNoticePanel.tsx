import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { GetStockList, StockNotice } from '../../../../wailsjs/go/main/App';
import { BrowserOpenURL } from '../../../../wailsjs/runtime/runtime';
import { KLineChart } from '../KLineChart';
import { MoneyTrend } from '../MoneyTrend';
import { useTheme } from '../../context/ThemeContext';

function getMarketCode(market: string, code: string): string {
  if (market === '0') return `sz${code}`;
  if (market === '1') return `sh${code}`;
  if (market === '2') return `bj${code}`;
  if (market === '3') return `hk${code}`;
  return code;
}

function getTypeClass(name: string): string {
  if (
    /质押|冻结|解冻|解押|解禁|异常|减持|增发|重大|季度报告|年度报告|澄清公告|风险|终止|复牌|停牌|退市|破产|清算/.test(
      name,
    )
  ) {
    return 'text-red-400';
  }
  if (/回购|重组|诉讼|仲裁|转让|收购|调研|募集/.test(name)) {
    return 'text-amber-400';
  }
  return 'text-muted-foreground';
}

type NoticeRow = Record<string, unknown>;

export function StockNoticePanel() {
  const { isDark } = useTheme();
  const [rows, setRows] = useState<NoticeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hoverK, setHoverK] = useState<{ code: string; name: string } | null>(null);
  const [hoverM, setHoverM] = useState<{ code: string; name: string } | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const fetchList = useCallback(async (codes: string) => {
    setLoading(true);
    try {
      const res = (await StockNotice(codes)) as NoticeRow[];
      setRows(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList('');
  }, [fetchList]);

  const onSearchInput = (q: string) => {
    setSearch(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setOptions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await GetStockList(q);
        setOptions(
          (res || []).map((item: { name?: string; ts_code?: string }) => ({
            label: `${item.name ?? ''} - ${item.ts_code ?? ''}`,
            value: item.ts_code ?? '',
          })),
        );
      } catch {
        setOptions([]);
      }
    }, 300);
  };

  const onSelectStock = (tsCode: string) => {
    setSearch('');
    setOptions([]);
    fetchList(tsCode);
  };

  const openPdf = (artCode: string) => {
    BrowserOpenURL(`https://pdf.dfcfw.com/pdf/H2_${artCode}_1.pdf?1750092081000.pdf`);
  };

  const clearHide = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };

  const enterK = (row: NoticeRow, e: React.MouseEvent) => {
    clearHide();
    const codes = row.codes as { market_code?: string; stock_code?: string; short_name?: string }[] | undefined;
    const c = codes?.[0];
    if (!c) return;
    const code = getMarketCode(String(c.market_code ?? ''), String(c.stock_code ?? ''));
    setHoverK({ code, name: String(c.short_name ?? '') });
    setHoverM(null);
    setPos({ x: e.clientX, y: e.clientY });
  };

  const enterM = (row: NoticeRow, e: React.MouseEvent) => {
    clearHide();
    const codes = row.codes as { market_code?: string; stock_code?: string; short_name?: string }[] | undefined;
    const c = codes?.[0];
    if (!c) return;
    const code = getMarketCode(String(c.market_code ?? ''), String(c.stock_code ?? ''));
    setHoverM({ code, name: String(c.short_name ?? '') });
    setHoverK(null);
    setPos({ x: e.clientX, y: e.clientY });
  };

  const leaveHover = () => {
    clearHide();
    hideTimer.current = setTimeout(() => {
      setHoverK(null);
      setHoverM(null);
    }, 150);
  };

  return (
    <div className="space-y-3">
      <div className="bg-card rounded-xl border border-border p-3 shadow-2xl flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchInput(e.target.value)}
          placeholder="输入 A 股名称或代码"
          className="flex-1 min-w-[200px] bg-input-background border border-input rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground"
        />
        {options.length > 0 && (
          <div className="w-full max-h-40 overflow-y-auto rounded-lg border border-border bg-popover text-xs">
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                className="block w-full text-left px-3 py-2 hover:bg-white/10 text-slate-200"
                onClick={() => onSelectStock(o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => fetchList('')}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-cyan-500/30 text-xs text-cyan-400 hover:bg-cyan-500/10"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          刷新全部
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-2xl overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-10 text-cyan-400 text-xs gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            加载公告…
          </div>
        )}
        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-400">股票代码</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-400">股票名称</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-400">公告标题</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-400">公告类型</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-400">公告日期</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-400">更新时间</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => {
                  const artCode = String(item.art_code ?? '');
                  const title = String(item.title ?? '');
                  const cols = item.columns as { column_name?: string }[] | undefined;
                  const colName = cols?.[0]?.column_name ?? '';
                  const codes = item.codes as
                    | { market_code?: string; stock_code?: string; short_name?: string }[]
                    | undefined;
                  const c0 = codes?.[0];
                  const nd = String(item.notice_date ?? '');
                  const dt = String(item.display_time ?? '');
                  return (
                    <tr key={artCode + title} className="border-b border-border/60 hover:bg-accent/40 dark:hover:bg-white/5">
                      <td className="px-3 py-2">
                        {c0 ? (
                          <button
                            type="button"
                            className="text-xs font-mono text-cyan-400 hover:underline"
                            onMouseEnter={(e) => enterM(item, e)}
                            onMouseLeave={leaveHover}
                          >
                            {c0.stock_code}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {c0 ? (
                          <button
                            type="button"
                            className={`text-xs hover:underline ${getTypeClass(colName)}`}
                            onMouseEnter={(e) => enterK(item, e)}
                            onMouseLeave={leaveHover}
                          >
                            {c0.short_name}
                          </button>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs max-w-[280px]">
                        <button
                          type="button"
                          className={`text-left hover:underline ${getTypeClass(colName)}`}
                          onClick={() => openPdf(artCode)}
                        >
                          {title}
                        </button>
                      </td>
                      <td className={`px-3 py-2 text-xs ${getTypeClass(colName)}`}>{colName}</td>
                      <td className="px-3 py-2 text-xs text-slate-400">{nd.slice(0, 10)}</td>
                      <td className="px-3 py-2 text-xs text-slate-400">{dt.slice(0, 19)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {hoverK && (
        <div
          className="fixed z-50 bg-popover border border-border rounded-xl shadow-2xl p-3"
          style={{
            left: Math.min(pos.x + 16, window.innerWidth - 820),
            top: Math.min(pos.y, window.innerHeight - 520),
            width: 800,
            height: 500,
          }}
          onMouseEnter={() => clearHide()}
          onMouseLeave={() => {
            setHoverK(null);
          }}
        >
          <KLineChart code={hoverK.code} stockName={hoverK.name} kDays={20} chartHeight={460} darkTheme={isDark} />
        </div>
      )}
      {hoverM && (
        <div
          className="fixed z-50 bg-popover border border-border rounded-xl shadow-2xl p-3"
          style={{
            left: Math.min(pos.x + 16, window.innerWidth - 820),
            top: Math.min(pos.y, window.innerHeight - 520),
            width: 800,
            height: 500,
          }}
          onMouseEnter={() => clearHide()}
          onMouseLeave={() => {
            setHoverM(null);
          }}
        >
          <MoneyTrend code={hoverM.code} name={hoverM.name} days={360} chartHeight={460} darkTheme={isDark} />
        </div>
      )}
    </div>
  );
}
