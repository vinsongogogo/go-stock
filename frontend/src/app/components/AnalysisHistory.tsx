import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Trash2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Loader2,
  History,
  AlertCircle,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import {
  GetAIResponseResultList,
  DeleteAIResponseResult,
  BatchDeleteAIResponseResult,
} from '../../../wailsjs/go/main/App';
import { models } from '../../../wailsjs/go/models';

// =====================
// 简易 Markdown 渲染函数（不从 AIAnalysis 导入，避免循环依赖）
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
// 结构化数据类型
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

// 从 LLM 输出中提取 JSON 结构化数据
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

// 推荐等级颜色映射
const recommendationStyles: Record<string, { bg: string; text: string }> = {
  '强烈买入': { bg: 'bg-red-500/20', text: 'text-red-400' },
  '买入': { bg: 'bg-green-500/20', text: 'text-green-400' },
  '持有': { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  '卖出': { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  '强烈卖出': { bg: 'bg-red-700/20', text: 'text-red-500' },
};

// 风险等级颜色
const riskLevelStyles: Record<string, string> = {
  '低风险': 'text-green-400',
  '中风险': 'text-yellow-400',
  '高风险': 'text-red-400',
};

// 星级计算
const getStarRating = (score: number): number => {
  if (score >= 90) return 5;
  if (score >= 75) return 4;
  if (score >= 60) return 3;
  if (score >= 40) return 2;
  return 1;
};

// =====================
// 主组件
// =====================
interface AnalysisHistoryProps {
  embedded?: boolean;
}

export default function AnalysisHistory({ embedded = false }: AnalysisHistoryProps) {
  // 查询参数
  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 数据
  const [pageData, setPageData] = useState<models.AIResponseResultPageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 选择
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // 查询历史记录
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new models.AIResponseResultQuery();
      query.page = currentPage;
      query.pageSize = pageSize;
      query.stockCode = searchText;
      query.stockName = searchText;
      query.startDate = startDate;
      query.endDate = endDate;
      const result = await GetAIResponseResultList(query);
      setPageData(result);
    } catch (err: any) {
      console.error('查询失败', err);
      setError('查询失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchText, startDate, endDate]);

  // 初始化加载
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // 单条删除
  const handleDelete = async (id: number) => {
    try {
      const result = await DeleteAIResponseResult(id);
      if (result === '删除成功') {
        setSelectedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        if (expandedId === id) {
          setExpandedId(null);
        }
        fetchHistory();
      } else {
        setError('删除失败');
      }
    } catch (err) {
      console.error('删除失败', err);
      setError('删除失败');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      const result = await BatchDeleteAIResponseResult(Array.from(selectedIds));
      if (result === '删除成功') {
        setSelectedIds(new Set());
        setExpandedId(null);
        fetchHistory();
      } else {
        setError('批量删除失败');
      }
    } catch (err) {
      console.error('批量删除失败', err);
      setError('批量删除失败');
    }
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    if (!pageData?.list) return;
    const allIds = pageData.list.map(item => item.ID);
    if (selectedIds.size === allIds.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allIds));
    }
  };

  // 切换选择
  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // 搜索
  const handleSearch = () => {
    setCurrentPage(1);
    fetchHistory();
  };

  // 重置筛选
  const handleReset = () => {
    setSearchText('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  // 渲染结构化数据卡片
  const renderStructuredCard = (data: StructuredAnalysisData) => {
    const recStyle = recommendationStyles[data.recommendation] || { bg: 'bg-gray-500/20', text: 'text-gray-400' };
    const riskStyle = riskLevelStyles[data.riskLevel] || 'text-gray-400';
    const stars = getStarRating(data.overallScore);

    return (
      <div className="bg-muted/50 dark:bg-slate-800/40 rounded-lg p-4 mb-4 border border-border">
        {/* 头部：推荐等级和综合评分 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${recStyle.bg} ${recStyle.text}`}>
              {data.recommendation}
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < stars ? 'text-yellow-400' : 'text-gray-600'}>★</span>
              ))}
              <span className="ml-2 text-lg font-bold text-foreground">{data.overallScore}</span>
            </div>
          </div>
          <span className={`text-sm font-medium ${riskStyle}`}>{data.riskLevel}</span>
        </div>

        {/* 四维评分 */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">技术面</p>
            <p className="text-lg font-bold text-cyan-400">{data.technicalScore}</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">基本面</p>
            <p className="text-lg font-bold text-green-400">{data.fundamentalScore}</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">资金面</p>
            <p className="text-lg font-bold text-purple-400">{data.capitalScore}</p>
          </div>
        </div>

        {/* AI 智能洞察 */}
        {data.aiInsight && (
          <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-lg p-3 mb-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">AI 智能洞察</span>
            </div>
            <p className="text-sm text-gray-300">{data.aiInsight}</p>
          </div>
        )}

        {/* 目标价 */}
        {data.targetPrice && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-700/50 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-400 mb-1">悲观</p>
              <p className="text-sm font-medium text-red-400">¥{data.targetPrice.pessimistic?.toFixed(2) || '--'}</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-400 mb-1">中性</p>
              <p className="text-sm font-medium text-yellow-400">¥{data.targetPrice.neutral?.toFixed(2) || '--'}</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-400 mb-1">乐观</p>
              <p className="text-sm font-medium text-green-400">¥{data.targetPrice.optimistic?.toFixed(2) || '--'}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 渲染展开的详情内容
  const renderExpandedContent = (item: models.AIResponseResult) => {
    const { structured, markdown } = parseStructuredData(item.content || '');

    return (
      <div className="mt-4 pt-4 border-t border-border">
        {/* 结构化数据卡片 */}
        {structured && renderStructuredCard(structured)}

        {/* Markdown 内容 */}
        <div 
          className="prose prose-invert max-w-none text-gray-300"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown || item.content || '') }}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 头部 — embedded 模式下隐藏 */}
      {!embedded && (
        <div className="bg-card rounded-xl border border-border p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <History className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl text-foreground font-light">分析历史记录</h2>
                <p className="text-xs text-gray-400">Analysis History · Review Past Insights</p>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              共 {pageData?.total || 0} 条记录
            </div>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* 搜索筛选区域 */}
      <div className="bg-card rounded-xl border border-border p-5 shadow-2xl">
        <div className="flex flex-wrap gap-3">
          {/* 搜索框 */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="搜索股票代码或名称"
              className="w-full bg-input-background border border-input rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* 开始日期 */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-input-background border border-input rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* 结束日期 */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-input-background border border-input rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* 搜索按钮 */}
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-lg text-white text-sm font-medium transition-all shadow-lg shadow-cyan-500/20"
          >
            搜索
          </button>

          {/* 重置按钮 */}
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-muted/80 dark:bg-slate-700/60 hover:bg-accent border border-border rounded-lg text-muted-foreground text-sm transition-all"
          >
            重置
          </button>
        </div>

        {/* 批量操作 */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-cyan-400 transition-colors"
          >
            {pageData?.list && selectedIds.size === pageData.list.length && pageData.list.length > 0 ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            全选
          </button>
          
          {selectedIds.size > 0 && (
            <button
              onClick={handleBatchDelete}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm transition-all"
            >
              <Trash2 className="w-4 h-4" />
              批量删除 ({selectedIds.size})
            </button>
          )}
        </div>
      </div>

      {/* 列表 */}
      <div className="bg-card rounded-xl border border-border shadow-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-sm">加载中...</p>
            </div>
          </div>
        ) : !pageData?.list || pageData.list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800/60 flex items-center justify-center mb-4">
              <History className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-gray-400 mb-2">暂无分析历史记录</p>
            <p className="text-xs text-gray-500">在 AI 股票分析页面进行分析后，记录会显示在这里</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {pageData.list.map((item) => (
              <div key={item.ID} className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-start gap-3">
                  {/* 复选框 */}
                  <button
                    onClick={() => toggleSelect(item.ID)}
                    className="mt-1 text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    {selectedIds.has(item.ID) ? (
                      <CheckSquare className="w-5 h-5 text-cyan-400" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedId(expandedId === item.ID ? null : item.ID)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-foreground font-medium">{item.stockName || '--'}</span>
                        <span className="text-gray-400 text-sm font-mono">{item.stockCode || '--'}</span>
                        {item.modelName && (
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded">
                            {item.modelName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 text-sm">
                          {item.CreatedAt ? new Date(item.CreatedAt).toLocaleString('zh-CN') : '--'}
                        </span>
                        {expandedId === item.ID ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* 展开内容 */}
                    {expandedId === item.ID && renderExpandedContent(item)}
                  </div>

                  {/* 删除按钮 */}
                  <button
                    onClick={() => handleDelete(item.ID)}
                    className="mt-1 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 分页 */}
      {pageData && pageData.totalPages > 1 && (
        <div className="bg-card rounded-xl border border-border p-4 shadow-2xl">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-input-background hover:bg-accent border border-input rounded-lg text-sm text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              上一页
            </button>
            <span className="text-sm text-gray-400">
              第 {currentPage} / {pageData.totalPages} 页
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(pageData.totalPages, prev + 1))}
              disabled={currentPage === pageData.totalPages}
              className="px-4 py-2 bg-input-background hover:bg-accent border border-input rounded-lg text-sm text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
