import { useEffect, useState, useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import { GetStockKLine } from '../../../wailsjs/go/main/App';
import type { ProcessedKLineData } from '../types/longtiger';

interface KLineChartProps {
  code: string;
  stockName: string;
  kDays?: number;
  chartHeight?: number;
  darkTheme?: boolean;
}

// 计算移动平均线
function calculateMA(dayCount: number, values: { close: number }[], currentIndex: number): number | string {
  if (currentIndex < dayCount - 1) {
    return '-';
  }
  let sum = 0;
  for (let j = 0; j < dayCount; j++) {
    sum += values[currentIndex - j].close;
  }
  return Number((sum / dayCount).toFixed(2));
}

// 将 SECUCODE 转换为 API 需要的格式
function convertCode(secuCode: string): string {
  // 000001.SZ -> sz000001
  const parts = secuCode.split('.');
  if (parts.length === 2) {
    return parts[1].toLowerCase() + parts[0];
  }
  return secuCode.toLowerCase();
}

export function KLineChart({
  code,
  stockName,
  kDays = 20,
  chartHeight = 500,
  darkTheme = true
}: KLineChartProps) {
  const [data, setData] = useState<ProcessedKLineData[]>([]);
  const [loading, setLoading] = useState(true);

  const textColor = darkTheme ? '#ccc' : '#456';
  const gridColor = darkTheme ? '#333' : '#eee';
  const upColor = '#ec0000';
  const downColor = '#00da3c';

  useEffect(() => {
    const convertedCode = convertCode(code);
    setLoading(true);
    GetStockKLine(convertedCode, stockName, 365).then((result: unknown) => {
      const rawData = result as Array<{ day: string; open: string; close: string; low: string; high: string; volume: string }>;
      
      // 处理数据
      const processed = rawData.map((item, index, arr) => ({
        date: item.day,
        open: Number(item.open),
        close: Number(item.close),
        low: Number(item.low),
        high: Number(item.high),
        volume: Number(item.volume) / 10000,
        ma5: calculateMA(5, arr.map(d => ({ close: Number(d.close) })), index),
        ma10: calculateMA(10, arr.map(d => ({ close: Number(d.close) })), index),
        ma20: calculateMA(20, arr.map(d => ({ close: Number(d.close) })), index),
        ma30: calculateMA(30, arr.map(d => ({ close: Number(d.close) })), index),
      }));
      
      setData(processed);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [code, stockName]);

  // 只显示最近 kDays 天的数据
  const displayData = useMemo(() => {
    if (data.length <= kDays) return data;
    return data.slice(data.length - kDays);
  }, [data, kDays]);

  // 自定义 K 线形状
  const CustomCandlestick = (props: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    payload?: { open: number; close: number; low: number; high: number };
  }) => {
    const { x = 0, y = 0, width = 0, payload } = props;
    if (!payload) return null;
    
    const { open, close, low, high } = payload;
    const isUp = close >= open;
    const color = isUp ? upColor : downColor;
    
    const bodyTop = Math.min(open, close);
    const bodyBottom = Math.max(open, close);
    const bodyHeight = Math.abs(close - open);
    
    // 计算 Y 轴比例（简化版，实际应该根据 YAxis 的 domain 计算）
    const chartHeight = 300;
    const maxPrice = Math.max(...displayData.map(d => d.high));
    const minPrice = Math.min(...displayData.map(d => d.low));
    const priceRange = maxPrice - minPrice || 1;
    
    const scaleY = (price: number) => chartHeight - ((price - minPrice) / priceRange) * chartHeight;
    
    const x1 = x + width / 2;
    const bodyY = scaleY(bodyTop);
    const bodyH = Math.max(1, scaleY(bodyBottom) - scaleY(bodyTop));
    
    return (
      <g>
        {/* 上影线 */}
        <line
          x1={x1}
          y1={scaleY(high)}
          x2={x1}
          y2={bodyY}
          stroke={color}
          strokeWidth={1}
        />
        {/* 下影线 */}
        <line
          x1={x1}
          y1={bodyY + bodyH}
          x2={x1}
          y2={scaleY(low)}
          stroke={color}
          strokeWidth={1}
        />
        {/* 实体 */}
        <rect
          x={x + 1}
          y={bodyY}
          width={Math.max(2, width - 2)}
          height={Math.max(1, bodyH)}
          fill={color}
        />
      </g>
    );
  };

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center"
        style={{ height: chartHeight }}
      >
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center"
        style={{ height: chartHeight }}
      >
        <div className="text-gray-400">暂无数据</div>
      </div>
    );
  }

  const latestData = data[data.length - 1];
  const prevData = data[data.length - 2];
  const changePercent = prevData 
    ? ((latestData.close - prevData.close) / prevData.close * 100).toFixed(2)
    : '0.00';
  const titleColor = Number(changePercent) >= 0 ? upColor : downColor;

  return (
    <div style={{ width: '100%', height: chartHeight }}>
      <div 
        className="text-sm font-medium mb-2"
        style={{ color: titleColor }}
      >
        {stockName} {latestData.date} {latestData.close} {changePercent}%
      </div>
      <ResponsiveContainer width="100%" height={chartHeight - 30}>
        <ComposedChart data={displayData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <XAxis 
            dataKey="date" 
            tick={{ fill: textColor, fontSize: 10 }}
            axisLine={{ stroke: gridColor }}
            tickLine={{ stroke: gridColor }}
          />
          <YAxis 
            yAxisId="price"
            domain={['auto', 'auto']}
            tick={{ fill: textColor, fontSize: 10 }}
            axisLine={{ stroke: gridColor }}
            tickLine={{ stroke: gridColor }}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <YAxis 
            yAxisId="volume"
            orientation="right"
            tick={{ fill: textColor, fontSize: 10 }}
            axisLine={{ stroke: gridColor }}
            tickLine={{ stroke: gridColor }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: darkTheme ? '#1f2937' : '#fff',
              border: `1px solid ${darkTheme ? '#374151' : '#e5e7eb'}`,
              borderRadius: '4px',
              color: textColor
            }}
            labelStyle={{ color: textColor }}
            formatter={(value: number, name: string) => {
              if (name === '成交量') return [`${value.toFixed(2)}万手`, name];
              return [value, name];
            }}
          />
          <Legend 
            wrapperStyle={{ color: textColor }}
          />
          
          {/* 收盘价线作为 K 线简化表示 */}
          <Bar
            dataKey="close"
            yAxisId="price"
            name="收盘价"
            fill="#8884d8"
          >
            {displayData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.close >= entry.open ? upColor : downColor}
              />
            ))}
          </Bar>
          
          {/* 均线 */}
          <Line
            type="monotone"
            dataKey="ma5"
            yAxisId="price"
            name="MA5"
            stroke="#8884d8"
            dot={false}
            strokeWidth={1}
          />
          <Line
            type="monotone"
            dataKey="ma10"
            yAxisId="price"
            name="MA10"
            stroke="#82ca9d"
            dot={false}
            strokeWidth={1}
          />
          <Line
            type="monotone"
            dataKey="ma20"
            yAxisId="price"
            name="MA20"
            stroke="#ffc658"
            dot={false}
            strokeWidth={1}
          />
          <Line
            type="monotone"
            dataKey="ma30"
            yAxisId="price"
            name="MA30"
            stroke="#ff7300"
            dot={false}
            strokeWidth={1}
          />
          
          {/* 成交量 */}
          <Bar
            dataKey="volume"
            yAxisId="volume"
            name="成交量"
            fill="#7fbe9e"
            opacity={0.5}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
