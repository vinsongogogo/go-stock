# 项目通识（Common Knowledge）

由自我优化技能在功能完成或纠正沉淀后补充。以下为各 feature 的入口、调用关系、依赖与设计原因等，供需求澄清与技术方案设计时引用。

---

## 龙虎榜功能

### 入口与调用

**入口位置：**
- Sidebar 菜单："龙虎榜"
- 路由 view：`longtiger`

**调用链：**
```
Sidebar (点击"龙虎榜") 
  -> App.tsx (setCurrentView('longtiger'))
    -> LongTigerRank.tsx (主组件)
      -> LongTigerRank() (Wails API)
        -> Go backend: market_news_api.go LongTiger()
```

**悬停交互：**
```
股票名称悬停 -> KLineChart.tsx -> GetStockKLine()
净买额悬停 -> MoneyTrend.tsx -> GetStockMoneyTrendByDay()
```

### 涉及文件

| 文件 | 说明 |
|-----|------|
| `frontend/src/app/components/LongTigerRank.tsx` | 龙虎榜主组件 |
| `frontend/src/app/components/KLineChart.tsx` | K 线图组件 |
| `frontend/src/app/components/MoneyTrend.tsx` | 资金流向组件 |
| `frontend/src/app/types/longtiger.ts` | 类型定义 |
| `frontend/src/app/App.tsx` | 集成路由 |
| `frontend/src/app/components/Sidebar.tsx` | 菜单入口 |

### 依赖服务

- **后端 API**：`LongTigerRank(date)` - 获取龙虎榜数据
- **后端 API**：`GetStockKLine(code, name, days)` - 获取 K 线数据
- **后端 API**：`GetStockMoneyTrendByDay(code, days)` - 获取资金流向数据

### 设计原因

1. **从 Vue 重新实现**：React 前端使用 Recharts 而非 ECharts，需要重新实现图表组件
2. **悬停交互**：采用固定定位弹窗而非 Popover 组件，避免嵌套层级问题
3. **自动回退**：当天无数据时自动查询前一日，最多回退 7 天

---

## AI 股票分析功能

### 入口与调用

**入口位置：**
- Sidebar 菜单："AI股票分析"
- 路由 view：`aianalysis`
- 页面内 Tab 切换：「实时分析」（默认）/ 「历史记录」

**调用链（实时分析）：**
```
Sidebar (点击"AI股票分析")
  -> App.tsx (setCurrentView('aianalysis'))
    -> AIAnalysis.tsx (activeTab='analysis')
      -> NewChatStream() (Wails API, 流式分析)
      -> SaveAIResponseResult() (保存结果)
      -> GetAIResponseResult() (加载历史结果)
```

**调用链（历史记录 Tab）：**
```
AIAnalysis.tsx (activeTab='history')
  -> AnalysisHistory.tsx (embedded=true)
    -> GetAIResponseResultList() (分页查询)
    -> DeleteAIResponseResult() (单条删除)
    -> BatchDeleteAIResponseResult() (批量删除)
```

### 涉及文件

| 文件 | 说明 |
|-----|------|
| `frontend/src/app/components/AIAnalysis.tsx` | AI 分析主组件（含 Tab 切换） |
| `frontend/src/app/components/AnalysisHistory.tsx` | 历史记录子组件（支持 embedded 模式） |
| `frontend/src/app/App.tsx` | 集成路由 |
| `frontend/src/app/components/Sidebar.tsx` | 菜单入口 |
| `backend/data/ai_response_result_api.go` | 后端历史记录数据服务 |
| `backend/models/models.go` | AIResponseResult 数据模型 |

### 依赖服务

- **后端 API**：`NewChatStream(stock, stockCode, question, sysPromptId, tools, think)` - 流式 AI 分析
- **后端 API**：`SaveAIResponseResult(stockCode, stockName, result, chatId, question, aiConfigId)` - 保存分析结果
- **后端 API**：`GetAIResponseResultList(query)` - 分页查询历史记录
- **后端 API**：`DeleteAIResponseResult(id)` / `BatchDeleteAIResponseResult(ids)` - 删除记录

### 设计原因

1. **Tab 整合**：历史记录以 Tab 方式内嵌在 AI 分析页面，而非独立页面，减少导航跳转
2. **embedded 模式**：AnalysisHistory 组件支持 `embedded` prop，嵌入时隐藏独立头部，保持视觉一致性
3. **结构化 + Fallback**：AI 输出优先解析 JSON 结构化数据渲染卡片，解析失败降级到 Markdown 分块渲染
4. **分批加载**：初始化时每批 5 个并发加载历史结果，避免服务器压力

---

## 行情中心（Dashboard）- 数据源与展示优化

### 入口与调用

**入口位置：**
- Sidebar 菜单："行情中心"
- 路由 view：`dashboard`
- 主组件：`Dashboard.tsx`

### 子模块与调用链

#### 1. 市场情绪强弱（MarketGauge.tsx）

**调用链：**
```
MarketGauge.tsx 
  -> App.GetMarketSentimentScore() 
    -> market_news_api.go GetMarketSentimentMultiDimensional()
```

**数据来源：** 东方财富爬虫（涨跌停、涨跌家数、北向资金）+ 现有 NLP 情感分析

**评分模型：** 涨跌停 30% + 涨跌家数 25% + 北向资金 20% + NLP 情感 25%，固定默认权重

**刷新频率：** 60 秒

#### 2. 行业热力图（TreeMap.tsx 左侧）

**调用链：**
```
TreeMap.tsx 
  -> App.GetIndustryHeatMap() 
    -> market_news_api.go GetIndustryHeatMap()
      -> GetIndustryRank（腾讯财经）
      -> GetIndustryMoneyRankSina（新浪）
```

**刷新频率：** 5 分钟

#### 3. 24H 热词（TreeMap.tsx 右侧）

**调用链：**
```
TreeMap.tsx 
  -> App.GetHotWords() 
    -> market_news_api.go GetHotWords() 
      -> NewsAnalyze()
```

**刷新频率：** 60 分钟

#### 4. 事件时间轴（NewsFeed.tsx 内 EventTimeline 组件）

**调用链：**
```
NewsFeed.tsx EventTimeline 
  -> App.GetMarketEvents() 
    -> market_news_api.go GetMarketEvents()
```

**事件源：** 重要快讯(isRed) + 行业异动(涨跌幅>3%) + 北向资金异动(>50亿)

**刷新频率：** 5 分钟

#### 5. Tushare 快讯（NewsFeed.tsx 第四频道）

**调用链：**
```
NewsFeed.tsx 
  -> App.FetchTushareNews(src) 
    -> tushare_data_api.go GetNews()
```

**存储：** Telegraph 表，Source="tushare"

**注意：** 需单独申请 tushare news 权限

### 涉及文件

| 文件 | 说明 |
|-----|------|
| `backend/data/market_news_api.go` | 市场情绪、行业热力图、热词、事件等 API |
| `backend/data/tushare_data_api.go` | Tushare 快讯 API |
| `app.go` | Wails 绑定入口 |
| `frontend/src/app/components/Dashboard.tsx` | 行情中心主组件 |
| `frontend/src/app/components/MarketGauge.tsx` | 市场情绪强弱组件 |
| `frontend/src/app/components/TreeMap.tsx` | 行业热力图 + 24H 热词组件 |
| `frontend/src/app/components/NewsFeed.tsx` | 快讯 + 事件时间轴组件 |

### 依赖服务

- **后端 API**：`GetMarketSentimentScore()` - 获取多维度市场情绪评分
- **后端 API**：`GetIndustryHeatMap()` - 获取行业热力图数据
- **后端 API**：`GetHotWords()` - 获取 24H 热词
- **后端 API**：`GetMarketEvents()` - 获取市场重要事件
- **后端 API**：`FetchTushareNews(src)` - 获取 Tushare 快讯

### 设计原因

1. **多数据源整合**：行业热力图整合腾讯财经和新浪两个数据源，提高数据可靠性
2. **多维度情绪评分**：综合涨跌停、涨跌家数、北向资金、NLP 情感四个维度，更全面反映市场情绪
3. **事件聚合**：将重要快讯、行业异动、北向资金异动整合到时间轴，便于用户快速把握市场动态
4. **分层刷新**：不同模块采用不同刷新频率，平衡数据实时性和系统负载

---

