"use client";

import type { LoadingScreenProps } from "@/types";

const DATASET_LABELS: Record<string, string> = {
  budget: "Budget data",
  neighborhood: "311 data",
  cip: "CIP data",
};

export function LoadingScreen({ loading }: LoadingScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="mb-6 text-2xl font-semibold text-navy-900">
          Loading San Diego city data...
        </h2>
        <div className="space-y-3">
          {Object.entries(DATASET_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-3 text-lg">
              <span className="w-6 text-center">
                {loading[key] ? (
                  <span className="inline-block animate-spin">⏳</span>
                ) : (
                  "✓"
                )}
              </span>
              <span className={loading[key] ? "text-gray-500" : "text-green-700"}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
