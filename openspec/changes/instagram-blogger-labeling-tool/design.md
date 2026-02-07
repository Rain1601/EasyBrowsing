## Context

SHEIN 品牌合作团队需要批量评估 Instagram 博主。当前流程是：打开 Excel → 逐个复制链接 → 打开浏览器查看 → 回到 Excel 记录。这个工具将整合为一个界面，提升标注效率。

约束条件：
- 纯前端应用，无后端服务
- 需支持 Vercel 一键部署
- Instagram 页面嵌入受 X-Frame-Options 限制

## Goals / Non-Goals

**Goals:**
- 提供一站式博主标注工作流（导入 → 预览 → 标注 → 导出）
- 用户可自定义原因选项，保存在本地
- 支持批量处理数百个博主链接
- Vercel 部署，无需服务器

**Non-Goals:**
- 不做用户登录/多用户协作
- 不做数据持久化到云端
- 不做 Instagram 数据抓取/分析
- 不做移动端适配

## Decisions

### 1. 技术栈选择：Next.js + Tailwind CSS

**选择**: Next.js 14 (App Router) + Tailwind CSS + shadcn/ui

**理由**:
- Next.js 是 Vercel 原生支持的框架，零配置部署
- Tailwind CSS 快速开发 UI，无需额外 CSS 文件
- shadcn/ui 提供高质量的 UI 组件（Button, Select, Dialog 等）

**备选方案**:
- Vite + React：需要额外配置 Vercel 部署
- Create React App：已停止维护

### 2. Excel 处理：SheetJS (xlsx)

**选择**: 使用 `xlsx` 库在浏览器端处理 Excel

**理由**:
- 纯前端处理，无需上传到服务器
- 支持 .xlsx 和 .xls 格式
- 可以读取和写入，满足导入导出需求

**备选方案**:
- Papa Parse：仅支持 CSV
- ExcelJS：体积较大

### 3. Instagram 预览方案：新标签页打开

**选择**: 点击按钮在新标签页打开 Instagram 链接

**理由**:
- Instagram 设置了 `X-Frame-Options: DENY`，无法用 iframe 嵌入
- oEmbed API 只能嵌入单个帖子，不能嵌入用户主页
- 新标签页方案最简单可靠，用户可以并排窗口操作

**备选方案**:
- iframe 嵌入：被 Instagram 禁止
- 截图预览：需要后端爬虫，增加复杂度
- Instagram Basic Display API：需要用户授权，不适合查看他人主页

### 4. 数据存储：localStorage

**选择**: 使用 localStorage 存储：
- 自定义原因选项列表
- 当前工作进度（可选）

**理由**:
- 纯前端方案，无需数据库
- 数据量小（选项列表），localStorage 足够
- 用户关闭页面后可恢复自定义选项

### 5. 应用状态管理：React useState + Context

**选择**: 使用 React 内置状态管理

**理由**:
- 应用状态简单（博主列表、当前索引、标注结果）
- 无需引入 Redux/Zustand 等外部库

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| Instagram 无法嵌入预览 | 使用新标签页打开，用户需要并排窗口操作 |
| 大量数据导入可能卡顿 | 分批处理，添加加载状态提示 |
| localStorage 有 5MB 限制 | 只存储选项配置，不存储完整数据 |
| 用户误关页面丢失进度 | 提供"保存进度"按钮，导出中间结果 |

## 页面结构

```
┌─────────────────────────────────────────────────────────┐
│  Header: 进度显示 (3/50)  [导入] [导出]                  │
├─────────────────────────────────────────────────────────┤
│                    │                                     │
│   博主链接列表      │      标注面板                       │
│   (可点击切换)      │                                     │
│                    │   [打开 Instagram ↗]                │
│   ● 博主1 ✓        │                                     │
│   ○ 博主2 (当前)   │   是否符合 SHEIN 风格？              │
│   ○ 博主3          │   ( ) 是  (●) 否                    │
│   ○ 博主4          │                                     │
│   ...              │   原因：[下拉选择 ▼] [+ 添加]        │
│                    │                                     │
│                    │   [上一个] [保存并下一个]            │
│                    │                                     │
└─────────────────────────────────────────────────────────┘
```

## 文件结构

```
app/
├── page.tsx              # 主页面
├── layout.tsx            # 布局
├── globals.css           # 全局样式
components/
├── ExcelImporter.tsx     # Excel 导入组件
├── BloggerList.tsx       # 博主列表组件
├── LabelingPanel.tsx     # 标注面板组件
├── ReasonSelector.tsx    # 原因选择器（含自定义添加）
├── ExcelExporter.tsx     # Excel 导出组件
lib/
├── excel.ts              # Excel 读写工具函数
├── storage.ts            # localStorage 工具函数
types/
├── index.ts              # TypeScript 类型定义
```
