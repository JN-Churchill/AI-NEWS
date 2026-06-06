# AI 信号指数

一个基于 Next.js 的 AI 日报/指数站底座，用本地 JSON 内容源渲染首页、每日详情、历史归档、主题、来源池、搜索、RSS、JSON Feed、OG 图片、sitemap 和部署健康检查。

## 本地运行

```bash
npm run dev
```

默认访问 `http://localhost:3000`。

## 内容结构

每日一期内容放在 `content/issues/YYYY-MM-DD.json`。`status: "draft"` 的日报不会出现在公开首页、归档、搜索、RSS、JSON Feed 或 sitemap 中；公开发布前应切换为 `published` 并通过校验。

来源池放在 `content/sources.json`。每个来源可声明 `fetchMode`、`parser`、`feedUrl`、`requiresAuth`、`authEnv` 和 `notes`，用于区分稳定 RSS/Atom、HTML 候选、API 待接入和人工来源。

## 日常生产流程

抓取候选池：

```bash
npm run ingest -- --date 2026-06-06 --limit 8 --concurrency 4 --retries 2
```

只抓某个来源：

```bash
npm run ingest -- --date 2026-06-06 --source hacker-news
```

试跑但不写文件：

```bash
npm run ingest -- --date 2026-06-06 --dry-run
```

从候选池生成草稿：

```bash
npm run issue:from-candidates -- --date 2026-06-06 --limit 8
```

生成草稿运营摘要：

```bash
npm run draft:summary -- --date 2026-06-06
```

从候选池直接生成公开日报：

```bash
npm run issue:from-candidates -- --date 2026-06-06 --limit 8 --publish
```

创建某一天的人工草稿：

```bash
npm run issue:new -- 2026-06-06
```

发布或撤回某一天：

```bash
npm run issue:publish -- 2026-06-06
npm run issue:unpublish -- 2026-06-06
```

发布脚本会先检查公开内容是否具备有效来源链接、连续排序、正确分类计数，并拦截草稿/复核类内部话术。

## 验证

校验所有日报、候选池和来源池：

```bash
npm run issue:validate
```

校验指定日期：

```bash
npm run issue:validate -- 2026-06-05
```

运行站点运营体检：

```bash
npm run site:audit
```

生产部署前可增加生产 URL 校验：

```bash
npm run site:audit -- --production
npm run site:audit:production
```

运行内容契约测试：

```bash
npm test
```

推荐发布前顺序：

```bash
npm run ingest -- --date 2026-06-06
npm run issue:from-candidates -- --date 2026-06-06 --limit 8
npm run draft:summary -- --date 2026-06-06
npm run issue:publish -- 2026-06-06
npm run issue:validate
npm run site:audit
npm test
npm run lint
npm run build
```

## 自动化

- `.github/workflows/ci.yml` 在 push/PR 时运行内容校验、测试、lint 和 build。
- `.github/workflows/daily-draft.yml` 支持定时或手动生成候选池、日报草稿和 Markdown 运营摘要，并上传 artifact；默认不自动提交到仓库。
- 需要认证的来源先在 `content/sources.json` 中通过 `requiresAuth` 和 `authEnv` 预留，例如 `X_BEARER_TOKEN`、`WECHAT_SOURCE_TOKEN`。

## 部署

Vercel 部署前建议配置：

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.example
NEXT_PUBLIC_CONTACT_EMAIL=editor@example.com
NEXT_PUBLIC_NEWSLETTER_URL=https://newsletter.example.com
PUBLIC_ISSUE_MAX_AGE_DAYS=3
```

本地可参考 `.env.example` 配置站点 URL、联系邮箱、Newsletter URL、公开日报最大允许过期天数和后续来源接入所需的环境变量。日报站默认要求公开内容 3 天内更新一次；如果假期或低频运营，可通过 `PUBLIC_ISSUE_MAX_AGE_DAYS` 临时放宽。不要把真实 token 提交到仓库。

如果使用 Vercel CLI，本机需要先登录：

```bash
npx vercel login
npx vercel deploy --prod --yes
```

## 页面与接口

- `/` 今日指数
- `/daily/[date]` 每日详情
- `/archive` 历史归档
- `/about` 评分方法
- `/topics` 主题索引
- `/topics/[slug]` 主题详情
- `/sources` 来源池
- `/search` 静态搜索
- `/subscribe` 订阅入口
- `/editorial` 编辑政策
- `/contact` 联系与投稿
- `/rss.xml` RSS
- `/feed.json` JSON Feed
- `/sitemap.xml` sitemap
- `/api/health` 部署健康检查，返回公开日报数量、最新日期和启用来源数

## 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- 本地 JSON 内容源
- Zod 数据校验
- tsx 脚本运行
