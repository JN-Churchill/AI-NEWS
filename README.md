# AI 信号指数

一个基于 Next.js 的 AI 日报/指数站底座，用本地 JSON 内容源渲染首页、每日详情、历史归档、评分方法、RSS 和 sitemap。

## 本地运行

```bash
npm run dev
```

默认访问 `http://localhost:3000`。

## 内容结构

每日一期内容放在 `content/issues/YYYY-MM-DD.json`。

当前数据是示例期，用来承载页面结构。正式运营时可以把采集脚本、CMS 或数据库接到 `src/lib/issues.ts`。

来源池放在 `content/sources.json`，后续采集脚本可以从这里读取启用的来源。

## 内容生产

从来源池抓取候选内容：

```bash
npm run ingest -- --date 2026-06-06 --limit 8
```

只抓某个来源：

```bash
npm run ingest -- --date 2026-06-06 --source hacker-news
```

从候选池生成日报草稿：

```bash
npm run issue:from-candidates -- --date 2026-06-06 --limit 8
```

生成某一天的日报草稿：

```bash
npm run issue:new -- 2026-06-06
```

校验所有日报和来源池：

```bash
npm run issue:validate
```

校验指定日期：

```bash
npm run issue:validate -- 2026-06-05
```

推荐发布前顺序：

```bash
npm run ingest -- --date 2026-06-06
npm run issue:from-candidates -- --date 2026-06-06
npm run issue:validate
npm run lint
npm run build
```

## 页面

- `/` 今日指数
- `/daily/[date]` 每日详情
- `/archive` 历史归档
- `/about` 评分方法
- `/topics` 主题索引
- `/topics/[slug]` 主题详情
- `/sources` 来源池
- `/search` 静态搜索
- `/editorial` 编辑政策
- `/contact` 联系与投稿
- `/rss.xml` RSS
- `/feed.json` JSON Feed
- `/sitemap.xml` sitemap

## 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- 本地 JSON 内容源
- Zod 数据校验
- tsx 脚本运行
