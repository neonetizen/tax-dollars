"use client";

import { useAppContext } from "@/context/AppContext";

export function VerdictPanel() {
  const { state } = useAppContext();

  if (!state.verdict && !state.verdictLoading) return null;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
      <div className="flex items-stretch">
        <div className="w-1.5 shrink-0 bg-sd-blue" />
        <div className="p-6 sm:p-8">
          <h3 className="mb-4 text-xl font-bold text-sd-navy">
            Your Value-for-Money Verdict
          </h3>
          {state.verdictLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 rounded-full bg-sd-sky-light/60" />
              <div className="h-4 w-5/6 rounded-full bg-sd-sky-light/60" />
              <div className="h-4 w-4/6 rounded-full bg-sd-sky-light/60" />
            </div>
          ) : (
            <div className="whitespace-pre-line leading-relaxed text-sd-text-muted">
              {state.verdict}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
