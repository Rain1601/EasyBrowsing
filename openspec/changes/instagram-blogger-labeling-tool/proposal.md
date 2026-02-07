    ## Why

SHEIN 的品牌合作团队需要快速评估大量 Instagram 博主是否符合品牌风格。目前人工逐个打开博主主页并在 Excel 中记录非常低效，需要一个专门的标注工具来提升效率。

## What Changes

- 新增一个 Web 应用，支持 Vercel 部署
- 支持导入 Excel 文件并选择博主链接列
- 提供左侧博主页面预览 + 右侧标注面板的双栏布局
- 标注内容：是否符合 SHEIN 风格（是/否，默认否）+ 原因（可自定义下拉选项）
- 支持导出完整标注结果为 Excel

## Capabilities

### New Capabilities

- `excel-import`: 导入 Excel 文件，解析并选择博主链接列
- `instagram-preview`: 在左侧面板中展示 Instagram 博主主页
- `labeling-panel`: 右侧标注面板，包含是否符合 SHEIN 风格选项和原因下拉框
- `custom-options`: 支持用户动态添加原因选项到下拉列表
- `excel-export`: 将标注结果导出为包含链接、是否符合、原因的 Excel 文件

### Modified Capabilities

（无，这是一个全新项目）

## Impact

- **技术栈**: Next.js + React + Tailwind CSS
- **依赖**: xlsx (SheetJS) 用于 Excel 处理
- **部署**: Vercel（纯前端，无需后端服务）
- **数据存储**: 浏览器本地 localStorage（用于保存自定义原因选项）
