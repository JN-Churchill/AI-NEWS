interface HeatGaugeProps {
  value: number;
  label?: string;
  size?: number;
}

/**
 * 环形热度仪表——纯 SVG，无额外依赖，服务端可渲染。
 * 用渐变描边表现"信号强度"，与站点青→紫主色一致。
 */
export function HeatGauge({ value, label = "综合热度", size = 148 }: HeatGaugeProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="heatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="55%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(148,163,184,0.16)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#heatGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-[34px] font-extrabold leading-none gradient-text">
          {clamped.toFixed(1)}
        </span>
        <span className="mt-1.5 text-[11.5px] tracking-wide text-[var(--color-ink-3)]">{label}</span>
      </div>
    </div>
  );
}
