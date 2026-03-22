import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { GlobalStockIndexes } from '../../../../wailsjs/go/main/App';

interface StockIndex {
  name: string;
  zxj: number | string;
  zdf: number | string;
  img?: string;
  location?: string;
  state?: string;
  code?: string;
}

type BucketKey = 'common' | 'america' | 'europe' | 'asia' | 'other';

const ORDER: BucketKey[] = ['common', 'america', 'europe', 'asia', 'other'];

const LABELS: Record<BucketKey, string> = {
  common: '常用',
  america: '美洲',
  europe: '欧洲',
  asia: '亚洲',
  other: '其他',
};

function num(v: unknown): number {
  if (typeof v === 'number') return v;
  return parseFloat(String(v ?? 0)) || 0;
}

export function GlobalIndexesPanel() {
  const [data, setData] = useState<Record<string, StockIndex[]> | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await GlobalStockIndexes()) as Record<string, StockIndex[]>;
      setData(res || null);
    } catch (e) {
      console.error(e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = setInterval(load, 10_000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden p-3 sm:p-4">
      {loading && !data && (
        <div className="flex items-center justify-center py-12 text-cyan-400 text-xs gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          加载全球指数…
        </div>
      )}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {ORDER.map((key) => {
            const list = data[key] || [];
            return (
              <div
                key={key}
                className="rounded-lg border border-white/10 bg-slate-900/30 overflow-hidden"
              >
                <div className="px-3 py-2 border-b border-white/10 text-xs font-medium text-cyan-400/90">
                  {LABELS[key]}
                </div>
                <ul className="divide-y divide-white/5 max-h-[420px] overflow-y-auto">
                  {list.map((item) => {
                    const zdf = num(item.zdf);
                    const up = zdf >= 0;
                    return (
                      <li key={String(item.code ?? item.name)} className="px-2 py-2 text-xs">
                        <div className="flex items-start gap-2">
                          {item.img ? (
                            <img src={item.img} alt="" className="w-5 h-5 rounded mt-0.5 shrink-0" />
                          ) : null}
                          <div className="min-w-0 flex-1">
                            <div className={`font-medium truncate ${up ? 'text-red-400' : 'text-green-400'}`}>
                              {item.name}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[11px]">
                              <span className={up ? 'text-red-400' : 'text-green-400'}>
                                {typeof item.zxj === 'number' ? item.zxj.toFixed(2) : num(item.zxj).toFixed(2)}
                              </span>
                              <span className={up ? 'text-red-400' : 'text-green-400'}>
                                {up ? '+' : ''}
                                {zdf.toFixed(2)}%
                              </span>
                              <span
                                className={
                                  item.state === 'open' ? 'text-emerald-400' : 'text-amber-400'
                                }
                              >
                                {item.state === 'open' ? '开市' : '休市'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
