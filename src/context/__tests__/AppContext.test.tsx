import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AppProvider, useAppContext } from "../AppContext";
import type { ReactNode } from "react";

function wrapper({ children }: { children: ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}

describe("AppContext", () => {
  it("provides initial state", () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    expect(result.current.state.error).toBeNull();
    expect(result.current.state.taxBreakdown).toBeNull();
    expect(result.current.state.cipProjects).toEqual([]);
    expect(result.current.state.verdict).toBeNull();
    expect(result.current.state.verdictLoading).toBe(false);
    expect(result.current.state.input.assessedValue).toBe(0);
    expect(result.current.state.input.zipCode).toBe("");
  });

  it("throws when used outside AppProvider", () => {
    expect(() => {
      renderHook(() => useAppContext());
    }).toThrow("useAppContext must be used within AppProvider");
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
      expect(result.current.state.input.zipCode).toBe("");
    });
  });

  describe("SET_RECEIPT_DATA", () => {
    it("stores breakdown and CIP projects", () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });
      const breakdown = {
        assessedValue: 650_000,
        baseTax: 6_500,
        cityContribution: 1_170,
        departments: [],
      };
      const cipProjects = [
        {
          projectName: "Water Main",
          projectNumber: "P-001",
          assetOwningDept: "PUD",
          amount: 5_000_000,
          fundType: "Capital",
          reportFY: "25",
        },
      ];

      act(() => {
        result.current.dispatch({
          type: "SET_RECEIPT_DATA",
          payload: { breakdown, cipProjects },
        });
      });

      expect(result.current.state.taxBreakdown).toEqual(breakdown);
      expect(result.current.state.cipProjects).toHaveLength(1);
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
});
