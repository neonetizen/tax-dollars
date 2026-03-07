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
  error: null,
  input: {
    assessedValue: 0,
    zipCode: "",
  },
  taxBreakdown: null,
  cipProjects: [],
  verdict: null,
  verdictLoading: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_INPUT":
      return { ...state, input: { ...state.input, ...action.payload } };
    case "SET_RECEIPT_DATA":
      return {
        ...state,
        taxBreakdown: action.payload.breakdown,
        cipProjects: action.payload.cipProjects,
      };
    case "SET_VERDICT":
      return { ...state, verdict: action.payload, verdictLoading: false };
    case "SET_VERDICT_LOADING":
      return { ...state, verdictLoading: action.payload };
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
