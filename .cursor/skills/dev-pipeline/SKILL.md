---
name: dev-pipeline
description: >-
  Orchestrates the full development chain in order: requirement clarification →
  technical solution design → AI coding implementation → testing/validation →
  bug fix (if needed). Invokes project skills requirement-clarification,
  detailed-tech-solution-design, ai-coding-implementation, and bug-fix at the
  right stage. Use when the user asks to run the full dev pipeline, 按流程执行,
  需求澄清到bug修复链路, or 依次执行需求澄清/技术方案/代码编码/测试/bug修复.
---

# 开发流程链路（需求澄清 → 技术方案 → 代码编码 → 测试 → Bug 修复）

按顺序执行以下五个阶段，不跳步；每阶段完成并满足出口条件后再进入下一阶段。若测试阶段发现缺陷，转入 Bug 修复并在此后重新执行测试，直至通过。

---

## 流程总览

| 阶段 | 技能/动作 | 输入 | 产出 | 出口条件 |
|------|-----------|------|------|----------|
| 1. 需求澄清 | requirement-clarification | 产品需求描述 | `feature/需求-{主题}-{日期}.md` | 待产品确认已关闭、澄清后需求明细已定稿 |
| 2. 技术方案 | detailed-tech-solution-design | 需求文档 | `feature/{同名前缀}_技术方案.md` | 技术方案文档已生成且含开发步骤 |
| 3. 代码编码 | ai-coding-implementation | 技术方案文档 | 代码变更 + 构建/单测通过 | 开发步骤执行完毕、改动点核对完成、构建与单测通过 |
| 4. 测试 | 本技能内「测试阶段」 | 当前代码与方案 | 测试结果 / 缺陷列表 | 全部约定验证通过，或列出需修复项 |
| 5. Bug 修复 | bug-fix | 复现步骤与现象 | 修复补丁 + 验证通过 | 问题根因已修复、回归通过 |

---

## 执行说明

### 何时使用本技能

- 用户要求「按流程依次执行」「需求澄清 → 技术方案 → 代码编码 → 测试 → bug 修复」或类似表述。
- 用户希望从需求到上线的完整链路由 Agent 按阶段推进。

### 阶段切换规则

- **顺序执行**：1 → 2 → 3 → 4；仅在阶段 4 发现问题时进入阶段 5，修复后回到阶段 4 再测。
- **阶段 1→2**：需求文档中「待产品确认」为空且「澄清后需求明细」已补全；若未满足，提示用户与产品对焦后再继续。
- **阶段 2→3**：技术方案文档已就绪且包含「7. 开发步骤」；若未满足，先完成技术方案设计。
- **阶段 3→4**：ai-coding-implementation 已跑完（含 Phase 4 构建/单测通过），或用户明确要求进入测试阶段。
- **阶段 4→5**：测试或验收中发现缺陷（失败用例、报错、与预期不符）；将现象、复现步骤与预期整理后交给 bug-fix。
- **阶段 5→4**：bug-fix 完成并验证通过后，再次执行测试阶段，直到通过或用户叫停。

---

## 阶段 1：需求澄清

1. **调用**：按 [requirement-clarification](.cursor/skills/requirement-clarification/SKILL.md) 技能执行。
2. **输入**：用户提供的产品需求描述（或已有需求初稿）。
3. **产出**：`feature/需求-{主题}-{日期}.md`，且文档内：
   - 「待产品确认」已全部关闭；
   - 「澄清后需求明细」已补全且产品认可。
4. **出口**：对焦完成时，明确提示用户可进入下一阶段，并建议表述：「请根据 feature/需求-xxx 生成技术方案」。

---

## 阶段 2：技术方案设计

1. **调用**：按 [detailed-tech-solution-design](.cursor/skills/detailed-tech-solution-design/SKILL.md) 技能执行。
2. **输入**：阶段 1 产出的需求文档（路径如 `feature/需求-{主题}-{日期}.md`）。
3. **产出**：`feature/需求-{主题}-{日期}_技术方案.md`，且包含：
   - 需求依据与范围、架构与模块、数据与接口、跨域协议、代码级设计、开发步骤与执行顺序。
4. **出口**：技术方案定稿后，提示用户可进入实现阶段，并建议表述：「请按技术方案实现」或「AI Coding 实现」。

---

## 阶段 3：代码编码（AI Coding 实现）

1. **调用**：按 [ai-coding-implementation](.cursor/skills/ai-coding-implementation/SKILL.md) 技能执行。
2. **输入**：阶段 2 产出的技术方案文档。
3. **自我优化**：AI Coding 技能执行前会先读取并应用 `.cursor/skills/self-optimization/corrections/` 中与实现相关的规则（tech-implementation、workflow、style-format 等），实现过程中遵守这些沉淀偏好。
4. **产出**：按「7. 开发步骤」完成的代码变更；Phase 4 的构建/单测/lint 通过（或说明未执行原因）。
5. **出口**：实现完成且 Phase 3 改动点核对、Phase 4 验证均通过；若有「执行主体为人」的步骤，已列出并提醒用户。

---

## 阶段 4：测试

本阶段不依赖单独技能，在流程内完成以下动作：

1. **自我优化**：执行验证前，先读取 `.cursor/skills/self-optimization/corrections/` 中与测试与流程相关的文件（如 `workflow.md`、`style-format.md`、`other.md`），将其中与验证方式、输出风格、步骤顺序相关的规则作为本阶段的约束（例如：先列改动再测、报告用中文等）。
2. **验证范围**
   - 构建与单测：若阶段 3 已执行 Phase 4 且通过，可视为已包含；否则在本阶段执行 `npm run build` / `go build`、`npm run test` / `go test` 等。
   - 关键路径：根据需求文档与技术方案，做最小必要的手工或自动化验收（关键接口、关键页面/流程）。
   - 回归：本次改动涉及模块的相关测试全部通过。

3. **结果处理**
   - **全部通过**：进入「流程结束」，向用户汇报各阶段产出与测试结果。
   - **存在失败或缺陷**：整理「复现步骤、预期 vs 实际、环境/数据」并进入阶段 5（Bug 修复），修复后再回到本阶段重测。

4. **出口**：无待修复缺陷，或用户明确接受当前状态并结束流程。

---

## 阶段 5：Bug 修复

1. **调用**：按 [bug-fix](.cursor/skills/bug-fix/SKILL.md) 技能执行。
2. **输入**：阶段 4 整理的缺陷信息（复现步骤、预期 vs 实际、环境）。
3. **产出**：根因修复、最小改动、验证通过；向用户反馈根因、修改点与验证结果。
4. **出口**：修复验证与约定回归通过后，回到阶段 4 再测；若用户不再要求继续测试，可结束流程。

---

## 流程结束

当阶段 4 测试全部通过（或用户决定结束）时：

1. **构建通识**：按 [self-optimization](.cursor/skills/self-optimization/SKILL.md) 技能中「构建通识」流程，将本次 feature 的核心关键信息（入口、谁调用、使用目的、依赖服务、设计原因等）补充到 `knowledge/common.md`，供后续需求与方案引用。
2. **向用户说明**：

- 已完成的阶段与对应产出（需求文档、技术方案、代码变更、测试结果）。
- 若存在由「人」执行的步骤（如发布、配置、联调），列出并提醒。
- 若在流程中发现需求或方案歧义，简要列出并建议与产品/技术对焦。

---

## 注意事项

- **不跳步**：未满足某阶段出口条件时，不进入下一阶段；先补全或对焦后再继续。
- **测试与 Bug 修复可循环**：4 → 5 → 4 可重复，直到测试通过或用户叫停。
- **技能引用**：各阶段具体操作以对应技能文档为准（需求澄清、技术方案、AI Coding、Bug 修复）；本技能只负责顺序、输入产出与阶段切换。
