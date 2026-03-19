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

