"use client";

import { useCallback, useState } from "react";
import { AppProvider, useAppContext } from "@/context/AppContext";
import { InputForm } from "@/components/InputForm";
import { TaxReceipt } from "@/components/TaxReceipt";
import type { TaxReceiptResponse, VerdictRequest } from "@/types";

function AppContent() {
  const { state, dispatch } = useAppContext();
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);

  const handleCalculate = useCallback(
    async (assessedValue: number, zipCode: string) => {
      if (!assessedValue) return;

      setReceiptLoading(true);
      setShowReceipt(false);
      dispatch({ type: "SET_ERROR", payload: "" });

      try {
        const res = await fetch("/api/tax-receipt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assessedValue,
            zipCode: zipCode || undefined,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          dispatch({
            type: "SET_ERROR",
            payload:
              (err as { error?: string }).error ??
              "Failed to load receipt data",
          });
          return;
        }

        const receiptData: TaxReceiptResponse = await res.json();
        dispatch({ type: "SET_RECEIPT_DATA", payload: receiptData });
        setShowReceipt(true);

        dispatch({ type: "SET_VERDICT_LOADING", payload: true });

        const verdictReq: VerdictRequest = {
          assessedValue,
          cityContribution: receiptData.breakdown.cityContribution,
          deptBreakdown: receiptData.breakdown.departments,
          cipProjects: receiptData.cipProjects.slice(0, 20),
          zipCode: zipCode || undefined,
        };

        const verdictRes = await fetch("/api/verdict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(verdictReq),
        });

        if (!verdictRes.ok) {
          const errData = await verdictRes.json().catch(() => ({}));
          dispatch({
            type: "SET_VERDICT",
            payload:
              (errData as { error?: string }).error ??
              "Unable to generate verdict.",
          });
          return;
        }

        const verdictData: { verdict?: string; error?: string } =
          await verdictRes.json();
        dispatch({
          type: "SET_VERDICT",
          payload:
            verdictData.verdict ||
            verdictData.error ||
            "Unable to generate verdict.",
        });
      } catch {
        dispatch({
          type: "SET_ERROR",
          payload: "Unable to generate receipt. Please try again.",
        });
      } finally {
        setReceiptLoading(false);
      }
    },
    [dispatch]
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <header className="mb-12 text-center">
        <h1 className="mb-2 text-4xl font-bold text-navy-900">
          My Tax Dollars
        </h1>
        <p className="text-lg text-gray-600">
          A receipt for your San Diego property taxes
        </p>
      </header>

      {state.error && (
        <div className="mx-auto mb-8 max-w-lg rounded-lg bg-red-50 p-4 text-red-700">
          {state.error}
        </div>
      )}

      <InputForm onSubmit={handleCalculate} />

      {receiptLoading && (
        <div className="mt-12 text-center text-gray-500">
          Loading your receipt…
        </div>
      )}

      {showReceipt && !receiptLoading && (
        <div className="mt-12">
          <TaxReceipt />
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
