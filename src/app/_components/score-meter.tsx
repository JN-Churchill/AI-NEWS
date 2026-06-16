type ScoreMeterProps = {
  score: number;
  size?: "sm" | "lg";
  tone?: "signal" | "mono";
};

export function ScoreMeter({ score, size = "sm", tone = "signal" }: ScoreMeterProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const sizeClass = size === "lg" ? "h-2" : "h-1.5";

  return (
    <div
      className={`relative w-full overflow-hidden rounded-full ${sizeClass}`}
      style={{ background: "var(--line)" }}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${clampedScore}%`,
          background: tone === "mono" ? "var(--ink)" : clampedScore >= 80 ? "var(--ink)" : clampedScore >= 70 ? "var(--muted)" : "var(--line)",
        }}
      />
    </div>
  );
}
