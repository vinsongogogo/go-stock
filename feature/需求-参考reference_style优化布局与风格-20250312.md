# 需求文档：参考 reference_style 优化本项目布局与风格

## 1. 需求概述

- **目标**：以项目内 `reference_style/` 参考项目的风格和布局为参照，重新优化本项目的布局与视觉风格，使主框架与内容区在布局结构、色彩、组件形态上向参考风格靠拢。
- **背景/价值**：产品希望以 reference_style 作为设计参考，统一并提升前端视觉与布局一致性；可与既有「前端布局与样式改版」需求配合，明确「改成什么样」的参照物。

## 2. 业务通识摘要

- **当前无 `通识.md`**，建议在项目根或 `docs/` 下补充业务名词与规则。
- 与本需求相关的现有约定：
  - 应用为 Wails 桌面端，前端技术栈：**Vue 3 + Vite**，**Naive UI** + TDesign Vue Next，Vue Router（Hash）。
  - 主窗口标题为「大聪明」；主导航为左侧边栏 + 右侧内容区；路由含：自选列表、行情中心（发现）、基金、智能助手、研究、偏好设置、关于我们、计划任务等（参见 `feature/需求-前端布局与样式改版-20250312.md` 附录 A）。
  - **reference_style** 为仓库内独立参考项目：**React + Vite + Tailwind CSS v4**，lucide-react 图标；用于展示一套「大盘阴」风格的行情/资讯界面，不作为本应用运行时的一部分。

## 3. 现状与代码结论

### 3.1 reference_style 风格与布局要点（参照物）

| 维度 | 说明 | 典型实现位置 |
|------|------|--------------|
| **整体布局** | 左侧固定侧栏 + 右侧主内容区；全屏深色渐变背景 + 固定装饰性模糊光斑（无交互）。 | `reference_style/src/app/App.tsx` |
| **背景与氛围** | 深色：`bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900`；前景白字；光斑为 `bg-blue-500/10`、`bg-purple-500/10`、`bg-cyan-500/10` 等大圆 + `blur-3xl`。 | 同上 |
| **侧栏** | 固定宽度（Tailwind `w-64`）；`bg-slate-900/50 backdrop-blur-xl border-r border-white/10`；头部三色圆点 + 标题「大盘阴」；自选列表区；可展开/收起的菜单项（如「行情中心」下快讯/指数/核心指数）；底部「研究」「宿舍设置」「关于我们」「隐藏到托盘区」。 | `reference_style/src/app/components/Sidebar.tsx` |
| **主内容区结构** | 自上而下：**TopNav**（横向 tab，选中 cyan 高亮 + 底部分割线）→ **MarketTicker**（横向无限滚动指数条）→ **主内容**（max-w-[1600px] 居中，如热词、仪表盘、树图、新闻卡片）。 | `App.tsx`、`TopNav.tsx`、`MarketTicker.tsx` |
| **顶栏 Tab** | 横向滚动 tab：快讯、指数、核心指数、行业榜、资金流向、龙虎榜、研报、公告、行业研究、热门、选股、精选；选中态 `text-cyan-400` + 底部渐变线 `from-cyan-500 to-blue-500`。 | `TopNav.tsx` |
| **指数滚动条** | 单行横向滚动，重复两段数据形成无限滚动；每项：名称 + 数值 + 涨跌（绿色/红色 + 箭头）；`animate-scroll`、`scrollbar-hide`。 | `MarketTicker.tsx` |
| **内容卡片** | 圆角 `rounded-2xl`、`border border-white/10`、`bg-slate-900/40 backdrop-blur-xl`、`hover:border-cyan-500/30`；标题区带色条装饰；新闻列表为卡片列表 + 时间/标签 + 「查看更多」。 | `MarketGauge.tsx`、`TreeMap.tsx`、`NewsFeed.tsx` |
| **强调色** | 主强调色 cyan（如 `text-cyan-400`、`border-cyan-400`、渐变）；涨/跌为 green/red。 | 各组件 |
| **技术栈** | React、Tailwind CSS、lucide-react；无 Naive UI。 | `reference_style/package.json`、各 tsx |

### 3.2 本项目当前实现（对比）

| 维度 | 当前实现 | 与 reference_style 差异 |
|------|----------|--------------------------|
| **整体布局** | `n-layout has-sider` + `n-layout-sider`（宽 240，折叠 56）+ `n-layout-content`。 | 仍是左侧栏 + 内容区，但无全屏渐变与光斑；无 TopNav 与 MarketTicker 两层结构。 |
| **背景与氛围** | `theme/vars.css` 浅色变量（`--surface-bg: #f0f4f8`、`--nav-bg: #e8ecf1`、`--page-bg: #ffffff`）；`style.css` 用 `var(--surface-bg)`。 | 浅色 vs 参考的深色；无渐变与装饰光斑。 |
| **侧栏** | `n-menu` 垂直菜单，`main-nav` 类 + 主题变量；自选分组、行情中心子项、基金、智能助手、研究、设置、关于、隐藏/退出等。 | 功能结构类似，视觉不同（无毛玻璃、无 cyan 高亮、无「大盘阴」头部）；存在「宿舍设置」等参考项目占位文案需区分。 |
| **内容区** | 顶部 `n-marquee` 跑马灯（telegraph）→ `n-scrollbar` → `RouterView`；无独立 TopNav 与指数滚动条。 | 跑马灯与 reference 的 MarketTicker 形态不同；无页面级横向 tab 条（行情子 tab 在侧栏或各页面内）。 |
| **子页面** | 各路由对应组件（stock、market、researchIndex、settings、about、agent-chat、cron-task-manager、fund）；多使用 `n-card`、`n-tabs`、`n-grid`。 | 未采用参考的圆角毛玻璃卡片、cyan 边框与 hover 效果。 |

### 3.3 涉及模块/路径

| 类型 | 路径/说明 |
|------|-----------|
| 参考源 | `reference_style/src/app/App.tsx`，`reference_style/src/app/components/*.tsx`，`reference_style/src/styles/*.css` |
| 本项目根布局 | `frontend/src/App.vue` |
| 本项目全局样式 | `frontend/src/style.css`，`frontend/src/theme/vars.css` |
| 本项目路由与页面 | `frontend/src/router/router.js`，`frontend/src/components/*.vue`（如 `market.vue`、`stock.vue`、`researchIndex.vue` 等） |

### 3.4 与需求差异小结

- 需求为「参考 reference_style 优化布局与风格」，当前项目在**布局层次**（无 TopNav + MarketTicker 双栏）、**视觉体系**（浅色 vs 深色、无渐变与光斑、无毛玻璃与 cyan 强调）、**卡片与内容区形态**上均与 reference_style 不一致；需产品确认参考范围与技术选型后再落明细。

## 4. 待产品确认（已澄清）

| 序号 | 不明确点 | 产品确认结论 |
|------|----------|--------------|
| 1 | **参考范围**：是否主框架与行情页均按 reference_style 做？其他页是否一并统一同一套风格？ | **所有页面都按照新风格做**（主框架 + 行情中心 + 自选、基金、研究、设置、关于等全部统一）。 |
| 2 | **主题取向**：是否必须改为深色？ | **是**，改为深色主题（与 reference 一致）。 |
| 3 | **内容区结构**：是否增加 TopNav + MarketTicker？与现有 n-marquee 的关系？ | **增加** TopNav 与指数横向滚动条（MarketTicker），**替代**现有 n-marquee 跑马灯（telegraph）。 |
| 4 | **技术选型**：是否引入 Tailwind？ | **不引入**；使用**现有 CSS 变量**（theme/vars.css）+ Naive/手写样式还原参考视觉。 |
| 5 | **参考项目中的占位/错误文案**：是否以本项目文案为准？ | **不采纳参考里的文案**；一律使用本项目已有菜单与页面文案（如「偏好设置」「关于我们」等）。 |
| 6 | **侧栏形态**：是否与 reference 一致？折叠/拖拽/隐藏托盘是否保留？ | **与 reference 保持一致**（毛玻璃、白边、cyan 选中、可展开子项、头部三色点 + 标题）；折叠、拖拽、隐藏到托盘等交互**必须保留**。 |

## 5. 澄清后需求明细

### 5.1 主框架布局与视觉

- **描述**：整体改为深色主题；全屏深色渐变背景 + 固定装饰性模糊光斑（无交互）；主区域为「左侧固定侧栏 + 右侧主内容区」。主内容区自上而下为：TopNav（横向 tab）→ MarketTicker（指数滚动条）→ RouterView。使用现有 CSS 变量体系（在 theme/vars.css 中新增/调整深色变量）与手写样式还原 reference_style 的视觉效果，不引入 Tailwind。
- **验收标准**：首屏为深色渐变与光斑；布局层次为侧栏 + TopNav + MarketTicker + 内容；色系、圆角、边框风格与 reference 视觉一致；无旧版浅色首屏暴露。
- **涉及端/模块**：`frontend/src/App.vue`、`frontend/src/theme/vars.css`、`frontend/src/style.css`。

### 5.2 侧栏风格与结构

- **描述**：侧栏视觉与 reference 一致：毛玻璃（半透明 + backdrop-blur）、右边框白边、选中项 cyan 高亮与左侧竖条、可展开/收起子项；头部增加三色圆点 + 标题（如应用名「大聪明」或与产品约定的标题）；底部保留「研究」「偏好设置」「关于我们」「隐藏到托盘区」等，**文案一律采用本项目已有菜单文案**，不采纳 reference 中的「宿舍设置」等占位文案。保留现有折叠（宽度/折叠宽度）、拖拽区、隐藏到托盘、退出等交互。
- **验收标准**：侧栏观感与 reference Sidebar 一致（毛玻璃、白边、cyan 选中、可展开子菜单、头部三色点+标题）；所有入口与交互保留；无参考项目占位文案。
- **涉及端/模块**：`frontend/src/App.vue`（侧栏结构、菜单项、样式覆盖或自定义侧栏组件）、`frontend/src/theme/vars.css`、`frontend/src/style.css`。

### 5.3 内容区 TopNav、指数条与跑马灯替代

- **描述**：在主导航下**增加**「顶部横向 Tab」（TopNav，与 reference 一致：行情子 tab 横向排列，选中态 cyan + 底部分割线）和「指数横向滚动条」（MarketTicker，单行横向滚动、可无限循环，展示指数名称 + 数值 + 涨跌颜色）。用上述两者**替代**现有 `n-marquee` 跑马灯（telegraph）；telegraph 数据若需保留，可并入 TopNav 区域或 MarketTicker 区域展示，具体形态由技术方案确定，不再使用原 n-marquee 组件。
- **验收标准**：内容区顶部可见 TopNav（横向 tab，选中态明显）与 MarketTicker（指数滚动）；原跑马灯区域已移除或改为新形态；数据来源与后端接口需在技术方案中说明。
- **涉及端/模块**：`frontend/src/App.vue`、新增或改造的 TopNav/MarketTicker 相关组件、与跑马灯/指数数据相关的逻辑与接口。

### 5.4 子页面与卡片风格

- **描述**：所有子页面（自选列表、行情中心、基金、智能助手、研究、偏好设置、关于我们、计划任务等）统一采用新风格：深色背景、圆角毛玻璃卡片（半透明+backdrop-blur、白边、hover 时 cyan 边框）、标题区可带色条装饰；列表/新闻类采用与 reference NewsFeed 类似的卡片列表形态。使用现有 CSS 变量与 Naive 组件主题覆盖实现，不引入 Tailwind。
- **验收标准**：各子页面与主框架同一套深色与卡片语言；无遗留浅色或旧版卡片风格；浮动 AI 助手、弹窗、设置页等统一为新主题。
- **涉及端/模块**：`frontend/src/components/` 下所有页面级与列表/表单组件（如 stock.vue、market.vue、researchIndex.vue、settings.vue、about.vue、agent-chat.vue、cron-task-manager.vue、fund.vue）、FloatingAiAssistant.vue、`frontend/src/theme/vars.css`、各组件内样式与 Naive/TDesign 主题配置。

---

*文档生成自需求澄清流程；待产品确认已全部关闭，第 5 节已按确认结论补全。*

**对焦完成后下一步**：生成技术方案 + 明细变更文档（含：主题变量设计、布局结构、涉及文件清单、TopNav/MarketTicker 与 telegraph 的数据与接口说明；不引入 Tailwind，说明基于现有 CSS 变量与 Naive 的还原方式）。
