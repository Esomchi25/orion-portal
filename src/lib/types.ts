/**
 * ORION PMS TypeScript Types
 * @governance DOC-002, DATA-001
 *
 * These types match the backend Pydantic models exactly.
 * All Optional fields use `| null` to match backend null returns.
 * DATA-001: If data isn't available, backend returns null - NEVER invented values.
 */

// =============================================================================
// PORTFOLIO TYPES (Universe Level)
// =============================================================================

export interface PortfolioSummary {
  totalProjects: number;
  activeProjects: number;
  onTrack: number;
  atRisk: number;
  critical: number;
  totalActivities: number;
  completedActivities: number;
  inProgressActivities: number;
  avgPercentComplete: number;
  lastSync: string | null; // ISO timestamp or null if never synced
}

export interface PortfolioFinancials {
  totalBAC: number;
  totalActualCost: number;
  totalEAC: number;
  totalEarnedValue: number;
  currency: string;
  asOfDate: string | null;
}

export interface DomainProgress {
  engineering: number | null;
  procurement: number | null;
  construction: number | null;
  commissioning: number | null;
}

export interface ProjectCard {
  projectId: string;
  projectCode: string;
  projectName: string;
  status: 'on-track' | 'at-risk' | 'critical' | 'unknown';
  cpi: number | null;
  spi: number | null;
  percentComplete: number | null;
  domains?: DomainProgress;
}

export interface PortfolioHealth {
  status: 'ON_TRACK' | 'AT_RISK' | 'CRITICAL' | 'NO_DATA' | 'ERROR';
  avgCPI: number | null;
  avgSPI: number | null;
  projectCounts: {
    total: number;
    onTrack: number;
    atRisk: number;
    critical: number;
  };
}

export interface BudgetComparison {
  projectId: string;
  projectName: string;
  bac: number;
  actualCost: number;
  eac: number;
  variance: number;
}

// =============================================================================
// PROJECT TYPES (Galaxy Level)
// =============================================================================

export interface ProjectSummary {
  objectId: number;
  code: string;
  name: string;
  status: string | null;
  startDate: string | null;
  finishDate: string | null;
  dataDate: string | null;
}

export interface ProjectDetail {
  objectId: number;
  code: string;
  name: string;
  status: string | null;
  startDate: string | null;
  finishDate: string | null;
  plannedStart: string | null;
  plannedFinish: string | null;
  actualStart: string | null;
  actualFinish: string | null;
  percentComplete: number | null;
  dataDate: string | null;
  wbsCount: number;
  activityCount: number;
}

export interface ProjectHealth {
  id: string;
  name: string;
  percentComplete: number | null;
  spi: number | null;  // null if not available from P6 - DATA-001
  cpi: number | null;  // null if not available from P6 - DATA-001
  status: 'on-track' | 'at-risk' | 'critical' | 'unknown';
  plannedFinish: string | null;
  dataDate: string | null;
}

export interface ProjectHealthResponse {
  projects: ProjectHealth[];
  total: number;
}

// =============================================================================
// SCHEDULE TYPES (Planet/Earth Level)
// =============================================================================

export interface ScheduleSummary {
  projectId: string;
  totalActivities: number;
  completedActivities: number;
  inProgressActivities: number;
  notStartedActivities: number;
  criticalPathActivities: number;
  milestones: number;
  dataDate: string | null;
}

export interface CriticalPathActivity {
  activityId: string;
  activityCode: string;
  activityName: string;
  startDate: string | null;
  finishDate: string | null;
  totalFloat: number | null;
  remainingDuration: number | null;
}

export interface WBSNode {
  ObjectId: number;
  Id: string;
  Name: string;
  ParentObjectId: number | null;
  SequenceNumber: number;
  children?: WBSNode[];
}

export interface WBSHierarchy {
  hierarchy: WBSNode[];
  total_wbs_count: number;
}

export interface Activity {
  ObjectId: number;
  Id: string;
  Name: string;
  Status: 'NotStarted' | 'InProgress' | 'Completed';
  Type: string;
  StartDate: string | null;
  FinishDate: string | null;
  PercentComplete: number | null;
  IsCritical: boolean;
  TotalFloat: number | null;
  RemainingDuration: number | null;
  WBSObjectId: number | null;
}

// =============================================================================
// FINANCIAL TYPES (Galaxy Level - SAP Data)
// =============================================================================

export interface FinancialSummary {
  projectId: string;
  bac: number | null;         // Budget at Completion from SAP PRPS
  actualCost: number | null;  // Actual Cost from SAP ACDOCA
  earnedValue: number | null; // EV calculated from P6 progress + BAC
  eac: number | null;         // Estimate at Completion = BAC/CPI
  variance: number | null;    // BAC - EAC
  currency: string;
  asOfDate: string | null;
}

// =============================================================================
// EVM TYPES
// =============================================================================

export interface EVMSnapshot {
  projectId: string;
  dataDate: string | null;
  bac: number | null;
  bcws: number | null;  // Planned Value (BCWS)
  bcwp: number | null;  // Earned Value (BCWP)
  acwp: number | null;  // Actual Cost (ACWP) from SAP - NEVER estimated
  spi: number | null;   // BCWP/BCWS - null if can't calculate
  cpi: number | null;   // BCWP/ACWP - null if can't calculate
  sv: number | null;    // Schedule Variance (BCWP - BCWS)
  cv: number | null;    // Cost Variance (BCWP - ACWP)
  eac: number | null;   // Estimate at Completion
  etc: number | null;   // Estimate to Complete
  vac: number | null;   // Variance at Completion
}

export interface EVMMetrics extends EVMSnapshot {
  asOfDate: string | null;
  tcpi: number | null;  // To-Complete Performance Index
  currency: string;
  currencyLayer: string;
  dataSource: 'real' | 'partial' | 'no_data' | 'error';
}

export interface EVMByPhase {
  phase: string;       // 'E', 'P', 'C', 'COM'
  phaseName: string;   // 'Engineering', 'Procurement', 'Construction', 'Commissioning'
  planned: number | null;
  actual: number | null;
  earned: number | null;
  percentComplete: number | null;
  spi: number | null;
  cpi: number | null;
}

export interface EVMTrendPoint {
  period: string;
  dataDate: string;
  bcws: number | null;
  bcwp: number | null;
  acwp: number | null;
  spi: number | null;
  cpi: number | null;
}

export interface EVMTrend {
  projectId: number;
  trend: EVMTrendPoint[];
  currency: string;
  currencyLayer: string;
}

export interface EVMReference {
  term: string;
  abbreviation: string;
  formula: string | null;
  interpretation: string;
  category: 'value' | 'variance' | 'index' | 'forecast';
}

// =============================================================================
// EPCIC DOMAIN TYPES
// =============================================================================

export interface DomainProgressDetail {
  domain: string;       // 'E', 'P', 'C', 'COM'
  domainName: string;   // Full name
  totalActivities: number;
  completedActivities: number;
  progressPercent: number | null;
  budgetedCost: number | null;
  actualCost: number | null;
}

// =============================================================================
// SYNC TYPES
// =============================================================================

export interface SystemSyncStatus {
  connected: boolean;
  lastSync: string | null;
  status: 'success' | 'failed' | 'running' | 'never' | 'error';
  recordCount: number | null;
}

export interface SyncDashboard {
  p6: SystemSyncStatus;
  sap: SystemSyncStatus;
  nextScheduled: string | null;
  activeJobs: number;
  totalBatches: number;
  totalErrors: number;
}

export interface SyncBatch {
  batchId: string;
  batchType: 'full' | 'p6_only' | 'sap_only' | 'incremental';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string | null;
  completedAt: string | null;
  p6RecordCount: number;
  sapRecordCount: number;
  errorCount: number;
  triggeredBy: string | null;
  durationSeconds: number | null;
}

export interface SyncHistory {
  batches: SyncBatch[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SyncError {
  errorId: string;
  batchId: string | null;
  errorSource: 'p6' | 'sap' | 'transform' | 'load';
  errorType: 'connection' | 'timeout' | 'validation' | 'data' | 'unknown';
  errorMessage: string;
  recordType: string | null;
  recordId: string | null;
  occurredAt: string;
  resolved: boolean;
  resolvedAt: string | null;
}

export interface SyncErrorList {
  errors: SyncError[];
  total: number;
  unresolvedCount: number;
  page: number;
  pageSize: number;
}

export interface SyncJobStatus {
  jobId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  recordsSynced: {
    p6: number;
    sap: number;
  };
  startedAt: string;
  completedAt: string | null;
  error: string | null;
}

export interface SyncRequest {
  projectId?: number;
  syncType: 'full' | 'p6_only' | 'sap_only';
}

export interface SyncResponse {
  jobId: string;
  status: string;
  message: string;
  startedAt: string;
}

// =============================================================================
// PROJECT UNIVERSE (Combined View)
// =============================================================================

export interface ProjectUniverse {
  project: {
    objectId: number;
    code: string;
    name: string;
    status: string | null;
    percentComplete: number | null;
    dataDate: string | null;
  };
  metrics: {
    totalWbs: number;
    totalActivities: number;
    completedActivities: number;
    inProgressActivities: number;
    criticalActivities: number;
  };
  wbsHierarchy: WBSNode[];
  financials: {
    bac: number | null;
    actualCost: number | null;
    earnedValue: number | null;
    eac: number | null;
    variance: number | null;
    currency: string;
    asOfDate: string | null;
  };
  evm: {
    spi: number | null;
    cpi: number | null;
    sv: number | null;
    cv: number | null;
    eac: number | null;
    etc: number | null;
    vac: number | null;
  };
  domains: DomainProgressDetail[];
}
