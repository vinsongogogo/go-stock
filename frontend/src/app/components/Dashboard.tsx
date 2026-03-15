import { MarketGauge } from './MarketGauge';
import { TreeMap } from './TreeMap';
import { NewsFeed } from './NewsFeed';

export function Dashboard() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 市场数据和热词 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MarketGauge />
        <div className="lg:col-span-2">
          <TreeMap />
        </div>
      </div>

      {/* 新闻板块 */}
      <NewsFeed />
    </div>
  );
}
