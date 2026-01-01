/**
 * EVM Module Component Types (DATA HOLDERS)
 * @governance COMPONENT-001, DOC-002
 * @doc-sync PAGE_DATA_API_REFERENCE.md:4
 *
 * TypeScript interfaces for EVM Analysis module.
 * Based on ORION Platform Audit - EVM Reference page.
 */

// ============================================================================
// EVM DEFINITIONS
// ============================================================================

export type EVMMetricCategory = 'base' | 'variance' | 'index' | 'forecast';

/**
 * EVM metric definition for reference
 * @component EVMReferenceCard
 */
export interface EVMDefinition {
  /** Metric abbreviation */
  abbreviation: string;
  /** Full metric name */
  name: string;
  /** Description of the metric */
  description: string;
  /** Formula (if applicable) */
  formula: string | null;
  /** Category */
  category: EVMMetricCategory;
  /** Unit (%, $, ratio) */
  unit: string;
}

// ============================================================================
// EVM PROJECT SNAPSHOT
// ============================================================================

/**
 * Project EVM snapshot for analysis
 * @component EVMAnalysisTable
 * @schema orion_evm.project_snapshots
 * @api GET /api/v1/evm/projects
 */
export interface EVMProjectSnapshot {
  /** Project identifier */
  projectId: string;
  /** Project name */
  projectName: string;
  /** Snapshot date */
  snapshotDate: string;
  /** Percent complete */
  percentComplete: number;

  // Base metrics
  /** Budget at Completion */
  bac: number;
  /** Planned Value (BCWS) */
  pv: number;
  /** Earned Value (BCWP) */
  ev: number;
  /** Actual Cost (ACWP) */
  ac: number;

  // Variances
  /** Schedule Variance (EV - PV) */
  sv: number;
  /** Cost Variance (EV - AC) */
  cv: number;
  /** Variance at Completion */
  vac: number;

  // Indices
  /** Schedule Performance Index */
  spi: number;
  /** Cost Performance Index */
  cpi: number;
  /** To-Complete Performance Index */
  tcpi: number;

  // Forecasts
  /** Estimate at Completion */
  eac: number;
  /** Estimate to Complete */
  etc: number;
}

// ============================================================================
// EVM MODULE STATE
// ============================================================================

export interface EVMLoadingState {
  definitions: boolean;
  projects: boolean;
}

export interface EVMErrorState {
  definitions: string | null;
  projects: string | null;
}

export interface EVMModuleState {
  definitions: EVMDefinition[];
  projects: EVMProjectSnapshot[];
  isLoading: EVMLoadingState;
  errors: EVMErrorState;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface EVMModuleProps {
  /** Tenant ID for data fetching */
  tenantId: string;
  /** Optional project filter */
  projectId?: string;
  /** Callback when project is clicked */
  onProjectClick?: (projectId: string) => void;
}

export interface EVMReferenceCardProps {
  definitions: EVMDefinition[];
  isLoading: boolean;
}

export interface EVMAnalysisTableProps {
  projects: EVMProjectSnapshot[];
  isLoading: boolean;
  onProjectClick?: (projectId: string) => void;
}
