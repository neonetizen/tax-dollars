"use client";

import { useCallback, useRef, useState } from "react";
import { AppProvider, useAppContext } from "@/context/AppContext";
import { HeroHeader } from "@/components/HeroHeader";
import { InputForm } from "@/components/InputForm";
import { TaxReceipt } from "@/components/TaxReceipt";
import { LoadingScreen } from "@/components/LoadingScreen";
import { aggregateBudget } from "@/lib/budgetAggregator";
import { aggregateCIP, getAllCIPProjects } from "@/lib/cipAggregator";
import { calculateTaxBreakdown } from "@/lib/taxCalculator";
import type { VerdictRequest } from "@/types";
import Papa from "papaparse";

const DATA_URLS = {
  budget: "/data/actuals_operating_datasd.csv",
  cip: "/data/budget_capital_fy_datasd.csv",
};

function fetchCSV(url: string): Promise<Record<string, unknown>[]> {
  return fetch(url).then((response) => {
    if (!response.ok) throw new Error(`Failed to fetch ${url}`);
    return response.text();
  }).then((text) =>
    Papa.parse<Record<string, unknown>>(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    }).data
  );
}

type Phase = "input" | "loading" | "receipt";

function AppContent() {
  const { state, dispatch } = useAppContext();
  const [phase, setPhase] = useState<Phase>("input");
  const [errorMsg, setErrorMsg] = useState("");
  const dataLoadedRef = useRef(false);

  const handleCalculate = useCallback(async () => {
    setPhase("loading");
    setErrorMsg("");

    try {
      let budgetData = state.budgetData;
      let cipData = state.cipData;
      let totalGeneralFundSpend = state.totalGeneralFundSpend;

      if (!dataLoadedRef.current) {
        dispatch({ type: "SET_LOADING", payload: { dataset: "budget", loading: true } });
        dispatch({ type: "SET_LOADING", payload: { dataset: "cip", loading: true } });

        const results = await Promise.allSettled([
          fetchCSV(DATA_URLS.budget),
          fetchCSV(DATA_URLS.cip),
        ]);

        if (results[0].status === "fulfilled") {
          const agg = aggregateBudget(results[0].value);
          budgetData = agg.departmentSpendMap;
          totalGeneralFundSpend = [...budgetData.values()].reduce((s, v) => s + v, 0);
          dispatch({ type: "SET_BUDGET_DATA", payload: budgetData });
        } else {
          throw new Error("Could not load city budget data. Please try again.");
        }
        dispatch({ type: "SET_LOADING", payload: { dataset: "budget", loading: false } });

        if (results[1].status === "fulfilled") {
          cipData = aggregateCIP(results[1].value);
          dispatch({ type: "SET_CIP_DATA", payload: cipData });
        }
        dispatch({ type: "SET_LOADING", payload: { dataset: "cip", loading: false } });

        dataLoadedRef.current = true;
      }

      if (!budgetData) {
        throw new Error("Budget data is unavailable. Please try again.");
      }

      const breakdown = calculateTaxBreakdown(
        state.input.assessedValue,
        budgetData,
        totalGeneralFundSpend,
      );
      dispatch({ type: "SET_TAX_BREAKDOWN", payload: breakdown });

      const cipProjects = cipData
        ? getAllCIPProjects(cipData).slice(0, 20)
        : [];

      const verdictReq: VerdictRequest = {
        assessedValue: state.input.assessedValue,
        cityContribution: breakdown.cityContribution,
        deptBreakdown: breakdown.departments,
        cipProjects,
      };

      dispatch({ type: "SET_VERDICT_LOADING", payload: true });
      setPhase("receipt");

      try {
        const res = await fetch("/api/verdict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(verdictReq),
        });
        const data = await res.json();
        dispatch({ type: "SET_VERDICT", payload: data.verdict || data.error || "Unable to generate verdict." });
      } catch {
        dispatch({ type: "SET_VERDICT", payload: "Unable to generate verdict. Please try again." });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMsg(msg);
      setPhase("input");
    }
  }, [state, dispatch]);

  return (
    <div className="flex min-h-screen flex-col bg-sd-bg">
      <HeroHeader />

      <main className="mx-auto flex w-full max-w-4xl flex-1 items-center px-4 py-10">
        <div className="w-full">
          {phase === "loading" && (
            <LoadingScreen loading={state.loading} />
          )}

          {phase === "input" && (
            <div className="rounded-2xl bg-white p-6 shadow-xl sm:p-8">
              {errorMsg && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {errorMsg}
                </div>
              )}
              <InputForm onSubmit={handleCalculate} />
            </div>
          )}

          {phase === "receipt" && (
            <>
              <TaxReceipt />
              <div className="mt-8 text-center">
                <button
                  onClick={() => setPhase("input")}
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
