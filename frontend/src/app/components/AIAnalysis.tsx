import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Brain,
  Search,
  Play,
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
  Zap,
  Filter,
  FileText
} from 'lucide-react';
import { ScoreGauge, DashboardCard, StrategyPoints } from './dashboard/index';
import { AdvisorMasterPanel, type AdvisorMasterReport } from './ai-analysis/AdvisorMasterPanel';
import {
  GetAiConfigs,
  NewChatStream,
  SaveAIResponseResult,
  GetAIResponseResult,
  GetAIResponseResultList,
  GetStockList,
  GetFollowList,
  GetDashboardPromptID
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

// ============ 决策仪表盘数据结构 ============

interface PositionAdvice {
  no_position?: string;
  has_position?: string;
}

interface CoreConclusion {
  one_sentence?: string;
  signal_type?: string;
  time_sensitivity?: string;
  position_advice?: PositionAdvice;
}

interface TrendStatus {
  ma_alignment?: string;
  is_bullish?: boolean;
  trend_score?: number;
}

interface PricePosition {
  current_price?: number;
  ma5?: number;
  ma10?: number;
  ma20?: number;
  bias_ma5?: number;
  bias_status?: string;
  support_level?: number;
  resistance_level?: number;
}

interface VolumeAnalysis {
  volume_ratio?: number;
  volume_status?: string;
  turnover_rate?: number;
  volume_meaning?: string;
}

interface ChipStructure {
  profit_ratio?: number;
  avg_cost?: number;
  concentration?: number;
  chip_health?: string;
}

interface DataPerspective {
  trend_status?: TrendStatus;
  price_position?: PricePosition;
  volume_analysis?: VolumeAnalysis;
  chip_structure?: ChipStructure;
}

interface Intelligence {
  latest_news?: string;
  risk_alerts?: string[];
  positive_catalysts?: string[];
  earnings_outlook?: string;
  sentiment_summary?: string;
}

interface SniperPoints {
  ideal_buy?: number | string;
  secondary_buy?: number | string;
  stop_loss?: number | string;
  take_profit?: number | string;
}

interface PositionStrategy {
  suggested_position?: string;
  entry_plan?: string;
  risk_control?: string;
}

interface BattlePlan {
  sniper_points?: SniperPoints;
  position_strategy?: PositionStrategy;
  action_checklist?: string[];
}

interface DashboardView {
  core_conclusion?: CoreConclusion;
  data_perspective?: DataPerspective;
  intelligence?: Intelligence;
  battle_plan?: BattlePlan;
}

interface DashboardData {
  stock_name?: string;
  sentiment_score?: number;
  sentiment_label?: string;
  trend_prediction?: string;
  operation_advice?: string;
  decision_type?: 'buy' | 'hold' | 'sell';
  confidence_level?: string;
  dashboard?: DashboardView;
  analysis_summary?: string;
  key_points?: string;
  risk_warning?: string;
  buy_reason?: string;
}

type AnalysisPhase = 'idle' | 'collecting' | 'analyzing' | 'generating' | 'completed' | 'aborted' | 'timeout' | 'error';

interface HistoryRecord {
  id: number;
  content: string;
  dashboardData: DashboardData | null;
  advisorReport: AdvisorMasterReport | null;
  structuredData: StructuredAnalysisData | null;
  markdownContent: string;
  modelName: string;
  createdAt: string;
}

interface StockAnalysisState {
  stockCode: string;
  stockName: string;
  isAnalyzing: boolean;
  phase: AnalysisPhase;
  content: string;
  structuredData: StructuredAnalysisData | null;
  dashboardData: DashboardData | null;
  advisorReport: AdvisorMasterReport | null;
  markdownContent: string;
  historyResult: models.AIResponseResult | null;
  historyRecords: HistoryRecord[];
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
// 仪表盘数据解析（无 ```json``` 围栏时的 legacy 全文 JSON）
// =====================
function parseDashboardData(content: string): {
  dashboardData: DashboardData | null;
  rawContent: string;
} {
  if (!content) {
    return { dashboardData: null, rawContent: content };
  }

  let jsonStr = content;

  // 方式1：提取 ```json ``` 代码块
  const jsonBlockRegex = /```json\s*([\s\S]*?)```/;
  const blockMatch = content.match(jsonBlockRegex);
  if (blockMatch) {
    jsonStr = blockMatch[1].trim();
  } else {
    // 方式2：直接查找 JSON 对象
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      jsonStr = content.substring(jsonStart, jsonEnd + 1);
    }
  }

  try {
    // 修复常见 JSON 问题
    jsonStr = jsonStr
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      .replace(/True/g, 'true')
      .replace(/False/g, 'false');

    const parsed = JSON.parse(jsonStr);

    // 验证是否为有效的仪表盘数据
    if (
      typeof parsed.sentiment_score === 'number' &&
      parsed.dashboard &&
      typeof parsed.dashboard === 'object'
    ) {
      return {
        dashboardData: parsed as DashboardData,
        rawContent: content,
      };
    }
  } catch {
    // JSON 解析失败
  }

  return { dashboardData: null, rawContent: content };
}

// =====================
// 统一解析：投顾大师 v1 > 旧评分 JSON > 旧仪表盘 > Markdown
// =====================
function parseAiAnalysisPayload(content: string): {
  advisorReport: AdvisorMasterReport | null;
  dashboardData: DashboardData | null;
  structuredData: StructuredAnalysisData | null;
  markdownContent: string;
} {
  if (!content) {
    return { advisorReport: null, dashboardData: null, structuredData: null, markdownContent: '' };
  }
  const jsonBlockRegex = /```json\s*([\s\S]*?)```/;
  const match = content.match(jsonBlockRegex);
  if (match) {
    try {
      let jsonStr = match[1].trim();
      jsonStr = jsonStr
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        .replace(/True/g, 'true')
        .replace(/False/g, 'false');
      const parsed = JSON.parse(jsonStr);
      const jsonBlockEnd = content.indexOf(match[0]) + match[0].length;
      const markdownContent = content.substring(jsonBlockEnd).trim();

      if (parsed.schema_version === 'advisor_master_v1') {
        return {
          advisorReport: parsed as AdvisorMasterReport,
          dashboardData: null,
          structuredData: null,
          markdownContent,
        };
      }
      if (typeof parsed.overallScore === 'number' && parsed.recommendation) {
        return {
          advisorReport: null,
          dashboardData: null,
          structuredData: parsed as StructuredAnalysisData,
          markdownContent,
        };
      }
      if (
        typeof parsed.sentiment_score === 'number' &&
        parsed.dashboard &&
        typeof parsed.dashboard === 'object'
      ) {
        return {
          advisorReport: null,
          dashboardData: parsed as DashboardData,
          structuredData: null,
          markdownContent,
        };
      }
    } catch {
      // fall through
    }
  }
  const { dashboardData } = parseDashboardData(content);
  if (dashboardData) {
    return {
      advisorReport: null,
      dashboardData,
      structuredData: null,
      markdownContent: content,
    };
  }
  return { advisorReport: null, dashboardData: null, structuredData: null, markdownContent: content };
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
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold text-cyan-600 dark:text-cyan-300 mt-6 mb-3 pb-2 border-b border-border">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-foreground mt-6 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
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
        `<td class="px-3 py-2 border border-border text-muted-foreground">${cell.trim()}</td>`
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
  return `请对 ${stockName}(${stockCode}) 进行投顾大师级全面分析。

【输出】必须先输出一个 JSON 代码块，且其中 schema_version 为 advisor_master_v1（字段结构与系统 Prompt 中示例一致），再可选附加 Markdown 补充说明。
请基于系统提供的实时行情、K线、财务、新闻资讯等数据填写；不得编造未提供的具体数值。`;
};

// =====================
// 主组件
// =====================
interface AIAnalysisProps {
  pendingStock?: { code: string; name: string } | null;
  onPendingStockConsumed?: () => void;
}

export function AIAnalysis({ pendingStock, onPendingStockConsumed }: AIAnalysisProps = {}) {
  // 股票分析列表状态
  const [stockAnalysisList, setStockAnalysisList] = useState<StockAnalysisState[]>([]);
  const [stockInput, setStockInput] = useState('');

  // 数据列表
  const [watchlist, setWatchlist] = useState<data.StockBasic[]>([]);
  const [aiConfigs, setAiConfigs] = useState<data.AIConfig[]>([]);
  const [selectedAiConfigId, setSelectedAiConfigId] = useState<number>(0);
  const [dashboardPromptId, setDashboardPromptId] = useState<number | null>(null);

  // UI 状态
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);
  const [selectedStockCode, setSelectedStockCode] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');
  const [showLogStockCode, setShowLogStockCode] = useState<string | null>(null);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number>(0);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

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

        const [configs, followedStocks, promptId] = await Promise.all([
          GetAiConfigs(),
          GetFollowList(0),
          GetDashboardPromptID().catch(() => 0)
        ]);

        if (promptId) {
          setDashboardPromptId(promptId);
        }

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
          dashboardData: null,
          advisorReport: null,
          markdownContent: '',
          historyResult: null,
          historyRecords: [],
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
              dashboardData: DashboardData | null;
              advisorReport: AdvisorMasterReport | null;
            }>();
            
            // 并行处理当前批次
            const batchPromises = batch.map(async (stock) => {
              try {
                const result = await GetAIResponseResult(stock.ts_code);
                if (result && result.content) {
                  const parsed = parseAiAnalysisPayload(result.content);
                  batchResults.set(stock.ts_code, {
                    result,
                    structured: parsed.structuredData,
                    markdown: parsed.markdownContent,
                    dashboardData: parsed.dashboardData,
                    advisorReport: parsed.advisorReport,
                  });
                }
              } catch {
                // 忽略单个请求错误
              }
            });

            await Promise.all(batchPromises);

            // 每批完成后批量更新状态
            if (batchResults.size > 0) {
              setStockAnalysisList(prev => prev.map(item => {
                const batchData = batchResults.get(item.stockCode);
                if (batchData) {
                  return {
                    ...item,
                    historyResult: batchData.result,
                    structuredData: batchData.structured,
                    dashboardData: batchData.dashboardData,
                    advisorReport: batchData.advisorReport,
                    markdownContent: batchData.markdown,
                    content: batchData.result.content,
                    updatedAt: batchData.result.CreatedAt
                      ? new Date(batchData.result.CreatedAt).toLocaleString('zh-CN')
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
  // 自动选中第一只有数据的股票
  // =====================
  useEffect(() => {
    if (selectedStockCode) return;
    const firstWithData = stockAnalysisList.find(
      s => !s.isAnalyzing && (s.advisorReport || s.dashboardData || s.structuredData || s.content)
    );
    if (firstWithData) {
      setSelectedStockCode(firstWithData.stockCode);
    }
  }, [stockAnalysisList, selectedStockCode]);

  // =====================
  // 从自选列表跳转触发分析
  // =====================
  useEffect(() => {
    if (!pendingStock || loading) return;

    const { code, name } = pendingStock;
    onPendingStockConsumed?.();

    // 确保股票在列表中
    const exists = stockAnalysisList.some(s => s.stockCode === code);
    if (!exists) {
      setStockAnalysisList(prev => [{
        stockCode: code,
        stockName: name,
        isAnalyzing: false,
        phase: 'idle' as AnalysisPhase,
        content: '',
        structuredData: null,
        dashboardData: null,
        advisorReport: null,
        markdownContent: '',
        historyResult: null,
        historyRecords: [],
        showDetail: false,
        error: '',
        updatedAt: '',
      }, ...prev]);
    }

    setSelectedStockCode(code);
    startSingleAnalysis(code, name);
  }, [pendingStock, loading]);

  // =====================
  // 加载股票的所有历史记录
  // =====================
  const loadStockHistory = useCallback(async (stockCode: string) => {
    setLoadingHistory(true);
    try {
      const query = new models.AIResponseResultQuery({
        stockCode: stockCode,
        page: 1,
        pageSize: 50,
      });
      const result = await GetAIResponseResultList(query);
      if (result && result.list && result.list.length > 0) {
        const records: HistoryRecord[] = result.list.map((item: models.AIResponseResult) => {
          const parsed = parseAiAnalysisPayload(item.content);
          return {
            id: item.ID,
            content: item.content,
            dashboardData: parsed.dashboardData,
            advisorReport: parsed.advisorReport,
            structuredData: parsed.structuredData,
            markdownContent: parsed.markdownContent,
            modelName: item.modelName || '',
            createdAt: item.CreatedAt
              ? new Date(item.CreatedAt).toLocaleString('zh-CN')
              : '',
          };
        });
        updateStockAnalysis(stockCode, { historyRecords: records });
      }
    } catch (err) {
      console.error('加载历史记录失败:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, [updateStockAnalysis]);

  // 当选中股票变化时，加载其历史记录并重置选中索引
  useEffect(() => {
    if (selectedStockCode) {
      setSelectedHistoryIndex(0);
      loadStockHistory(selectedStockCode);
    }
  }, [selectedStockCode, loadStockHistory]);

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
        dashboardData: null,
        advisorReport: null,
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

      // 超时保护（5分钟）
      const timeoutId = setTimeout(() => {
        EventsOff(eventName);
        analyzingStocksRef.current.delete(stockCode);
        updateStockAnalysis(stockCode, {
          isAnalyzing: false,
          phase: 'timeout',
          error: '分析超时，请检查网络或AI服务配置',
        });
        resolve();
      }, 3000000);
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
          const parsed = parseAiAnalysisPayload(finalContent);

          updateStockAnalysis(stockCode, {
            isAnalyzing: false,
            phase: 'completed',
            content: finalContent,
            dashboardData: parsed.dashboardData,
            advisorReport: parsed.advisorReport,
            structuredData: parsed.structuredData,
            markdownContent: parsed.markdownContent,
            updatedAt: new Date().toLocaleString('zh-CN'),
          });

          // 分析完成后自动选中该股票并刷新历史
          setSelectedStockCode(stockCode);
          // 延迟加载历史，确保后端保存完成
          setTimeout(() => loadStockHistory(stockCode), 500);

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
            updateStockAnalysis(stockCode, {
              content: contentAccumulator.current,
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
        dashboardPromptId,
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
  }, [aiConfigs, selectedAiConfigId, dashboardPromptId, updateStockAnalysis, loadStockHistory]);

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
        dashboardData: null,
        advisorReport: null,
        markdownContent: '',
        historyResult: null,
        historyRecords: [],
        showDetail: false,
        error: '',
        updatedAt: '',
      }, ...prev]);
    }

    startSingleAnalysis(formattedCode, formattedCode);
    setStockInput('');
  };

  // =====================
  // 刷新自选股列表
  // =====================
  const refreshFollowList = useCallback(async () => {
    try {
      const followedStocks = await GetFollowList(0);
      const stocks = (followedStocks || []).map((fs: any) => ({
        ts_code: fs.StockCode,
        name: fs.Name || fs.StockCode,
        symbol: '',
        fullname: '',
        market: '',
        list_date: ''
      }));
      setWatchlist(stocks);

      // 找出新增的股票（不在现有列表中的）
      const existingCodes = new Set(stockAnalysisList.map(s => s.stockCode));
      const newStocks = stocks.filter((s: any) => !existingCodes.has(s.ts_code));

      if (newStocks.length > 0) {
        const newStates: StockAnalysisState[] = newStocks.map((stock: any) => ({
          stockCode: stock.ts_code,
          stockName: stock.name || stock.ts_code,
          isAnalyzing: false,
          phase: 'idle' as AnalysisPhase,
          content: '',
          structuredData: null,
          dashboardData: null,
          advisorReport: null,
          markdownContent: '',
          historyResult: null,
          historyRecords: [],
          showDetail: false,
          error: '',
          updatedAt: '',
        }));
        setStockAnalysisList(prev => [...prev, ...newStates]);

        // 为新增股票加载历史结果
        for (const stock of newStocks) {
          try {
            const result = await GetAIResponseResult(stock.ts_code);
            if (result && result.content) {
              const parsed = parseAiAnalysisPayload(result.content);
              updateStockAnalysis(stock.ts_code, {
                historyResult: result,
                structuredData: parsed.structuredData,
                dashboardData: parsed.dashboardData,
                advisorReport: parsed.advisorReport,
                markdownContent: parsed.markdownContent,
                content: result.content,
                updatedAt: result.CreatedAt
                  ? new Date(result.CreatedAt).toLocaleString('zh-CN')
                  : '',
                phase: 'completed' as AnalysisPhase,
              });
            }
          } catch {
            // ignore
          }
        }
      }
    } catch (err) {
      console.error('刷新自选股失败:', err);
    }
  }, [stockAnalysisList, updateStockAnalysis]);

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
  // 渲染决策仪表盘
  // =====================
  const renderDashboard = (stock: StockAnalysisState) => {
    const { dashboardData } = stock;
    if (!dashboardData) return null;

    const dashboard = dashboardData.dashboard;
    const coreConclusion = dashboard?.core_conclusion;
    const dataPerspective = dashboard?.data_perspective;
    const intelligence = dashboard?.intelligence;
    const battlePlan = dashboard?.battle_plan;

    const getAdviceStyle = (advice?: string) => {
      const styles: Record<string, { bg: string; text: string; border: string }> = {
        '买入': { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
        '加仓': { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
        '持有': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
        '观望': { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' },
        '减仓': { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
        '卖出': { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
      };
      return styles[advice || ''] || styles['观望'];
    };

    const adviceStyle = getAdviceStyle(dashboardData.operation_advice);

    return (
      <div className="space-y-2">
        {/* ========== 层1：头部区（股票信息+评分+结论+操作建议 合为一行） ========== */}
        <DashboardCard variant="gradient" padding="sm">
          <div className="flex items-start gap-4">
            {/* 左侧：股票信息与核心结论 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-foreground">
                  {dashboardData.stock_name || stock.stockName}
                </h3>
                <span className="text-xs text-gray-500 font-mono">{stock.stockCode}</span>
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${adviceStyle.bg} ${adviceStyle.text} border ${adviceStyle.border}`}>
                  {dashboardData.operation_advice || '观望'}
                </span>
                {coreConclusion?.signal_type && (
                  <span className="text-sm">{coreConclusion.signal_type}</span>
                )}
                {coreConclusion?.time_sensitivity && (
                  <span className="text-xs text-gray-500">{coreConclusion.time_sensitivity}</span>
                )}
              </div>

              {/* 核心结论 */}
              {(coreConclusion?.one_sentence || dashboardData.analysis_summary) && (
                <p className="mt-1 text-sm text-gray-300 leading-snug">
                  {coreConclusion?.one_sentence || dashboardData.analysis_summary}
                </p>
              )}

              {/* 操作建议 + 趋势 + 持仓建议 — 紧凑一行 */}
              <div className="mt-1.5 flex items-center gap-3 flex-wrap text-xs">
                <span className="text-gray-500">操作: <span className="text-gray-300">{dashboardData.operation_advice || '—'}</span></span>
                <span className="text-gray-500">趋势: <span className="text-gray-300">{dashboardData.trend_prediction || '—'}</span></span>
                {coreConclusion?.position_advice?.no_position && (
                  <span className="text-blue-400/80">空仓: <span className="text-gray-400">{coreConclusion.position_advice.no_position}</span></span>
                )}
                {coreConclusion?.position_advice?.has_position && (
                  <span className="text-purple-400/80">持仓: <span className="text-gray-400">{coreConclusion.position_advice.has_position}</span></span>
                )}
              </div>

              <p className="text-xs text-gray-600 mt-1">{stock.updatedAt}</p>
            </div>

            {/* 右侧：情绪仪表盘（紧凑尺寸） */}
            <div className="shrink-0">
              <ScoreGauge
                score={dashboardData.sentiment_score || 50}
                size="sm"
              />
            </div>
          </div>
        </DashboardCard>

        {/* ========== 层2：核心数据区（数据视角 + 狙击点位 横向并排） ========== */}
        {(dataPerspective || battlePlan?.sniper_points) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {/* 数据视角 */}
            {dataPerspective && (
              <DashboardCard variant="bordered" padding="sm">
                <div className="grid grid-cols-2 gap-1.5">
                  {dataPerspective.trend_status && (
                    <div className="bg-slate-800/40 rounded p-2">
                      <span className="text-xs text-gray-500">趋势</span>
                      <p className={`text-xs font-medium ${dataPerspective.trend_status.is_bullish ? 'text-green-400' : 'text-red-400'}`}>
                        {dataPerspective.trend_status.ma_alignment || '—'}
                      </p>
                      {dataPerspective.trend_status.trend_score !== undefined && (
                        <div className="mt-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${dataPerspective.trend_status.trend_score}%`,
                              backgroundColor: dataPerspective.trend_status.is_bullish ? '#22c55e' : '#ef4444',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                  {dataPerspective.price_position && (
                    <div className="bg-slate-800/40 rounded p-2">
                      <span className="text-xs text-gray-500">价格</span>
                      <p className="text-xs font-mono text-foreground">¥{dataPerspective.price_position.current_price}</p>
                      <span className={`text-xs font-mono ${
                        dataPerspective.price_position.bias_status === '安全' ? 'text-green-400' :
                        dataPerspective.price_position.bias_status === '警戒' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        乖离 {dataPerspective.price_position.bias_ma5 !== undefined ? `${dataPerspective.price_position.bias_ma5}%` : '—'}
                      </span>
                    </div>
                  )}
                  {dataPerspective.volume_analysis && (
                    <div className="bg-slate-800/40 rounded p-2">
                      <span className="text-xs text-gray-500">量能</span>
                      <p className="text-xs font-medium text-foreground">{dataPerspective.volume_analysis.volume_status || '—'}</p>
                      <span className="text-xs text-gray-500">
                        量比{dataPerspective.volume_analysis.volume_ratio ?? '—'} 换手{dataPerspective.volume_analysis.turnover_rate !== undefined ? `${dataPerspective.volume_analysis.turnover_rate}%` : '—'}
                      </span>
                    </div>
                  )}
                  {dataPerspective.chip_structure && (
                    <div className="bg-slate-800/40 rounded p-2">
                      <span className="text-xs text-gray-500">筹码</span>
                      <p className={`text-xs font-medium ${
                        dataPerspective.chip_structure.chip_health === '健康' ? 'text-green-400' :
                        dataPerspective.chip_structure.chip_health === '一般' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {dataPerspective.chip_structure.chip_health || '—'}
                      </p>
                      <span className="text-xs text-gray-500">
                        获利{dataPerspective.chip_structure.profit_ratio !== undefined ? `${dataPerspective.chip_structure.profit_ratio}%` : '—'}
                      </span>
                    </div>
                  )}
                </div>
              </DashboardCard>
            )}

            {/* 狙击点位 */}
            {battlePlan?.sniper_points && (
              <DashboardCard variant="bordered" padding="sm">
                <StrategyPoints points={battlePlan.sniper_points} />
              </DashboardCard>
            )}
          </div>
        )}

        {/* ========== 层3：辅助信息区（小字紧凑） ========== */}
        <DashboardCard variant="default" padding="sm">
          <div className="space-y-1.5">
            {/* 检查清单 — 单行紧凑 */}
            {battlePlan?.action_checklist && battlePlan.action_checklist.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {battlePlan.action_checklist.map((item, i) => {
                  const icon = item.startsWith('✅') ? '✅' : item.startsWith('⚠️') ? '⚠️' : item.startsWith('❌') ? '❌' : '•';
                  const text = item.replace(/^[✅⚠️❌]\s*/, '');
                  return (
                    <span key={i} className="text-xs text-gray-400">{icon} {text}</span>
                  );
                })}
              </div>
            )}

            {/* 仓位策略 — 单行 */}
            {battlePlan?.position_strategy && (
              <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                {battlePlan.position_strategy.suggested_position && (
                  <span>仓位: <span className="text-gray-400">{battlePlan.position_strategy.suggested_position}</span></span>
                )}
                {battlePlan.position_strategy.entry_plan && (
                  <span>建仓: <span className="text-gray-400">{battlePlan.position_strategy.entry_plan}</span></span>
                )}
                {battlePlan.position_strategy.risk_control && (
                  <span>风控: <span className="text-gray-400">{battlePlan.position_strategy.risk_control}</span></span>
                )}
              </div>
            )}

            {/* 核心看点 / 操作理由 / 风险提示 — 小字 */}
            {(dashboardData.key_points || dashboardData.buy_reason || dashboardData.risk_warning) && (
              <div className="space-y-0.5 text-xs">
                {dashboardData.key_points && (
                  <p className="text-gray-400">{dashboardData.key_points}</p>
                )}
                {dashboardData.buy_reason && (
                  <p className="text-gray-500"><span className="text-cyan-400/70">操作理由</span> {dashboardData.buy_reason}</p>
                )}
                {dashboardData.risk_warning && (
                  <p className="text-gray-500"><span className="text-red-400/70">风险提示</span> {dashboardData.risk_warning}</p>
                )}
              </div>
            )}

            {/* 舆情情报 — 小字 */}
            {intelligence && (intelligence.latest_news || (intelligence.risk_alerts && intelligence.risk_alerts.length > 0) || (intelligence.positive_catalysts && intelligence.positive_catalysts.length > 0)) && (
              <div className="text-xs text-gray-500 space-y-0.5">
                {intelligence.latest_news && (
                  <p className="text-gray-400">{intelligence.latest_news}</p>
                )}
                {intelligence.risk_alerts && intelligence.risk_alerts.length > 0 && (
                  <p><span className="text-red-400/70">风险:</span> {intelligence.risk_alerts.join(' · ')}</p>
                )}
                {intelligence.positive_catalysts && intelligence.positive_catalysts.length > 0 && (
                  <p><span className="text-green-400/70">利好:</span> {intelligence.positive_catalysts.join(' · ')}</p>
                )}
              </div>
            )}
          </div>
        </DashboardCard>
      </div>
    );
  };

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
                <h3 className="text-xl font-bold text-foreground">{stock.stockName}</h3>
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
          <div className="bg-muted/50 dark:bg-slate-800/40 rounded-lg p-3 border border-border/60">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-gray-400">技术面</span>
            </div>
            <p className="text-xl font-bold text-cyan-400">{structuredData.technicalScore}分</p>
          </div>
          <div className="bg-muted/50 dark:bg-slate-800/40 rounded-lg p-3 border border-border/60">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">基本面</span>
            </div>
            <p className="text-xl font-bold text-blue-400">{structuredData.fundamentalScore}分</p>
          </div>
          <div className="bg-muted/50 dark:bg-slate-800/40 rounded-lg p-3 border border-border/60">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-gray-400">资金面</span>
            </div>
            <p className="text-xl font-bold text-orange-400">{structuredData.capitalScore}分</p>
          </div>
          <div className="bg-muted/50 dark:bg-slate-800/40 rounded-lg p-3 border border-border/60">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">风险等级</span>
            </div>
            <p className={`text-xl font-bold ${riskStyle}`}>{structuredData.riskLevel}</p>
          </div>
        </div>

        {/* AI智能洞察 */}
        <div className="bg-muted/40 dark:bg-slate-800/30 rounded-lg p-4 border border-border/60">
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
            className="bg-muted dark:bg-slate-800 rounded-lg border border-border p-4"
          >
            {section.title && (
              <h3 className="text-lg font-semibold text-cyan-600 dark:text-cyan-300 mb-3 pb-2 border-b border-border flex items-center gap-2">
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
        className="bg-card rounded-xl border border-border p-5 shadow-2xl"
      >
        {/* 分析中状态 */}
        {stock.isAnalyzing && (
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-foreground">{stock.stockName}</h3>
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
              <h3 className="text-xl font-bold text-foreground">{stock.stockName}</h3>
              <span className="text-sm text-gray-400 font-mono">{stock.stockCode}</span>
            </div>
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{stock.error}</span>
            </div>
          </div>
        )}

        {/* 投顾大师结构化 */}
        {!stock.isAnalyzing && stock.advisorReport && (
          <AdvisorMasterPanel
            report={stock.advisorReport}
            stockName={stock.stockName}
            stockCode={stock.stockCode}
            updatedAt={stock.updatedAt}
          />
        )}

        {/* 有仪表盘数据 */}
        {!stock.isAnalyzing && !stock.advisorReport && stock.dashboardData && renderDashboard(stock)}

        {/* 有结构化数据（旧格式） */}
        {!stock.isAnalyzing && !stock.advisorReport && !stock.dashboardData && stock.structuredData && renderStructuredCard(stock)}

        {/* 无结构化数据但有内容（Fallback） */}
        {!stock.isAnalyzing && !stock.advisorReport && !stock.dashboardData && !stock.structuredData && stock.content && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-foreground">{stock.stockName}</h3>
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
        {!stock.isAnalyzing && !stock.advisorReport && !stock.dashboardData && !stock.content && !stock.error && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-foreground">{stock.stockName}</h3>
              <span className="text-sm text-gray-400 font-mono">{stock.stockCode}</span>
            </div>
            <span className="text-xs text-gray-500">暂无分析结果</span>
          </div>
        )}

        {/* 展开详情按钮和重新分析按钮 */}
        {!stock.isAnalyzing && (stock.content || stock.structuredData || stock.dashboardData || stock.advisorReport) && (
          <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-border/60">
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
        {!stock.isAnalyzing && !stock.advisorReport && !stock.dashboardData && !stock.content && !stock.error && (
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
          <div className="mt-4 pt-4 border-t border-border">
            {renderMarkdownSections(stock.markdownContent)}
          </div>
        )}
      </div>
    );
  };

  const hasAnyAnalyzing = stockAnalysisList.some(s => s.isAnalyzing);

  // 左栏列表数据
  const analyzingStocks = stockAnalysisList.filter(s => s.isAnalyzing);
  const completedStocks = stockAnalysisList
    .filter(s => !s.isAnalyzing && (s.advisorReport || s.dashboardData || s.structuredData || s.content))
    .sort((a, b) => {
      if (!a.updatedAt && !b.updatedAt) return 0;
      if (!a.updatedAt) return 1;
      if (!b.updatedAt) return -1;
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  const idleStocks = stockAnalysisList.filter(
    s => !s.isAnalyzing && !s.advisorReport && !s.dashboardData && !s.structuredData && !s.content && !s.error
  );

  // 按 filterText 过滤
  const filterFn = (s: StockAnalysisState) => {
    if (!filterText) return true;
    const q = filterText.toLowerCase();
    return s.stockCode.toLowerCase().includes(q) || s.stockName.toLowerCase().includes(q);
  };
  const filteredAnalyzing = analyzingStocks.filter(filterFn);
  const filteredCompleted = completedStocks.filter(filterFn);
  const filteredIdle = idleStocks.filter(filterFn);

  // 选中股票详情
  const selectedStock = selectedStockCode
    ? stockAnalysisList.find(s => s.stockCode === selectedStockCode) || null
    : null;

  // 获取评分
  const getScore = (s: StockAnalysisState): number | null => {
    if (s.advisorReport?.sentiment_score != null) return s.advisorReport.sentiment_score;
    if (s.dashboardData?.sentiment_score != null) return s.dashboardData.sentiment_score;
    if (s.structuredData?.overallScore != null) return s.structuredData.overallScore;
    return null;
  };

  // 评分颜色
  const getScoreColor = (score: number): string => {
    if (score >= 70) return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (score >= 40) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-red-400 bg-red-500/20 border-red-500/30';
  };

  // 渲染 LLM 原始日志区域
  const renderLogSection = (stock: StockAnalysisState) => {
    if (!stock.content) return null;
    const isLogVisible = showLogStockCode === stock.stockCode;

    return (
      <div className="pt-3 mt-3 border-t border-border/60">
        <button
          onClick={() => setShowLogStockCode(isLogVisible ? null : stock.stockCode)}
          className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          <FileText className="w-3 h-3" />
          {isLogVisible ? '收起日志' : '查看日志'}
          {isLogVisible ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {isLogVisible && (
          <div className="mt-2 bg-muted/50 dark:bg-slate-950/60 rounded-lg border border-border/60 p-4 max-h-[500px] overflow-y-auto">
            <pre className="text-xs text-gray-500 font-mono whitespace-pre-wrap break-words leading-relaxed">
              {stock.content}
            </pre>
          </div>
        )}
      </div>
    );
  };

  // 渲染历史记录切换器
  const renderHistoryPicker = (stock: StockAnalysisState) => {
    const records = stock.historyRecords;
    if (!records || records.length <= 1) return null;

    return (
      <div className="flex items-center gap-2 flex-wrap">
        <Clock className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-xs text-gray-500">历史记录:</span>
        <div className="flex items-center gap-1 flex-wrap">
          {records.map((record, index) => (
            <button
              key={record.id}
              onClick={() => setSelectedHistoryIndex(index)}
              className={`text-xs px-2 py-1 rounded transition-all ${
                selectedHistoryIndex === index
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'
              }`}
              title={`${record.createdAt}${record.modelName ? ' · ' + record.modelName : ''}`}
            >
              {record.createdAt || `#${index + 1}`}
            </button>
          ))}
        </div>
        {loadingHistory && <Loader2 className="w-3 h-3 text-gray-500 animate-spin" />}
      </div>
    );
  };

  // 获取当前选中的历史记录的展示数据
  const getDisplayData = (stock: StockAnalysisState): {
    content: string;
    dashboardData: DashboardData | null;
    advisorReport: AdvisorMasterReport | null;
    structuredData: StructuredAnalysisData | null;
    markdownContent: string;
    updatedAt: string;
  } => {
    const records = stock.historyRecords;
    if (records && records.length > 0 && selectedHistoryIndex < records.length) {
      const record = records[selectedHistoryIndex];
      return {
        content: record.content,
        dashboardData: record.dashboardData,
        advisorReport: record.advisorReport,
        structuredData: record.structuredData,
        markdownContent: record.markdownContent,
        updatedAt: record.createdAt,
      };
    }
    // fallback 到当前状态
    return {
      content: stock.content,
      dashboardData: stock.dashboardData,
      advisorReport: stock.advisorReport,
      structuredData: stock.structuredData,
      markdownContent: stock.markdownContent,
      updatedAt: stock.updatedAt,
    };
  };

  // 渲染右栏详情
  const renderDetail = () => {
    if (!selectedStock) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center py-20">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
            <Brain className="w-10 h-10 text-cyan-400" />
          </div>
          <h3 className="text-lg text-foreground mb-2">请在左侧选择股票</h3>
          <p className="text-sm text-gray-400 max-w-md">
            选择一只股票查看 AI 分析详情
          </p>
        </div>
      );
    }

    // 正在分析中
    if (selectedStock.isAnalyzing) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-foreground">{selectedStock.stockName}</h3>
            <span className="text-sm text-gray-400 font-mono">{selectedStock.stockCode}</span>
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
            <span className="text-sm text-gray-300">{phaseConfig[selectedStock.phase].text}</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${phaseConfig[selectedStock.phase].color} transition-all duration-1000 ease-out`}
              style={{ width: `${phaseConfig[selectedStock.phase].progress}%` }}
            />
          </div>
          {/* 流式输出内容 */}
          {selectedStock.content && (
            <div className="mt-4 bg-muted/50 dark:bg-slate-950/60 rounded-lg border border-border/60 p-4 max-h-[500px] overflow-y-auto">
              <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap break-words leading-relaxed">
                {selectedStock.content}
              </pre>
            </div>
          )}
        </div>
      );
    }

    // 错误状态
    if (selectedStock.error) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-foreground">{selectedStock.stockName}</h3>
            <span className="text-sm text-gray-400 font-mono">{selectedStock.stockCode}</span>
          </div>
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{selectedStock.error}</span>
          </div>
          <button
            onClick={() => startSingleAnalysis(selectedStock.stockCode, selectedStock.stockName)}
            disabled={hasAnyAnalyzing}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-4 h-4" />
            重新分析
          </button>
        </div>
      );
    }

    // 使用历史记录切换后的展示数据
    const display = getDisplayData(selectedStock);

    // 构建一个虚拟的 stock 对象用于渲染（合并历史数据）
    const displayStock: StockAnalysisState = {
      ...selectedStock,
      content: display.content,
      dashboardData: display.dashboardData,
      advisorReport: display.advisorReport,
      structuredData: display.structuredData,
      markdownContent: display.markdownContent,
      updatedAt: display.updatedAt,
    };

    // 投顾大师结构化报告
    if (display.advisorReport) {
      return (
        <div className="space-y-4">
          {renderHistoryPicker(selectedStock)}
          <AdvisorMasterPanel
            report={display.advisorReport}
            stockName={selectedStock.stockName}
            stockCode={selectedStock.stockCode}
            updatedAt={display.updatedAt}
          />
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => startSingleAnalysis(selectedStock.stockCode, selectedStock.stockName)}
              disabled={hasAnyAnalyzing}
              className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-sm text-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-4 h-4" />
              重新分析
            </button>
          </div>
          {renderLogSection(displayStock)}
        </div>
      );
    }

    // 有仪表盘数据
    if (display.dashboardData) {
      return (
        <div className="space-y-4">
          {renderHistoryPicker(selectedStock)}
          {renderDashboard(displayStock)}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => startSingleAnalysis(selectedStock.stockCode, selectedStock.stockName)}
              disabled={hasAnyAnalyzing}
              className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-sm text-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-4 h-4" />
              重新分析
            </button>
          </div>
          {renderLogSection(displayStock)}
        </div>
      );
    }

    // 有结构化数据（旧格式）
    if (display.structuredData) {
      return (
        <div className="space-y-4">
          {renderHistoryPicker(selectedStock)}
          {renderStructuredCard(displayStock)}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => startSingleAnalysis(selectedStock.stockCode, selectedStock.stockName)}
              disabled={hasAnyAnalyzing}
              className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-sm text-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-4 h-4" />
              重新分析
            </button>
          </div>
          {renderLogSection(displayStock)}
        </div>
      );
    }

    // 有内容（纯 markdown fallback）
    if (display.content) {
      return (
        <div className="space-y-4">
          {renderHistoryPicker(selectedStock)}
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-xl font-bold text-foreground">{selectedStock.stockName}</h3>
            <span className="text-sm text-gray-400 font-mono">{selectedStock.stockCode}</span>
            {display.updatedAt && (
              <span className="text-xs text-gray-500">{display.updatedAt} 更新</span>
            )}
          </div>
          {renderMarkdownSections(display.markdownContent || display.content)}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => startSingleAnalysis(selectedStock.stockCode, selectedStock.stockName)}
              disabled={hasAnyAnalyzing}
              className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-sm text-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-4 h-4" />
              重新分析
            </button>
          </div>
        </div>
      );
    }

    // 空状态
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-foreground">{selectedStock.stockName}</h3>
          <span className="text-sm text-gray-400 font-mono">{selectedStock.stockCode}</span>
        </div>
        <p className="text-sm text-gray-500">暂无分析结果</p>
        <button
          onClick={() => startSingleAnalysis(selectedStock.stockCode, selectedStock.stockName)}
          disabled={hasAnyAnalyzing}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
        >
          <Play className="w-4 h-4" />
          开始分析
        </button>
      </div>
    );
  };

  // 渲染左栏列表项
  const renderListItem = (stock: StockAnalysisState) => {
    const isSelected = selectedStockCode === stock.stockCode;
    const score = getScore(stock);

    return (
      <div
        key={stock.stockCode}
        onClick={() => setSelectedStockCode(stock.stockCode)}
        className={`relative flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg transition-all ${
          isSelected
            ? 'bg-cyan-500/10 border border-cyan-500/30'
            : 'hover:bg-white/5 border border-transparent'
        }`}
      >
        {/* 选中指示条 */}
        {isSelected && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-cyan-400 rounded-full" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-medium truncate ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
              {stock.stockName}
            </span>
            {stock.isAnalyzing && (
              <Loader2 className="w-3 h-3 text-cyan-400 animate-spin flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-500 font-mono">{stock.stockCode}</span>
            {stock.updatedAt && (
              <span className="text-xs text-gray-600">{stock.updatedAt}</span>
            )}
          </div>
        </div>

        {/* 评分 badge */}
        {score != null && (
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${getScoreColor(score)}`}>
            {score}
          </span>
        )}

        {/* 分析中标签 */}
        {stock.isAnalyzing && !score && (
          <span className="text-xs text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded flex-shrink-0">
            分析中
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* 工具栏 */}
      <div className="bg-card rounded-xl border border-border p-3 shadow-2xl flex-shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          {/* 标题 */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Brain className="w-4 h-4 text-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">AI分析</span>
          </div>

          <div className="h-6 w-px bg-white/10"></div>

          {/* AI模型选择 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">模型:</span>
            {aiConfigs.length > 0 ? (
              <div className="relative">
                <select
                  value={selectedAiConfigId}
                  onChange={(e) => setSelectedAiConfigId(Number(e.target.value))}
                  disabled={hasAnyAnalyzing}
                  className="appearance-none bg-input-background border border-input rounded-lg px-3 py-1.5 pr-8 text-sm text-foreground focus:outline-none focus:border-cyan-500/50 disabled:opacity-50"
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
                className="w-full bg-input-background border border-input rounded-lg pl-10 pr-4 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 disabled:opacity-50"
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

          <div className="h-6 w-px bg-white/10"></div>

          {/* 刷新 */}
          <button
            onClick={refreshFollowList}
            className="flex items-center gap-1 px-3 py-1.5 text-gray-400 hover:text-cyan-400 hover:bg-white/5 rounded-lg text-sm transition-all"
            title="刷新自选股列表"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

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
                一键分析
              </>
            )}
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-3 flex-shrink-0">
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

      {/* 主区域：左右分栏 */}
      <div className="flex gap-3 flex-1 min-h-0 mt-2.5">
        {/* ===== 左栏：股票列表 ===== */}
        <div className="w-72 flex-shrink-0 bg-card rounded-xl border border-border shadow-2xl flex flex-col overflow-hidden">
          {/* 筛选输入 */}
          <div className="p-3 border-b border-border/60">
            <div className="relative">
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="筛选股票..."
                className="w-full bg-input-background border border-input rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          {/* 列表区域（可滚动） */}
          <div className="flex-1 overflow-y-auto">
            {/* 分析中的任务 */}
            {filteredAnalyzing.length > 0 && (
              <div className="px-2 pt-2">
                <div className="flex items-center gap-1.5 px-2 py-1">
                  <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
                  <span className="text-xs text-gray-500 font-medium">分析中 ({filteredAnalyzing.length})</span>
                </div>
                {filteredAnalyzing.map(renderListItem)}
              </div>
            )}

            {/* 已有结果的 */}
            {filteredCompleted.length > 0 && (
              <div className="px-2 pt-2">
                <div className="flex items-center gap-1.5 px-2 py-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500 font-medium">历史记录 ({filteredCompleted.length})</span>
                </div>
                {filteredCompleted.map(renderListItem)}
              </div>
            )}

            {/* 未分析的 */}
            {filteredIdle.length > 0 && (
              <div className="px-2 pt-2">
                <div className="flex items-center gap-1.5 px-2 py-1">
                  <span className="text-xs text-gray-600 font-medium">待分析 ({filteredIdle.length})</span>
                </div>
                {filteredIdle.map(renderListItem)}
              </div>
            )}

            {/* 空列表提示 */}
            {stockAnalysisList.length === 0 && (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <Brain className="w-8 h-8 text-gray-600 mb-2" />
                <p className="text-xs text-gray-500">暂无自选股</p>
              </div>
            )}

            {/* 筛选无结果 */}
            {stockAnalysisList.length > 0 && filteredAnalyzing.length === 0 && filteredCompleted.length === 0 && filteredIdle.length === 0 && (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <Search className="w-6 h-6 text-gray-600 mb-2" />
                <p className="text-xs text-gray-500">无匹配结果</p>
              </div>
            )}
          </div>

          {/* 底部统计 */}
          <div className="px-3 py-2 border-t border-border/60 text-xs text-muted-foreground">
            共 {stockAnalysisList.length} 只
          </div>
        </div>

        {/* ===== 右栏：详情区 ===== */}
        <div className="flex-1 bg-card rounded-xl border border-border shadow-2xl overflow-y-auto p-5">
          {renderDetail()}
        </div>
      </div>

      {/* 免责声明 */}
      <div className="bg-card rounded-xl border border-border p-3 shadow-2xl flex-shrink-0">
        <div className="text-xs text-gray-500 flex gap-4">
          <span>AI 分析仅供参考，不构成投资建议</span>
          <span>投资有风险，入市需谨慎</span>
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
