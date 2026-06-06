"use client";

import { useState } from "react";

type ShareLinkButtonProps = {
  url: string;
};

export function ShareLinkButton({ url }: ShareLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.location.href = url;
    }
  }

  return (
    <button
      className="h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50"
      type="button"
      onClick={copyLink}
      aria-label="复制这条信号的分享链接"
    >
      {copied ? "已复制" : "分享"}
    </button>
  );
}
