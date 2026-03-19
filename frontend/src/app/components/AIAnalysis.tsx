import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Brain, 
  Search, 
  Play, 
  Square, 
  RefreshCw, 
  Clock, 
  AlertCircle, 
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  TrendingUp,
  BarChart3,
  DollarSign,
  Shield,
  Target,
  Star,
  Zap
} from 'lucide-react';
import { 
  GetAiConfigs, 
  NewChatStream, 
  SaveAIResponseResult, 
  GetAIResponseResult, 
  GetStockList,
  GetFollowList
} from '../../../wailsjs/go/main/App';
import { data, models } from '../../../wailsjs/go/models';

// =====================
// Wails Runtime
// =====================
const getRuntime = () => (window as any)?.runtime;

function EventsOn(eventName: string, callback: (...args: any[]) => void) {
  getRuntime()?.EventsOn?.(eventName, callback);
}

function EventsOff(...eventNames: string[]) {
  getRuntime()?.EventsOff?.(...eventNames);
}

// =====================
// 类型定义
// =====================
interface StructuredAnalysisData {
  overallScore: number;
  recommendation: string;
  technicalScore: number;
  fundamentalScore: number;
  capitalScore: number;
  riskLevel: string;
  aiInsight: string;
  targetPrice: {
    pessimistic: number;
    neutral: number;
    optimistic: number;
  };
}

type AnalysisPhase = 'idle' | 'collecting' | 'analyzing' | 'generating' | 'completed' | 'aborted' | 'timeout' | 'error';

interface StockAnalysisState {
  stockCode: string;
  stockName: string;
  isAnalyzing: boolean;
  phase: AnalysisPhase;
  content: string;
  structuredData: StructuredAnalysisData | null;
  markdownContent: string;
  historyResult: models.AIResponseResult | null;
  showDetail: boolean;
  error: string;
  updatedAt: string;
}

// =====================
// 阶段配置
// =====================
const phaseConfig: Record<AnalysisPhase, { text: string; progress: number; color: string }> = {
  idle: { text: '准备就绪', progress: 0, color: 'bg-gray-500' },
  collecting: { text: '正在采集市场数据...', progress: 20, color: 'bg-blue-500' },
  analyzing: { text: '正在分析技术指标...', progress: 50, color: 'bg-cyan-500' },
  generating: { text: 'AI 正在生成分析报告...', progress: 75, color: 'bg-purple-500' },
  completed: { text: '分析完成', progress: 100, color: 'bg-green-500' },
  aborted: { text: '分析已中止', progress: 0, color: 'bg-yellow-500' },
  timeout: { text: '分析超时', progress: 0, color: 'bg-red-500' },
  error: { text: '分析出错', progress: 0, color: 'bg-red-500' }
};

// =====================
// 推荐等级样式
// =====================
const recommendationStyles: Record<string, { bg: string; text: string; border: string }> = {
  '强烈买入': { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  '买入': { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  '持有': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  '卖出': { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  '强烈卖出': { bg: 'bg-red-700/20', text: 'text-red-500', border: 'border-red-700/30' },
};

// =====================
// 风险等级样式
// =====================
const riskLevelStyles: Record<string, string> = {
  '低风险': 'text-green-400',
  '中风险': 'text-yellow-400',
  '高风险': 'text-red-400',
};

// =====================
// 星级计算
// =====================
const getStarRating = (score: number): number => {
  if (score >= 90) return 5;
  if (score >= 75) return 4;
  if (score >= 60) return 3;
  if (score >= 40) return 2;
  return 1;
};

// =====================
// 渲染星星
// =====================
const renderStars = (count: number) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= count ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
        />
      ))}
    </div>
  );
};

// =====================
// JSON 解析函数
// =====================
function parseStructuredData(content: string): {
  structured: StructuredAnalysisData | null;
  markdown: string;
} {
  const jsonBlockRegex = /```json\s*([\s\S]*?)```/;
  const match = content.match(jsonBlockRegex);
  
  if (!match) {
    return { structured: null, markdown: content };
  }
  
  try {
    const parsed = JSON.parse(match[1].trim());
    if (typeof parsed.overallScore !== 'number' || !parsed.recommendation) {
      return { structured: null, markdown: content };
    }
    const jsonBlockEnd = content.indexOf(match[0]) + match[0].length;
    const markdown = content.substring(jsonBlockEnd).trim();
    return { structured: parsed as StructuredAnalysisData, markdown };
  } catch {
    return { structured: null, markdown: content };
  }
}

// =====================
// Markdown 渲染函数
// =====================
function renderMarkdown(text: string): string {
  if (!text) return '';
  
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-cyan-400 mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold text-cyan-300 mt-6 mb-3 pb-2 border-b border-white/10">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-white mt-6 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-gray-300">$1</em>')
    .replace(/```[\s\S]*?```/g, (match) => {
      const code = match.slice(3, -3).trim();
      return `<pre class="bg-slate-800/60 rounded-lg p-3 my-2 overflow-x-auto text-sm text-gray-300 font-mono">${code}</pre>`;
    })
    .replace(/`([^`]+)`/g, '<code class="bg-slate-700/50 px-1.5 py-0.5 rounded text-cyan-300 text-sm">$1</code>')
    .replace(/^[-*] (.+)$/gm, '<li class="ml-4 text-gray-300 list-disc list-inside">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-gray-300 list-decimal list-inside">$1</li>')
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(cell => cell.trim());
      if (cells.every(cell => /^[-:]+$/.test(cell.trim()))) {
        return '';
      }
      const tds = cells.map(cell => 
        `<td class="px-3 py-2 border border-white/10 text-gray-300">${cell.trim()}</td>`
      ).join('');
      return `<tr>${tds}</tr>`;
    })
    .replace(/\n\n/g, '</p><p class="text-gray-300 leading-relaxed my-2">')
    .replace(/\n/g, '<br/>');

  html = html.replace(/(<tr>[\s\S]*?<\/tr>)+/g, (match) => {
    return `<table class="w-full border-collapse my-4 text-sm">${match}</table>`;
  });

  return `<div class="markdown-content"><p class="text-gray-300 leading-relaxed my-2">${html}</p></div>`;
}

// =====================
// 按 ## 标题分块解析
// =====================
interface ContentSection {
  title: string;
  content: string;
}

function parseContentSections(text: string): ContentSection[] {
  if (!text) return [];
  
  const sections: ContentSection[] = [];
  const lines = text.split('\n');
  let currentTitle = '';
  let currentContent: string[] = [];

  for (const line of lines) {
    const h2Match = line.match(/^## (.+)$/);
    if (h2Match) {
      if (currentTitle || currentContent.length > 0) {
        sections.push({
          title: currentTitle,
          content: currentContent.join('\n').trim()
        });
      }
      currentTitle = h2Match[1];
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  if (currentTitle || currentContent.length > 0) {
    sections.push({
      title: currentTitle,
      content: currentContent.join('\n').trim()
    });
  }

  return sections;
}

// =====================
// 构造分析问题（新版带JSON引导）
// =====================
const buildAnalysisQuestion = (stockName: string, stockCode: string): string => {
  return `请对 ${stockName}(${stockCode}) 进行全面深度分析。

【重要】请严格按以下格式输出分析结果：

第一部分：请先输出一个 JSON 代码块，包含结构化评估数据，格式如下：
\`\`\`json
{
  "overallScore": 78,
  "recommendation": "买入",
  "technicalScore": 53,
  "fundamentalScore": 74,
  "capitalScore": 78,
  "riskLevel": "低风险",
  "aiInsight": "一句话综合分析摘要，不超过100字",
  "targetPrice": {
    "pessimistic": 63.21,
    "neutral": 108.45,
    "optimistic": 97.07
  }
}
\`\`\`

字段说明：
- overallScore：综合评分，0-100 整数
- recommendation：推荐等级，只能是以下之一：强烈买入、买入、持有、卖出、强烈卖出
- technicalScore：技术面评分，0-100 整数
- fundamentalScore：基本面评分，0-100 整数
- capitalScore：资金面评分，0-100 整数
- riskLevel：风险等级，只能是以下之一：低风险、中风险、高风险
- aiInsight：AI 智能洞察摘要，一句话概括分析结论
- targetPrice：目标价位预测，pessimistic(悲观)、neutral(中性)、optimistic(乐观)，保留两位小数

第二部分：在 JSON 代码块之后，请基于系统提供的实时数据，输出详细的 Markdown 格式分析报告，包含以下章节：

## 技术面分析
分析MACD、RSI、KDJ、均线系统等技术指标的走势和信号

## 基本面分析
分析市盈率、市净率、ROE等核心财务指标

## 资金流向分析
分析主力资金、散户资金动向

## 市场情绪分析
近期新闻舆论导向和市场情绪

## 行业对比分析
在所属行业中的竞争地位和相对估值

## 财报深度解读
最新财报关键数据及同比变化

## 风险评估与投资建议
综合风险评估和具体操作建议

请基于提供的数据进行分析，不要编造不存在的数据。所有评分和目标价必须基于实际分析给出合理数值。`;
};

// =====================
// 主组件
// =====================
export function AIAnalysis() {
  // 股票分析列表状态
  const [stockAnalysisList, setStockAnalysisList] = useState<StockAnalysisState[]>([]);
  const [stockInput, setStockInput] = useState('');

  // 数据列表
  const [watchlist, setWatchlist] = useState<data.StockBasic[]>([]);
  const [aiConfigs, setAiConfigs] = useState<data.AIConfig[]>([]);
  const [selectedAiConfigId, setSelectedAiConfigId] = useState<number>(0);

  // UI 状态
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);

  // Refs
  const analyzingStocksRef = useRef<Set<string>>(new Set());
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const phaseTimerRefs = useRef<Map<string, NodeJS.Timeout[]>>(new Map());

  // =====================
  // 更新单只股票状态
  // =====================
  const updateStockAnalysis = useCallback((stockCode: string, update: Partial<StockAnalysisState>) => {
    setStockAnalysisList(prev => prev.map(item =>
      item.stockCode === stockCode ? { ...item, ...update } : item
    ));
  }, []);

  // =====================
  // 初始化加载
  // =====================
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        setError(null);

        const [configs, followedStocks] = await Promise.all([
          GetAiConfigs(),
          GetFollowList(0)
        ]);

        setAiConfigs(configs || []);

        // 将 FollowedStock 转换为 StockBasic 兼容格式
        const stocks = (followedStocks || []).map((fs: any) => ({
          ts_code: fs.StockCode,
          name: fs.Name || fs.StockCode,
          symbol: '',
          fullname: '',
          market: '',
          list_date: ''
        }));
        setWatchlist(stocks);

        if (configs && configs.length > 0) {
          setSelectedAiConfigId(configs[0].ID || 0);
        }

        // 为每只自选股创建初始状态
        const initialStates: StockAnalysisState[] = (stocks || []).map(stock => ({
          stockCode: stock.ts_code,
          stockName: stock.name || stock.ts_code,
          isAnalyzing: false,
          phase: 'idle' as AnalysisPhase,
          content: '',
          structuredData: null,
          markdownContent: '',
          historyResult: null,
          showDetail: false,
          error: '',
          updatedAt: '',
        }));
        setStockAnalysisList(initialStates);

        // 分批加载历史结果 - 每批 5 个，串行执行批次
        const BATCH_SIZE = 5;
        const stocksToLoad = stocks || [];

        const loadHistoryInBatches = async () => {
          for (let i = 0; i < stocksToLoad.length; i += BATCH_SIZE) {
            const batch = stocksToLoad.slice(i, i + BATCH_SIZE);
            const batchResults = new Map<string, {
              result: any;
              structured: any;
              markdown: string;
            }>();
            
            // 并行处理当前批次
            const batchPromises = batch.map(async (stock) => {
              try {
                const result = await GetAIResponseResult(stock.ts_code);
                if (result && result.content) {
                  const { structured, markdown } = parseStructuredData(result.content);
                  batchResults.set(stock.ts_code, { result, structured, markdown });
                }
              } catch {
                // 忽略单个请求错误
              }
            });

            await Promise.all(batchPromises);

            // 每批完成后批量更新状态
            if (batchResults.size > 0) {
              setStockAnalysisList(prev => prev.map(item => {
                const data = batchResults.get(item.stockCode);
                if (data) {
                  return {
                    ...item,
                    historyResult: data.result,
                    structuredData: data.structured,
                    markdownContent: data.markdown,
                    content: data.result.content,
                    updatedAt: data.result.CreatedAt
                      ? new Date(data.result.CreatedAt).toLocaleString('zh-CN')
                      : '',
                    phase: 'completed' as AnalysisPhase,
                  };
                }
                return item;
              }));
            }
          }
        };

        // 异步执行分批加载（不阻塞初始渲染）
        loadHistoryInBatches();
      } catch (err) {
        console.error('初始化失败:', err);
        setError('加载数据失败，请刷新重试');
      } finally {
        setLoading(false);
      }
    };

    initialize();

    return () => {
      EventsOff('newChatStream');
      timeoutRefs.current.forEach(t => clearTimeout(t));
      phaseTimerRefs.current.forEach(timers => timers.forEach(t => clearTimeout(t)));
    };
  }, []);

  // =====================
  // 单股票分析流程
  // =====================
  const startSingleAnalysis = useCallback(async (stockCode: string, stockName: string): Promise<void> => {
    return new Promise((resolve) => {
      if (analyzingStocksRef.current.has(stockCode)) {
        resolve();
        return;
      }
      analyzingStocksRef.current.add(stockCode);

      if (aiConfigs.length === 0) {
        setError('请先在系统设置中配置 AI 模型');
        analyzingStocksRef.current.delete(stockCode);
        resolve();
        return;
      }

      const eventName = 'newChatStream';
      
      updateStockAnalysis(stockCode, {
        isAnalyzing: true,
        phase: 'collecting',
        content: '',
        structuredData: null,
        markdownContent: '',
        error: '',
        showDetail: false,
      });

      const contentAccumulator = { current: '' };
      const chatIdAccumulator = { current: '' };
      const question = buildAnalysisQuestion(stockName, stockCode);

      // 清理旧定时器
      const oldTimeout = timeoutRefs.current.get(stockCode);
      if (oldTimeout) clearTimeout(oldTimeout);
      const oldPhaseTimers = phaseTimerRefs.current.get(stockCode);
      if (oldPhaseTimers) oldPhaseTimers.forEach(t => clearTimeout(t));

      // 超时保护
      const timeoutId = setTimeout(() => {
        EventsOff(eventName);
        analyzingStocksRef.current.delete(stockCode);
        updateStockAnalysis(stockCode, {
          isAnalyzing: false,
          phase: 'timeout',
          error: '分析超时，请检查网络或AI服务配置',
        });
        resolve();
      }, 60000);
      timeoutRefs.current.set(stockCode, timeoutId);

      // 阶段推进定时器
      const phaseTimer1 = setTimeout(() => {
        updateStockAnalysis(stockCode, { phase: 'analyzing' });
      }, 5000);
      const phaseTimer2 = setTimeout(() => {
        updateStockAnalysis(stockCode, { phase: 'generating' });
      }, 10000);
      phaseTimerRefs.current.set(stockCode, [phaseTimer1, phaseTimer2]);

      // 清理旧事件监听
      EventsOff(eventName);

      // 注册事件监听
      EventsOn(eventName, (msg: any) => {
        if (msg === 'DONE') {
          clearTimeout(timeoutId);
          phaseTimerRefs.current.get(stockCode)?.forEach(t => clearTimeout(t));
          EventsOff(eventName);
          analyzingStocksRef.current.delete(stockCode);

          const finalContent = contentAccumulator.current;
          const { structured, markdown } = parseStructuredData(finalContent);

          updateStockAnalysis(stockCode, {
            isAnalyzing: false,
            phase: 'completed',
            content: finalContent,
            structuredData: structured,
            markdownContent: markdown,
            updatedAt: new Date().toLocaleString('zh-CN'),
          });

          SaveAIResponseResult(
            stockCode,
            stockName,
            finalContent,
            chatIdAccumulator.current,
            question,
            selectedAiConfigId
          ).catch(err => console.error('保存分析结果失败:', err));

          resolve();
        } else if (typeof msg === 'object' && msg !== null) {
          if (msg.chatId) chatIdAccumulator.current = msg.chatId;
          if (msg.content) {
            contentAccumulator.current += msg.content;
            const { structured, markdown } = parseStructuredData(contentAccumulator.current);
            updateStockAnalysis(stockCode, {
              content: contentAccumulator.current,
              structuredData: structured,
              markdownContent: markdown,
              phase: 'generating',
            });
          }
          if (msg.extraContent) {
            contentAccumulator.current += msg.extraContent;
            updateStockAnalysis(stockCode, {
              content: contentAccumulator.current,
            });
          }
        }
      });

      // 触发后端分析
      NewChatStream(
        stockName,
        stockCode,
        question,
        selectedAiConfigId,
        null,
        true,
        false
      ).catch(err => {
        console.error('触发分析失败:', err);
        clearTimeout(timeoutId);
        phaseTimerRefs.current.get(stockCode)?.forEach(t => clearTimeout(t));
        EventsOff(eventName);
        analyzingStocksRef.current.delete(stockCode);
        updateStockAnalysis(stockCode, {
          isAnalyzing: false,
          phase: 'error',
          error: err?.message || '分析失败',
        });
        resolve();
      });
    });
  }, [aiConfigs, selectedAiConfigId, updateStockAnalysis]);

  // =====================
  // 一键分析全部（串行队列）
  // =====================
  const analyzeAll = useCallback(async () => {
    if (isAnalyzingAll) return;
    setIsAnalyzingAll(true);
    
    const stocks = stockAnalysisList.filter(s => !s.isAnalyzing);
    for (const stock of stocks) {
      await startSingleAnalysis(stock.stockCode, stock.stockName);
    }
    
    setIsAnalyzingAll(false);
  }, [stockAnalysisList, startSingleAnalysis, isAnalyzingAll]);

  // =====================
  // 手动输入股票分析
  // =====================
  const handleInputAnalysis = () => {
    const code = stockInput.trim();
    if (!code) return;

    let formattedCode = code.toLowerCase();
    if (!formattedCode.startsWith('sh') && !formattedCode.startsWith('sz') && !formattedCode.startsWith('bj')) {
      if (formattedCode.startsWith('6')) {
        formattedCode = 'sh' + formattedCode;
      } else {
        formattedCode = 'sz' + formattedCode;
      }
    }

    // 检查是否已在列表中
    const exists = stockAnalysisList.some(s => s.stockCode === formattedCode);
    if (!exists) {
      setStockAnalysisList(prev => [{
        stockCode: formattedCode,
        stockName: formattedCode,
        isAnalyzing: false,
        phase: 'idle',
        content: '',
        structuredData: null,
        markdownContent: '',
        historyResult: null,
        showDetail: false,
        error: '',
        updatedAt: '',
      }, ...prev]);
    }

    startSingleAnalysis(formattedCode, formattedCode);
    setStockInput('');
  };

  // =====================
  // 切换详情展开
  // =====================
  const toggleDetail = (stockCode: string) => {
    updateStockAnalysis(stockCode, {
      showDetail: !stockAnalysisList.find(s => s.stockCode === stockCode)?.showDetail
    });
  };

  // =====================
  // 渲染 Loading
  // =====================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  // =====================
  // 渲染结构化卡片
  // =====================
  const renderStructuredCard = (stock: StockAnalysisState) => {
    const { structuredData } = stock;
    if (!structuredData) return null;

    const recStyle = recommendationStyles[structuredData.recommendation] || recommendationStyles['持有'];
    const riskStyle = riskLevelStyles[structuredData.riskLevel] || 'text-yellow-400';
    const starCount = getStarRating(structuredData.overallScore);

    return (
      <div className="space-y-4">
        {/* 头部：股票名称 + 推荐标签 + 评分 */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">{stock.stockName}</h3>
                <span className="text-sm text-gray-400 font-mono">{stock.stockCode}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${recStyle.bg} ${recStyle.text} border ${recStyle.border}`}>
                  {structuredData.recommendation}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{stock.updatedAt} 更新</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs text-gray-400">AI综合评分</span>
              {renderStars(starCount)}
            </div>
            <p className="text-4xl font-bold text-cyan-400 mt-1">{structuredData.overallScore}</p>
          </div>
        </div>

        {/* 四维评分卡片 */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-slate-800/40 rounded-lg p-3 border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-gray-400">技术面</span>
            </div>
            <p className="text-xl font-bold text-cyan-400">{structuredData.technicalScore}分</p>
          </div>
          <div className="bg-slate-800/40 rounded-lg p-3 border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">基本面</span>
            </div>
            <p className="text-xl font-bold text-blue-400">{structuredData.fundamentalScore}分</p>
          </div>
          <div className="bg-slate-800/40 rounded-lg p-3 border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-gray-400">资金面</span>
            </div>
            <p className="text-xl font-bold text-orange-400">{structuredData.capitalScore}分</p>
          </div>
          <div className="bg-slate-800/40 rounded-lg p-3 border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">风险等级</span>
            </div>
            <p className={`text-xl font-bold ${riskStyle}`}>{structuredData.riskLevel}</p>
          </div>
        </div>

        {/* AI智能洞察 */}
        <div className="bg-slate-800/30 rounded-lg p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-400">AI智能洞察</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{structuredData.aiInsight}</p>
        </div>

        {/* AI预测目标价 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">AI预测目标价</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-teal-900/30 rounded-lg p-4 border border-teal-500/20 text-center">
              <p className="text-xs text-teal-400 mb-1">悲观</p>
              <p className="text-xl font-bold text-teal-300">¥{structuredData.targetPrice.pessimistic.toFixed(2)}</p>
            </div>
            <div className="bg-slate-700/40 rounded-lg p-4 border border-slate-500/20 text-center">
              <p className="text-xs text-gray-400 mb-1">中性</p>
              <p className="text-xl font-bold text-gray-200">¥{structuredData.targetPrice.neutral.toFixed(2)}</p>
            </div>
            <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/20 text-center">
              <p className="text-xs text-purple-400 mb-1">乐观</p>
              <p className="text-xl font-bold text-purple-300">¥{structuredData.targetPrice.optimistic.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =====================
  // 渲染 Markdown 分块（Fallback）
  // =====================
  const renderMarkdownSections = (content: string) => {
    const sections = parseContentSections(content);
    if (sections.length === 0 && content) {
      return (
        <div 
          className="prose prose-invert max-w-none text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
      );
    }
    return (
      <div className="space-y-3">
        {sections.map((section, index) => (
          <div 
            key={index} 
            className="bg-slate-800/40 backdrop-blur-xl rounded-lg border border-white/10 p-4"
          >
            {section.title && (
              <h3 className="text-lg font-semibold text-cyan-300 mb-3 pb-2 border-b border-white/10 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                {section.title}
              </h3>
            )}
            <div 
              className="prose prose-invert max-w-none text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(section.content) }}
            />
          </div>
        ))}
      </div>
    );
  };

  // =====================
  // 渲染股票卡片
  // =====================
  const renderStockCard = (stock: StockAnalysisState) => {
    const isAnyAnalyzing = analyzingStocksRef.current.size > 0;

    return (
      <div 
        key={stock.stockCode}
        className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-5 shadow-2xl"
      >
        {/* 分析中状态 */}
        {stock.isAnalyzing && (
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">{stock.stockName}</h3>
                <span className="text-sm text-gray-400 font-mono">{stock.stockCode}</span>
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                <span className="text-sm text-gray-300">{phaseConfig[stock.phase].text}</span>
              </div>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${phaseConfig[stock.phase].color} transition-all duration-1000 ease-out`}
                style={{ width: `${phaseConfig[stock.phase].progress}%` }}
              />
            </div>
          </div>
        )}

        {/* 错误状态 */}
        {stock.error && !stock.isAnalyzing && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">{stock.stockName}</h3>
              <span className="text-sm text-gray-400 font-mono">{stock.stockCode}</span>
            </div>
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{stock.error}</span>
            </div>
          </div>
        )}

        {/* 有结构化数据 */}
        {!stock.isAnalyzing && stock.structuredData && renderStructuredCard(stock)}

        {/* 无结构化数据但有内容（Fallback） */}
        {!stock.isAnalyzing && !stock.structuredData && stock.content && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">{stock.stockName}</h3>
                <span className="text-sm text-gray-400 font-mono">{stock.stockCode}</span>
              </div>
              {stock.updatedAt && (
                <span className="text-xs text-gray-500">{stock.updatedAt} 更新</span>
              )}
            </div>
            {renderMarkdownSections(stock.markdownContent || stock.content)}
          </div>
        )}

        {/* 空状态 */}
        {!stock.isAnalyzing && !stock.content && !stock.error && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">{stock.stockName}</h3>
              <span className="text-sm text-gray-400 font-mono">{stock.stockCode}</span>
            </div>
            <span className="text-xs text-gray-500">暂无分析结果</span>
          </div>
        )}

        {/* 展开详情按钮和重新分析按钮 */}
        {!stock.isAnalyzing && (stock.content || stock.structuredData) && (
          <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-white/5">
            <button
              onClick={() => toggleDetail(stock.stockCode)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-400 hover:text-cyan-400 transition-colors"
            >
              {stock.showDetail ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  收起详情
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  展开详情
                </>
              )}
            </button>
            <button
              onClick={() => startSingleAnalysis(stock.stockCode, stock.stockName)}
              disabled={isAnyAnalyzing}
              className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-sm text-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-4 h-4" />
              重新分析
            </button>
          </div>
        )}

        {/* 空状态时的分析按钮 */}
        {!stock.isAnalyzing && !stock.content && !stock.error && (
          <div className="flex justify-end mt-3">
            <button
              onClick={() => startSingleAnalysis(stock.stockCode, stock.stockName)}
              disabled={isAnyAnalyzing}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-lg text-sm text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
            >
              <Play className="w-4 h-4" />
              开始分析
            </button>
          </div>
        )}

        {/* 展开的详情内容 */}
        {stock.showDetail && stock.markdownContent && (
          <div className="mt-4 pt-4 border-t border-white/10">
            {renderMarkdownSections(stock.markdownContent)}
          </div>
        )}
      </div>
    );
  };

  const hasAnyAnalyzing = stockAnalysisList.some(s => s.isAnalyzing);

  return (
    <div className="space-y-4">
      {/* 头部 */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl text-white font-light">AI股票分析</h2>
              <p className="text-xs text-gray-400">AI Stock Analysis · Intelligent Insights</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-400">分析股票数</p>
              <p className="text-2xl font-bold text-purple-400">{stockAnalysisList.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 工具栏 */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-2xl">
        <div className="flex items-center gap-3 flex-wrap">
          {/* AI模型选择 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">AI模型：</span>
            {aiConfigs.length > 0 ? (
              <div className="relative">
                <select
                  value={selectedAiConfigId}
                  onChange={(e) => setSelectedAiConfigId(Number(e.target.value))}
                  disabled={hasAnyAnalyzing}
                  className="appearance-none bg-slate-800/60 border border-white/10 rounded-lg px-3 py-1.5 pr-8 text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50 disabled:opacity-50"
                >
                  {aiConfigs.map((config) => (
                    <option key={config.ID} value={config.ID}>
                      {config.name || `模型 ${config.ID}`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            ) : (
              <span className="text-xs text-yellow-400">未配置</span>
            )}
          </div>

          {/* 分隔线 */}
          <div className="h-6 w-px bg-white/10"></div>

          {/* 股票搜索输入 */}
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={stockInput}
                onChange={(e) => setStockInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInputAnalysis()}
                placeholder="输入股票代码，如 600519"
                disabled={hasAnyAnalyzing}
                className="w-full bg-slate-800/60 border border-white/10 rounded-lg pl-10 pr-4 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 disabled:opacity-50"
              />
            </div>
            <button
              onClick={handleInputAnalysis}
              disabled={!stockInput.trim() || aiConfigs.length === 0 || hasAnyAnalyzing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
            >
              <Play className="w-4 h-4" />
              分析
            </button>
          </div>

          {/* 分隔线 */}
          <div className="h-6 w-px bg-white/10"></div>

          {/* 一键分析全部 */}
          <button
            onClick={analyzeAll}
            disabled={stockAnalysisList.length === 0 || aiConfigs.length === 0 || hasAnyAnalyzing || isAnalyzingAll}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
          >
            {isAnalyzingAll ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                分析中...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                一键分析全部
              </>
            )}
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-400">{error}</p>
            {error.includes('AI 模型') && (
              <p className="text-xs text-gray-400 mt-1">
                请前往「系统设置」→「AI 设置」配置 AI 模型后再进行分析
              </p>
            )}
          </div>
        </div>
      )}

      {/* 股票卡片列表 */}
      {stockAnalysisList.length > 0 ? (
        <div className="space-y-4">
          {stockAnalysisList.map(stock => renderStockCard(stock))}
        </div>
      ) : (
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-8 shadow-2xl">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
              <Brain className="w-10 h-10 text-cyan-400" />
            </div>
            <h3 className="text-lg text-white mb-2">暂无自选股</h3>
            <p className="text-sm text-gray-400 max-w-md">
              请先在「自选列表」中添加股票，或在上方输入股票代码进行分析
            </p>
          </div>
        </div>
      )}

      {/* 免责声明 */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-2xl">
        <div className="text-xs text-gray-400 space-y-1">
          <p>• AI 分析基于多维度数据，包含技术面、基本面、资金面、市场情绪等指标</p>
          <p>• 分析结果由 AI 模型生成，仅供参考，不构成投资建议</p>
          <p>• 投资有风险，入市需谨慎，请结合实际情况做出决策</p>
        </div>
      </div>

      {/* CSS 动画 */}
      <style>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
