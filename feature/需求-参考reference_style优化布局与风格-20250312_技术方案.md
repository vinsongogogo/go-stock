# 技术方案：参考 reference_style 优化本项目布局与风格

**对应需求文档**：`feature/需求-参考reference_style优化布局与风格-20250312.md`  
**本技术方案文件名**：`需求-参考reference_style优化布局与风格-20250312_技术方案.md`  
**技术方案版本**：20250312  
**对 AI Coding**：请严格按「7. 开发步骤」中的顺序实现，每步标明执行主体（人 / AI Coding）。

---

## 1. 需求依据与范围

- **目标**：以 `reference_style/` 为参照，重新优化本项目布局与视觉风格；深色主题、全屏渐变与光斑、侧栏与 reference 一致、增加 TopNav + MarketTicker 替代跑马灯、所有子页面统一新卡片风格；使用现有 CSS 变量 + 手写样式，不引入 Tailwind。
- **功能点覆盖**：

| 需求条目 | 对应方案章节 |
|----------|--------------|
| 5.1 主框架布局与视觉 | 3 数据与接口；5.1；6 UI/前端；7 步骤 1、2、3 |
| 5.2 侧栏风格与结构 | 5.2；6；7 步骤 2、4 |
| 5.3 内容区 TopNav、指数条与跑马灯替代 | 3；4 跨域；5.3；6；7 步骤 3、5 |
| 5.4 子页面与卡片风格 | 5.4；6；7 步骤 6、7 |

---

## 2. 架构与模块

- **本期范围**：仅前端（`frontend/`）。无后端 API 新增或变更；Wails 绑定沿用，复用 `GlobalStockIndexes` 供 MarketTicker 使用；`telegraph` 事件不再在主框架展示（由 n-marquee 替代为 TopNav + MarketTicker）。
- **涉及目录与文件**：
  - `frontend/src/theme/vars.css` — 深色主题变量（背景渐变、光斑色、侧栏、强调色、卡片、涨跌色等）
  - `frontend/src/style.css` — 全局基础样式、动画类（如 scroll）、滚动条隐藏
  - `frontend/src/App.vue` — 根布局：外层渐变+光斑、侧栏（含头部三色点+标题）、主内容区（TopNav + MarketTicker + RouterView）；移除 n-marquee；侧栏样式覆盖
  - `frontend/src/components/TopNav.vue` — **新增**，横向 tab（快讯、指数、核心指数…），选中态 cyan + 底部分割线，点击跳转 discovery 并 emit changeMarketTab
  - `frontend/src/components/MarketTicker.vue` — **新增**，指数横向滚动条，数据来自 GlobalStockIndexes 或静态列表
  - `frontend/src/components/*.vue` — 所有页面与列表组件统一使用新卡片类与变量（5.4、6）
- **依赖关系**：vars.css → style.css、App.vue、TopNav、MarketTicker、各子页面；App.vue 引用 TopNav、MarketTicker；TopNav 与路由/EventsEmit 联动。
- **技术选型**：不引入 Tailwind；使用现有 `theme/vars.css` 扩展深色变量 + 手写 CSS 还原 reference_style 视觉效果；侧栏继续使用 Naive `n-layout-sider` + `n-menu`，通过 class 与 :deep 覆盖样式达成毛玻璃、cyan 选中、三色点头部。

---

## 3. 数据与接口

- **数据模型**：无新增。MarketTicker 所需结构为 `{ name, code, change, isUp }[]`，由前端从 `GlobalStockIndexes()` 返回的 `res.common` / `res.america` 等结构转换，或首版使用静态数组（与 reference 一致）。
- **API**：无变更。沿用 `GlobalStockIndexes()`（`wailsjs/go/main/App`）作为指数条数据源；若返回结构无法直接映射，前端做一层适配或先用静态数据，后续再接活数据。
- **前端状态与事件**：
  - **telegraph**：App.vue 中移除 `n-marquee` 及对 `telegraph` 的展示；可保留 `EventsOn("telegraph", ...)` 仅更新 ref 供将来他用（如 discovery 页内小提示），或不再监听，以需求「替代」为准，本方案采用**移除主框架跑马灯展示及对 telegraph 的 UI 依赖**。
  - **TopNav**：当前路由为 discovery 时高亮对应 tab（由 `route.query.name` 或统一 state 决定）；点击 tab 即 `router.push({ name: 'discovery', query: { name: tabName } })` 并 `EventsEmit("changeMarketTab", { ID: 0, name: tabName })`，与现有侧栏行为一致。
  - **MarketTicker**：组件内 onMounted 调用 `GlobalStockIndexes()`，将结果转为 `{ name, code, change, isUp }[]` 用于渲染；若接口失败或结构不符，回退为静态列表（与 reference_style 中 MarketTicker 一致）。

---

## 4. 跨域/对外协议

本期不新增后端接口；前端与 Go 的对接沿用现有 Wails 绑定。

| 域/系统 | 协议形式 | 端点/方法 | 说明 |
|---------|----------|-----------|------|
| 前端 ↔ Go | Wails Call | `GlobalStockIndexes()` | 用于 MarketTicker 指数条数据；返回 `Record<string, any>`（含 common、america 等），前端适配为 ticker 列表。 |
| 前端 ↔ Go | Wails Events | `EventsEmit("changeMarketTab", { ID, name })` | 与现有一致；TopNav 点击时触发，market.vue 监听切换子 tab。 |
| 前端 ↔ Go | Wails Events | `telegraph` | 主框架不再展示；可保留 EventsOn 仅存数据或移除监听，见 3。 |

- **GlobalStockIndexes 返回结构**：以现有 `market.vue` 使用为准（`res.common`、`res.america` 等）；若为数组则每项需包含名称、点位/价格、涨跌幅，前端解析出 `name`、`code`、`change`、`isUp`。若结构不统一，方案阶段先采用**静态数据**实现 MarketTicker，接口适配在实现时按实际返回补充。

---

## 5. 代码级设计（含代码/伪代码）

### 5.1 深色主题变量与主框架外壳（渐变 + 光斑）

- **涉及文件**：`frontend/src/theme/vars.css`、`frontend/src/style.css`、`frontend/src/App.vue`
- **逻辑**：在 vars.css 中定义深色主题变量（背景渐变起止色、光斑色、侧栏背景/边框、强调色 cyan、卡片背景/边框、涨跌色等）；style.css 中 body/#app 使用这些变量，并新增 .scrollbar-hide、.animate-scroll（与 reference 一致）；App.vue 根节点增加一层包裹：全屏渐变背景 + 固定定位的装饰光斑（三处大圆 + blur），再内层为 flex 布局（侧栏 + 主内容区）。

**vars.css 新增/覆盖（深色主题）**：

```css
/* frontend/src/theme/vars.css - 深色主题，替代当前浅色 */
:root {
  /* 背景与氛围 */
  --surface-bg: #0f172a;           /* slate-900 主底 */
  --surface-bg-gradient-start: #020617;
  --surface-bg-gradient-mid: #172554;
  --surface-bg-gradient-end: #0f172a;
  --orb-blue: rgba(59, 130, 246, 0.1);
  --orb-purple: rgba(168, 85, 247, 0.1);
  --orb-cyan: rgba(34, 211, 238, 0.1);
  --blur-size: 80px;

  /* 侧栏 */
  --nav-bg: rgba(15, 23, 42, 0.5);
  --nav-blur: 24px;
  --nav-border: rgba(255, 255, 255, 0.1);
  --nav-width: 256px;
  --nav-collapsed-width: 56px;

  /* 主内容区 */
  --page-bg: transparent;

  /* 文字与强调 */
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --accent: #22d3ee;
  --accent-dim: rgba(34, 211, 238, 0.3);
  --border-default: rgba(255, 255, 255, 0.1);
  --up: #4ade80;
  --down: #f87171;

  /* 卡片 */
  --card-bg: rgba(15, 23, 42, 0.4);
  --card-border: rgba(255, 255, 255, 0.1);
  --card-border-hover: rgba(34, 211, 238, 0.3);
  --card-radius: 1rem;
  --font-sans: "DM Sans", "Segoe UI", system-ui, sans-serif;
}
```

**style.css 补充**：

```css
/* 在 frontend/src/style.css 中追加 */
body {
  background: var(--surface-bg);
  color: var(--text-primary);
}
.app-shell {
  min-height: 100vh;
  background: linear-gradient(to bottom right, var(--surface-bg-gradient-start), var(--surface-bg-gradient-mid), var(--surface-bg-gradient-end));
}
.app-orbs {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.app-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(var(--blur-size));
}
.scrollbar-hide {
  overflow-x: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar { display: none; }
@keyframes ticker-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-ticker {
  animation: ticker-scroll 30s linear infinite;
}
```

**App.vue template 结构调整（伪代码）**：

```html
<template>
  <n-config-provider ...>
    ...
    <div class="app-shell">
      <div class="app-orbs">
        <div class="app-orb" style="top:0;left:-16px;width:384px;height:384px;background:var(--orb-blue);"></div>
        <div class="app-orb" style="top:50%;right:0;width:384px;height:384px;background:var(--orb-purple);"></div>
        <div class="app-orb" style="bottom:0;left:33%;width:384px;height:384px;background:var(--orb-cyan);"></div>
      </div>
      <div class="app-main flex" style="position:relative;min-height:100vh">
        <n-layout-sider ... class="main-nav app-sidebar">
          <!-- 头部三色点 + 标题 -->
          <div class="sidebar-header">...</div>
          <n-menu ... />
        </n-layout-sider>
        <n-layout-content class="app-content">
          <TopNav />
          <MarketTicker />
          <n-spin ...>
            <n-scrollbar><RouterView /></n-scrollbar>
          </n-spin>
        </n-layout-content>
      </div>
    </div>
  </n-config-provider>
</template>
```

- 删除原 `<n-marquee>` 整块；TopNav、MarketTicker 为新组件，见 5.3。

### 5.2 侧栏风格与结构（毛玻璃、cyan 选中、头部、折叠保留）

- **涉及文件**：`frontend/src/App.vue`
- **逻辑**：侧栏容器使用 `main-nav app-sidebar`，通过 content-style 或 class 设置 `background: var(--nav-bg)`、`backdrop-filter: blur(var(--nav-blur))`、`border-right: 1px solid var(--nav-border)`。在 `n-menu` 上方增加头部区域：三个圆点（红/黄/绿）+ 标题文案「大聪明」（或产品约定）。菜单选中态通过 Naive 的 `n-menu-item-content--selected` 覆盖：左侧 2px 竖条 + 文字/图标色为 `var(--accent)`；hover 同理。折叠、拖拽区（`--wails-draggable: drag`）、隐藏到托盘、退出等交互与现有一致，不删不改。文案一律为本项目已有（偏好设置、关于我们、隐藏到托盘区等）。

**侧栏头部 HTML（在 n-layout-sider 内、n-menu 前）**：

```html
<div class="sidebar-header" style="padding: 1rem; border-bottom: 1px solid var(--nav-border); display: flex; align-items: center; gap: 0.5rem;">
  <span class="dot" style="width:12px;height:12px;border-radius:50%;background:#ef4444"></span>
  <span class="dot" style="width:12px;height:12px;border-radius:50%;background:#eab308"></span>
  <span class="dot" style="width:12px;height:12px;border-radius:50%;background:#22c55e"></span>
  <span style="margin-left:8px;font-size:14px;color:var(--text-secondary)">大聪明</span>
</div>
```

**侧栏与菜单样式（App.vue style 或 style.css）**：

```css
.app-sidebar.n-layout-sider,
.app-sidebar .n-layout-sider-scroll-content {
  background: var(--nav-bg) !important;
  backdrop-filter: blur(var(--nav-blur));
  border-right: 1px solid var(--nav-border);
}
.main-nav-menu .n-menu-item-content.n-menu-item-content--selected,
.main-nav-menu .n-menu-item-content.n-menu-item-content--selected .n-icon {
  color: var(--accent) !important;
}
.main-nav-menu .n-menu-item-content.n-menu-item-content--selected::before {
  border-left: 2px solid var(--accent);
}
```

- 保持 `collapse-mode="width"`、`:collapsed-width="56"`、`:width="240"`（可与 vars 中 `--nav-width` 统一为 256 若需与 reference 完全一致）。

### 5.3 TopNav 与 MarketTicker 组件；跑马灯移除

- **涉及文件**：`frontend/src/App.vue`（移除 marquee，引入并放置 TopNav、MarketTicker）、`frontend/src/components/TopNav.vue`（新建）、`frontend/src/components/MarketTicker.vue`（新建）
- **逻辑**：
  - **TopNav**：展示与 reference 一致的 tab 列表：快讯、指数、核心指数、行业榜、资金流向、龙虎榜、研报、公告、行业研究、热门、选股、精选。当前高亮由 `route.query.name`（当 `route.name === 'discovery'`）或本地 state 与 tab 对应。样式：横向滚动、选中项 `color: var(--accent)`、底部一条渐变线（如 `linear-gradient(to right, var(--accent), #3b82f6)`）。点击 tab：`router.push({ name: 'discovery', query: { name: tabLabel } })` 且 `EventsEmit("changeMarketTab", { ID: 0, name: tabLabel })`。注意与现有侧栏子项 name 一致（如「指数」对应「全球股指」时，以需求附录 A.2 为准，此处用「指数」等新文案）。
  - **MarketTicker**：单行横向滚动，内容为两段重复的指数列表以实现无限滚动效果。每项：名称 + 数值 + 涨跌（绿色/红色 + 箭头或 ±%）。数据来源：onMounted 调用 `GlobalStockIndexes()`，将 `common`、`america` 等数组合并并映射为 `{ name, code, change, isUp }[]`；若接口不可用或结构不符，使用静态数组（与 reference_style MarketTicker 一致）。样式：背景半透明、底边 `var(--border-default)`、内部 flex + `animate-ticker`、单项右边框、涨用 `var(--up)` 跌用 `var(--down)`。
  - **跑马灯**：删除 App.vue 中 `<n-marquee>` 及依赖 `telegraph`/`enableNews` 的展示逻辑；可选保留 `EventsOn("telegraph", ...)` 仅更新 ref 不渲染，或完全移除监听（以「替代」为最终行为）。

**TopNav.vue 伪代码**：

```vue
<!-- frontend/src/components/TopNav.vue -->
<script setup>
import { useRoute, useRouter } from 'vue-router'
import { EventsEmit } from '../../wailsjs/runtime'

const route = useRoute()
const router = useRouter()
const tabs = ['快讯', '指数', '核心指数', '行业榜', '资金流向', '龙虎榜', '研报', '公告', '行业研究', '热门', '选股', '精选']

function selectTab(tab) {
  router.push({ name: 'discovery', query: { name: tab } })
  EventsEmit('changeMarketTab', { ID: 0, name: tab })
}
</script>
<template>
  <div class="topnav scrollbar-hide" style="background:var(--nav-bg);backdrop-filter:blur(var(--nav-blur));border-bottom:1px solid var(--nav-border);display:flex;overflow-x:auto">
    <button v-for="t in tabs" :key="t" class="topnav-tab" :class="{ active: route.name==='discovery' && route.query?.name===t }" @click="selectTab(t)">
      {{ t }}
    </button>
  </div>
</template>
<style scoped>
.topnav-tab { padding: 1rem 1.5rem; color: var(--text-secondary); white-space: nowrap; position: relative; }
.topnav-tab:hover { color: var(--text-primary); }
.topnav-tab.active { color: var(--accent); }
.topnav-tab.active::after { content:''; position:absolute; left:0; right:0; bottom:0; height:2px; background: linear-gradient(to right, var(--accent), #3b82f6); }
</style>
```

**MarketTicker.vue 伪代码**：

```vue
<!-- frontend/src/components/MarketTicker.vue -->
<script setup>
import { ref, computed, onMounted } from 'vue'
import { GlobalStockIndexes } from '../../wailsjs/go/main/App'

const tickerList = ref([])
const defaultData = [
  { name: '上证指数', code: '4106.96', change: '-0.64%', isUp: false },
  { name: '深证成指', code: '14270.35', change: '+1.36%', isUp: true },
  /* ... 与 reference 一致若干条 ... */
]
function normalizeIndexData(res) {
  const out = []
  const keys = ['common', 'america', 'asia', 'europe', 'other']
  keys.forEach(k => {
    const arr = res?.[k]
    if (Array.isArray(arr)) arr.forEach(it => { out.push({ name: it.name ?? it.title, code: String(it.price ?? it.point ?? ''), change: it.changePercent ?? it.change ?? '', isUp: (it.changePercent ?? it.change ?? '').indexOf('+') >= 0 }) })
  })
  return out.length ? out : defaultData
}
onMounted(() => {
  GlobalStockIndexes().then(normalizeIndexData).then(list => { tickerList.value = list }).catch(() => { tickerList.value = defaultData })
})
const displayList = computed(() => [...tickerList.value, ...tickerList.value])
</script>
<template>
  <div class="market-ticker" style="background:rgba(15,23,42,0.2);backdrop-filter:blur(4px);border-bottom:1px solid var(--border-default);overflow:hidden">
    <div class="animate-ticker flex" style="width:max-content">
      <template v-for="(item, i) in displayList" :key="i">
        <div class="ticker-item" style="display:flex;align-items:center;gap:8px;padding:12px 24px;border-right:1px solid var(--border-default);white-space:nowrap">
          <span style="font-size:12px;color:var(--text-secondary)">{{ item.name }}</span>
          <template v-if="item.code">
            <span style="font-size:14px;font-family:monospace">{{ item.code }}</span>
            <span :style="{ color: item.isUp ? 'var(--up)' : 'var(--down)', fontSize: '12px' }">{{ item.change }}</span>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>
```

- 需在 MarketTicker 中补全 `defaultData` 列表及 `computed` 的 import；若 `GlobalStockIndexes` 返回结构不同，在 `normalizeIndexData` 中按实际字段名适配。

### 5.4 子页面与卡片风格（统一深色与毛玻璃卡片）

- **涉及文件**：`frontend/src/theme/vars.css`、`frontend/src/style.css`、`frontend/src/components/*.vue`（stock.vue、market.vue、researchIndex.vue、settings.vue、about.vue、agent-chat.vue、cron-task-manager.vue、fund.vue 及子组件如 newsList.vue、FloatingAiAssistant.vue 等）
- **逻辑**：为卡片容器提供统一 class（如 `.card-glass`）：背景 `var(--card-bg)`、边框 `var(--card-border)`、圆角 `var(--card-radius)`、backdrop-filter blur；hover 时边框 `var(--card-border-hover)`。各子页面根容器使用 `var(--page-bg)` 或透明，内容块使用 `.card-glass`；列表项、新闻块等采用与 reference NewsFeed 类似的卡片样式（左侧色条、时间、标签）。Naive 的 n-card、n-tabs 等通过 :deep 或 theme overrides 使用上述变量，使整体与主框架一致。浮动 AI 助手、弹窗（NModal/NDialog）背景与边框使用同一套变量。

**style.css 中卡片类**：

```css
.card-glass {
  background: var(--card-bg);
  backdrop-filter: blur(var(--nav-blur));
  border: 1px solid var(--card-border);
  border-radius: var(--card-radius);
}
.card-glass:hover {
  border-color: var(--card-border-hover);
}
```

- 各页面将原有 n-card 或内容块加上 `card-glass`，并确保内部文字使用 `var(--text-primary)` / `var(--text-secondary)`；n-tabs 的 tab 选中色使用 `var(--accent)`。具体在每个组件内替换或增加 class、必要时 :deep 覆盖 Naive 变量（如 `--n-card-color`、`--n-tab-color` 等）。

---

## 6. UI/前端结构

- **路由表**：无变更；沿用 `router.js` 中 watchlist、discovery、funds、assistant、lab、preferences、info、scheduler。
- **组件树（主框架）**：
  - `#app` → `n-config-provider` → 各 Provider → `div.app-shell` → `div.app-orbs` + `div.app-main` → `n-layout has-sider` → `n-layout-sider.main-nav.app-sidebar`（sidebar-header + n-menu）| `n-layout-content.app-content` → TopNav | MarketTicker | n-spin → n-scrollbar → RouterView。
- **主题/样式**：入口为 `main.js` 已引入的 `theme/vars.css` 与 `style.css`。深色主题由 vars.css 中 :root 变量统一控制；Naive 的 NConfigProvider 若需深色可继续使用现有 `enableDarkTheme`（darkTheme），与 vars 深色变量一致即可。

---

## 7. 开发步骤与执行顺序

（AI Coding 将**严格按本顺序**执行。）

| 步骤 | 内容简述 | 执行主体 | 输入依赖 | 产出 |
|------|----------|----------|----------|------|
| 1 | 深色主题变量与基础样式：在 theme/vars.css 中定义深色变量（背景渐变、光斑、侧栏、强调色、卡片、涨跌色）；在 style.css 中增加 .app-shell、.app-orbs、.app-orb、.scrollbar-hide、.animate-ticker、.card-glass | AI Coding | 本方案 5.1、5.4 | vars.css、style.css 更新 |
| 2 | 主框架外壳与光斑：在 App.vue 的 template 最外层增加 app-shell、app-orbs 及三处 app-orb；主内容区包在 app-main；确保 n-config-provider 等结构不变 | AI Coding | 步骤 1 | App.vue template 结构 |
| 3 | 侧栏头部与样式：在 n-layout-sider 内 n-menu 前增加 sidebar-header（三色点 + 「大聪明」）；在 App.vue style 或 style.css 中增加 .app-sidebar、.main-nav-menu 的深色与选中态样式（毛玻璃、cyan、左边框） | AI Coding | 步骤 1、5.2 | App.vue 侧栏结构及样式 |
| 4 | 移除跑马灯并增加 TopNav、MarketTicker：删除 n-marquee 块及对 telegraph 的展示依赖；新建 TopNav.vue（tab 列表、路由与 EventsEmit）、MarketTicker.vue（GlobalStockIndexes 或静态数据、animate-ticker）；在 App.vue 中引入并置于 n-layout-content 内 TopNav → MarketTicker → n-spin | AI Coding | 步骤 2、5.3；需求 5.3 | TopNav.vue、MarketTicker.vue、App.vue 更新 |
| 5 | MarketTicker 数据对接：在 MarketTicker.vue 中 onMounted 调用 GlobalStockIndexes，实现 normalizeIndexData 将返回结构转为 { name, code, change, isUp }[]；失败或空时使用静态 defaultData | AI Coding | 步骤 4；4 跨域 | MarketTicker.vue 数据逻辑 |
| 6 | 子页面与卡片风格：在 market.vue、stock.vue、researchIndex.vue、settings.vue、about.vue、fund.vue、agent-chat.vue、cron-task-manager.vue 等页面根容器与内容块应用 .card-glass 及变量；统一 n-card、n-tabs 等组件的颜色变量（:deep 或 themeOverrides） | AI Coding | 步骤 1、5.4 | 各页面组件样式 |
| 7 | 浮动助手与弹窗主题：FloatingAiAssistant.vue 及使用 NModal/NDialog 的组件，背景与边框改为使用 vars 中卡片/边框变量，与主框架一致 | AI Coding | 步骤 1、5.4 | FloatingAiAssistant 等样式 |

---

## 8. 需与产品再对焦（若有）

- 无。若实现时发现 TopNav 的 tab 与 discovery 子 tab 名称不完全一致（如侧栏为「全球股指」而 TopNav 为「指数」），以需求文档附录 A.2 及现有 menuOptions 的 label 为准统一即可。

---

## 9. 需用户决策（若有）

- 无。技术选型已按需求确认：不引入 Tailwind，使用现有 CSS 变量 + 手写样式。

---

*技术方案由「详细技术方案设计」技能产出；实现时以本方案与对应需求文档为准。*

**对 AI Coding**：请严格按「7. 开发步骤」中的顺序实现；每步产出完成后再进行下一步。
