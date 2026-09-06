<div align="center">

# AI 日报 · AI Daily

**每天自动抓取全网 AI 热点，去重打分后生成一份「五分钟看完」的日报**

一个全自动运行的 AI 信号聚合站：RSS/API/HTML 多来源采集 → 跨源去重 → 六维热度评分 → 智能归类 → 生成每日一期日报，并提供归档、检索、主题追踪与 RSS/JSON Feed 订阅。

![Next.js](https://img.shields.io/badge/Next.js%2016-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind%20CSS%20v4-06B6D4?logo=tailwindcss&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-每日自动运行-2088FF?logo=githubactions&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

## ✨ 功能特性

- **每日日报**：自动聚合模型发布、产品更新、行业动态、论文研究、技巧观点五大版块，每期约 20-30 条精选热点
- **AI 热度指数**：对每条热点按「实用性 / 新颖度 / 影响力 / 可信度 / 受众广度 / 时效 + 跨源加成」六维规则打分（0-100），**算法公开可解释**，见 `/about`
- **跨源去重**：URL 规范化 + 标题 Jaccard 相似度聚类，同一事件多源报道自动合并并加权
- **全站检索**：输入即过滤的实时搜索，支持按版块与主题组合筛选
- **主题追踪**：融资 / 开源 / 评测 / Agent / 多模态 / 基础设施 / 安全对齐 / 具身智能，横向聚合全部历史日报
- **订阅分发**：RSS 2.0、JSON Feed、sitemap 构建期自动生成
- **全自动流水线**：本地 `npm run dev` 启动即自动补当天数据；GitHub Actions 每天定时抓取发布，零人工干预

## 🧱 技术栈

| 层级 | 选型 | 说明 |
| --- | --- | --- |
| 框架 | Next.js 16（App Router）+ React 19 | 全栈单体，纯静态导出 |
| 语言 | TypeScript + Zod | 全链路类型安全与数据契约校验 |
| 样式 | Tailwind CSS v4 | 深色科技 + 玻璃拟态设计系统 |
| 图表 | recharts / 原生 SVG | 热度仪表盘与版块分布 |
| 存储 | Git 仓库 + 本地 JSON | **Git as Database**：零成本、版本化、可回滚 |
| 采集 | fast-xml-parser + 原生 fetch | RSS/Atom/HTML/AI HOT API 四类适配器 |
| 调度 | GitHub Actions Cron | 每日北京时间 09:00 自动运行 |

## 🚀 快速开始

要求：Node.js ≥ 20.9

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev
```

打开 http://localhost:3000 即可。

> 首次启动会自动检查「今天的日报」是否已生成；没有则自动抓取并生成（约 1 分钟），无需手动命令。

### 手动运行流水线

```bash
npm run daily        # 完整流程：抓取 → 生成 → 校验 → 建索引 → 出 Feed
npm run ingest       # 仅抓取候选热点（写入 content/candidates/）
npm run issue:build  # 候选池 → 今日日报
npm run validate     # 发布门禁校验
npm run build        # 生产构建（静态导出到 out/）
```

## 🗂 目录结构

```
├── content/                    # 内容即数据（Git as Database）
│   ├── sources.json            #   来源配置（12 个启用来源，含权威度）
│   ├── candidates/YYYY-MM-DD.json   # 原始候选池（可回溯审计）
│   ├── issues/YYYY-MM-DD.json       # 正式日报（唯一数据源）
│   └── index/search-index.json      # 构建期搜索索引
├── scripts/                    # 数据流水线（TS，可被 CLI 或程序调用）
│   ├── adapters/               #   AI HOT API / RSS / HTML 适配器
│   ├── ingest.ts               #   统一采集入口（并发 + 超时重试）
│   ├── lib/dedupe.ts           #   跨源去重聚类
│   ├── lib/score.ts            #   六维热度评分引擎
│   ├── lib/classify.ts         #   版块归类 + 主题打标
│   ├── build-issue.ts          #   候选池 → 日报
│   ├── pipeline.ts             #   自动编排（启动时确保当日数据）
│   └── emit-feeds.ts           #   RSS / JSON Feed / sitemap
├── src/
│   ├── app/                    # 页面：首页 / 日报 / 归档 / 搜索 / 主题 / 评分方法
│   ├── components/             # UI 组件（仪表盘 / 卡片 / 导航 / 图表）
│   ├── lib/                    # 内容读取与数据层
│   ├── types/schema.ts         # 统一数据契约（Zod）
│   └── instrumentation.ts      # dev 启动自动补当日日报
├── .github/workflows/daily.yml # 每日定时抓取 + 提交
└── next.config.ts
```

## 🔥 热度指数是怎么算的

```
热度 = 实用性(30) + 新颖度(20) + 影响力(20) + 可信度(15) + 受众广度(10) + 时效(5) + 跨源加成(≤10)
```

- **可信度** 直接由来源权威度映射（官方源 95 → 14.25 分）
- **时效** 按发布时间 24h / 72h / 7d 梯度衰减
- **跨源加成** 每多一个独立来源报道 +5，封顶 +10
- 全部为规则化纯函数，公开可复核，不依赖付费大模型，零 API 成本

完整算法见站点 `/about` 页面与 `scripts/lib/score.ts`。

## ☁️ 部署（零成本）

项目配置为纯静态导出（`output: "export"`），可部署到任意静态托管：

**方式一：Vercel 免费层**

1. 推送代码到 GitHub，在 Vercel 导入仓库，选择 `ai-daily` 分支
2. 框架自动识别 Next.js，构建命令 `npm run build`，输出目录 `out`
3. 部署后配置 `SITE_URL` 环境变量（用于 RSS 绝对链接）

**方式二：GitHub Pages**

1. Actions 构建后将 `out/` 发布到 `gh-pages`
2. `next.config.ts` 按需要调整 `output` 与资源前缀

### 每日自动更新

`.github/workflows/daily.yml` 每天 UTC 01:00（北京时间 09:00）自动执行：
抓取 → 生成 → 校验 → 提交数据回仓库 → 触发 Vercel 重新部署。

本地开发时由 `src/instrumentation.ts` 在 dev 启动时自动补齐当日数据；
生产构建请保持 `SKIP_AUTO_INGEST=1`（数据以仓库提交为准）。

## 🔌 配置项

| 环境变量 | 说明 | 默认值 |
| --- | --- | --- |
| `SITE_URL` | 站点域名（RSS / metadata 绝对链接） | `http://localhost:3000` |
| `SKIP_AUTO_INGEST` | 设为 `1` 禁用 dev 自动采集 | 未设置 |

来源增删改在 `content/sources.json`，每个来源支持 `aihot / feed / html / api / manual` 五种策略。

## 📜 版权与许可

- 站内聚合内容版权归各原始来源所有，本站仅作索引与摘要
- 代码采用 [MIT License](LICENSE)

## 📌 分支说明

本仓库基于旧项目 `AI-NEWS` 演进而来：

- `ai-daily`：**当前主线**，本项目代码
- `main`：旧项目历史存档（仅归档，不再维护）
