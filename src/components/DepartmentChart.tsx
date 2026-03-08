"use client";

import { useState } from "react";
import type { DepartmentChartProps } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Treemap,
} from "recharts";

const COLORS = [
  "#003B5C",
  "#009CDE",
  "#FFC425",
  "#5DC3F0",
  "#0A5A80",
  "#F2A900",
  "#33B0E5",
  "#A8DEFA",
  "#5a6b7f",
];

type ChartView = "bar" | "donut" | "treemap" | "list";

const VIEW_OPTIONS: { id: ChartView; label: string }[] = [
  { id: "list", label: "List" },
  { id: "bar", label: "Bar" },
  { id: "treemap", label: "Treemap" },
  { id: "donut", label: "Donut" },
];

interface ChartDatum {
  name: string;
  amount: number;
  percentage: number;
}

function buildChartData(departments: DepartmentChartProps["departments"], expanded: boolean): ChartDatum[] {
  if (expanded) {
    return departments.map((d) => ({
      name: d.department,
      amount: d.amount,
      percentage: d.percentage,
    }));
  }

  const top8 = departments.slice(0, 8);
  const rest = departments.slice(8);
  const otherAmount = rest.reduce((sum, d) => sum + d.amount, 0);
  const otherPercentage = rest.reduce((sum, d) => sum + d.percentage, 0);

  return [
    ...top8.map((d) => ({
      name: d.department,
      amount: d.amount,
      percentage: d.percentage,
    })),
    ...(otherAmount > 0
      ? [{
          name: "Other",
          amount: Math.round(otherAmount * 100) / 100,
          percentage: Math.round(otherPercentage * 100) / 100,
        }]
      : []),
  ];
}

function BarView({ data }: { data: ChartDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} layout="vertical" margin={{ left: 140 }}>
        <XAxis
          type="number"
          tickFormatter={(v: number) => `$${v.toFixed(0)}`}
          tick={{ fill: "#5a6b7f", fontSize: 12 }}
          axisLine={{ stroke: "#DBF0FC" }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={130}
          tick={{ fill: "#003B5C", fontSize: 12, fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value) => [`$${Number(value).toFixed(2)}`, "Your Contribution"]}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #DBF0FC",
            boxShadow: "0 4px 12px rgba(0,59,92,0.08)",
          }}
        />
        <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
          {data.map((_, i) => (
            <Cell key={`bar-${i}`} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function DonutView({ data, cityContribution }: { data: ChartDatum[]; cityContribution: number }) {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="85%"
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((_, i) => (
              <Cell key={`pie-${i}`} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [
              `$${Number(value).toFixed(2)}`,
              String(name),
            ]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #DBF0FC",
              boxShadow: "0 4px 12px rgba(0,59,92,0.08)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-medium text-sd-text-muted">City Total</p>
          <p className="text-2xl font-bold text-sd-navy">
            ${cityContribution.toFixed(0)}
          </p>
        </div>
      </div>
    </div>
  );
}

interface TreemapContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  amount?: number;
  index?: number;
}

function TreemapContent({ x = 0, y = 0, width = 0, height = 0, name, amount, index = 0 }: TreemapContentProps) {
  const fill = COLORS[index % COLORS.length];
  const showLabel = width > 60 && height > 40;
  const showAmount = width > 60 && height > 55;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={6}
        fill={fill}
        stroke="#fff"
        strokeWidth={2}
      />
      {showLabel && (
        <text
          x={x + width / 2}
          y={y + height / 2 - (showAmount ? 8 : 0)}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#fff"
          fontSize={width > 100 ? 13 : 11}
          fontWeight={600}
        >
          {name && name.length > 18 ? name.slice(0, 16) + "..." : name}
        </text>
      )}
      {showAmount && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 14}
          textAnchor="middle"
          dominantBaseline="central"
          fill="rgba(255,255,255,0.8)"
          fontSize={11}
        >
          ${amount?.toFixed(0)}
        </text>
      )}
    </g>
  );
}

function TreemapView({ data }: { data: ChartDatum[] }) {
  const treemapData = data.map((d) => ({ ...d }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <Treemap
        data={treemapData}
        dataKey="amount"
        nameKey="name"
        content={<TreemapContent />}
      >
        <Tooltip
          formatter={(value, name) => [
            `$${Number(value).toFixed(2)}`,
            String(name),
          ]}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #DBF0FC",
            boxShadow: "0 4px 12px rgba(0,59,92,0.08)",
          }}
        />
      </Treemap>
    </ResponsiveContainer>
  );
}

function ListView({ data }: { data: ChartDatum[] }) {
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div key={d.name} className="flex items-center gap-3">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: COLORS[i % COLORS.length] }}
          >
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="truncate text-sm font-semibold text-sd-navy">
                {d.name}
              </span>
              <span className="shrink-0 text-sm font-bold text-sd-navy">
                ${d.amount.toFixed(2)}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-sd-sky-pale">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${d.percentage}%`,
                  backgroundColor: COLORS[i % COLORS.length],
                }}
              />
            </div>
          </div>
          <span className="w-12 shrink-0 text-right text-xs text-sd-text-muted">
            {d.percentage.toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}

export function DepartmentChart({ departments, cityContribution }: DepartmentChartProps) {
  const [view, setView] = useState<ChartView>("list");
  const [expanded, setExpanded] = useState(false);
  const hasOther = departments.length > 8;
  const chartData = buildChartData(departments, expanded);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
      <div className="h-1 bg-sd-blue" />
      <div className="p-6 sm:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xl font-bold text-sd-navy">
            Where Your Dollars Go
          </h3>
          <div className="flex gap-1 rounded-lg bg-sd-bg p-1">
            {VIEW_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setView(opt.id)}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-all ${
                  view === opt.id
                    ? "bg-sd-blue text-white shadow-sm"
                    : "text-sd-navy hover:bg-sd-sky-pale"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {view === "bar" && <BarView data={chartData} />}
        {view === "donut" && <DonutView data={chartData} cityContribution={cityContribution} />}
        {view === "treemap" && <TreemapView data={chartData} />}
        {view === "list" && <ListView data={chartData} />}

        {hasOther && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-4 w-full rounded-lg border border-sd-sky-light/50 py-2 text-sm font-semibold text-sd-blue transition-colors hover:bg-sd-sky-pale"
          >
            {expanded
              ? `Show top 8 + Other`
              : `Expand "Other" (${departments.length - 8} more departments)`}
          </button>
        )}
      </div>
    </div>
  );
}
