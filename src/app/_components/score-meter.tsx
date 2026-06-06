type ScoreMeterProps = {
  score: number;
  size?: "sm" | "lg";
  tone?: "signal" | "mono";
};

export function ScoreMeter({ score, size = "sm", tone = "signal" }: ScoreMeterProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const sizeClass = size === "lg" ? "h-3" : "h-2";
  const toneClass =
    tone === "mono"
      ? "bg-neutral-950"
      : clampedScore >= 80
        ? "bg-emerald-600"
        : clampedScore >= 70
          ? "bg-amber-500"
          : "bg-rose-500";

  return (
    <div className={`relative w-full overflow-hidden rounded-full bg-neutral-200/90 shadow-inner ${sizeClass}`}>
      <div className={`h-full rounded-full ${toneClass}`} style={{ width: `${clampedScore}%` }} />
      <div className="absolute inset-y-0 left-[70%] w-px bg-white/70" />
      <div className="absolute inset-y-0 left-[85%] w-px bg-white/70" />
    </div>
  );
}
