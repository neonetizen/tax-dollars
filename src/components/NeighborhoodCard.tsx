"use client";

import type { NeighborhoodCardProps } from "@/types";

function getGrade(avgDays: number, cityAvg: number): string {
  const ratio = avgDays / cityAvg;
  if (ratio <= 0.7) return "A";
  if (ratio <= 0.9) return "B";
  if (ratio <= 1.1) return "C";
  if (ratio <= 1.3) return "D";
  return "F";
}

const GRADE_COLORS: Record<string, string> = {
  A: "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200",
  B: "text-sd-blue bg-sd-sky-pale ring-1 ring-sd-sky-light",
  C: "text-sd-gold-dark bg-sd-gold/10 ring-1 ring-sd-gold/30",
  D: "text-orange-700 bg-orange-50 ring-1 ring-orange-200",
  F: "text-red-700 bg-red-50 ring-1 ring-red-200",
};

export function NeighborhoodCard({
  stats,
  cityAvgDays = 0,
}: NeighborhoodCardProps) {
  const grade = cityAvgDays > 0 ? getGrade(stats.avgResolutionDays, cityAvgDays) : null;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
      <div className="h-1 bg-sd-blue" />
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-sd-navy">{stats.name}</h3>
          {grade && (
            <span
              className={`rounded-lg px-3 py-1 text-lg font-bold ${GRADE_COLORS[grade]}`}
            >
              Grade: {grade}
            </span>
          )}
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-sd-bg p-4 text-center">
            <p className="text-sm font-medium text-sd-text-muted">Avg Resolution Time</p>
            <p className="mt-1 text-xl font-bold text-sd-navy">{stats.avgResolutionDays} days</p>
            {cityAvgDays > 0 && (
              <p className="mt-0.5 text-xs text-sd-text-muted/60">City avg: {cityAvgDays} days</p>
            )}
          </div>
          <div className="rounded-xl bg-sd-bg p-4 text-center">
            <p className="text-sm font-medium text-sd-text-muted">Total Cases</p>
            <p className="mt-1 text-xl font-bold text-sd-navy">
              {stats.totalCases.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl bg-sd-bg p-4 text-center">
            <p className="text-sm font-medium text-sd-text-muted">Issue Categories</p>
            <p className="mt-1 text-xl font-bold text-sd-navy">{stats.topServices.length}</p>
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-sd-navy">
            Top Issues
          </h4>
          <div className="space-y-2">
            {stats.topServices.map((s) => {
              const maxCount = stats.topServices[0]?.count || 1;
              const width = (s.count / maxCount) * 100;
              return (
                <div key={s.service} className="flex items-center gap-3">
                  <span className="w-40 truncate text-sm text-sd-text-muted">{s.service}</span>
                  <div className="flex-1">
                    <div
                      className="h-3 rounded-full bg-sd-sky"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-sd-navy">
                    {s.count.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
