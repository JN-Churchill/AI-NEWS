import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { candidatePoolSchema } from "../src/lib/candidate-schema";
import { dailyIssueSchema } from "../src/lib/issue-schema";
import { sourceConfigListSchema } from "../src/lib/source-schema";

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

      if (issue.status !== "draft") {
        publicIssueCount += 1;
        issue.items.forEach((item) => {
          assert.doesNotThrow(() => new URL(item.sourceUrl));
          assert.equal(/发布前|等待人工|页面抓取候选|复核/.test(`${item.summary} ${item.whyItMatters}`), false);
        });
      }
    });

    assert.ok(publicIssueCount > 0);
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
});
