import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { GetIndustryMoneyRankSina, GetIndustryRank } from '../../../../wailsjs/go/main/App';
import { KLineChart } from '../KLineChart';
import { SubMenu } from '../SubMenu';
import { useTheme } from '../../context/ThemeContext';

type IndustryTab = 'gain' | 'money0' | 'money2' | 'money1';

const TABS: { id: IndustryTab; label: string }[] = [
  { id: 'gain', label: '行业涨幅排名' },
  { id: 'money0', label: '行业资金排名(申万)' },
  { id: 'money2', label: '证监会行业资金' },
  { id: 'money1', label: '概念板块资金' },
];

function num(v: unknown): number {
  if (typeof v === 'number') return v;
  return parseFloat(String(v ?? 0)) || 0;
}

export function IndustryRankPanel() {
  const { isDark } = useTheme();
  const [tab, setTab] = useState<IndustryTab>('gain');
  const [sort, setSort] = useState<'0' | '1'>('0');
  const [gainRows, setGainRows] = useState<Record<string, unknown>[]>([]);
  const [moneyRows, setMoneyRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);

  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hover, setHover] = useState<{ code: string; name: string } | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const fetchGain = useCallback(async () => {
    setLoading(true);
    try {
      const res = await GetIndustryRank(sort, 150);
      if (Array.isArray(res) && res.length > 0) setGainRows(res as Record<string, unknown>[]);
      else setGainRows([]);
    } catch (e) {
      console.error(e);
      setGainRows([]);
    } finally {
      setLoading(false);
    }
  }, [sort]);

  const fenleiForTab = (t: IndustryTab): string | null => {
    if (t === 'money0') return '0';
    if (t === 'money2') return '2';
    if (t === 'money1') return '1';
    return null;
  };

  const fetchMoney = useCallback(async () => {
    const f = fenleiForTab(tab);
    if (f === null) return;
    setLoading(true);
    try {
      const res = await GetIndustryMoneyRankSina(f, 'netamount');
      if (Array.isArray(res) && res.length > 0) setMoneyRows(res as Record<string, unknown>[]);
      else setMoneyRows([]);
    } catch (e) {
      console.error(e);
      setMoneyRows([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    if (tab === 'gain') fetchGain();
    else fetchMoney();
  }, [tab, sort, fetchGain, fetchMoney]);

  useEffect(() => {
    const t = setInterval(() => {
      if (tab === 'gain') fetchGain();
      else fetchMoney();
    }, 60_000);
    return () => clearInterval(t);
  }, [tab, fetchGain, fetchMoney]);

  const toggleSort = () => setSort((s) => (s === '0' ? '1' : '0'));

  const clearHide = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };

  const onLeaderEnter = (code: string, name: string, e: React.MouseEvent) => {
    clearHide();
    setHover({ code, name });
    setPos({ x: e.clientX, y: e.clientY });
  };

  const onLeaderLeave = () => {
    clearHide();
    hideTimer.current = setTimeout(() => setHover(null), 150);
  };

  return (
    <div className="space-y-4">
      <SubMenu
        items={TABS.map((t) => t.label)}
        activeItem={TABS.find((t) => t.id === tab)?.label}
        onItemClick={(label) => {
          const f = TABS.find((t) => t.label === label);
          if (f) setTab(f.id);
        }}
      />

      <div className="bg-card rounded-xl border border-border shadow-2xl overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-8 text-cyan-400 text-xs gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            加载中…
          </div>
        )}
        {!loading && tab === 'gain' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-400">行业名称</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-gray-400 hover:text-cyan-400"
                      onClick={toggleSort}
                    >
                      行业涨幅
                      {sort === '0' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                    </button>
                  </th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">行业5日涨幅</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">行业20日涨幅</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-400">领涨股</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">涨幅</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">最新价</th>
                </tr>
              </thead>
              <tbody>
                {gainRows.map((item) => {
                  const z = num(item.bd_zdf);
                  const up = z > 0;
                  const nz = num(item.nzg_zdf);
                  const nzUp = nz > 0;
                  return (
                    <tr key={String(item.bd_code)} className="border-b border-border/60 hover:bg-accent/40 dark:hover:bg-white/5">
                      <td className="px-3 py-2 text-xs text-cyan-400/90">{String(item.bd_name ?? '')}</td>
                      <td className={`px-3 py-2 text-right text-xs ${up ? 'text-red-400' : 'text-green-400'}`}>
                        {z}%
                      </td>
                      <td className={`px-3 py-2 text-right text-xs ${num(item.bd_zdf5) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {num(item.bd_zdf5)}%
                      </td>
                      <td className={`px-3 py-2 text-right text-xs ${num(item.bd_zdf20) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {num(item.bd_zdf20)}%
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <span className={nzUp ? 'text-red-400' : 'text-green-400'}>
                          {String(item.nzg_name ?? '')}{' '}
                          <span className="text-slate-500">{String(item.nzg_code ?? '')}</span>
                        </span>
                      </td>
                      <td className={`px-3 py-2 text-right text-xs ${nzUp ? 'text-red-400' : 'text-green-400'}`}>
                        {nz}%
                      </td>
                      <td className={`px-3 py-2 text-right text-xs ${nzUp ? 'text-red-400' : 'text-green-400'}`}>
                        {num(item.nzg_zxj)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && tab !== 'gain' && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-400">板块名称</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">涨跌幅</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">流入资金/万</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">流出资金/万</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">净流入/万</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">净流入率</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-400">领涨股</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">涨跌幅</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">最新价</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-400">净流入率</th>
                </tr>
              </thead>
              <tbody>
                {moneyRows.map((item) => {
                  const tsSym = String(item.ts_symbol ?? '');
                  const tsName = String(item.ts_name ?? '');
                  const tsZ = num(item.ts_changeratio);
                  const tsUp = tsZ > 0;
                  return (
                    <tr key={String(item.category ?? item.name)} className="border-b border-border/60 hover:bg-accent/40 dark:hover:bg-white/5">
                      <td className="px-3 py-2 text-xs text-cyan-400/90">{String(item.name ?? '')}</td>
                      <td className={`px-3 py-2 text-right text-xs ${num(item.avg_changeratio) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {(num(item.avg_changeratio) * 100).toFixed(2)}%
                      </td>
                      <td className="px-3 py-2 text-right text-xs text-slate-300">
                        {(num(item.inamount) / 10000).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right text-xs text-slate-300">
                        {(num(item.outamount) / 10000).toFixed(2)}
                      </td>
                      <td className={`px-3 py-2 text-right text-xs ${num(item.netamount) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {(num(item.netamount) / 10000).toFixed(2)}
                      </td>
                      <td className={`px-3 py-2 text-right text-xs ${num(item.ratioamount) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {(num(item.ratioamount) * 100).toFixed(2)}%
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <button
                          type="button"
                          className={tsUp ? 'text-red-400 hover:underline' : 'text-green-400 hover:underline'}
                          onMouseEnter={(e) => onLeaderEnter(tsSym, tsName, e)}
                          onMouseLeave={onLeaderLeave}
                        >
                          {tsName}
                        </button>
                      </td>
                      <td className={`px-3 py-2 text-right text-xs ${tsUp ? 'text-red-400' : 'text-green-400'}`}>
                        {(tsZ * 100).toFixed(2)}%
                      </td>
                      <td className="px-3 py-2 text-right text-xs text-slate-300">{num(item.ts_trade)}</td>
                      <td className={`px-3 py-2 text-right text-xs ${num(item.ts_ratioamount) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {(num(item.ts_ratioamount) * 100).toFixed(2)}%
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
