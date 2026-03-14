---
name: self-optimization
description: >-
  Captures user corrections and follow-up preferences after model output was wrong or not as expected,
  classifies them into categories, and persists them to files under .cursor/skills/self-optimization/corrections/
  for reuse in future sessions. After feature completion or after applying corrections, builds common knowledge
  into knowledge/common.md (entry points, callers, usage, dependencies, design rationale). Use when the user
  corrects previous output, says "不对"/"应该是"/"改成"/"按XX来", or when a feature is done and common knowledge should be updated.
---

# 自我优化

在用户对模型输出进行纠正或补充说明时，识别其偏好与规则，按分类沉淀到 `corrections/` 下对应文件；在**每次功能完成**或**自我优化（沉淀纠正）之后**，将本次研发 feature 的核心关键信息补充到通识文件 `knowledge/common.md`，供后续需求澄清、技术方案、实现与测试时参考。

## 何时触发

- **沉淀**：用户在一次回复后再次发消息，且明显是在纠正或调整（例如：「不对」「应该是」「不要XX」「改成XX」「按XX来」「重新」「用YY而不是ZZ」等）。
- **应用**：用户发起新指令时，若与已沉淀规则相关（同类型任务、同技术栈、同输出形式），先读取对应分类文件再执行。
- **构建通识**：每次功能完成（如 AI Coding 实现完成、测试通过）或完成一次纠正沉淀后，执行「构建通识」流程，将本次 feature 的关键信息写入 `knowledge/common.md`。

## 分类与文件

| 分类 | 文件名 | 适用场景 |
|------|--------|----------|
| 风格与格式 | `corrections/style-format.md` | 输出语气、长度、排版、Markdown/代码风格、语言（中/英）等 |
| 技术选型与实现 | `corrections/tech-implementation.md` | 用某库/某写法、目录结构、命名约定、架构偏好等 |
| 业务与规则 | `corrections/business-rules.md` | 业务规则、领域用词、命名、数据含义等 |
| 流程与步骤 | `corrections/workflow.md` | 先做什么后做什么、是否确认、是否分步、是否跑测试等 |
| 其他 | `corrections/other.md` | 无法归入以上四类的偏好或约束 |

所有文件位于：`.cursor/skills/self-optimization/corrections/`。

## 沉淀流程（用户纠正时）

1. **判断是否为纠正/偏好**  
   若用户消息是在对上一次（或之前）输出做修正、补充或强调偏好，则进入沉淀流程。

2. **提炼规则**  
   - 用一两句话概括用户意图（可执行、可复用的规则）。  
   - 保留关键原话（可截取短语），便于日后理解语境。

3. **选择分类**  
   根据上表将规则归入一个分类；不确定时归入「其他」。

4. **追加写入**  
   - 打开对应 `corrections/<category>.md`，若文件不存在则创建。  
   - 在文件末尾追加一条记录，格式如下（保持统一）：

```markdown
### YYYY-MM-DD
- **用户原话（摘要）**：<用户关键原话或简短摘要>
- **规则**：<提炼后的可复用规则>
```

5. **可选确认**  
   可简短回复用户已记录该偏好，并会在之后类似场景中遵循。

## 应用流程（新指令时）

**为何下次任务会参考这些文件？** 项目里已配置规则 `.cursor/rules/self-optimization-preferences.mdc`（`alwaysApply: true`），每次对话都会加载该规则，要求在做实现/改代码/前端等任务前先读 `corrections/` 并应用其中规则。因此新对话、新任务也会自动带上已沉淀的偏好。

1. **判断是否相关**  
   根据用户新指令的主题（技术栈、输出类型、业务域、流程）判断是否可能有已沉淀规则。

2. **按需读取**  
   若相关，读取 `corrections/` 下可能相关的 1～2 个分类文件（如做前端改版则读 `style-format.md`、`tech-implementation.md`）。若目录下尚无对应 .md 文件则跳过。

3. **合并执行**  
   在执行用户新指令时，将读到的规则作为约束或偏好一并满足；若规则与当前请求冲突，以当前请求为准，必要时在回复中说明。

## 规则表述原则

- **可执行**：写清楚「要做什么/不要做什么」，而不是模糊感受。  
- **可复用**：面向「一类场景」而非单次对话。  
- **简短**：一条规则一两句话即可；原话摘要仅保留关键信息。

## 示例（沉淀）

**用户**：「不要用 div 套一层，直接写在组件里就行。」  
→ 分类：技术选型与实现  
→ 规则：组件内避免无意义的 div 包裹，结构直接写在组件根或语义节点下。

**用户**：「回复用中文，代码注释也用中文。」  
→ 分类：风格与格式  
→ 规则：回复与代码注释均使用中文。

**用户**：「先列出改动点再改，别直接改。」  
→ 分类：流程与步骤  
→ 规则：做代码修改前先列出改动点，待确认或用户无异议后再执行修改。

---

## 构建通识（功能完成或自我优化之后）

在**每次功能完成**（如按技术方案实现完成、测试阶段通过）或**完成一次纠正沉淀**之后，执行本流程，将本次研发 feature 的核心关键信息补充到 `knowledge/common.md`，便于下次需求澄清、技术方案与实现时直接引用。

### 触发时机

- AI Coding 实现完成并通知用户之后。
- 开发流程中阶段 4（测试）全部通过之后。
- 完成「沉淀流程」、向 corrections 写入一条或多条规则之后。

### 提取内容（按本次 feature 能确定的填写）

从本次实现的需求文档、技术方案、代码与对话中提炼，写入通识的条目可包含（无则略）：

| 维度 | 说明 | 示例 |
|------|------|------|
| **入口** | 功能入口（路由、API 路径、菜单项、命令等） | 路由 `/market`、接口 `GET /api/stocks` |
| **谁调用 / 何时调用** | 调用方、触发条件或场景 | 前端 TopNav 点击「行情」时；定时任务每日 9:00 |
| **谁使用 / 使用目的** | 最终用户或角色、使用该功能的目的 | 投资者查看大盘概览、做选股参考 |
| **依赖服务** | 依赖的后端服务、第三方 API、数据源 | 行情服务、自选股服务、Redis 缓存 |
| **依赖应用/模块** | 依赖的本项目内应用、前端模块、包 | frontend 的 layout、Go 的 pkg/market |
| **设计原因** | 关键设计决策及原因（为什么这么设计） | 使用 WebSocket 是为了实时推送，减少轮询 |

### 写入位置与格式

- **文件路径**：`knowledge/common.md`（项目根下 `knowledge/` 目录）。若目录或文件不存在则创建。
- **追加方式**：在文件末尾新增一节，不要覆盖已有内容；若本次为「仅纠正、无新 feature」，可只追加与纠正相关的简短说明或跳过。

每条 feature 通识建议格式：

```markdown
## [Feature 名称或需求主题]（YYYY-MM-DD）

- **入口**：…
- **谁调用 / 何时调用**：…
- **谁使用 / 使用目的**：…
- **依赖服务**：…
- **依赖应用/模块**：…
- **设计原因**：…（关键设计点及原因）
```

仅填写本次能确定且对后续有用的项；不确定的项可写「待补充」或省略。

### 与需求澄清的衔接

需求澄清技能会读取 `knowledge/common.md`（或项目内约定的通识路径）作为业务通识来源。保持通识更新后，下次做需求分析、技术方案时可直接引用这些入口、依赖与设计原因，减少重复澄清。

---

## 文件与目录

- 本技能目录：`.cursor/skills/self-optimization/`  
- 沉淀存放：`.cursor/skills/self-optimization/corrections/*.md`  
- 通识文件：`knowledge/common.md`（项目根下）  
- 分类说明与更多示例见 [categories.md](categories.md)（可选）。
