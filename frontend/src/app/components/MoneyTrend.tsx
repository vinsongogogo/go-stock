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
  ReferenceLine
} from 'recharts';
import { GetStockMoneyTrendByDay } from '../../../wailsjs/go/main/App';
import type { ProcessedMoneyTrendData } from '../types/longtiger';

interface MoneyTrendProps {
  code: string;
  name: string;
  days?: number;
  chartHeight?: number;
  darkTheme?: boolean;
}

// 将 SECUCODE 转换为 API 需要的格式
function convertCode(secuCode: string): string {
  const parts = secuCode.split('.');
  if (parts.length === 2) {
    return parts[1].toLowerCase() + parts[0];
  }
  return secuCode.toLowerCase();
}

export function MoneyTrend({
  code,
  name,
  days = 360,
  chartHeight = 500,
  darkTheme = true
}: MoneyTrendProps) {
  const [data, setData] = useState<ProcessedMoneyTrendData[]>([]);
  const [loading, setLoading] = useState(true);

  const textColor = darkTheme ? '#ccc' : '#456';
  const gridColor = darkTheme ? '#333' : '#eee';

  useEffect(() => {
    const convertedCode = convertCode(code);
    setLoading(true);
    GetStockMoneyTrendByDay(convertedCode, days).then((result: unknown) => {
      const rawData = result as Array<{ opendate: string; netamount: number; r0_net: number; trade: string }>;
      
      // 处理数据
      const processed = rawData.map((item, index) => {
        const netAmount = (item.netamount / 10000).toFixed(2);
        const r0Net = (item.r0_net / 10000).toFixed(2);
        const price = Number(item.trade);
        
        // 累计净流入计算
        let volume: string;
        if (index > 0) {
          const b = (Number(rawData[index].netamount) + Number(rawData[index - 1].netamount)) / 10000;
          volume = b.toFixed(2);
        } else {
          volume = (Number(rawData[index].netamount) / 10000).toFixed(2);
        }
        
        return {
          date: item.opendate,
          netAmount,
          r0Net,
          price,
          volume
        };
      });
      
      setData(processed);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [code, days]);

  // 计算价格范围
  const priceRange = useMemo(() => {
    if (data.length === 0) return { min: 0, max: 100 };
    const prices = data.map(d => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return {
      min: Math.max(0, min - 1),
      max: max + 1
    };
  }, [data]);

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

  return (
    <div style={{ width: '100%', height: chartHeight }}>
      <div 
        className="text-sm font-medium mb-2"
        style={{ color: textColor }}
      >
        {name} - 资金流向
      </div>
      <ResponsiveContainer width="100%" height={chartHeight - 30}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis 
            dataKey="date" 
            tick={{ fill: textColor, fontSize: 10 }}
            axisLine={{ stroke: gridColor }}
            tickLine={{ stroke: gridColor }}
          />
          <YAxis 
            yAxisId="left"
            tick={{ fill: textColor, fontSize: 10 }}
            axisLine={{ stroke: gridColor }}
            tickLine={{ stroke: gridColor }}
            label={{ value: '当日净流入/万', angle: -90, position: 'insideLeft', style: { fill: textColor } }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            domain={[priceRange.min, priceRange.max]}
            tick={{ fill: textColor, fontSize: 10 }}
            axisLine={{ stroke: gridColor }}
            tickLine={{ stroke: gridColor }}
            label={{ value: '股价', angle: 90, position: 'insideRight', style: { fill: textColor } }}
          />
          <YAxis 
            yAxisId="volume"
            orientation="right"
            hide
          />
          <Tooltip
            contentStyle={{
              backgroundColor: darkTheme ? '#1f2937' : '#fff',
              border: `1px solid ${darkTheme ? '#374151' : '#e5e7eb'}`,
              borderRadius: '4px',
              color: textColor
            }}
            labelStyle={{ color: textColor }}
          />
          <Legend 
            wrapperStyle={{ color: textColor }}
          />
          
          {/* 当日净流入 - 线图 */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="netAmount"
            name="当日净流入"
            stroke="#0d7dfc"
            strokeWidth={2}
            dot={false}
          />
          
          {/* 主力当日净流入 - 柱状图 */}
          <Bar
            yAxisId="left"
            dataKey="r0Net"
            name="主力当日净流入"
            fill="#82ca9d"
            opacity={0.6}
          />
          
          {/* 股价 - 线图 */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="price"
            name="股价"
            stroke="#f39509"
            strokeWidth={3}
            dot={false}
          />
          
          {/* 累计净流入 - 底部柱状图 */}
          <Bar
            yAxisId="volume"
            dataKey="volume"
            name="累计净流入"
            fill="#8884d8"
            opacity={0.5}
          />
          
          {/* 零线 */}
          <ReferenceLine y={0} yAxisId="left" stroke="#666" strokeDasharray="3 3" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
