# new_frontend_vue

Vue 3 实现的金融看板首页，界面与 new_frontend（React）一致，业务逻辑参考 frontend（Vue）的 Wails 调用。

## 技术栈

- Vue 3 + Composition API + `<script setup>`
- Vite 6
- Tailwind CSS 3
- 与 frontend 共用同一套 `wailsjs`（已复制到本目录）

## 业务逻辑来源

- **App 级数据**：`composables/useAppData.js` 对应 frontend 的 `App.vue`（GetConfig、GetGroupList、GetVersionInfo、GlobalStockIndexes、EventsOn telegraph/loadingMsg/realtime_profit、首屏 loading 与 8 秒超时）。
- **行情条**：与 frontend `layout/MarketTicker.vue` 一致，由 GlobalStockIndexes + telegraph 合并为 tickerItems。
- **资讯流**：与 frontend `market.vue` + `newsList.vue` 一致，GetTelegraphList / ReFleshTelegraphList 三个频道（财联社电报、新浪财经、外媒）。

## 开发与构建

```bash
npm install
npm run dev    # 开发
npm run build  # 产出 dist/
```

## 作为 Wails 前端使用

1. 在项目根目录 `wails.json` 中设置：
   - `"frontend:dir": "new_frontend_vue"`
2. 在 `main.go` 中将 embed 改为：
   - `//go:embed new_frontend_vue/dist`
3. 执行 `wails build` 或 `wails dev`。
