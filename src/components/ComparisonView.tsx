"use client";

import { useAppContext } from "@/context/AppContext";
import { NeighborhoodCard } from "./NeighborhoodCard";
import { VerdictPanel } from "./VerdictPanel";
import type { ComparisonViewProps } from "@/types";

export function ComparisonView({ cityAvgDays }: ComparisonViewProps) {
  const { state } = useAppContext();
  const { neighborhoodData, input } = state;

  const statsA = neighborhoodData?.get(input.neighborhood);
  const statsB = neighborhoodData?.get(input.comparisonNeighborhood);

  if (!statsA || !statsB) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <NeighborhoodCard stats={statsA} cityAvgDays={cityAvgDays} />
        <NeighborhoodCard stats={statsB} cityAvgDays={cityAvgDays} />
      </div>
      <VerdictPanel />
    </div>
  );
}
