// =============================================================================
// My Tax Dollars — Shared TypeScript Interfaces
// =============================================================================
// Single source of truth for all data shapes. Both engineers import from here.
// Naming matches the actual CSV column conventions used by Engineer A's
// aggregators and the component tree built by Engineer B.
// =============================================================================

// -----------------------------------------------------------------------------
// Domain Data (produced by aggregators in src/lib/)
// -----------------------------------------------------------------------------

export interface DepartmentSpend {
  department: string;
  amount: number;
  percentage: number;
}

export interface ServiceCategory {
  service: string;
  count: number;
}

export interface NeighborhoodStats {
  name: string;
  avgResolutionDays: number;
  totalCases: number;
  topServices: ServiceCategory[];
  casesByType: Record<string, number>;
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
  neighborhood?: string;
  avgResolutionDays?: number;
  cityAvgResolutionDays?: number;
  topIssues?: ServiceCategory[];
  comparisonNeighborhood?: string;
  comparisonStats?: NeighborhoodStats;
  comparisonCipProjects?: CIPProject[];
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
  zipcode: string;
  neighborhood: string;
  comparisonNeighborhood: string;
}

// -----------------------------------------------------------------------------
// App State (useReducer in AppContext)
// -----------------------------------------------------------------------------

export interface AppState {
  loading: Record<string, boolean>;
  error: string | null;

  budgetData: Map<string, number> | null;
  neighborhoodData: Map<string, NeighborhoodStats> | null;
  cipData: Map<string, CIPProject[]> | null;
  neighborhoodsList: string[];
  totalGeneralFundSpend: number;

  input: AppInput;
  taxBreakdown: TaxBreakdown | null;

  verdict: string | null;
  verdictLoading: boolean;
  comparisonMode: boolean;
}

// -----------------------------------------------------------------------------
// Reducer Actions (discriminated union)
// -----------------------------------------------------------------------------

export type AppAction =
  | { type: "SET_LOADING"; payload: { dataset: string; loading: boolean } }
  | { type: "SET_BUDGET_DATA"; payload: Map<string, number> }
  | { type: "SET_NEIGHBORHOOD_DATA"; payload: Map<string, NeighborhoodStats> }
  | { type: "SET_CIP_DATA"; payload: Map<string, CIPProject[]> }
  | { type: "SET_NEIGHBORHOODS_LIST"; payload: string[] }
  | { type: "SET_ERROR"; payload: string }
  | { type: "SET_INPUT"; payload: Partial<AppInput> }
  | { type: "SET_TAX_BREAKDOWN"; payload: TaxBreakdown }
  | { type: "SET_VERDICT"; payload: string }
  | { type: "SET_VERDICT_LOADING"; payload: boolean }
  | { type: "TOGGLE_COMPARISON" };

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

export interface NeighborhoodCardProps {
  stats: NeighborhoodStats;
  cityAvgDays?: number;
}

export interface ComparisonViewProps {
  cityAvgDays: number;
}
