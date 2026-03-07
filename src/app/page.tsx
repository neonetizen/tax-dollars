"use client";

import { useEffect, useState, useCallback } from "react";
import { AppProvider, useAppContext } from "@/context/AppContext";
import { LoadingScreen } from "@/components/LoadingScreen";
import { InputForm } from "@/components/InputForm";
import { TaxReceipt } from "@/components/TaxReceipt";
import { aggregateBudget } from "@/lib/budgetAggregator";
import { aggregateNeighborhoods } from "@/lib/neighborhoodAggregator";
import { aggregateCIP, getCIPProjectsForNeighborhood } from "@/lib/cipAggregator";
import { calculateTaxBreakdown } from "@/lib/taxCalculator";
import type { VerdictRequest } from "@/types";
import Papa from "papaparse";

const DATA_URLS = {
  budget: "/data/operating_actuals_datasd.csv",
  neighborhood: "/data/get_it_done_requests_closed_2025_datasd.csv",
  cip: "/data/capital_actuals_ptd_datasd.csv",
};

function AppContent() {
  const { state, dispatch } = useAppContext();
  const [cityAvgDays, setCityAvgDays] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);

  const allLoaded = !Object.values(state.loading).some(Boolean);

  useEffect(() => {
    async function fetchCSV(url: string) {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch ${url}`);
      const text = await response.text();
      return Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
      }).data;
    }

    const loadAll = async () => {
      const results = await Promise.allSettled([
        fetchCSV(DATA_URLS.budget),
        fetchCSV(DATA_URLS.neighborhood),
        fetchCSV(DATA_URLS.cip),
      ]);

      // Budget
      if (results[0].status === "fulfilled") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { departmentSpendMap } = aggregateBudget(results[0].value as any[]);
        dispatch({ type: "SET_BUDGET_DATA", payload: departmentSpendMap });
      } else {
        dispatch({ type: "SET_ERROR", payload: "Failed to load budget data" });
      }
      dispatch({ type: "SET_LOADING", payload: { dataset: "budget", loading: false } });

      // Neighborhood (311)
      if (results[1].status === "fulfilled") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { neighborhoodMap, neighborhoodsList, cityAvgResolutionDays } = aggregateNeighborhoods(results[1].value as any[]);
        dispatch({ type: "SET_NEIGHBORHOOD_DATA", payload: neighborhoodMap });
        dispatch({ type: "SET_NEIGHBORHOODS_LIST", payload: neighborhoodsList });
        setCityAvgDays(cityAvgResolutionDays);
      } else {
        dispatch({ type: "SET_ERROR", payload: "Failed to load 311 data" });
      }
      dispatch({ type: "SET_LOADING", payload: { dataset: "neighborhood", loading: false } });

      // CIP
      if (results[2].status === "fulfilled") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cipMap = aggregateCIP(results[2].value as any[]);
        dispatch({ type: "SET_CIP_DATA", payload: cipMap });
      } else {
        dispatch({ type: "SET_ERROR", payload: "Failed to load CIP data" });
      }
      dispatch({ type: "SET_LOADING", payload: { dataset: "cip", loading: false } });
    };

    loadAll();
  }, [dispatch]);

  const handleCalculate = useCallback(async () => {
    const { budgetData, neighborhoodData, cipData, totalGeneralFundSpend, input } = state;
    if (!budgetData || !neighborhoodData || !input.assessedValue || !input.neighborhood) return;

    const breakdown = calculateTaxBreakdown(input.assessedValue, budgetData, totalGeneralFundSpend);
    dispatch({ type: "SET_TAX_BREAKDOWN", payload: breakdown });
    setShowReceipt(true);

    // Request verdict from Claude
    const neighborhoodStats = neighborhoodData.get(input.neighborhood);
    if (!neighborhoodStats) return;

    const cipProjects = cipData
      ? getCIPProjectsForNeighborhood(cipData, input.neighborhood)
      : [];

    const verdictReq: VerdictRequest = {
      assessedValue: input.assessedValue,
      cityContribution: breakdown.cityContribution,
      neighborhood: input.neighborhood,
      deptBreakdown: breakdown.departments,
      avgResolutionDays: neighborhoodStats.avgResolutionDays,
      cityAvgResolutionDays: cityAvgDays,
      topIssues: neighborhoodStats.topServices,
      cipProjects,
    };

    if (state.comparisonMode && input.comparisonNeighborhood) {
      verdictReq.comparisonNeighborhood = input.comparisonNeighborhood;
      verdictReq.comparisonStats = neighborhoodData.get(input.comparisonNeighborhood);
      verdictReq.comparisonCipProjects = cipData
        ? getCIPProjectsForNeighborhood(cipData, input.comparisonNeighborhood)
        : [];
    }

    dispatch({ type: "SET_VERDICT_LOADING", payload: true });

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
  }, [state, cityAvgDays, dispatch]);

  if (!allLoaded) {
    return <LoadingScreen loading={state.loading} />;
  }

  if (state.error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-red-50 p-6 text-red-700">
          <h2 className="mb-2 text-xl font-bold">Error Loading Data</h2>
          <p>{state.error}</p>
        </div>
      </div>
    );
  }

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

      <InputForm onSubmit={handleCalculate} />

      {showReceipt && (
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
