"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export interface SectionHeatPoint {
  name: string;
  heat: number;
  count: number;
}

const COLORS = ["#22d3ee", "#6366f1", "#a855f7", "#f59e0b", "#22c55e"];

/** 各版块平均热度分布 */
export function SectionHeatChart({ data }: { data: SectionHeatPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={176}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
        <XAxis
          dataKey="name"
          tick={{ fill: "#94a3b8", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <Tooltip
          cursor={{ fill: "rgba(148,163,184,0.08)" }}
          contentStyle={{
            background: "rgba(18,20,31,0.95)",
            border: "1px solid rgba(148,163,184,0.24)",
            borderRadius: 12,
            fontSize: 12,
            color: "#f1f5f9",
          }}
          formatter={(value: number, _name, payload) => [
            `平均热度 ${value} · ${payload?.payload?.count ?? 0} 条`,
            "热度",
          ]}
        />
        <Bar dataKey="heat" radius={[6, 6, 0, 0]} maxBarSize={46}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
