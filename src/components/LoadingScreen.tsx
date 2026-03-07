"use client";

import type { LoadingScreenProps } from "@/types";

const DATASET_LABELS: Record<string, string> = {
  budget: "Budget data",
  cip: "CIP data",
};

export function LoadingScreen({ loading }: LoadingScreenProps) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-4 border-sd-sky-light border-t-sd-blue" />
        <h2 className="mb-6 text-2xl font-bold text-sd-navy">
          Crunching the numbers&hellip;
        </h2>
        <div className="space-y-3">
          {Object.entries(DATASET_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center justify-center gap-3 text-lg">
              <span className="flex h-6 w-6 items-center justify-center">
                {loading[key] ? (
                  <span className="inline-block h-4 w-4 animate-pulse rounded-full bg-sd-sky" />
                ) : (
                  <svg className="h-5 w-5 text-sd-gold-dark" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
              <span className={loading[key] ? "text-sd-text-muted" : "font-medium text-sd-navy"}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
