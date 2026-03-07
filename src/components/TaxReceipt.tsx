"use client";

import { useAppContext } from "@/context/AppContext";
import { DepartmentChart } from "./DepartmentChart";
import { NeighborhoodCard } from "./NeighborhoodCard";
import { VerdictPanel } from "./VerdictPanel";
import { Disclaimer } from "./Disclaimer";

export function TaxReceipt() {
  const { state } = useAppContext();
  const { taxBreakdown, neighborhoodData, input } = state;

  if (!taxBreakdown) return null;

  const neighborhoodStats = neighborhoodData?.get(input.neighborhood);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-2 text-2xl font-bold text-navy-900">
          Your San Diego Tax Receipt
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-4 text-center">
            <p className="text-sm text-gray-500">Assessed Value</p>
            <p className="text-2xl font-bold text-navy-800">
              ${taxBreakdown.assessedValue.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 text-center">
            <p className="text-sm text-gray-500">Base Property Tax (1%)</p>
            <p className="text-2xl font-bold text-navy-800">
              ${taxBreakdown.baseTax.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 text-center">
            <p className="text-sm text-gray-500">Your City Contribution</p>
            <p className="text-2xl font-bold text-amber-600">
              ${taxBreakdown.cityContribution.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <DepartmentChart departments={taxBreakdown.departments} />

      {neighborhoodStats && (
        <NeighborhoodCard stats={neighborhoodStats} />
      )}

      <VerdictPanel />
      <Disclaimer />
    </div>
  );
}
