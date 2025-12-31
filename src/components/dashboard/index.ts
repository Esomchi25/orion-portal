/**
 * Dashboard Components Index
 * @governance COMPONENT-001
 *
 * Export all dashboard components and types.
 */

// Main Component
export { Dashboard, default } from './Dashboard';

// Types
export type {
  // Portfolio
  PortfolioSummary,
  // Project Health
  HealthStatus,
  ProjectHealth,
  // Sync Status
  SyncStatusType,
  SystemSyncStatus,
  SyncStatus,
  // Dashboard State
  DashboardLoadingState,
  DashboardErrorState,
  DashboardState,
  // Props
  PortfolioSummaryCardsProps,
  ProjectHealthCardProps,
  ProjectHealthListProps,
  SyncStatusCardProps,
  DashboardProps,
} from './types';
