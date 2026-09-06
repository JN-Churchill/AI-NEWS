"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/** 返回顶部：滚动超过阈值淡入 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 620);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="返回顶部"
      className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full text-[#05121a] transition-all duration-300"
      style={{
        background: "linear-gradient(120deg, var(--color-brand-1), var(--color-brand-2))",
        boxShadow: "0 10px 26px -8px rgba(34,211,238,0.7)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(14px)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
    </button>
  );
}
