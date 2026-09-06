import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 纯静态导出：可同时部署到 Vercel 免费层与 GitHub Pages，零成本。
  output: "export",
  // 静态导出下禁用 next/image 优化，避免构建期图片处理失败。
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
