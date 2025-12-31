/**
 * Dashboard Component Types (DATA HOLDERS)
 * @governance COMPONENT-001, DOC-002
 * @doc-sync PAGE_DATA_API_REFERENCE.md:1
 *
 * These interfaces define the data shape for all dashboard components.
 * Auto-synced to documentation via sync_component_docs.py hook.
 */

// ============================================================================
// PORTFOLIO SUMMARY
// ============================================================================

/**
 * Portfolio summary data for dashboard cards
 * @component PortfolioSummaryCards
 * @schema orion_core.projects
 * @api GET /api/v1/portfolio/summary
 */
export interface PortfolioSummary {
  /** Total number of projects */
  totalProjects: number;
  /** Projects with SPI >= 0.95 AND CPI >= 0.95 */
  onTrack: number;
  /** Projects with 0.85 <= SPI < 0.95 OR 0.85 <= CPI < 0.95 */
  atRisk: number;
  /** Projects with SPI < 0.85 OR CPI < 0.85 */
  critical: number;
}

// ============================================================================
// PROJECT HEALTH
// ============================================================================

/**
 * Health status for a project
 */
export type HealthStatus = 'on_track' | 'at_risk' | 'critical';

/**
 * Project health data for dashboard cards
 * @component ProjectHealthCard
 * @schema orion_core.projects
 * @api GET /api/v1/projects/health
 */
export interface ProjectHealth {
  /** Project UUID */
  id: string;
  /** Project name */
  name: string;
  /** Percent complete (0-100) */
  percentComplete: number;
  /** Schedule Performance Index */
  spi: number;
  /** Cost Performance Index */
  cpi: number;
  /** Derived health status */
  status: HealthStatus;
  /** Planned finish date (ISO 8601) */
  plannedFinish: string;
  /** Data date (ISO 8601) */
  dataDate: string;
}

// ============================================================================
// SYNC STATUS
// ============================================================================

/**
 * Connection status type
 */
export type SyncStatusType = 'success' | 'failed' | 'running' | 'never';

/**
 * Individual system sync status
 */
export interface SystemSyncStatus {
  /** Whether the system is connected */
  connected: boolean;
  /** Last sync timestamp (ISO 8601) or null if never synced */
  lastSync: string | null;
  /** Current sync status */
  status: SyncStatusType;
}

/**
 * Overall sync status for both P6 and SAP
 * @component SyncStatusCard
 * @schema orion_sync.batches, orion_xconf.client_config
 * @api GET /api/v1/sync/status
 */
export interface SyncStatus {
  /** P6 connection and sync status */
  p6: SystemSyncStatus;
  /** SAP connection and sync status */
  sap: SystemSyncStatus;
  /** Next scheduled sync timestamp (ISO 8601) or null */
  nextScheduled: string | null;
}

// ============================================================================
// DASHBOARD STATE
// ============================================================================

/**
 * Dashboard loading state
 */
export interface DashboardLoadingState {
  portfolio: boolean;
  projects: boolean;
  sync: boolean;
}

/**
 * Dashboard error state
 */
export interface DashboardErrorState {
  portfolio: string | null;
  projects: string | null;
  sync: string | null;
}

/**
 * Complete dashboard state
 * @component Dashboard
 */
export interface DashboardState {
  /** Portfolio summary data */
  portfolio: PortfolioSummary | null;
  /** Top projects by health */
  projects: ProjectHealth[];
  /** Sync status */
  syncStatus: SyncStatus | null;
  /** Loading states */
  isLoading: DashboardLoadingState;
  /** Error states */
  errors: DashboardErrorState;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

/**
 * Portfolio summary cards props
 * @component PortfolioSummaryCards
 */
export interface PortfolioSummaryCardsProps {
  /** Portfolio summary data */
  data: PortfolioSummary | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Callback when card is clicked */
  onCardClick?: (status: 'all' | 'on_track' | 'at_risk' | 'critical') => void;
}

/**
 * Project health card props
 * @component ProjectHealthCard
 */
export interface ProjectHealthCardProps {
  /** Project health data */
  project: ProjectHealth;
  /** Callback when card is clicked */
  onClick?: (projectId: string) => void;
}

/**
 * Project health list props
 * @component ProjectHealthList
 */
export interface ProjectHealthListProps {
  /** List of project health data */
  projects: ProjectHealth[];
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Callback when project is clicked */
  onProjectClick?: (projectId: string) => void;
  /** Maximum number of projects to show */
  limit?: number;
}

/**
 * Sync status card props
 * @component SyncStatusCard
 */
export interface SyncStatusCardProps {
  /** Sync status data */
  data: SyncStatus | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Callback when sync now is clicked */
  onSyncNow?: () => void;
  /** Callback when settings is clicked */
  onSettings?: () => void;
}

/**
 * Main dashboard props
 * @component Dashboard
 */
export interface DashboardProps {
  /** Tenant ID for data fetching */
  tenantId: string;
  /** Callback when a project is clicked */
  onProjectClick?: (projectId: string) => void;
  /** Callback when view all projects is clicked */
  onViewAllProjects?: () => void;
  /** Callback when sync settings is clicked */
  onSyncSettings?: () => void;
}
