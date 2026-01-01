/**
 * CFO Insights Component Types (DATA HOLDERS)
 * @governance COMPONENT-001, DOC-002
 * @doc-sync PAGE_DATA_API_REFERENCE.md:2
 *
 * TypeScript interfaces for CFO Insights dashboard.
 * Based on ORION Platform Audit - CFO Insights Center page.
 */

// ============================================================================
// PORTFOLIO HEALTH
// ============================================================================

export type PortfolioHealthStatus = 'ON_TRACK' | 'AT_RISK' | 'CRITICAL';

/**
 * Portfolio health metrics
 * @component PortfolioHealthBanner
 * @schema orion_core.portfolio_metrics
 * @api GET /api/v1/cfo/health
 */
export interface PortfolioHealth {
  /** Overall portfolio status */
  status: PortfolioHealthStatus;
  /** Average Cost Performance Index */
  avgCPI: number;
  /** Average Schedule Performance Index */
  avgSPI: number;
  /** Total projects count */
  totalProjects: number;
  /** Projects on track */
  onTrackCount: number;
  /** Projects at risk */
  atRiskCount: number;
  /** Critical projects */
  criticalCount: number;
}

// ============================================================================
// PORTFOLIO FINANCIALS
// ============================================================================

/**
 * Portfolio financial summary
 * @component PortfolioFinancialsCard
 * @schema orion_core.portfolio_financials (aggregated from SAP)
 * @api GET /api/v1/cfo/financials
 */
export interface PortfolioFinancials {
  /** Budget at Completion (total across all projects) */
  totalBAC: number;
  /** Actual costs incurred */
  actualCosts: number;
  /** Open purchase order commitments */
  openCommitments: number;
  /** Revenue received from clients */
  revenueReceived: number;
  /** Net cash position */
  netCashPosition: number;
  /** Currency code */
  currency: 'USD' | 'NGN';
}

// ============================================================================
// PROJECT BUDGET BREAKDOWN
// ============================================================================

/**
 * Individual project budget for comparison
 * @component ProjectBudgetChart
 * @schema orion_core.projects, orion_evm.project_snapshots
 * @api GET /api/v1/cfo/budgets
 */
export interface ProjectBudget {
  /** Project identifier */
  projectId: string;
  /** Project name */
  projectName: string;
  /** Budget at Completion */
  bac: number;
  /** Actual Cost */
  actualCost: number;
  /** Earned Value */
  earnedValue: number;
  /** Estimate at Completion */
  eac: number;
}

// ============================================================================
// PROJECT COMPARISON
// ============================================================================

/**
 * Project comparison row for data table
 * @component ProjectComparisonTable
 * @schema orion_core.projects, orion_evm.project_snapshots
 * @api GET /api/v1/cfo/comparison
 */
export interface ProjectComparison {
  /** Project identifier */
  projectId: string;
  /** Project name */
  projectName: string;
  /** Percent complete */
  percentComplete: number;
  /** Schedule Performance Index */
  spi: number;
  /** Cost Performance Index */
  cpi: number;
  /** Budget at Completion */
  bac: number;
  /** Actual Cost */
  ac: number;
  /** Earned Value */
  ev: number;
  /** Estimate at Completion */
  eac: number;
  /** Variance at Completion */
  vac: number;
  /** Health status */
  status: 'on_track' | 'at_risk' | 'critical';
}

// ============================================================================
// CFO DASHBOARD STATE
// ============================================================================

export interface CFOLoadingState {
  health: boolean;
  financials: boolean;
  budgets: boolean;
  comparison: boolean;
}

export interface CFOErrorState {
  health: string | null;
  financials: string | null;
  budgets: string | null;
  comparison: string | null;
}

export interface CFODashboardState {
  health: PortfolioHealth | null;
  financials: PortfolioFinancials | null;
  budgets: ProjectBudget[];
  comparison: ProjectComparison[];
  isLoading: CFOLoadingState;
  errors: CFOErrorState;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface CFODashboardProps {
  /** Tenant ID for data fetching */
  tenantId: string;
  /** Callback when project is clicked */
  onProjectClick?: (projectId: string) => void;
}

export interface PortfolioHealthBannerProps {
  data: PortfolioHealth | null;
  isLoading: boolean;
  error: string | null;
}

export interface PortfolioFinancialsCardProps {
  data: PortfolioFinancials | null;
  isLoading: boolean;
  error: string | null;
}

export interface ProjectBudgetChartProps {
  data: ProjectBudget[];
  isLoading: boolean;
  error: string | null;
}

export interface ProjectComparisonTableProps {
  data: ProjectComparison[];
  isLoading: boolean;
  error: string | null;
  onProjectClick?: (projectId: string) => void;
}
