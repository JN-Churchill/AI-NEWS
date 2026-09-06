import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 纯静态导出：可同时部署到 Vercel 免费层与 GitHub Pages，零成本。
  output: "export",
  // 静态导出下禁用 next/image 优化，避免构建期图片处理失败。
  images: { unoptimized: true },
  trailingSlash: true,
  // 尽量放开 dev 模式的来源限制，方便局域网任意 IP 访问调试。
  // 注意：Next 官方文档声明 '*' 通配不被正式支持，此处为实测尝试；
  // 若 '*' 不生效，下面的精确 IP / localhost 兜底仍会放行常见入口。
  allowedDevOrigins: ["*", "192.168.110.13", "localhost", "127.0.0.1"],
};

export default nextConfig;
