// =============================================================================
// My Tax Dollars — Shared TypeScript Interfaces
// =============================================================================

// -----------------------------------------------------------------------------
// Domain Data (produced by aggregators in src/lib/)
// -----------------------------------------------------------------------------

export interface DepartmentSpend {
  department: string;
  amount: number;
  percentage: number;
}

export interface CIPProject {
  projectName: string;
  projectNumber: string;
  assetOwningDept: string;
  amount: number;
  fundType: string;
  reportFY: string;
}

// -----------------------------------------------------------------------------
// Tax Calculator
// -----------------------------------------------------------------------------

export interface TaxBreakdown {
  assessedValue: number;
  baseTax: number;
  cityContribution: number;
  departments: DepartmentSpend[];
}

// -----------------------------------------------------------------------------
// Claude API Route (/api/verdict)
// -----------------------------------------------------------------------------

export interface VerdictRequest {
  assessedValue: number;
  cityContribution: number;
  deptBreakdown: DepartmentSpend[];
  cipProjects: CIPProject[];
}

export interface VerdictResponse {
  verdict: string;
  error?: string;
}

// -----------------------------------------------------------------------------
// User Input
// -----------------------------------------------------------------------------

export interface AppInput {
  assessedValue: number;
}

// -----------------------------------------------------------------------------
// App State (useReducer in AppContext)
// -----------------------------------------------------------------------------

export interface AppState {
  loading: Record<string, boolean>;
  error: string | null;

  budgetData: Map<string, number> | null;
  cipData: Map<string, CIPProject[]> | null;
  totalGeneralFundSpend: number;

  input: AppInput;
  taxBreakdown: TaxBreakdown | null;

  verdict: string | null;
  verdictLoading: boolean;
}

// -----------------------------------------------------------------------------
// Reducer Actions (discriminated union)
// -----------------------------------------------------------------------------

export type AppAction =
  | { type: "SET_LOADING"; payload: { dataset: string; loading: boolean } }
  | { type: "SET_BUDGET_DATA"; payload: Map<string, number> }
  | { type: "SET_CIP_DATA"; payload: Map<string, CIPProject[]> }
  | { type: "SET_ERROR"; payload: string }
  | { type: "SET_INPUT"; payload: Partial<AppInput> }
  | { type: "SET_TAX_BREAKDOWN"; payload: TaxBreakdown }
  | { type: "SET_VERDICT"; payload: string }
  | { type: "SET_VERDICT_LOADING"; payload: boolean };

// -----------------------------------------------------------------------------
// Component Props
// -----------------------------------------------------------------------------

export interface LoadingScreenProps {
  loading: Record<string, boolean>;
}

export interface InputFormProps {
  onSubmit: () => void;
}

export interface DepartmentChartProps {
  departments: DepartmentSpend[];
}
