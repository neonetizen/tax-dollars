"use client";

import type { NeighborhoodStats } from "@/types";

interface NeighborhoodCardProps {
  stats: NeighborhoodStats;
  cityAvgDays?: number;
}

function getGrade(avgDays: number, cityAvg: number): string {
  const ratio = avgDays / cityAvg;
  if (ratio <= 0.7) return "A";
  if (ratio <= 0.9) return "B";
  if (ratio <= 1.1) return "C";
  if (ratio <= 1.3) return "D";
  return "F";
}

const GRADE_COLORS: Record<string, string> = {
  A: "text-green-700 bg-green-100",
  B: "text-blue-700 bg-blue-100",
  C: "text-yellow-700 bg-yellow-100",
  D: "text-orange-700 bg-orange-100",
  F: "text-red-700 bg-red-100",
};

export function NeighborhoodCard({
  stats,
  cityAvgDays = 0,
}: NeighborhoodCardProps) {
  const grade = cityAvgDays > 0 ? getGrade(stats.avgResolutionDays, cityAvgDays) : null;

  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold text-navy-900">{stats.name}</h3>
        {grade && (
          <span
            className={`rounded-lg px-3 py-1 text-lg font-bold ${GRADE_COLORS[grade]}`}
          >
            Grade: {grade}
          </span>
        )}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-gray-50 p-3 text-center">
          <p className="text-sm text-gray-500">Avg Resolution Time</p>
          <p className="text-xl font-bold">{stats.avgResolutionDays} days</p>
          {cityAvgDays > 0 && (
            <p className="text-xs text-gray-400">City avg: {cityAvgDays} days</p>
          )}
        </div>
        <div className="rounded-lg bg-gray-50 p-3 text-center">
          <p className="text-sm text-gray-500">Total Cases</p>
          <p className="text-xl font-bold">
            {stats.totalCases.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3 text-center">
          <p className="text-sm text-gray-500">Issue Categories</p>
          <p className="text-xl font-bold">{stats.topServices.length}</p>
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-gray-600">
          Top Issues
        </h4>
        <div className="space-y-2">
          {stats.topServices.map((s) => {
            const maxCount = stats.topServices[0]?.count || 1;
            const width = (s.count / maxCount) * 100;
            return (
              <div key={s.service} className="flex items-center gap-3">
                <span className="w-40 truncate text-sm">{s.service}</span>
                <div className="flex-1">
                  <div
                    className="h-4 rounded bg-blue-200"
                    style={{ width: `${width}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500">
                  {s.count.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
