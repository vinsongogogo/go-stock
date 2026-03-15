import { Radio, Newspaper, TrendingUp, Clock, ChevronRight, Sparkles } from 'lucide-react';

export function NewsFeed() {
  const newsData = [
    {
      source: '财联社',
      icon: Radio,
      color: 'from-green-500 to-emerald-600',
      items: [
        { time: '12:06:31', title: '财联社3月12日午间新闻播报：港股午间收盘,恒生指数跌1.23%,恒生科技指数跌1.21%', tags: ['金融圈', '快讯'], priority: 'high' },
        { time: '12:05:18', title: '中国央行今日进行500亿元7天期逆回购操作,中标利率为1.80%', tags: ['货币政策'], priority: 'medium' },
        { time: '12:04:32', title: '工信部：推动新能源汽车产业高质量发展,加快充电基础设施建设', tags: ['政策', '新能源'], priority: 'high' },
        { time: '12:03:15', title: '沪深两市成交额突破1.2万亿元,北向资金净流入超80亿元', tags: ['市场动态'], priority: 'medium' },
        { time: '12:02:05', title: 'AI芯片板块异动拉升,寒武纪涨超8%,海光信息、景嘉微跟涨', tags: ['行业', '科技'], priority: 'high' },
      ]
    },
    {
      source: '新浪财经',
      icon: Newspaper,
      color: 'from-blue-500 to-cyan-600',
      items: [
        { time: '12:04:49', title: '比亚迪发布新一代刀片电池技术,能量密度提升20%,续航里程突破1000公里', tags: ['公司', '新能源'], priority: 'high' },
        { time: '12:04:08', title: '美联储官员：需要更多数据来判断是否需要调整利率政策', tags: ['国际'], priority: 'medium' },
        { time: '12:03:32', title: '科大讯飞发布星火认知大模型V3.5,多项能力达到GPT-4水平', tags: ['公司', 'AI'], priority: 'high' },
        { time: '12:03:26', title: '太古集团：预计2026年净利润同比增长15%-20%,受益于地产业务复苏', tags: ['业绩', '房地产'], priority: 'medium' },
        { time: '12:02:15', title: '茅台股价创历史新高,市值突破2.8万亿元,白酒板块全线飘红', tags: ['消费'], priority: 'medium' },
      ]
    },
    {
      source: '证券时报',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-600',
      items: [
        { time: '12:05:42', title: '监管层密集发声,强调坚持房住不炒定位,支持刚性和改善性住房需求', tags: ['政策', '房地产'], priority: 'high' },
        { time: '12:04:55', title: '创业板指跌幅收窄至0.5%,医药生物板块表现活跃', tags: ['市场'], priority: 'low' },
        { time: '12:03:48', title: '证监会：将继续推进资本市场高水平对外开放,优化互联互通机制', tags: ['政策'], priority: 'medium' },
        { time: '12:02:33', title: '多家券商上调A股年度目标,看好科技、消费、医药三大赛道', tags: ['研报'], priority: 'medium' },
        { time: '12:01:20', title: '稀土永磁板块午后走强,金力永磁涨停,北方稀土涨超5%', tags: ['行业'], priority: 'high' },
      ]
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-500/5';
      case 'medium': return 'border-l-yellow-500 bg-yellow-500/5';
      default: return 'border-l-gray-500 bg-gray-500/5';
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-5 shadow-2xl">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg text-cyan-400 tracking-wide flex items-center gap-2">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          实时资讯流
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-[10px] sm:text-xs">2026-03-12 12:06:31</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {newsData.map((channel, channelIndex) => (
          <div 
            key={channelIndex}
            className="bg-slate-800/30 backdrop-blur rounded-xl border border-white/5 p-2.5 sm:p-3 hover:border-cyan-500/30 transition-all"
          >
            {/* 频道标题 */}
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/5">
              <div className="flex items-center gap-1.5">
                <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-gradient-to-r ${channel.color}`}></div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-300">{channel.source}</h4>
              </div>
              <span className="text-[10px] text-gray-500">{channel.items.length}条</span>
            </div>

            {/* 新闻列表 */}
            <div className="space-y-0.5 sm:space-y-1">
              {channel.items.map((item, itemIndex) => (
                <div 
                  key={itemIndex}
                  className="p-1.5 rounded-lg hover:bg-slate-700/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-1.5">
                    <span className="text-[9px] sm:text-[10px] font-mono text-cyan-400 flex-shrink-0 mt-0.5">{item.time}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] sm:text-[11px] text-gray-300 leading-relaxed line-clamp-2 group-hover:text-white transition-colors">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        {item.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-1 py-0.5 bg-white/5 rounded text-[8px] sm:text-[9px] text-gray-400 border border-white/10"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
                  </div>
                </div>
              ))}
            </div>

            {/* 查看更多 */}
            <button className="w-full mt-1.5 py-1 sm:py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] sm:text-[10px] text-gray-500 hover:text-cyan-400 transition-all border border-white/5 hover:border-cyan-500/30">
              加载更多 {channel.source}
            </button>
          </div>
        ))}
      </div>

      {/* 底部统计 */}
      <div className="mt-2.5 sm:mt-3 pt-2.5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="text-center">
          <div className="text-[9px] sm:text-[10px] text-gray-500 mb-0.5">今日资讯</div>
          <div className="text-sm sm:text-base text-cyan-400">1,247</div>
        </div>
        <div className="text-center">
          <div className="text-[9px] sm:text-[10px] text-gray-500 mb-0.5">重要公告</div>
          <div className="text-sm sm:text-base text-yellow-400">89</div>
        </div>
        <div className="text-center">
          <div className="text-[9px] sm:text-[10px] text-gray-500 mb-0.5">研报更新</div>
          <div className="text-sm sm:text-base text-purple-400">156</div>
        </div>
        <div className="text-center">
          <div className="text-[9px] sm:text-[10px] text-gray-500 mb-0.5">实时监控</div>
          <div className="text-sm sm:text-base text-green-400 flex items-center justify-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
            ON
          </div>
        </div>
      </div>
    </div>
  );
}
