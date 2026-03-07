"use client";

import type { DepartmentChartProps } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = [
  "#1e3a5f",
  "#2563eb",
  "#d97706",
  "#059669",
  "#dc2626",
  "#7c3aed",
  "#db2777",
  "#0891b2",
  "#65a30d",
];

export function DepartmentChart({ departments }: DepartmentChartProps) {
  const top8 = departments.slice(0, 8);
  const otherAmount = departments
    .slice(8)
    .reduce((sum, d) => sum + d.amount, 0);
  const otherPercentage = departments
    .slice(8)
    .reduce((sum, d) => sum + d.percentage, 0);

  const chartData = [
    ...top8.map((d) => ({
      name: d.department,
      amount: d.amount,
      percentage: d.percentage,
    })),
    ...(otherAmount > 0
      ? [
          {
            name: "Other",
            amount: Math.round(otherAmount * 100) / 100,
            percentage: Math.round(otherPercentage * 100) / 100,
          },
        ]
      : []),
  ];

  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <h3 className="mb-4 text-xl font-bold text-navy-900">
        Department Breakdown
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 140 }}>
          <XAxis
            type="number"
            tickFormatter={(v: number) => `$${v.toFixed(0)}`}
          />
          <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value) => [
              `$${Number(value).toFixed(2)}`,
              "Your Contribution",
            ]}
          />
          <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
