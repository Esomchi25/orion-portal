/**
 * ORION PMS Library Exports
 * @governance DATA-001, DOC-002
 *
 * Centralized exports for API client, types, and hooks.
 */

// Types
export * from './types';

// API Client
export { api, portfolioApi, projectsApi, evmApi, syncApi, healthApi } from './api';

// React Query Hooks
export {
  // Query Keys
  queryKeys,

  // Portfolio Hooks
  usePortfolioSummary,
  usePortfolioFinancials,
  usePortfolioDomainProgress,
  usePortfolioProjects,
  useCfoHealth,
  useCfoBudgetComparison,

  // Projects Hooks
  useProjectsHealth,
  useProjects,
  useProject,
  useProjectSchedule,
  useProjectCriticalPath,
  useProjectWbs,
  useProjectActivities,
  useProjectFinancial,
  useProjectEvm,
  useProjectDomains,
  useProjectUniverse,

  // EVM Hooks
  useEvmMetrics,
  useEvmByPhase,
  useEvmTrend,
  useEvmReference,

  // Sync Hooks
  useSyncDashboard,
  useSyncHistory,
  useSyncErrors,
  useSyncJobStatus,

  // Mutations
  useTriggerSync,
  useResolveError,
} from './hooks';

// Data Mode Utilities
export {
  type DataMode,
  getDataModeFromRequest,
  SCHEMA_MAP,
  getSchema,
  getTable,
  TABLE_MAP,
  getMappedTable,
} from './dataMode';

// Onboarding API
export {
  onboardingApi,
  testP6Connection,
  testSAPConnection,
  listP6Projects,
  completeOnboarding,
  getSyncStatus,
  checkHealth,
} from './onboarding';
export type {
  P6TestRequest,
  SAPTestRequest,
  ConnectionTestResponse,
  ProjectListItem,
  OnboardingCompleteRequest,
  OnboardingCompleteResponse,
} from './onboarding';
