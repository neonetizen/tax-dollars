"use client";

import { useAppContext } from "@/context/AppContext";
import { DepartmentChart } from "./DepartmentChart";
import { VerdictPanel } from "./VerdictPanel";
import { Disclaimer } from "./Disclaimer";

export function TaxReceipt() {
  const { state } = useAppContext();
  const { taxBreakdown } = state;

  if (!taxBreakdown) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
        <div className="h-1.5 bg-gradient-to-r from-sd-navy via-sd-blue to-sd-sky" />
        <div className="p-6 sm:p-8">
          <h2 className="mb-6 text-2xl font-bold text-sd-navy sm:text-3xl">
            Your San Diego Tax Receipt
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-sd-bg p-5 text-center">
              <p className="text-sm font-medium text-sd-text-muted">Assessed Value</p>
              <p className="mt-1 text-2xl font-bold text-sd-navy">
                ${taxBreakdown.assessedValue.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-sd-bg p-5 text-center">
              <p className="text-sm font-medium text-sd-text-muted">Base Property Tax (1%)</p>
              <p className="mt-1 text-2xl font-bold text-sd-navy">
                ${taxBreakdown.baseTax.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-sd-gold/10 p-5 text-center ring-1 ring-sd-gold/30">
              <p className="text-sm font-medium text-sd-gold-dark">Your City Contribution</p>
              <p className="mt-1 text-2xl font-bold text-sd-gold-dark">
                ${taxBreakdown.cityContribution.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <DepartmentChart departments={taxBreakdown.departments} cityContribution={taxBreakdown.cityContribution} />

      <VerdictPanel />
      <Disclaimer />
    </div>
  );
}
