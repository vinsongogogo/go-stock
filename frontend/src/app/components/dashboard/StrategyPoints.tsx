import React from 'react';

interface SniperPoints {
  ideal_buy?: number | string;
  secondary_buy?: number | string;
  stop_loss?: number | string;
  take_profit?: number | string;
}

interface StrategyPointsProps {
  points?: SniperPoints;
}

interface StrategyItemProps {
  label: string;
  value?: number | string;
  colorVar: string;
}

function StrategyItem({ label, value, colorVar }: StrategyItemProps) {
  const displayValue = value !== undefined && value !== null
    ? (typeof value === 'number' ? `¥${value.toFixed(2)}` : value)
    : '—';

  return (
    <div className="relative bg-slate-800/40 rounded-lg p-3 border border-white/5">
      <div className="flex flex-col">
        <span className="text-xs text-gray-400 mb-1">{label}</span>
        <span
          className="text-lg font-bold font-mono"
          style={{ color: value ? `var(${colorVar})` : 'rgb(107, 114, 128)' }}
        >
          {displayValue}
        </span>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-lg"
        style={{
          background: value
            ? `linear-gradient(90deg, transparent, var(${colorVar}), transparent)`
            : 'transparent'
        }}
      />
    </div>
  );
}

export function StrategyPoints({ points }: StrategyPointsProps) {
  if (!points) return null;

  const items = [
    { label: '理想买入', value: points.ideal_buy, colorVar: '--color-success' },
    { label: '次优买入', value: points.secondary_buy, colorVar: '--color-info' },
    { label: '止损位', value: points.stop_loss, colorVar: '--color-danger' },
    { label: '止盈目标', value: points.take_profit, colorVar: '--color-warning' },
  ];

  const cssVars = {
    '--color-success': '#22c55e',
    '--color-info': '#3b82f6',
    '--color-danger': '#ef4444',
    '--color-warning': '#f59e0b',
  } as React.CSSProperties;

  return (
    <div style={cssVars}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs uppercase tracking-wider text-gray-400">STRATEGY POINTS</span>
        <span className="text-sm font-medium text-white">狙击点位</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((item) => (
          <StrategyItem key={item.label} {...item} />
        ))}
      </div>
    </div>
  );
}
