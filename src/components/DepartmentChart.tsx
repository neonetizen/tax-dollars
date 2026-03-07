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
  "#003366",
  "#0085CA",
  "#FFC425",
  "#4DB8E8",
  "#0A4D80",
  "#F2A900",
  "#339FD4",
  "#B8E2F6",
  "#5a6b7f",
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
    <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
      <div className="h-1 bg-sd-blue" />
      <div className="p-6 sm:p-8">
        <h3 className="mb-6 text-xl font-bold text-sd-navy">
          Where Your Dollars Go
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 140 }}>
            <XAxis
              type="number"
              tickFormatter={(v: number) => `$${v.toFixed(0)}`}
              tick={{ fill: "#5a6b7f", fontSize: 12 }}
              axisLine={{ stroke: "#E0F1FB" }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={130}
              tick={{ fill: "#003366", fontSize: 12, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => [
                `$${Number(value).toFixed(2)}`,
                "Your Contribution",
              ]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #E0F1FB",
                boxShadow: "0 4px 12px rgba(0,51,102,0.08)",
              }}
            />
            <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
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
    </div>
  );
}
