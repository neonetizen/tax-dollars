// =============================================================================
// My Tax Dollars — Shared TypeScript Interfaces
// =============================================================================

// -----------------------------------------------------------------------------
// Domain Data
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
// API Routes
// -----------------------------------------------------------------------------

export interface TaxReceiptResponse {
  breakdown: TaxBreakdown;
  cipProjects: CIPProject[];
}

export interface VerdictRequest {
  assessedValue: number;
  cityContribution: number;
  deptBreakdown: DepartmentSpend[];
  cipProjects: CIPProject[];
  zipCode?: string;
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
  zipCode: string;
}

// -----------------------------------------------------------------------------
// App State (useReducer in AppContext)
// -----------------------------------------------------------------------------

export interface AppState {
  error: string | null;
  input: AppInput;
  taxBreakdown: TaxBreakdown | null;
  cipProjects: CIPProject[];
  verdict: string | null;
  verdictLoading: boolean;
}

// -----------------------------------------------------------------------------
// Reducer Actions (discriminated union)
// -----------------------------------------------------------------------------

export type AppAction =
  | { type: "SET_ERROR"; payload: string }
  | { type: "SET_INPUT"; payload: Partial<AppInput> }
  | { type: "SET_RECEIPT_DATA"; payload: TaxReceiptResponse }
  | { type: "SET_VERDICT"; payload: string }
  | { type: "SET_VERDICT_LOADING"; payload: boolean };

// -----------------------------------------------------------------------------
// Component Props
// -----------------------------------------------------------------------------

export interface InputFormProps {
  onSubmit: () => void;
}

export interface DepartmentChartProps {
  departments: DepartmentSpend[];
}
