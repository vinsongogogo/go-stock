import type { ReactNode } from 'react';
import {
  MapPin,
  Layers,
  AlertTriangle,
  Compass,
  NotebookPen,
  Box,
  Microscope,
  HandCoins,
  Brain,
} from 'lucide-react';
import { DashboardCard } from '../dashboard/DashboardCard';

export interface AdvisorMasterReport {
  schema_version?: string;
  stock_name?: string;
  sentiment_score?: number;
  sentiment_label?: string;
  trend_prediction?: string;
  operation_advice?: string;
  confidence_level?: string;
  analysis_summary?: string;
  market_position?: {
    stock_quote?: string;
    market_quote?: string;
    relative_strength?: string;
    volatility_character?: string;
    market_cap_tier?: string;
  };
  multi_factor?: {
    valuation?: string;
    growth?: string;
    momentum?: string;
    quality?: string;
    sentiment?: string;
  };
  risk_alert?: {
    gray_rhino?: string;
    black_swan?: string;
  };
  tactical?: {
    trend_following?: string;
    contrarian?: string;
  };
  tracking_memo?: {
    next_key_time_node?: string;
    volume_price_alert?: string;
  };
  four_dimensions?: {
    fundamental?: string;
    industry?: string;
    capital?: string;
    technical?: string;
  };
  professional_dimensions?: {
    static_valuation?: string;
    dynamic_valuation?: string;
    volatility?: string;
    institution_research?: string;
  };
  actionable?: {
    stop_loss_triggers?: string;
    suggested_position?: string;
    buy_reason?: string;
    sell_reason?: string;
  };
}

const opStyles: Record<string, { bg: string; text: string; border: string }> = {
  买入: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  加仓: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  持有: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  观望: { bg: 'bg-slate-500/20', text: 'text-slate-300', border: 'border-slate-500/30' },
  减仓: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  卖出: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
};

function SectionBlock(props: {
  index: number;
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <DashboardCard variant="bordered" padding="sm">
      <div className="flex items-start gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-xs font-bold text-cyan-400">
          {props.index}
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-cyan-200">
            {props.icon}
            {props.title}
          </h4>
          <div className="space-y-1.5 text-xs leading-relaxed text-gray-300">{props.children}</div>
        </div>
      </div>
    </DashboardCard>
  );
}

function Line(props: { label: string; value?: string }) {
  if (!props.value?.trim()) return null;
  return (
    <p>
      <span className="text-gray-500">{props.label}</span>{' '}
      <span className="text-gray-200">{props.value}</span>
    </p>
  );
}

export interface AdvisorMasterPanelProps {
  report: AdvisorMasterReport;
  stockName: string;
  stockCode: string;
  updatedAt?: string;
}

export function AdvisorMasterPanel({ report, stockName, stockCode, updatedAt }: AdvisorMasterPanelProps) {
  const displayName = report.stock_name || stockName;
  const op = report.operation_advice || '观望';
  const opStyle = opStyles[op] || opStyles['观望'];
  const score = report.sentiment_score;

  return (
    <div className="space-y-3">
      <DashboardCard variant="gradient" padding="sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-white">{displayName}</h3>
              <span className="font-mono text-xs text-gray-500">{stockCode}</span>
              <span className={`rounded border px-2 py-0.5 text-xs font-medium ${opStyle.bg} ${opStyle.text} ${opStyle.border}`}>
                {op}
              </span>
            </div>
            {report.analysis_summary && (
              <p className="mt-2 text-sm leading-snug text-gray-300">{report.analysis_summary}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              {report.sentiment_label && <span>情绪: {report.sentiment_label}</span>}
              {report.trend_prediction && <span>趋势: {report.trend_prediction}</span>}
              {report.confidence_level && <span>置信: {report.confidence_level}</span>}
              {updatedAt && <span>{updatedAt}</span>}
            </div>
          </div>
          {typeof score === 'number' && !Number.isNaN(score) && (
            <div className="shrink-0 text-right">
              <div className="text-xs text-gray-500">综合情绪分</div>
              <div className="text-3xl font-bold text-cyan-400">{Math.round(score)}</div>
            </div>
          )}
        </div>
      </DashboardCard>

      <SectionBlock index={1} title="行情定位" icon={<MapPin className="h-4 w-4 text-cyan-400" />}>
        <Line label="个股" value={report.market_position?.stock_quote} />
        <Line label="大盘" value={report.market_position?.market_quote} />
        <Line label="相对强弱" value={report.market_position?.relative_strength} />
        <Line label="波动特征" value={report.market_position?.volatility_character} />
        <Line label="市值坐标" value={report.market_position?.market_cap_tier} />
      </SectionBlock>

      <SectionBlock index={2} title="多因子透视" icon={<Layers className="h-4 w-4 text-violet-400" />}>
        <Line label="估值" value={report.multi_factor?.valuation} />
        <Line label="成长" value={report.multi_factor?.growth} />
        <Line label="动量" value={report.multi_factor?.momentum} />
        <Line label="质量" value={report.multi_factor?.quality} />
        <Line label="情绪" value={report.multi_factor?.sentiment} />
      </SectionBlock>

      <SectionBlock index={3} title="风险预警" icon={<AlertTriangle className="h-4 w-4 text-amber-400" />}>
        <Line label="灰犀牛" value={report.risk_alert?.gray_rhino} />
        <Line label="黑天鹅" value={report.risk_alert?.black_swan} />
      </SectionBlock>

      <SectionBlock index={4} title="战术建议" icon={<Compass className="h-4 w-4 text-sky-400" />}>
        <Line label="趋势跟踪" value={report.tactical?.trend_following} />
        <Line label="逆向投资" value={report.tactical?.contrarian} />
      </SectionBlock>

      <SectionBlock index={5} title="跟踪备忘录" icon={<NotebookPen className="h-4 w-4 text-fuchsia-400" />}>
        <Line label="关键时间节点" value={report.tracking_memo?.next_key_time_node} />
        <Line label="量价预警" value={report.tracking_memo?.volume_price_alert} />
      </SectionBlock>

      <SectionBlock index={6} title="四维分析" icon={<Box className="h-4 w-4 text-emerald-400" />}>
        <Line label="基本面" value={report.four_dimensions?.fundamental} />
        <Line label="行业面" value={report.four_dimensions?.industry} />
        <Line label="资金面" value={report.four_dimensions?.capital} />
        <Line label="技术面" value={report.four_dimensions?.technical} />
      </SectionBlock>

      <SectionBlock index={7} title="专业维度" icon={<Microscope className="h-4 w-4 text-indigo-400" />}>
        <Line label="静态估值" value={report.professional_dimensions?.static_valuation} />
        <Line label="动态估值" value={report.professional_dimensions?.dynamic_valuation} />
        <Line label="波动性" value={report.professional_dimensions?.volatility} />
        <Line label="机构调研" value={report.professional_dimensions?.institution_research} />
      </SectionBlock>

      <SectionBlock index={8} title="具体操作建议" icon={<HandCoins className="h-4 w-4 text-rose-400" />}>
        <Line label="止损/止跌" value={report.actionable?.stop_loss_triggers} />
        <Line label="仓位" value={report.actionable?.suggested_position} />
        <Line label="买入理由" value={report.actionable?.buy_reason} />
        <Line label="卖出理由" value={report.actionable?.sell_reason} />
      </SectionBlock>

      <div className="flex items-start gap-2 rounded-lg border border-white/5 bg-slate-800/30 p-3 text-xs text-gray-500">
        <Brain className="mt-0.5 h-4 w-4 shrink-0 text-gray-600" />
        <span>以上为模型生成的教育性整理，不构成投资建议。请结合自身风险承受能力独立决策。</span>
      </div>
    </div>
  );
}
