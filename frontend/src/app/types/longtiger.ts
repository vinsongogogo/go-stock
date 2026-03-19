// 龙虎榜相关类型定义

/**
 * 龙虎榜数据模型
 */
export interface LongTigerRankData {
  ACCUM_AMOUNT: number;           // 市场总成交额
  BILLBOARD_BUY_AMT: number;      // 龙虎榜买入额
  BILLBOARD_DEAL_AMT: number;     // 龙虎榜成交额
  BILLBOARD_NET_AMT: number;      // 龙虎榜净买额
  BILLBOARD_SELL_AMT: number;     // 龙虎榜卖出额
  CHANGE_RATE: number;            // 涨跌幅
  CLOSE_PRICE: number;            // 收盘价
  DEAL_AMOUNT_RATIO: number;      // 成交额占总成交比
  DEAL_NET_RATIO: number;         // 净买额占总成交比
  EXPLAIN: string;                // 解读
  EXPLANATION: string;            // 上榜原因
  FREE_MARKET_CAP: number;        // 流通市值
  SECUCODE: string;               // 股票代码（带后缀，如 000001.SZ）
  SECURITY_CODE: string;          // 股票代码
  SECURITY_NAME_ABBR: string;     // 股票名称
  SECURITY_TYPE_CODE: string;     // 股票类型代码
  TRADE_DATE: string;             // 交易日期
  TURNOVERRATE: number;           // 换手率
}

/**
 * K 线数据
 */
export interface KLineData {
  day: string;      // 日期
  open: string;     // 开盘价
  close: string;    // 收盘价
  low: string;      // 最低价
  high: string;     // 最高价
  volume: string;   // 成交量
}

/**
 * 资金流向数据
 */
export interface MoneyTrendData {
  opendate: string;     // 日期
  netamount: number;    // 当日净流入
  r0_net: number;       // 主力当日净流入
  trade: string;        // 股价
}

/**
 * 处理后的 K 线数据（用于 Recharts）
 */
export interface ProcessedKLineData {
  date: string;
  open: number;
  close: number;
  low: number;
  high: number;
  volume: number;
  ma5: number | string;
  ma10: number | string;
  ma20: number | string;
  ma30: number | string;
}

/**
 * 处理后的资金流向数据（用于 Recharts）
 */
export interface ProcessedMoneyTrendData {
  date: string;
  netAmount: string;
  r0Net: string;
  price: number;
  volume: string;
}
