# 首页双屏设计重构

## TL;DR

> **Quick Summary**: 将首页重构为双屏设计 - 未连接钱包时显示全屏 Hero Section + 向下箭头动画，滚动后显示功能内容；连接钱包后直接显示功能内容，不显示 Hero 和钱包信息卡片。
> 
> **Deliverables**:
> - 修改后的 `src/pages/Home.tsx` 组件
> - 新增 CSS 动画 `@keyframes bounce` 到 `src/index.css`
> 
> **Estimated Effort**: Short
> **Parallel Execution**: NO - 单文件顺序修改
> **Critical Path**: Task 1 → Task 2 → Task 3

---

## Context

### Original Request
> 现在要让首页未连接钱包的时候更高级，更吸引用户。我的想法是将现在未连接钱包时的首页作为第一屏，在下方添加一个向下的箭头动效（像一些网站首页的第一屏），然后用户向下滚动屏幕或者点击"向下的箭头动效"后，滚动到第二屏，第二屏可以向上滚动回第一屏。第二屏的内容就是连接钱包之后的内容，除了不显示最上面的钱包信息卡片，下面的 Quick Action、Features、Coming Soon 都显示。

### Interview Summary
**Key Discussions**:
- **第一屏高度**: 强制全屏 (`min-h-[100dvh]`)，使用动态视口高度适配移动端
- **滚动行为**: 平滑滚动 (`scroll-smooth`)
- **箭头动画**: Bounce 弹跳效果
- **移动端**: 保持双屏设计
- **连接后行为**: 隐藏 Hero，直接显示第二屏（类似当前 connected 状态）
- **钱包信息**: 完全移除，不在首页显示

**Research Findings**:
- 现有动画资源：`.float`, `.animate-fade-in`, `.bg-animated-gradient`, `.bg-floating-orbs`
- 首页背景由 Layout 组件提供
- 项目不使用 framer-motion，所有动画为纯 CSS

### Metis Review
**Identified Gaps** (addressed):
- **连接状态处理**: 确认连接后隐藏 Hero，直接显示第二屏
- **钱包信息位置**: 确认完全移除，不在首页显示
- **移动端高度**: 使用 `100dvh` 替代 `100vh`
- **Reduced Motion**: 添加 `prefers-reduced-motion` 媒体查询支持

---

## Work Objectives

### Core Objective
重构首页为双屏设计：
- **未连接状态**: 第一屏全屏 Hero + 向下箭头动画 → 第二屏功能内容
- **已连接状态**: 直接显示第二屏功能内容（无 Hero，无钱包信息卡片）

### Concrete Deliverables
- `src/pages/Home.tsx` - 重构后的首页组件
- `src/index.css` - 新增 bounce 动画和 reduced-motion 支持

### Definition of Done
- [ ] 未连接时显示双屏布局，首屏占满视口
- [ ] 向下箭头有 bounce 弹跳动画
- [ ] 点击箭头或滚动可切换到第二屏
- [ ] 连接后直接显示第二屏，无 Hero
- [ ] 第二屏不显示钱包信息卡片
- [ ] 移动端使用 `100dvh` 正确显示
- [ ] Playwright 测试全部通过

### Must Have
- 双屏布局（未连接状态）
- Bounce 箭头动画
- 平滑滚动
- 第二屏包含所有功能卡片
- 连接状态正确切换

### Must NOT Have (Guardrails)
- 不修改 Layout.tsx 或 Header
- 不添加 framer-motion
- 不修改钱包连接逻辑
- 不修改翻译文件
- 不修改其他页面

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO (无测试框架)
- **Automated tests**: Playwright 自动化验证
- **Framework**: Playwright (通过 playwright skill)
- **TDD**: NO

### QA Policy
使用 Playwright 进行浏览器自动化测试：
- 验证首屏布局和箭头动画
- 验证滚动行为
- 验证连接状态切换
- 验证第二屏内容完整性

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation):
└── Task 1: Add CSS animations (bounce, reduced-motion) [quick]

Wave 2 (Core Implementation):
└── Task 2: Refactor Home.tsx component structure [visual-engineering]

Wave 3 (Verification):
└── Task 3: Playwright automated QA tests [unspecified-high]
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|------------|--------|
| 1 | — | 2, 3 |
| 2 | 1 | 3 |
| 3 | 1, 2 | — |

### Agent Dispatch Summary

- **Wave 1**: Task 1 → `quick`
- **Wave 2**: Task 2 → `visual-engineering` (UI/UX changes)
- **Wave 3**: Task 3 → `unspecified-high` (Playwright testing)

---

## TODOs
- [ ] 1. Add CSS animations (bounce and reduced-motion)

  **What to do**:
  - 在 `src/index.css` 的 `@layer utilities` 中添加 `@keyframes bounce-down` 动画
  - 添加 `.animate-bounce-down` 工具类
  - 添加 `@media (prefers-reduced-motion: reduce)` 媒体查询，禁用动画

  **Must NOT do**:
  - 不修改其他现有的动画
  - 不添加 framer-motion

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的 CSS 添加任务，不需要复杂的逻辑
  - **Skills**: []
    - 无需额外技能

  **Parallelization**:
  - **Can Run In Parallel**: NO (Wave 1, 无依赖)
  - **Parallel Group**: Sequential
  - **Blocks**: Task 2, Task 3
  - **Blocked By**: None

  **References**:
  - `src/index.css:107-126` - 现有的 `@keyframes` 定义位置（如 `gradientShift`, `floatOrb1`）
  - `src/index.css:289-296` - 现有的 `.float` 动画类作为参考
  - `https://tailwindcss.com/docs/animation` - Tailwind 动画文档

  **Acceptance Criteria**:
  - [ ] `@keyframes bounce-down` 定义在 `@layer utilities` 中
  - [ ] `.animate-bounce-down` 类可用
  - [ ] `@media (prefers-reduced-motion: reduce)` 中动画被禁用

  **QA Scenarios**:
  ```
  Scenario: CSS 动画类存在
    Tool: Bash (grep)
    Steps:
      1. grep -q "@keyframes bounce-down" src/index.css
      2. grep -q "animate-bounce-down" src/index.css
      3. grep -q "prefers-reduced-motion" src/index.css
    Expected Result: 所有 grep 命令返回 0 (找到匹配)
    Evidence: .sisyphus/evidence/task-1-css-animation-check.txt
  ```

  **Commit**: YES
  - Message: `style: add bounce animation and reduced-motion support`
  - Files: `src/index.css`
  - Pre-commit: `npm run build`

- [ ] 2. Refactor Home.tsx component structure

  **What to do**:
  - 重构 `src/pages/Home.tsx` 组件
  - **未连接状态**:
    - 第一屏：全屏 Hero Section（`min-h-[100dvh]`），包含 Logo + 标题 + 描述 + 连接按钮 + 向下箭头
    - 箭头使用 `animate-bounce-down` 动画，点击时平滑滚动到第二屏
    - 第二屏：Quick Actions + Features + Account + Coming Soon（不显示钱包信息卡片）
  - **已连接状态**:
    - 直接显示第二屏内容（无 Hero，无钱包信息卡片）
  - 移除现有的钱包信息卡片代码（lines 310-358）
  - 移除不再需要的状态：`mousePosition`, `cardRef`（仅钱包卡片使用）

  **Must NOT do**:
  - 不修改 Layout.tsx 或 Header
  - 不修改钱包连接逻辑（WalletSelectModal 正常工作）
  - 不修改翻译文件
  - 不修改 quickActions, categories, comingSoonFeatures 数据

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI/UX 重构任务，涉及布局和动画
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 确保 UI 设计质量

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (depends on Task 1)
  - **Blocks**: Task 3
  - **Blocked By**: Task 1

  **References**:
  - `src/pages/Home.tsx:274-306` - 当前的未连接状态渲染代码
  - `src/pages/Home.tsx:360-508` - 当前的 Quick Actions / Features / Account / Coming Soon 渲染代码
  - `src/pages/Home.tsx:310-358` - 要移除的钱包信息卡片代码
  - `src/components/common/RippletLogo.tsx` - Logo 组件
  - `src/components/wallet/WalletSelectModal.tsx` - 钱包选择弹窗
  - `lucide-react` - ChevronDown 图标用于向下箭头

  **Acceptance Criteria**:
  - [ ] 未连接时，第一屏使用 `min-h-[100dvh]` 占满视口
  - [ ] 未连接时，向下箭头使用 `animate-bounce-down` 动画
  - [ ] 未连接时，点击箭头平滑滚动到第二屏
  - [ ] 未连接时，第二屏包含 Quick Actions, Features, Account, Coming Soon
  - [ ] 已连接时，直接显示第二屏，无 Hero
  - [ ] 第二屏不显示钱包信息卡片
  - [ ] 移动端使用 `100dvh` 正确显示

  **QA Scenarios**:
  ```
  Scenario: 未连接状态显示双屏布局
    Tool: Playwright
    Preconditions: 钱包未连接
    Steps:
      1. Navigate to http://localhost:5173/
      2. Verify page.locator('text=Welcome to Ripplet').isVisible()
      3. Verify page.locator('button:has-text("Connect")').isVisible()
      4. Verify page.locator('[data-testid="scroll-indicator"]').isVisible()
      5. Check window.scrollY === 0 (initial position)
    Expected Result: Hero section fills viewport, arrow visible
    Evidence: .sisyphus/evidence/task-2-hero-visible.png

  Scenario: 点击箭头滚动到第二屏
    Tool: Playwright
    Preconditions: 钱包未连接，位于页面顶部
    Steps:
      1. Click [data-testid="scroll-indicator"]
      2. Wait for scroll to complete (timeout: 2s)
      3. Verify window.scrollY > 300
      4. Verify page.locator('text=Quick Actions').isVisible()
    Expected Result: Smooth scroll to second screen, Quick Actions visible
    Evidence: .sisyphus/evidence/task-2-scroll-to-features.png

  Scenario: 已连接状态跳过 Hero
    Tool: Playwright
    Preconditions: 钱包已连接
    Steps:
      1. Navigate to http://localhost:5173/
      2. Verify page.locator('text=Welcome to Ripplet').isHidden() OR not in DOM
      3. Verify page.locator('text=Quick Actions').isVisible()
    Expected Result: No Hero section, directly show features
    Evidence: .sisyphus/evidence/task-2-connected-no-hero.png

  Scenario: 移动端正确显示
    Tool: Playwright
    Preconditions: 钱包未连接，移动端视口 (375x667)
    Steps:
      1. Set viewport size to 375x667
      2. Navigate to http://localhost:5173/
      3. Verify first screen fills viewport (no vertical scroll initially)
      4. Verify arrow is visible and clickable
    Expected Result: Mobile viewport handled correctly with 100dvh
    Evidence: .sisyphus/evidence/task-2-mobile-viewport.png
  ```

  **Commit**: YES
  - Message: `feat(home): implement dual-screen layout with hero section`
  - Files: `src/pages/Home.tsx`
  - Pre-commit: `npm run build`

- [ ] 3. Playwright automated QA tests

  **What to do**:
  - 使用 Playwright 执行所有 QA 场景验证
  - 验证未连接状态的双屏布局
  - 验证箭头动画和滚动行为
  - 验证已连接状态的布局
  - 验证移动端响应式
  - 保存所有截图证据到 `.sisyphus/evidence/` 目录

  **Must NOT do**:
  - 不修改源代码
  - 不修改组件逻辑

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 需要运行 Playwright 并进行详细验证
  - **Skills**: [`playwright`]
    - `playwright`: 必须使用此技能进行浏览器自动化

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (depends on Task 1, 2)
  - **Blocks**: None
  - **Blocked By**: Task 1, Task 2

  **References**:
  - Task 2 的 QA Scenarios 定义
  - `src/pages/Home.tsx` - 被测试的组件

  **Acceptance Criteria**:
  - [ ] 所有 QA 场景通过
  - [ ] 截图证据保存到 `.sisyphus/evidence/` 目录
  - [ ] 未连接状态验证通过
  - [ ] 已连接状态验证通过
  - [ ] 移动端验证通过

  **QA Scenarios**:
  ```
  Scenario: 完整的端到端测试
    Tool: Playwright
    Preconditions: 开发服务器运行中 (npm run dev)
    Steps:
      1. 执行 Task 2 中定义的所有 QA 场景
      2. 记录每个场景的结果
      3. 保存截图证据
    Expected Result: 所有场景 PASS
    Evidence: .sisyphus/evidence/task-3-e2e-test-results.txt
  ```

  **Commit**: NO
  - 此任务仅验证，不修改代码

---

## Final Verification Wave (MANDATORY)

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. Verify all "Must Have" items are implemented. Check evidence files exist.

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + linter. Check for TypeScript errors. Review changes for code quality.

- [ ] F3. **Real Manual QA** — `unspecified-high` + `playwright` skill
  Execute all QA scenarios. Test on both desktop and mobile viewports. Capture evidence.

---

## Commit Strategy

- **Task 1**: `style: add bounce animation and reduced-motion support`
- **Task 2**: `feat(home): implement dual-screen layout with hero section`
- **Task 3**: `test(home): add Playwright tests for dual-screen layout`

---

## Success Criteria

### Verification Commands
```bash
npm run dev          # Start dev server
npm run build        # Verify build succeeds
npx playwright test  # Run Playwright tests
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] Build succeeds without errors
- [ ] Playwright tests pass
