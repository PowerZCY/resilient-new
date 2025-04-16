
用户需要重构 src/components/Timeline.tsx 组件的 UI。
核心要求是：
 保留现有数据获取逻辑：Timeline.tsx 中的数据获取、分页、无限滚动等逻辑保持不变。
 复刻原型 UI：UI 需要 1:1 复刻提供的原型文件 (timeline-card-prototype.html, timeline-card.css, timeline-card.js)。
 TypeScript 化交互逻辑：将 timeline-card.js 中的交互逻辑改写为 TypeScript，并集成到 Timeline.tsx 中。
 数据对接：将原型中的静态数据 (timeline-data.js) 替换为 Timeline.tsx 中动态获取的分页数据。
 导航按钮映射：原型中的组导航按钮 (group-nav) 需要映射为分页页码。需要处理分页按钮的数据加载逻辑（点击页码按钮加载对应页数据）。
 遵循代码规范：遵循 jet-brains-style-rule.md 中的规范，包括 JetBrains 风格 UI、代码性能、TypeScript 严格类型、组件最佳实践、Git 提交规范和 License 声明。
理解确认：
 理解需求复述：我将重构 src/components/Timeline.tsx 组件，使其 UI 效果与您提供的 timeline-card-prototype.html、timeline-card.css 和 timeline-card.js 文件中的原型设计完全一致。
 数据逻辑保留：我会保留现有的数据获取、分页和无限滚动逻辑，不进行修改。
 交互逻辑迁移与 TypeScript 化：我会将 timeline-card.js 中的交互逻辑（如 3D 轮播、卡片点击、悬停效果、进度指示器拖拽等）转换为 TypeScript，并整合到 Timeline.tsx 组件中。
 数据替换：原型中的静态 timeline-data.js 不再使用。组件将使用 Timeline.tsx 中通过 API 获取的 entries 数据。
 分页导航：原型的分组导航将改为分页按钮。每个按钮代表一个已加载的页面。点击按钮时，需要实现切换到对应页面数据的展示逻辑（可能需要调整或扩展现有数据获取逻辑，确保能按页码切换）。进度指示器应反映当前查看的总条目数和已加载条目数。
 规范遵循：我会严格遵循 jet-brains-style-rule.md 中的所有规范，包括 UI 风格、代码性能、TypeScript、组件类型、Git 提交和License。
规划步骤：
 分析原型文件：
  timeline-card-prototype.html：理解 HTML 结构，特别是 .group-nav, .carousel-container, .modal-overlay 的布局。
  timeline-card.css：理解 CSS 样式，特别是 3D 轮播、卡片样式、动画效果、导航按钮、进度指示器和模态框的样式。需要将这些样式整合或迁移到项目中（可能使用 Tailwind CSS 结合全局 CSS 或 CSS Modules）。
  timeline-card.js：分析交互逻辑，包括：
  分组和卡片渲染（需要改为动态渲染分页数据）。
  导航按钮切换分组（改为切换页面）。
  3D 轮播效果（setup3DEffects, rotateCardsToTarget, calculateAndAnimateCards）。
  卡片点击/悬停效果/模态框显示。
  进度指示器更新和拖拽（addGlobalProgressIndicator, updateProgressIndicator, setupDraggableProgress, initProgressDrag）。
  timeline-data.js：明确数据结构，了解如何将 entries 映射到卡片上。
 整合 CSS 样式：将 timeline-card.css 中的样式应用到 Timeline.tsx。由于项目使用 Tailwind CSS，最优方案可能是：
  将关键的、难以用 Tailwind 实现的样式（如复杂动画、3D 变换、自定义字体、信纸效果）放入一个单独的 CSS 文件（如 src/styles/timeline-card.css）并在 Timeline.tsx 中引入。
  尽可能使用 Tailwind CSS 实现布局、颜色、间距等基础样式，以保持项目风格统一。
  注意 CSS 变量的转换或保留。
 重构 Timeline.tsx：
  组件结构调整：引入类似 carousel-container, carousel-group（映射到页面）, timeline, timeline-card 的结构。
  TypeScript 化交互逻辑：将 timeline-card.js 的逻辑逐步迁移到 Timeline.tsx 中，使用 React Hooks (useState, useEffect, useRef, useCallback) 和 TypeScript。
  状态管理：管理当前显示的页面 (currentPage)、每个页面的卡片旋转状态/当前卡片索引 (groupStates)、激活的卡片 ID (activeCardId)、进度指示器位置等。
  Effect 钩子：处理 3D 效果的初始化和更新、事件监听器的设置和清理。
  渲染逻辑：根据当前页面动态渲染卡片，并应用 3D 变换和样式。
  数据映射：将 entries 数据按页分组（或维护一个按页分组的数据结构），传递给卡片渲染逻辑。totalCount 用于进度指示器。
  分页导航：
  渲染分页按钮（基于 loadedPages.current 或总页数）。
  实现按钮点击逻辑：设置 currentPage 状态，触发对应页面卡片的显示和动画。如果目标页数据未加载，可能需要调用 fetchEntries（需要审视现有 fetchEntries 是否支持按指定页码加载，或是否需要调整）。
  进度指示器：重写或适配 addGlobalProgressIndicator, updateProgressIndicator，使其使用 React 状态和 entries.length / totalCount。实现拖拽逻辑 (initProgressDrag / setupDraggableProgress)。
  模态框：实现模态框的显示/隐藏逻辑。
  性能优化：应用 will-change, backface-visibility 等优化，注意避免不必要的重渲染。
 代码规范检查：确保代码符合 jet-brains-style-rule.md。添加 License 头。
 （可选）Git 提交：如果需要，生成符合规范的 Git commit 

关键挑战与思考：
  CSS 整合：如何在 Tailwind CSS 项目中优雅地整合大量自定义 CSS？选择合适的策略（全局 CSS, CSS Modules, styled-components/emotion，或 Tailwind 插件/自定义）很重要。考虑到原型 CSS 的复杂性，可能需要保留大部分 CSS 在单独文件中。
  JS 到 TS/React 的转换：将命令式的 DOM 操作（如 querySelectorAll, style.transform, classList.add) 转换为 React 的声明式方式（状态驱动渲染，使用 ref 操作 DOM 有限）。这需要重写大量逻辑。
  3D 轮播逻辑：timeline-card.js 中的 3D 轮播计算 (calculateAndAnimateCards, rotateCardsToTarget) 需要仔细移植，确保在 React 组件更新时正确执行。
  分页与分组映射：原型是按“组”切换，现在要按“页”切换。这意味着 switchGroup 逻辑需要改为 switchPage，并且数据源从静态 timelineData.cards[groupIndex] 变为动态的 entries（可能需要按页缓存或筛选）。点击分页按钮时，如果该页数据已加载，直接切换显示；如果未加载，触发 fetchEntries 加载该页。这可能需要修改 fetchEntries 或增加新的加载函数。
  状态管理复杂性：需要管理多个状态（当前页、每页卡片状态、活动卡片、进度条状态等），逻辑会比较复杂。考虑是否需要拆分组件。
  性能：大量的卡片和复杂的 3D 动画可能带来性能问题。需要关注 React 渲染优化 (React.memo, useCallback) 和 CSS 性能。原型中的 performance-boost 类和 will-change 属性需要保留。

1.  **核心任务**：重构 `src/components/Timeline.tsx` 组件的 UI，使其与提供的原型 (`timeline-card-prototype.html`, `timeline-card.css`, `timeline-card.js`) 1:1 匹配。
2.  **保留逻辑**：现有的数据获取、分页和无限滚动机制将保持不变。
3.  **迁移与转换**：将 `timeline-card.js` 中的交互逻辑（3D 轮播、卡片交互、进度指示器等）转换为 TypeScript，并使用 React Hooks 集成到 `Timeline.tsx` 中。
4.  **数据源**：使用 `Timeline.tsx` 通过 API 获取的动态 `entries` 数据，替代原型中的静态 `timeline-data.js`。
5.  **导航映射**：原型的“分组导航”将改为“分页导航”，按钮代表已加载的页面。点击按钮需要能切换到对应页面的卡片视图。
6.  **规范遵循**：严格遵守 `jet-brains-style-rule.md` 文件中定义的 UI 风格、代码规范、TypeScript 最佳实践、Git 提交格式和 License 要求。

我现在将开始分析原型文件，并着手重构 `src/components/Timeline.tsx` 文件以实现新的 UI 和交互。我会分步进行，首先处理结构和样式，然后是交互逻辑的迁移和数据对接。
