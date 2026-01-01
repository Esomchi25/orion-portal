/**
 * Project Dashboard Component Types (DATA HOLDERS)
 * @governance COMPONENT-001, DOC-002
 * @doc-sync PAGE_DATA_API_REFERENCE.md:3
 *
 * TypeScript interfaces for Project Dashboard.
 * Based on ORION Platform Audit - Project Dashboard page.
 */

// ============================================================================
// PROJECT HEADER
// ============================================================================

export type ProjectStatus = 'on_track' | 'at_risk' | 'critical';

/**
 * Project header and identification
 * @component ProjectHeader
 * @schema orion_core.projects
 * @api GET /api/v1/project/{projectId}
 */
export interface ProjectHeader {
  /** Project identifier */
  projectId: string;
  /** Project name */
  projectName: string;
  /** Project code */
  projectCode: string;
  /** Percent complete */
  percentComplete: number;
  /** Overall health status */
  status: ProjectStatus;
  /** Data date (last sync) */
  dataDate: string;
  /** Planned start date */
  plannedStart: string;
  /** Planned finish date */
  plannedFinish: string;
  /** P6 project ID for reference */
  p6ProjectId: string;
  /** SAP WBS element */
  sapWbsElement: string | null;
}

// ============================================================================
// PERFORMANCE INDICES
// ============================================================================

/**
 * CPI/SPI performance metrics for gauge display
 * @component PerformanceGauges
 * @schema orion_evm.project_snapshots
 * @api GET /api/v1/project/{projectId}/performance
 */
export interface PerformanceMetrics {
  /** Schedule Performance Index */
  spi: number;
  /** Cost Performance Index */
  cpi: number;
  /** Overall health score (0-100) */
  healthScore: number;
  /** Schedule variance (SV = EV - PV) */
  sv: number;
  /** Cost variance (CV = EV - AC) */
  cv: number;
  /** To-Complete Performance Index */
  tcpi: number;
}

// ============================================================================
// DOMAIN PROGRESS (EPCIC)
// ============================================================================

export type DomainType = 'engineering' | 'procurement' | 'construction' | 'installation' | 'commissioning';

/**
 * EPCIC domain progress breakdown
 * @component DomainProgressChart
 * @schema orion_evm.wbs_metrics (filtered by domain)
 * @api GET /api/v1/project/{projectId}/domains
 */
export interface DomainProgress {
  /** Domain type */
  domain: DomainType;
  /** Domain display label */
  label: string;
  /** Planned value (PV) */
  plannedValue: number;
  /** Earned value (EV) */
  earnedValue: number;
  /** Actual cost (AC) */
  actualCost: number;
  /** Percent complete */
  percentComplete: number;
  /** Domain-level SPI */
  spi: number;
  /** Domain-level CPI */
  cpi: number;
}

// ============================================================================
// BUDGET ANALYTICS
// ============================================================================

/**
 * Project budget breakdown
 * @component BudgetChart
 * @schema orion_evm.project_snapshots
 * @api GET /api/v1/project/{projectId}/budget
 */
export interface BudgetAnalytics {
  /** Budget at Completion */
  bac: number;
  /** Earned Value */
  ev: number;
  /** Actual Cost */
  ac: number;
  /** Planned Value (BCWS) */
  pv: number;
  /** Estimate at Completion */
  eac: number;
  /** Estimate to Complete */
  etc: number;
  /** Variance at Completion */
  vac: number;
  /** Currency */
  currency: 'USD' | 'NGN';
}

// ============================================================================
// SCHEDULE INTELLIGENCE
// ============================================================================

/**
 * P6 Schedule statistics
 * @component ScheduleIntelligence
 * @schema p6_raw.activities, p6_raw.wbs
 * @api GET /api/v1/project/{projectId}/schedule
 */
export interface ScheduleIntelligence {
  /** Total activities in schedule */
  totalActivities: number;
  /** Completed activities */
  completedActivities: number;
  /** In-progress activities */
  inProgressActivities: number;
  /** Not started activities */
  notStartedActivities: number;
  /** Critical path activities */
  criticalPathActivities: number;
  /** WBS elements count */
  wbsElements: number;
  /** Original duration (days) */
  originalDuration: number;
  /** Remaining duration (days) */
  remainingDuration: number;
  /** Float days (total float) */
  totalFloat: number;
}

// ============================================================================
// S-CURVE DATA
// ============================================================================

/**
 * S-Curve data point for baseline vs actual comparison
 * @component SCurveChart
 * @schema orion_evm.project_snapshots (time series)
 * @api GET /api/v1/project/{projectId}/scurve
 */
export interface SCurveDataPoint {
  /** Date label */
  date: string;
  /** Baseline (planned) value */
  baseline: number;
  /** Actual value */
  actual: number;
  /** Forecast value (for future dates) */
  forecast?: number;
}

// ============================================================================
// PROJECT DASHBOARD STATE
// ============================================================================

export interface ProjectLoadingState {
  header: boolean;
  performance: boolean;
  domains: boolean;
  budget: boolean;
  schedule: boolean;
  scurve: boolean;
}

export interface ProjectErrorState {
  header: string | null;
  performance: string | null;
  domains: string | null;
  budget: string | null;
  schedule: string | null;
  scurve: string | null;
}

export interface ProjectDashboardState {
  header: ProjectHeader | null;
  performance: PerformanceMetrics | null;
  domains: DomainProgress[];
  budget: BudgetAnalytics | null;
  schedule: ScheduleIntelligence | null;
  scurve: SCurveDataPoint[];
  isLoading: ProjectLoadingState;
  errors: ProjectErrorState;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface ProjectDashboardProps {
  /** Project ID to display */
  projectId: string;
  /** Tenant ID for data fetching */
  tenantId: string;
  /** Callback when navigation is triggered */
  onNavigate?: (path: string) => void;
}

export interface ProjectHeaderProps {
  data: ProjectHeader | null;
  isLoading: boolean;
  error: string | null;
}

export interface PerformanceGaugesProps {
  data: PerformanceMetrics | null;
  isLoading: boolean;
  error: string | null;
}

export interface DomainProgressChartProps {
  data: DomainProgress[];
  isLoading: boolean;
  error: string | null;
}

export interface BudgetChartProps {
  data: BudgetAnalytics | null;
  isLoading: boolean;
  error: string | null;
}

export interface ScheduleIntelligenceProps {
  data: ScheduleIntelligence | null;
  isLoading: boolean;
  error: string | null;
}

export interface SCurveChartProps {
  data: SCurveDataPoint[];
  isLoading: boolean;
  error: string | null;
}
