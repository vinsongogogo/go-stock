import { useState, useEffect } from 'react';

/** 检测是否在 Wails 环境中运行 */
export function isWails(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as unknown as { go?: { main?: { App?: unknown } }; runtime?: unknown };
  return !!(w.go?.main?.App && w.runtime);
}

/** 从后端 GlobalStockIndexes 与 telegraph 拼出的行情条单项 */
export interface TickerItem {
  name: string;
  value: string;
  change: string;
  isUp: boolean;
  isTelegraph?: boolean;
}

/** 将 GlobalStockIndexes 和 telegraph 数组合并为 TickerItem[]（与 frontend MarketTicker 逻辑一致） */
export function buildTickerItems(
  indexes: Record<string, unknown> | null,
  telegraph: string[]
): TickerItem[] {
  const list: TickerItem[] = [];
  if (indexes && typeof indexes === 'object') {
    const regions = ['common', 'america', 'europe', 'asia', 'other'] as const;
    for (const key of regions) {
      const arr = indexes[key];
      if (Array.isArray(arr)) {
        for (const item of arr as Array<{ name?: string; zxj?: number; zdf?: number }>) {
          list.push({
            name: item.name ?? '',
            value: item.zxj != null ? String(item.zxj) : '',
            change:
              item.zdf != null
                ? (item.zdf >= 0 ? `+${item.zdf}%` : `${item.zdf}%`)
                : '',
            isUp: item.zdf != null ? item.zdf >= 0 : true,
          });
        }
      }
    }
  }
  if (Array.isArray(telegraph) && telegraph.length) {
    for (const text of telegraph) {
      list.push({ name: text, value: '', change: '', isUp: true, isTelegraph: true });
    }
  }
  return list;
}

export interface AppDataState {
  /** 是否在 Wails 环境 */
  isWails: boolean;
  /** 全局配置（仅 Wails 下有效） */
  config: { enableFund?: boolean; enableAgent?: boolean; enableNews?: boolean; darkTheme?: boolean } | null;
  /** 自选分组列表（仅 Wails 下有效） */
  groupList: Array<{ ID?: number; name?: string; [k: string]: unknown }>;
  /** 版本/关于信息（仅 Wails 下有效） */
  versionInfo: { officialStatement?: string; [k: string]: unknown } | null;
  /** 全球指数原始数据（仅 Wails 下有效） */
  marketIndexes: Record<string, unknown> | null;
  /** 快讯文案列表（仅 Wails 下有效） */
  telegraph: string[];
  /** 已合并的行情条列表（指数 + 快讯文案），由 marketIndexes + telegraph 派生 */
  tickerItems: TickerItem[];
  /** 实时盈亏（仅 Wails 下有效） */
  realtimeProfit: number;
  /** 首屏加载中 */
  loading: boolean;
  /** 加载状态文案 */
  loadingMsg: string;
}

const DEFAULT_STATE: AppDataState = {
  isWails: false,
  config: null,
  groupList: [],
  versionInfo: null,
  marketIndexes: null,
  telegraph: [],
  tickerItems: [],
  realtimeProfit: 0,
  loading: false,
  loadingMsg: '加载完成...',
};

/**
 * 从 frontend 主页迁移的获取数据逻辑：
 * - GetConfig / GetGroupList / GetVersionInfo / GlobalStockIndexes
 * - 事件：realtime_profit, telegraph, loadingMsg
 * 非 Wails 环境下返回默认值，不请求后端。
 */
export function useAppData(): AppDataState {
  const [state, setState] = useState<AppDataState>(() => ({
    ...DEFAULT_STATE,
    isWails: isWails(),
  }));

  useEffect(() => {
    const wails = isWails();
    if (!wails) {
      setState((s) => ({ ...s, loading: false, loadingMsg: '加载完成...' }));
      return;
    }

    // 动态加载 wails 绑定，避免在非 Wails 构建时报错
    const loadBindings = async () => {
      const [
        { GetConfig, GetGroupList, GetVersionInfo, GlobalStockIndexes },
        { EventsOn, EventsOff },
      ] = await Promise.all([
        import('../../../wailsjs/go/main/App'),
        import('../../../wailsjs/runtime/runtime'),
      ]);

      GetVersionInfo()
        .then((result: { officialStatement?: string }) => {
          setState((s) => ({
            ...s,
            versionInfo: result ? { officialStatement: result.officialStatement } : null,
          }));
        })
        .catch(() => {});

      GetGroupList()
        .then((result: Array<{ ID?: number; name?: string }>) => {
          setState((s) => ({ ...s, groupList: Array.isArray(result) ? result : [] }));
        })
        .catch(() => {});

      GetConfig()
        .then((res: { enableFund?: boolean; enableAgent?: boolean; enableNews?: boolean; darkTheme?: boolean }) => {
          setState((s) => ({
            ...s,
            config: res
              ? {
                  enableFund: res.enableFund,
                  enableAgent: res.enableAgent,
                  enableNews: res.enableNews,
                  darkTheme: res.darkTheme,
                }
              : null,
          }));
        })
        .catch(() => {});

      GlobalStockIndexes()
        .then((res: Record<string, unknown>) => {
          setState((s) => ({
            ...s,
            marketIndexes: res ?? null,
            tickerItems: buildTickerItems(res ?? null, s.telegraph),
          }));
        })
        .catch(() => {
          setState((s) => ({ ...s, marketIndexes: null, tickerItems: buildTickerItems(null, s.telegraph) }));
        });

      EventsOn('realtime_profit', (data: number) => {
        setState((s) => ({ ...s, realtimeProfit: data }));
      });
      EventsOn('telegraph', (data: string[]) => {
        const telegraph = Array.isArray(data) ? data : [];
        setState((s) => ({
          ...s,
          telegraph,
          tickerItems: buildTickerItems(s.marketIndexes, telegraph),
        }));
      });
      EventsOn('loadingMsg', (data: string) => {
        if (data === 'done') {
          setState((s) => ({
            ...s,
            loadingMsg: '加载完成...',
            loading: false,
          }));
          // 与 frontend 一致：通知后端加载完成
          import('../../../wailsjs/runtime/runtime').then(({ EventsEmit }) =>
            EventsEmit('loadingDone', 'app')
          );
        } else {
          setState((s) => ({
            ...s,
            loading: true,
            loadingMsg: data ?? '加载数据中...',
          }));
        }
      });

      return EventsOff;
    };

    let eventsOff: ((...names: string[]) => void) | null = null;
    loadBindings().then((off) => {
      eventsOff = off;
    });

    // 与 frontend 一致：超时 8 秒强制结束 loading
    const timer = setTimeout(() => {
      setState((s) => {
        if (s.loading)
          return { ...s, loading: false, loadingMsg: '加载完成...' };
        return s;
      });
    }, 8000);

    return () => {
      clearTimeout(timer);
      if (eventsOff) eventsOff('realtime_profit', 'telegraph', 'loadingMsg', 'newsPush');
    };
  }, []);

  return state;
}
