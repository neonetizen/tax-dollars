import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AppProvider, useAppContext } from "../AppContext";
import type { ReactNode } from "react";
import type { CIPProject, NeighborhoodStats } from "@/types";

function wrapper({ children }: { children: ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}

describe("AppContext", () => {
  it("provides initial state", () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    expect(result.current.state.loading).toEqual({ budget: true, cip: true });
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.budgetData).toBeNull();
    expect(result.current.state.taxBreakdown).toBeNull();
    expect(result.current.state.verdict).toBeNull();
    expect(result.current.state.comparisonMode).toBe(false);
  });

  it("throws when used outside AppProvider", () => {
    expect(() => {
      renderHook(() => useAppContext());
    }).toThrow("useAppContext must be used within AppProvider");
  });

  describe("SET_LOADING", () => {
    it("updates loading state for a dataset", () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.dispatch({
          type: "SET_LOADING",
          payload: { dataset: "budget", loading: false },
        });
      });

      expect(result.current.state.loading.budget).toBe(false);
      expect(result.current.state.loading.cip).toBe(true);
    });
  });

  describe("SET_BUDGET_DATA", () => {
    it("sets budget data and computes totalGeneralFundSpend", () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });
      const deptMap = new Map([
        ["Police", 500_000],
        ["Fire-Rescue", 300_000],
      ]);

      act(() => {
        result.current.dispatch({ type: "SET_BUDGET_DATA", payload: deptMap });
      });

      expect(result.current.state.budgetData).toBe(deptMap);
      expect(result.current.state.totalGeneralFundSpend).toBe(800_000);
    });
  });

  describe("SET_NEIGHBORHOOD_DATA", () => {
    it("sets neighborhood data", () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });
      const nMap = new Map<string, NeighborhoodStats>([
        [
          "North Park",
          {
            name: "North Park",
            avgResolutionDays: 10,
            totalCases: 100,
            topServices: [],
            casesByType: {},
          },
        ],
      ]);

      act(() => {
        result.current.dispatch({
          type: "SET_NEIGHBORHOOD_DATA",
          payload: nMap,
        });
      });

      expect(result.current.state.neighborhoodData?.get("North Park")?.totalCases).toBe(100);
    });
  });

  describe("SET_CIP_DATA", () => {
    it("sets CIP data", () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });
      const cipMap = new Map<string, CIPProject[]>([
        [
          "PUD",
          [
            {
              projectName: "Test",
              projectNumber: "1",
              assetOwningDept: "PUD",
              amount: 100,
              fundType: "C",
              reportFY: "25",
            },
          ],
        ],
      ]);

      act(() => {
        result.current.dispatch({ type: "SET_CIP_DATA", payload: cipMap });
      });

      expect(result.current.state.cipData?.get("PUD")).toHaveLength(1);
    });
  });

  describe("SET_ERROR", () => {
    it("sets error message", () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.dispatch({
          type: "SET_ERROR",
          payload: "Something broke",
        });
      });

      expect(result.current.state.error).toBe("Something broke");
    });
  });

  describe("SET_INPUT", () => {
    it("merges partial input", () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.dispatch({
          type: "SET_INPUT",
          payload: { assessedValue: 650_000 },
        });
      });

      expect(result.current.state.input.assessedValue).toBe(650_000);
      expect(result.current.state.input.zipcode).toBe("");
    });
  });

  describe("SET_TAX_BREAKDOWN", () => {
    it("stores tax breakdown", () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });
      const breakdown = {
        assessedValue: 650_000,
        baseTax: 6_500,
        cityContribution: 1_170,
        departments: [],
      };

      act(() => {
        result.current.dispatch({
          type: "SET_TAX_BREAKDOWN",
          payload: breakdown,
        });
      });

      expect(result.current.state.taxBreakdown).toEqual(breakdown);
    });
  });

  describe("SET_VERDICT", () => {
    it("sets verdict and clears loading", () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.dispatch({ type: "SET_VERDICT_LOADING", payload: true });
      });
      expect(result.current.state.verdictLoading).toBe(true);

      act(() => {
        result.current.dispatch({
          type: "SET_VERDICT",
          payload: "Your tax dollars are well spent.",
        });
      });

      expect(result.current.state.verdict).toBe("Your tax dollars are well spent.");
      expect(result.current.state.verdictLoading).toBe(false);
    });
  });

  describe("TOGGLE_COMPARISON", () => {
    it("toggles comparison mode", () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      expect(result.current.state.comparisonMode).toBe(false);

      act(() => {
        result.current.dispatch({ type: "TOGGLE_COMPARISON" });
      });
      expect(result.current.state.comparisonMode).toBe(true);

      act(() => {
        result.current.dispatch({ type: "TOGGLE_COMPARISON" });
      });
      expect(result.current.state.comparisonMode).toBe(false);
    });
  });
});
