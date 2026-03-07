export interface DepartmentSpend {
  department: string;
  amount: number;
  percentage: number;
}

export interface TaxBreakdown {
  assessedValue: number;
  baseTax: number;
  cityContribution: number;
  departments: DepartmentSpend[];
}

export interface NeighborhoodStats {
  name: string;
  avgResolutionDays: number;
  totalCases: number;
  topServices: { service: string; count: number }[];
  casesByType: Record<string, number>;
}

export interface CIPProject {
  projectTitle: string;
  assetOwningDept: string;
  amount: number;
  councilDistrict: number;
}

export interface VerdictRequest {
  assessedValue: number;
  cityContribution: number;
  neighborhood: string;
  deptBreakdown: DepartmentSpend[];
  avgResolutionDays: number;
  cityAvgResolutionDays: number;
  topIssues: { service: string; count: number }[];
  cipProjects: CIPProject[];
  comparisonNeighborhood?: string;
  comparisonStats?: NeighborhoodStats;
  comparisonCipProjects?: CIPProject[];
}

export interface VerdictResponse {
  verdict: string;
  error?: string;
}

export type AppAction =
  | { type: "SET_LOADING"; payload: { dataset: string; loading: boolean } }
  | { type: "SET_BUDGET_DATA"; payload: Map<string, number> }
  | { type: "SET_NEIGHBORHOOD_DATA"; payload: Map<string, NeighborhoodStats> }
  | { type: "SET_CIP_DATA"; payload: Map<number, CIPProject[]> }
  | { type: "SET_NEIGHBORHOODS_LIST"; payload: string[] }
  | { type: "SET_ERROR"; payload: string }
  | { type: "SET_INPUT"; payload: Partial<AppInput> }
  | { type: "SET_VERDICT"; payload: string }
  | { type: "SET_VERDICT_LOADING"; payload: boolean }
  | { type: "TOGGLE_COMPARISON" }
  | { type: "SET_TAX_BREAKDOWN"; payload: TaxBreakdown };

export interface AppInput {
  assessedValue: number;
  neighborhood: string;
  comparisonNeighborhood: string;
}

export interface AppState {
  loading: Record<string, boolean>;
  error: string | null;
  budgetData: Map<string, number> | null;
  neighborhoodData: Map<string, NeighborhoodStats> | null;
  cipData: Map<number, CIPProject[]> | null;
  neighborhoodsList: string[];
  totalGeneralFundSpend: number;
  input: AppInput;
  taxBreakdown: TaxBreakdown | null;
  verdict: string | null;
  verdictLoading: boolean;
  comparisonMode: boolean;
}
