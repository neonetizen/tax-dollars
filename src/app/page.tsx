"use client";

import { useCallback, useState } from "react";
import { AppProvider, useAppContext } from "@/context/AppContext";
import { HeroHeader } from "@/components/HeroHeader";
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
    <div className="flex min-h-screen flex-col bg-sd-bg">
      <HeroHeader />

      <main className="mx-auto flex w-full max-w-4xl flex-1 items-center px-4 py-10">
        <div className="w-full">
          {!showReceipt && !receiptLoading && (
            <div className="rounded-2xl bg-white p-6 shadow-xl sm:p-8">
              {state.error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {state.error}
                </div>
              )}
              <InputForm onSubmit={handleCalculate} />
            </div>
          )}

          {receiptLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-sd-sky-light border-t-sd-blue" />
              <p className="text-lg font-semibold text-sd-navy">
                Crunching the numbers&hellip;
              </p>
            </div>
          )}

          {showReceipt && !receiptLoading && (
            <>
              <TaxReceipt />
              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    setShowReceipt(false);
                    dispatch({ type: "SET_ERROR", payload: "" });
                  }}
                  className="rounded-lg border border-sd-blue/20 bg-white px-6 py-2.5 text-sm font-semibold text-sd-blue shadow-sm transition-all hover:bg-sd-bg hover:shadow-md"
                >
                  Calculate Again
                </button>
              </div>
            </>
          )}
        </div>
      </main>
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
