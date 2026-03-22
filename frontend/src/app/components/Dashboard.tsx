import { MarketGauge } from './MarketGauge';
import { TreeMap } from './TreeMap';
import { NewsFeed } from './NewsFeed';
import { useLayoutShell } from '../context/LayoutShellContext';
import { cn } from './ui/utils';

export function Dashboard() {
  const { compactLayout } = useLayoutShell();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 市场数据和热词 */}
      <div
        className={cn(
          "grid gap-6",
          compactLayout ? "grid-cols-1 md:grid-cols-3" : "grid-cols-3",
        )}
      >
        <MarketGauge />
        <div className={cn(compactLayout ? "md:col-span-2" : "col-span-2")}>
          <TreeMap />
        </div>
      </div>

      {/* 新闻板块 */}
      <div className="mt-2.5">
        <NewsFeed />
      </div>
    </div>
  );
}
