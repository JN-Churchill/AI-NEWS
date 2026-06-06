import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { candidatePoolSchema } from "../src/lib/candidate-schema";
import { dailyIssueSchema } from "../src/lib/issue-schema";
import { sourceConfigListSchema } from "../src/lib/source-schema";
import { GET as getHealth } from "../src/app/api/health/route";
import { GET as getJsonFeed } from "../src/app/feed.json/route";
import { GET as getRss } from "../src/app/rss.xml/route";
import sitemap from "../src/app/sitemap";
import { searchSignalEntries } from "../src/lib/catalog";
import { getPublicIssueQualityErrors } from "../scripts/issue-quality";
import { paginateItems } from "../src/lib/pagination";

const root = process.cwd();

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8")) as T;
}

describe("content contracts", () => {
  it("keeps the hero asset deployable", () => {
    const heroPath = path.join(root, "public", "hero-intelligence-desk.jpg");
    const stats = fs.statSync(heroPath);

    assert.ok(stats.size > 0);
    assert.ok(stats.size < 250_000);
  });

  it("parses the source catalog and keeps ids unique", () => {
    const sources = sourceConfigListSchema.parse(readJson("content/sources.json"));
    const ids = new Set(sources.map((source) => source.id));

    assert.equal(ids.size, sources.length);
    assert.ok(sources.some((source) => source.enabled && source.feedUrl));
    assert.ok(sources.some((source) => source.requiresAuth && !source.enabled));
  });

  it("parses every issue file and keeps ranks ordered", () => {
    const issueFiles = fs.readdirSync(path.join(root, "content/issues")).filter((fileName) => fileName.endsWith(".json"));

    assert.ok(issueFiles.length > 0);
    let publicIssueCount = 0;

    issueFiles.forEach((fileName) => {
      const issue = dailyIssueSchema.parse(readJson(path.join("content/issues", fileName)));
      const ranks = issue.items.map((item) => item.rank);

      assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b));
      assert.equal(issue.items.length, issue.selectedCount);

      if (issue.status === "published") {
        publicIssueCount += 1;
        assert.deepEqual(getPublicIssueQualityErrors(issue), []);
      }
    });

    assert.ok(publicIssueCount > 0);
  });

  it("rejects generated public summary templates", () => {
    const issueFiles = fs.readdirSync(path.join(root, "content/issues")).filter((fileName) => fileName.endsWith(".json"));
    const publicIssue = issueFiles
      .map((fileName) => dailyIssueSchema.parse(readJson(path.join("content/issues", fileName))))
      .find((issue) => issue.status === "published");

    assert.ok(publicIssue);

    const issueWithTemplateSummary = {
      ...publicIssue,
      items: publicIssue.items.map((item, index) =>
        index === 0
          ? {
              ...item,
              summary: `来自 ${item.source} 的公开信号，核心内容指向「${item.title}」。这条内容值得结合原文继续查看其具体细节、适用场景和后续影响。`,
            }
          : item,
      ),
    };

    assert.ok(getPublicIssueQualityErrors(issueWithTemplateSummary).some((error) => error.includes("generic generated summary")));
  });

  it("paginates long lists with clamped page boundaries", () => {
    const items = Array.from({ length: 25 }, (_, index) => index + 1);
    const lastPage = paginateItems(items, "9", 10);
    const invalidPage = paginateItems(items, "abc", 10);
    const emptyPage = paginateItems([], "2", 10);

    assert.deepEqual(lastPage.items, [21, 22, 23, 24, 25]);
    assert.equal(lastPage.currentPage, 3);
    assert.equal(lastPage.pageCount, 3);
    assert.equal(lastPage.startIndex, 21);
    assert.equal(lastPage.endIndex, 25);
    assert.equal(lastPage.hasNextPage, false);
    assert.equal(invalidPage.currentPage, 1);
    assert.equal(emptyPage.currentPage, 1);
    assert.equal(emptyPage.pageCount, 1);
    assert.equal(emptyPage.startIndex, 0);
    assert.deepEqual(emptyPage.items, []);
  });

  it("parses candidate pools when present", () => {
    const candidatesPath = path.join(root, "content/candidates");

    if (!fs.existsSync(candidatesPath)) {
      return;
    }

    fs.readdirSync(candidatesPath)
      .filter((fileName) => fileName.endsWith(".json"))
      .forEach((fileName) => {
        const pool = candidatePoolSchema.parse(readJson(path.join("content/candidates", fileName)));

        assert.equal(pool.items.length, pool.itemCount);
      });
  });

  it("searches published signals with multiple weighted terms", () => {
    const openAiModelResults = searchSignalEntries("OpenAI 模型");
    const nvidiaAgentResults = searchSignalEntries("NVIDIA Agent");

    assert.ok(openAiModelResults.length > 0);
    assert.equal(openAiModelResults[0]?.source, "OpenAI News");
    assert.ok(openAiModelResults[0]?.tags.includes("模型"));
    assert.equal(nvidiaAgentResults[0]?.source, "NVIDIA Generative AI Blog");
  });

  it("exposes deployable feed, sitemap, and health outputs", async () => {
    const health = (await getHealth().json()) as {
      ok: boolean;
      publicIssueCount: number;
      latestIssueDate: string | null;
      contentFresh: boolean;
      contentAgeDays: number | null;
      maxPublicIssueAgeDays: number;
    };
    const jsonFeed = (await getJsonFeed().json()) as { items: unknown[] };
    const rss = await getRss().text();
    const sitemapEntries = sitemap();

    assert.equal(health.ok, true);
    assert.equal(health.contentFresh, true);
    assert.equal(typeof health.maxPublicIssueAgeDays, "number");
    assert.ok(health.contentAgeDays === null || health.contentAgeDays >= 0);
    assert.ok(health.publicIssueCount > 0);
    assert.equal(typeof health.latestIssueDate, "string");
    assert.ok(jsonFeed.items.length > 0);
    assert.match(rss, /<rss version="2.0"/);
    assert.match(rss, /<atom:link/);
    assert.ok(sitemapEntries.some((entry) => entry.url.endsWith("/subscribe")));
    assert.ok(sitemapEntries.some((entry) => entry.url.endsWith(`/daily/${health.latestIssueDate}`)));
  });
});
