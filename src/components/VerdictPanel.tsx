"use client";

import { useAppContext } from "@/context/AppContext";

export function VerdictPanel() {
  const { state } = useAppContext();

  if (!state.verdict && !state.verdictLoading) return null;

  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <h3 className="mb-4 text-xl font-bold text-navy-900">
        Your Value-for-Money Verdict
      </h3>
      {state.verdictLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-4 rounded bg-gray-200" />
          <div className="h-4 w-5/6 rounded bg-gray-200" />
          <div className="h-4 w-4/6 rounded bg-gray-200" />
        </div>
      ) : (
        <div className="whitespace-pre-line text-gray-700 leading-relaxed">
          {state.verdict}
        </div>
      )}
    </div>
  );
}
