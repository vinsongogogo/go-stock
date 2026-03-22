import { TrendingUp } from 'lucide-react';
import { StockMoneyFlowPanel } from './market/StockMoneyFlowPanel';
import { IndustryRankPanel } from './market/IndustryRankPanel';
import { GlobalIndexesPanel } from './market/GlobalIndexesPanel';
import { StockNoticePanel } from './market/StockNoticePanel';

export type MoneyFlowMainTab = 'flow' | 'industry' | 'global' | 'notice';

const MAIN_TABS: { id: MoneyFlowMainTab; label: string; desc: string }[] = [
  { id: 'flow', label: '个股资金流向', desc: 'Stock money flow · 新浪数据源' },
  { id: 'industry', label: '行业排名', desc: '行业涨幅与板块资金' },
  { id: 'global', label: '全球指数', desc: '分区指数行情' },
  { id: 'notice', label: '个股公告', desc: '上市公司公告' },
];

interface MoneyFlowProps {
  /** 与左侧菜单同步 */
  activeTab?: MoneyFlowMainTab;
}

export function MoneyFlow({ activeTab: activeTabProp }: MoneyFlowProps = {}) {
  const mainTab = activeTabProp ?? 'flow';
  const meta = MAIN_TABS.find((t) => t.id === mainTab);

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border p-5 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/50">
            <TrendingUp className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl text-foreground font-light">{meta?.label ?? '行情'}</h2>
            <p className="text-xs text-muted-foreground">{meta?.desc}</p>
          </div>
        </div>
      </div>

      {mainTab === 'flow' && <StockMoneyFlowPanel />}
      {mainTab === 'industry' && <IndustryRankPanel />}
      {mainTab === 'global' && <GlobalIndexesPanel />}
      {mainTab === 'notice' && <StockNoticePanel />}
    </div>
  );
}
