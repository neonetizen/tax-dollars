"use client";

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from "react";
import type { AppState, AppAction } from "@/types";

const initialState: AppState = {
  loading: { budget: true, cip: true },
  error: null,
  budgetData: null,
  cipData: null,
  totalGeneralFundSpend: 0,
  input: {
    assessedValue: 0,
  },
  taxBreakdown: null,
  verdict: null,
  verdictLoading: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.dataset]: action.payload.loading,
        },
      };
    case "SET_BUDGET_DATA":
      return {
        ...state,
        budgetData: action.payload,
        totalGeneralFundSpend: [...action.payload.values()].reduce(
          (sum, v) => sum + v,
          0
        ),
      };
    case "SET_CIP_DATA":
      return { ...state, cipData: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_INPUT":
      return { ...state, input: { ...state.input, ...action.payload } };
    case "SET_VERDICT":
      return { ...state, verdict: action.payload, verdictLoading: false };
    case "SET_VERDICT_LOADING":
      return { ...state, verdictLoading: action.payload };
    case "SET_TAX_BREAKDOWN":
      return { ...state, taxBreakdown: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}
