# 自我优化 - 分类说明

供 agent 在「自我优化」技能中判断用户纠正/偏好应归入哪一类时参考。

## 分类定义

| 分类 | 英文标识 | 典型关键词与场景 |
|------|----------|------------------|
| **风格与格式** | style-format | 语气、长短、排版、Markdown、代码风格、中英文、标点、列表/表格形式 |
| **技术选型与实现** | tech-implementation | 用某库/某框架、目录结构、文件命名、组件写法、API 风格、架构、技术栈 |
| **业务与规则** | business-rules | 业务含义、领域术语、数据口径、命名（业务侧）、功能边界、合规/规则 |
| **流程与步骤** | workflow | 先/后顺序、是否确认、是否分步、是否跑测试、是否写文档、协作流程 |
| **其他** | other | 无法明确归入以上四类的偏好或约束 |

## 归类示例

- 「用 Tailwind 不要内联 style」→ 技术选型与实现  
- 「总结控制在 3 句以内」→ 风格与格式  
- 「股票代码用 6 位数字」→ 业务与规则  
- 「改代码前先 diff 给我看」→ 流程与步骤  
- 「别用 emoji」→ 风格与格式  

## 沉淀文件路径

- `corrections/style-format.md`
- `corrections/tech-implementation.md`
- `corrections/business-rules.md`
- `corrections/workflow.md`
- `corrections/other.md`
