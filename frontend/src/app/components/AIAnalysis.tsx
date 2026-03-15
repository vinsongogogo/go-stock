import { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, BarChart3, DollarSign, Activity, Star, ChevronDown, ChevronUp } from 'lucide-react';

interface Stock {
  code: string;
  name: string;
}

interface AIAnalysisData {
  stock: Stock;
  timestamp: string;
  overallScore: number; // 0-100
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  technicalAnalysis: {
    score: number;
    trend: 'bullish' | 'bearish' | 'neutral';
    indicators: {
      macd: string;
      rsi: string;
      ma: string;
      kdj: string;
    };
    summary: string;
  };
  fundamentalAnalysis: {
    score: number;
    pe: number;
    pb: number;
    roe: number;
    summary: string;
  };
  moneyFlow: {
    score: number;
    mainInflow: number;
    retailInflow: number;
    trend: 'inflow' | 'outflow' | 'balanced';
    summary: string;
  };
  sentiment: {
    score: number;
    newsCount: number;
    positiveRate: number;
    summary: string;
  };
  riskLevel: 'low' | 'medium' | 'high';
  targetPrice: {
    low: number;
    mid: number;
    high: number;
  };
  aiInsight: string;
  keyPoints: string[];
  risks: string[];
}

// 生成模拟AI分析数据
const generateAIAnalysis = (stock: Stock): AIAnalysisData => {
  const overallScore = Math.floor(Math.random() * 40) + 50; // 50-90
  const recommendations: AIAnalysisData['recommendation'][] = ['strong_buy', 'buy', 'hold', 'sell', 'strong_sell'];
  const trends: ('bullish' | 'bearish' | 'neutral')[] = ['bullish', 'bearish', 'neutral'];
  const flowTrends: ('inflow' | 'outflow' | 'balanced')[] = ['inflow', 'outflow', 'balanced'];
  
  const recommendation = overallScore >= 80 ? 'strong_buy' :
                        overallScore >= 70 ? 'buy' :
                        overallScore >= 50 ? 'hold' :
                        overallScore >= 40 ? 'sell' : 'strong_sell';

  const technicalScore = Math.floor(Math.random() * 40) + 50;
  const trend = trends[Math.floor(Math.random() * trends.length)];

  return {
    stock,
    timestamp: new Date().toLocaleString('zh-CN'),
    overallScore,
    recommendation,
    technicalAnalysis: {
      score: technicalScore,
      trend,
      indicators: {
        macd: trend === 'bullish' ? '金叉' : trend === 'bearish' ? '死叉' : '横盘',
        rsi: `${Math.floor(Math.random() * 40) + 30}`,
        ma: trend === 'bullish' ? '多头排列' : trend === 'bearish' ? '空头排列' : '缠绕',
        kdj: Math.random() > 0.5 ? '金叉' : '死叉',
      },
      summary: `技术面呈现${trend === 'bullish' ? '看涨' : trend === 'bearish' ? '看跌' : '震荡'}格局，短期均线${trend === 'bullish' ? '向上' : trend === 'bearish' ? '向下' : '横向'}运行，MACD指标${trend === 'bullish' ? '金叉' : trend === 'bearish' ? '死叉' : '平稳'}，建议关注${trend === 'bullish' ? '回调买入' : trend === 'bearish' ? '反弹卖出' : '突破'}机会。`,
    },
    fundamentalAnalysis: {
      score: Math.floor(Math.random() * 40) + 50,
      pe: parseFloat((Math.random() * 50 + 10).toFixed(2)),
      pb: parseFloat((Math.random() * 5 + 1).toFixed(2)),
      roe: parseFloat((Math.random() * 20 + 5).toFixed(2)),
      summary: `公司基本面${Math.random() > 0.5 ? '良好' : '稳健'}，市盈率处于${Math.random() > 0.5 ? '合理' : '偏高'}区间，净资产收益率表现${Math.random() > 0.5 ? '优秀' : '稳定'}，具备${Math.random() > 0.5 ? '长期' : '中期'}投资价值。`,
    },
    moneyFlow: {
      score: Math.floor(Math.random() * 40) + 50,
      mainInflow: parseFloat((Math.random() * 1000000 - 500000).toFixed(2)),
      retailInflow: parseFloat((Math.random() * 500000 - 250000).toFixed(2)),
      trend: flowTrends[Math.floor(Math.random() * flowTrends.length)],
      summary: `近期资金呈现${Math.random() > 0.5 ? '净流入' : '净流出'}态势，主力资金${Math.random() > 0.5 ? '积极' : '观望'}，散户情绪${Math.random() > 0.5 ? '活跃' : '谨慎'}，整体资金面${Math.random() > 0.5 ? '向好' : '承压'}。`,
    },
    sentiment: {
      score: Math.floor(Math.random() * 40) + 50,
      newsCount: Math.floor(Math.random() * 50) + 10,
      positiveRate: parseFloat((Math.random() * 40 + 40).toFixed(2)),
      summary: `市场情绪${Math.random() > 0.5 ? '积极' : '谨慎'}，近期${Math.floor(Math.random() * 50) + 10}条相关新闻，正面新闻占比${parseFloat((Math.random() * 40 + 40).toFixed(2))}%，舆论导向${Math.random() > 0.5 ? '正面' : '中性'}。`,
    },
    riskLevel: overallScore >= 70 ? 'low' : overallScore >= 50 ? 'medium' : 'high',
    targetPrice: {
      low: parseFloat((Math.random() * 50 + 20).toFixed(2)),
      mid: parseFloat((Math.random() * 80 + 40).toFixed(2)),
      high: parseFloat((Math.random() * 120 + 60).toFixed(2)),
    },
    aiInsight: `基于多维度分析，${stock.name}当前处于${trend === 'bullish' ? '上升' : trend === 'bearish' ? '下降' : '震荡'}通道。技术指标${trend === 'bullish' ? '支撑' : trend === 'bearish' ? '压制' : '中性'}，资金流向${Math.random() > 0.5 ? '积极' : '谨慎'}，基本面${Math.random() > 0.5 ? '稳健' : '尚可'}。综合AI模型分析，建议${recommendation === 'strong_buy' ? '强烈买入' : recommendation === 'buy' ? '买入' : recommendation === 'hold' ? '持有观望' : recommendation === 'sell' ? '适当减仓' : '卖出'}。`,
    keyPoints: [
      `技术面呈现${trend === 'bullish' ? '多头' : trend === 'bearish' ? '空头' : '震荡'}格局，短期趋势${trend === 'bullish' ? '向上' : trend === 'bearish' ? '向下' : '不明'}`,
      `主力资金${Math.random() > 0.5 ? '持续流入' : '小幅流出'}，机构${Math.random() > 0.5 ? '看好' : '观望'}后市`,
      `估值水平${Math.random() > 0.5 ? '合理' : '偏高'}，市盈率${Math.floor(Math.random() * 50 + 10)}倍`,
      `市场情绪${Math.random() > 0.5 ? '乐观' : '谨慎'}，成交活跃度${Math.random() > 0.5 ? '提升' : '下降'}`,
    ],
    risks: [
      `短期${Math.random() > 0.5 ? '超买' : '波动'}风险需要关注`,
      `行业政策变化可能带来${Math.random() > 0.5 ? '不确定性' : '压力'}`,
      `市场整体情绪${Math.random() > 0.5 ? '波动' : '偏弱'}，需谨慎操作`,
    ],
  };
};

export function AIAnalysis() {
  const [analysisData, setAnalysisData] = useState<AIAnalysisData[]>([]);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从localStorage获取自选股票
    const watchlistStr = localStorage.getItem('watchlist');
    const watchlist: Stock[] = watchlistStr ? JSON.parse(watchlistStr) : [
      { code: 'sh600519', name: '贵州茅台' },
      { code: 'sz000858', name: '五粮液' },
      { code: 'sz300750', name: '宁德时代' },
      { code: 'sz002594', name: '比亚迪' },
      { code: 'sh601318', name: '中国平安' },
    ];

    // 生成AI分析数据
    setTimeout(() => {
      const analyses = watchlist.map(stock => generateAIAnalysis(stock));
      setAnalysisData(analyses);
      setLoading(false);
    }, 800);
  }, []);

  const toggleExpand = (code: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(code)) {
        newSet.delete(code);
      } else {
        newSet.add(code);
      }
      return newSet;
    });
  };

  const getRecommendationConfig = (recommendation: AIAnalysisData['recommendation']) => {
    switch (recommendation) {
      case 'strong_buy':
        return { text: '强烈买入', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' };
      case 'buy':
        return { text: '买入', color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' };
      case 'hold':
        return { text: '持有', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' };
      case 'sell':
        return { text: '卖出', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' };
      case 'strong_sell':
        return { text: '强烈卖出', color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/30' };
    }
  };

  const getRiskConfig = (risk: string) => {
    switch (risk) {
      case 'low':
        return { text: '低风险', color: 'text-green-400', icon: CheckCircle };
      case 'medium':
        return { text: '中风险', color: 'text-yellow-400', icon: AlertTriangle };
      case 'high':
        return { text: '高风险', color: 'text-red-400', icon: XCircle };
      default:
        return { text: '未知', color: 'text-gray-400', icon: AlertTriangle };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">AI分析中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 头部 */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl text-white font-light">AI股票分析</h2>
              <p className="text-xs text-gray-400">AI Stock Analysis · Intelligent Insights</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">分析股票数</p>
            <p className="text-lg text-cyan-400 font-medium">{analysisData.length}</p>
          </div>
        </div>
      </div>

      {/* AI分析卡片列表 */}
      {analysisData.length === 0 ? (
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-12 shadow-2xl text-center">
          <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">暂无自选股票</p>
          <p className="text-xs text-gray-500">请先在自选股票列表中添加股票</p>
        </div>
      ) : (
        analysisData.map((analysis) => {
          const isExpanded = expandedCards.has(analysis.stock.code);
          const recConfig = getRecommendationConfig(analysis.recommendation);
          const riskConfig = getRiskConfig(analysis.riskLevel);
          const RiskIcon = riskConfig.icon;

          return (
            <div
              key={analysis.stock.code}
              className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden"
            >
              {/* 卡片头部 */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg text-white font-medium">{analysis.stock.name}</h3>
                      <span className="text-xs text-gray-500 font-mono">{analysis.stock.code}</span>
                      <div className={`px-3 py-1 rounded-full ${recConfig.bg} border ${recConfig.border}`}>
                        <span className={`text-xs font-medium ${recConfig.color}`}>{recConfig.text}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">{analysis.timestamp} 更新</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400">AI综合评分</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(analysis.overallScore / 20)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                      {analysis.overallScore}
                    </div>
                  </div>
                </div>

                {/* 核心指标 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/40 rounded-lg border border-white/10">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <div>
                      <p className="text-xs text-gray-400">技术面</p>
                      <p className={`text-sm font-medium ${analysis.technicalAnalysis.score >= 70 ? 'text-green-400' : analysis.technicalAnalysis.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {analysis.technicalAnalysis.score}分
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/40 rounded-lg border border-white/10">
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    <div>
                      <p className="text-xs text-gray-400">基本面</p>
                      <p className={`text-sm font-medium ${analysis.fundamentalAnalysis.score >= 70 ? 'text-green-400' : analysis.fundamentalAnalysis.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {analysis.fundamentalAnalysis.score}分
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/40 rounded-lg border border-white/10">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <div>
                      <p className="text-xs text-gray-400">资金面</p>
                      <p className={`text-sm font-medium ${analysis.moneyFlow.score >= 70 ? 'text-green-400' : analysis.moneyFlow.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {analysis.moneyFlow.score}分
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/40 rounded-lg border border-white/10">
                    <RiskIcon className={`w-4 h-4 ${riskConfig.color}`} />
                    <div>
                      <p className="text-xs text-gray-400">风险等级</p>
                      <p className={`text-sm font-medium ${riskConfig.color}`}>{riskConfig.text}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI洞察 */}
              <div className="p-4 bg-gradient-to-r from-purple-500/5 to-cyan-500/5 border-b border-white/10">
                <div className="flex items-start gap-2">
                  <Brain className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm text-purple-400 font-medium mb-1">AI智能洞察</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">{analysis.aiInsight}</p>
                  </div>
                </div>
              </div>

              {/* 目标价位 */}
              <div className="p-4 border-b border-white/10">
                <h4 className="text-sm text-gray-400 mb-3">AI预测目标价</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">悲观</p>
                    <p className="text-lg text-green-400 font-medium">¥{analysis.targetPrice.low}</p>
                  </div>
                  <div className="text-center px-3 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">中性</p>
                    <p className="text-lg text-cyan-400 font-medium">¥{analysis.targetPrice.mid}</p>
                  </div>
                  <div className="text-center px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">乐观</p>
                    <p className="text-lg text-red-400 font-medium">¥{analysis.targetPrice.high}</p>
                  </div>
                </div>
              </div>

              {/* 展开/折叠详情 */}
              {isExpanded && (
                <>
                  {/* 关键要点 */}
                  <div className="p-4 border-b border-white/10">
                    <h4 className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      关键要点
                    </h4>
                    <div className="space-y-2">
                      {analysis.keyPoints.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="text-cyan-400 mt-1">•</span>
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 风险提示 */}
                  <div className="p-4 border-b border-white/10">
                    <h4 className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      风险提示
                    </h4>
                    <div className="space-y-2">
                      {analysis.risks.map((risk, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="text-yellow-400 mt-1">⚠</span>
                          <span>{risk}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 详细分析 */}
                  <div className="p-4 border-b border-white/10 grid md:grid-cols-2 gap-4">
                    {/* 技术分析 */}
                    <div>
                      <h4 className="text-sm text-gray-400 mb-3">技术分析详情</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">MACD:</span>
                          <span className="text-white">{analysis.technicalAnalysis.indicators.macd}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">RSI:</span>
                          <span className="text-white">{analysis.technicalAnalysis.indicators.rsi}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">均线:</span>
                          <span className="text-white">{analysis.technicalAnalysis.indicators.ma}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">KDJ:</span>
                          <span className="text-white">{analysis.technicalAnalysis.indicators.kdj}</span>
                        </div>
                      </div>
                    </div>

                    {/* 基本面分析 */}
                    <div>
                      <h4 className="text-sm text-gray-400 mb-3">基本面详情</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">市盈率(PE):</span>
                          <span className="text-white">{analysis.fundamentalAnalysis.pe}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">市净率(PB):</span>
                          <span className="text-white">{analysis.fundamentalAnalysis.pb}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">净资产收益率:</span>
                          <span className="text-white">{analysis.fundamentalAnalysis.roe}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* 展开按钮 */}
              <button
                onClick={() => toggleExpand(analysis.stock.code)}
                className="w-full p-3 flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                {isExpanded ? (
                  <>
                    <span>收起详情</span>
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>展开详情</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          );
        })
      )}

      {/* 底部说明 */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-2xl">
        <div className="text-xs text-gray-400 space-y-1">
          <p>• AI分析基于多维度数据模型，包含技术面、基本面、资金面和市场情绪等指标</p>
          <p>• 分析结果仅供参考，不构成投资建议，投资有风险，入市需谨慎</p>
          <p>• 数据每15分钟更新一次，确保分析结果的时效性和准确性</p>
          <p>• 建议结合实际市场情况和个人风险承受能力做出投资决策</p>
        </div>
      </div>
    </div>
  );
}
