import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { GetMoneyRankSina } from '../../../../wailsjs/go/main/App';
import { KLineChart } from '../KLineChart';
import { SubMenu } from '../SubMenu';
import { useTheme } from '../../context/ThemeContext';

type SortKey =
  | 'netamount'
  | 'outamount'
  | 'ratioamount'
  | 'r0_net'
  | 'r0_out'
  | 'r0_ratio'
  | 'r3_net'
  | 'r3_out'
  | 'r3_ratio';

const SORT_ITEMS: { key: SortKey; label: string }[] = [
  { key: 'netamount', label: '净流入额排名' },
  { key: 'outamount', label: '流出资金排名' },
  { key: 'ratioamount', label: '净流入率排名' },
  { key: 'r0_net', label: '主力净流入额排名' },
  { key: 'r0_out', label: '主力流出排名' },
  { key: 'r0_ratio', label: '主力净流入率排名' },
  { key: 'r3_net', label: '散户净流入额排名' },
  { key: 'r3_out', label: '散户流出排名' },
  { key: 'r3_ratio', label: '散户净流入率排名' },
];

function num(v: unknown): number {
  if (typeof v === 'number') return v;
  return parseFloat(String(v ?? 0)) || 0;
}

export function StockMoneyFlowPanel() {
  const { isDark } = useTheme();
  const [sort, setSort] = useState<SortKey>('netamount');
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hover, setHover] = useState<{ code: string; name: string } | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await GetMoneyRankSina(sort);
      if (Array.isArray(res) && res.length > 0) setRows(res);
      else setRows([]);
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const t = setInterval(fetchData, 60_000);
    return () => clearInterval(t);
  }, [fetchData]);

  const clearHide = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };

  const onNameEnter = (row: Record<string, unknown>, e: React.MouseEvent) => {
    clearHide();
    setHover({
      code: String(row.symbol ?? ''),
      name: String(row.name ?? ''),
    });
    setPos({ x: e.clientX, y: e.clientY });
  };

  const onNameLeave = () => {
    clearHide();
    hideTimer.current = setTimeout(() => setHover(null), 150);
  };

  const showR0Extra = sort === 'r0_net' || sort === 'r0_out';
  const showR0NetCols = sort === 'r0_net';
  const showR3Extra = sort === 'r3_net' || sort === 'r3_out';
  const showR3NetCols = sort === 'r3_net';

  return (
    <div className="space-y-4">
      <SubMenu
        items={SORT_ITEMS.map((s) => s.label)}
        activeItem={SORT_ITEMS.find((s) => s.key === sort)?.label}
        onItemClick={(label) => {
          const found = SORT_ITEMS.find((s) => s.label === label);
          if (found) setSort(found.key);
        }}
      />

      <div className="bg-card rounded-xl border border-border shadow-2xl overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-8 text-cyan-400 text-xs gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            加载中…
          </div>
        )}
        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="border-b border-border">
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
                  {showR0Extra && (
                    <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">主力流出/万</th>
                  )}
                  {showR0NetCols && (
                    <>
                      <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">主力流入/万</th>
                      <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">主力净流入/万</th>
                    </>
                  )}
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">主力净流入率</th>
                  {showR3Extra && (
                    <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">散户流出/万</th>
                  )}
                  {showR3NetCols && (
                    <>
                      <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">散户流入/万</th>
                      <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">散户净流入/万</th>
                    </>
                  )}
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">散户净流入率</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => {
                  const cr = num(item.changeratio);
                  const up = cr >= 0;
                  const turnover = num(item.turnover);
                  return (
                    <tr key={String(item.symbol)} className="border-b border-border/60 hover:bg-accent/40 dark:hover:bg-white/5">
                      <td className="px-3 py-2 text-xs font-mono text-cyan-400">{String(item.symbol)}</td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          className={`text-xs font-medium hover:underline ${up ? 'text-red-400' : 'text-green-400'}`}
                          onMouseEnter={(e) => onNameEnter(item, e)}
                          onMouseLeave={onNameLeave}
                        >
                          {String(item.name ?? '')}
                        </button>
                      </td>
                      <td className={`px-3 py-2 text-right text-xs ${up ? 'text-red-400' : 'text-green-400'}`}>
                        {num(item.trade).toFixed(2)}
                      </td>
                      <td className={`px-3 py-2 text-right text-xs ${up ? 'text-red-400' : 'text-green-400'}`}>
                        {(cr * 100).toFixed(2)}%
                      </td>
                      <td className={`px-3 py-2 text-right text-xs ${turnover > 500 ? 'text-red-400' : 'text-slate-400'}`}>
                        {(turnover / 100).toFixed(2)}%
                      </td>
                      <td className="px-3 py-2 text-right text-xs text-slate-300">
                        {(num(item.amount) / 10000).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right text-xs text-slate-300">
                        {(num(item.outamount) / 10000).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right text-xs text-slate-300">
                        {(num(item.inamount) / 10000).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right text-xs text-slate-300">
                        {(num(item.netamount) / 10000).toFixed(2)}
                      </td>
                      <td className={`px-3 py-2 text-right text-xs ${num(item.ratioamount) >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {(num(item.ratioamount) * 100).toFixed(2)}%
                      </td>
                      {showR0Extra && (
                        <td className="px-3 py-2 text-right text-xs text-green-400">
                          {(num(item.r0_out) / 10000).toFixed(2)}
                        </td>
                      )}
                      {showR0NetCols && (
                        <>
                          <td className="px-3 py-2 text-right text-xs text-red-400">
                            {(num(item.r0_in) / 10000).toFixed(2)}
                          </td>
                          <td className={`px-3 py-2 text-right text-xs ${num(item.r0_net) >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {(num(item.r0_net) / 10000).toFixed(2)}
                          </td>
                        </>
                      )}
                      <td className={`px-3 py-2 text-right text-xs ${num(item.r0_ratio) >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {(num(item.r0_ratio) * 100).toFixed(2)}%
                      </td>
                      {showR3Extra && (
                        <td className="px-3 py-2 text-right text-xs text-green-400">
                          {(num(item.r3_out) / 10000).toFixed(2)}
                        </td>
                      )}
                      {showR3NetCols && (
                        <>
                          <td className="px-3 py-2 text-right text-xs text-red-400">
                            {(num(item.r3_in) / 10000).toFixed(2)}
                          </td>
                          <td className={`px-3 py-2 text-right text-xs ${num(item.r3_net) >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {(num(item.r3_net) / 10000).toFixed(2)}
                          </td>
                        </>
                      )}
                      <td className={`px-3 py-2 text-right text-xs ${num(item.r3_ratio) >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {(num(item.r3_ratio) * 100).toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {hover && (
        <div
          className="fixed z-50 bg-popover border border-border rounded-xl shadow-2xl p-3"
          style={{
            left: Math.min(pos.x + 16, window.innerWidth - 820),
            top: Math.min(pos.y, window.innerHeight - 520),
            width: 800,
            height: 500,
          }}
          onMouseEnter={() => clearHide()}
          onMouseLeave={() => setHover(null)}
        >
          <KLineChart code={hover.code} stockName={hover.name} kDays={20} chartHeight={460} darkTheme={isDark} />
        </div>
      )}
    </div>
  );
}
