/**
 * ORION PMS React Query Hooks
 * @governance DATA-001, DOC-002
 *
 * All hooks fetch from real backend - NO hardcoded data.
 * DATA-001: If backend returns null, we propagate null - NEVER invent values.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type {
  PortfolioSummary,
  PortfolioFinancials,
  DomainProgress,
  ProjectCard,
  PortfolioHealth,
  BudgetComparison,
  ProjectSummary,
  ProjectDetail,
  ProjectHealthResponse,
  ScheduleSummary,
  CriticalPathActivity,
  FinancialSummary,
  EVMMetrics,
  EVMTrend,
  DomainProgressDetail,
  SyncDashboard,
  SyncHistory,
  SyncErrorList,
  SyncRequest,
  ProjectUniverse,
} from './types';

// =============================================================================
// QUERY KEYS
// =============================================================================

export const queryKeys = {
  // Portfolio
  portfolioSummary: (tenant?: string) => ['portfolio', 'summary', tenant] as const,
  portfolioFinancials: (tenant?: string) => ['portfolio', 'financials', tenant] as const,
  portfolioDomainProgress: (tenant?: string) => ['portfolio', 'domain-progress', tenant] as const,
  portfolioProjects: (tenant?: string, status?: string) => ['portfolio', 'projects', tenant, status] as const,
  portfolioCfoHealth: (tenant?: string) => ['portfolio', 'cfo', 'health', tenant] as const,
  portfolioCfoBudget: (tenant?: string) => ['portfolio', 'cfo', 'budget', tenant] as const,

  // Projects
  projectsHealth: (tenant?: string, limit?: number) => ['projects', 'health', tenant, limit] as const,
  projectsList: (activeOnly?: boolean) => ['projects', 'list', activeOnly] as const,
  projectDetail: (projectId: number) => ['projects', projectId] as const,
  projectSchedule: (projectId: number) => ['projects', projectId, 'schedule'] as const,
  projectCriticalPath: (projectId: number) => ['projects', projectId, 'critical-path'] as const,
  projectWbs: (projectId: number, hierarchical?: boolean) => ['projects', projectId, 'wbs', hierarchical] as const,
  projectActivities: (projectId: number) => ['projects', projectId, 'activities'] as const,
  projectFinancial: (projectId: number) => ['projects', projectId, 'financial'] as const,
  projectEvm: (projectId: number) => ['projects', projectId, 'evm'] as const,
  projectDomains: (projectId: number) => ['projects', projectId, 'domains'] as const,
  projectUniverse: (projectId: number) => ['projects', projectId, 'universe'] as const,

  // EVM
  evmMetrics: (projectId: number, asOfDate?: string) => ['evm', projectId, asOfDate] as const,
  evmByPhase: (projectId: number) => ['evm', projectId, 'by-phase'] as const,
  evmTrend: (projectId: number, periods?: number) => ['evm', projectId, 'trend', periods] as const,
  evmReference: () => ['evm', 'reference'] as const,

  // Sync
  syncDashboard: (tenant?: string) => ['sync', 'dashboard', tenant] as const,
  syncHistory: (page?: number) => ['sync', 'history', page] as const,
  syncErrors: (page?: number, unresolvedOnly?: boolean) => ['sync', 'errors', page, unresolvedOnly] as const,
  syncJobStatus: (jobId: string) => ['sync', 'jobs', jobId] as const,
};

// =============================================================================
// PORTFOLIO HOOKS
// =============================================================================

export function usePortfolioSummary(tenant?: string) {
  return useQuery<PortfolioSummary>({
    queryKey: queryKeys.portfolioSummary(tenant),
    queryFn: () => api.portfolio.getSummary(tenant),
  });
}

export function usePortfolioFinancials(tenant?: string) {
  return useQuery<PortfolioFinancials>({
    queryKey: queryKeys.portfolioFinancials(tenant),
    queryFn: () => api.portfolio.getFinancials(tenant),
  });
}

export function usePortfolioDomainProgress(tenant?: string) {
  return useQuery<DomainProgress>({
    queryKey: queryKeys.portfolioDomainProgress(tenant),
    queryFn: () => api.portfolio.getDomainProgress(tenant),
  });
}

export function usePortfolioProjects(options?: { tenant?: string; status?: string; limit?: number }) {
  return useQuery<ProjectCard[]>({
    queryKey: queryKeys.portfolioProjects(options?.tenant, options?.status),
    queryFn: () => api.portfolio.getProjects(options),
  });
}

export function useCfoHealth(tenant?: string) {
  return useQuery<PortfolioHealth>({
    queryKey: queryKeys.portfolioCfoHealth(tenant),
    queryFn: () => api.portfolio.getCfoHealth(tenant),
  });
}

export function useCfoBudgetComparison(tenant?: string) {
  return useQuery<BudgetComparison[]>({
    queryKey: queryKeys.portfolioCfoBudget(tenant),
    queryFn: () => api.portfolio.getCfoBudgetComparison(tenant),
  });
}

// =============================================================================
// PROJECTS HOOKS
// =============================================================================

export function useProjectsHealth(options?: { tenant?: string; limit?: number }) {
  return useQuery<ProjectHealthResponse>({
    queryKey: queryKeys.projectsHealth(options?.tenant, options?.limit),
    queryFn: () => api.projects.getHealth(options),
  });
}

export function useProjects(activeOnly = false) {
  return useQuery<ProjectSummary[]>({
    queryKey: queryKeys.projectsList(activeOnly),
    queryFn: () => api.projects.list(activeOnly),
  });
}

export function useProject(projectId: number) {
  return useQuery<ProjectDetail>({
    queryKey: queryKeys.projectDetail(projectId),
    queryFn: () => api.projects.getById(projectId),
    enabled: projectId > 0,
  });
}

export function useProjectSchedule(projectId: number) {
  return useQuery<ScheduleSummary>({
    queryKey: queryKeys.projectSchedule(projectId),
    queryFn: () => api.projects.getSchedule(projectId),
    enabled: projectId > 0,
  });
}

export function useProjectCriticalPath(projectId: number, limit = 50) {
  return useQuery<CriticalPathActivity[]>({
    queryKey: queryKeys.projectCriticalPath(projectId),
    queryFn: () => api.projects.getCriticalPath(projectId, limit),
    enabled: projectId > 0,
  });
}

export function useProjectWbs(projectId: number, hierarchical = false) {
  return useQuery({
    queryKey: queryKeys.projectWbs(projectId, hierarchical),
    queryFn: () => api.projects.getWbs(projectId, hierarchical),
    enabled: projectId > 0,
  });
}

export function useProjectActivities(
  projectId: number,
  options?: { status?: string; criticalOnly?: boolean; limit?: number }
) {
  return useQuery({
    queryKey: queryKeys.projectActivities(projectId),
    queryFn: () => api.projects.getActivities(projectId, options),
    enabled: projectId > 0,
  });
}

export function useProjectFinancial(projectId: number) {
  return useQuery<FinancialSummary>({
    queryKey: queryKeys.projectFinancial(projectId),
    queryFn: () => api.projects.getFinancial(projectId),
    enabled: projectId > 0,
  });
}

export function useProjectEvm(projectId: number) {
  return useQuery<EVMMetrics>({
    queryKey: queryKeys.projectEvm(projectId),
    queryFn: () => api.projects.getEvm(projectId),
    enabled: projectId > 0,
  });
}

export function useProjectDomains(projectId: number) {
  return useQuery<DomainProgressDetail[]>({
    queryKey: queryKeys.projectDomains(projectId),
    queryFn: () => api.projects.getDomains(projectId),
    enabled: projectId > 0,
  });
}

export function useProjectUniverse(projectId: number) {
  return useQuery<ProjectUniverse>({
    queryKey: queryKeys.projectUniverse(projectId),
    queryFn: () => api.projects.getUniverse(projectId),
    enabled: projectId > 0,
  });
}

// =============================================================================
// EVM HOOKS
// =============================================================================

export function useEvmMetrics(projectId: number, asOfDate?: string) {
  return useQuery<EVMMetrics>({
    queryKey: queryKeys.evmMetrics(projectId, asOfDate),
    queryFn: () => api.evm.getMetrics(projectId, asOfDate),
    enabled: projectId > 0,
  });
}

export function useEvmByPhase(projectId: number) {
  return useQuery({
    queryKey: queryKeys.evmByPhase(projectId),
    queryFn: () => api.evm.getByPhase(projectId),
    enabled: projectId > 0,
  });
}

export function useEvmTrend(projectId: number, periods = 12) {
  return useQuery<EVMTrend>({
    queryKey: queryKeys.evmTrend(projectId, periods),
    queryFn: () => api.evm.getTrend(projectId, periods),
    enabled: projectId > 0,
  });
}

export function useEvmReference() {
  return useQuery({
    queryKey: queryKeys.evmReference(),
    queryFn: () => api.evm.getReference(),
    staleTime: Infinity, // Reference data doesn't change
  });
}

// =============================================================================
// SYNC HOOKS
// =============================================================================

export function useSyncDashboard(tenant?: string) {
  return useQuery<SyncDashboard>({
    queryKey: queryKeys.syncDashboard(tenant),
    queryFn: () => api.sync.getDashboard(tenant),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useSyncHistory(options?: {
  page?: number;
  pageSize?: number;
  status?: string;
  batchType?: string;
}) {
  return useQuery<SyncHistory>({
    queryKey: queryKeys.syncHistory(options?.page),
    queryFn: () => api.sync.getHistory(options),
  });
}

export function useSyncErrors(options?: {
  page?: number;
  pageSize?: number;
  unresolvedOnly?: boolean;
  source?: string;
  errorType?: string;
}) {
  return useQuery<SyncErrorList>({
    queryKey: queryKeys.syncErrors(options?.page, options?.unresolvedOnly),
    queryFn: () => api.sync.getErrors(options),
  });
}

export function useSyncJobStatus(jobId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.syncJobStatus(jobId),
    queryFn: () => api.sync.getJobStatus(jobId),
    enabled: enabled && !!jobId,
    refetchInterval: (query) => {
      // Stop polling when job is completed or failed
      const data = query.state.data;
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      return 2000; // Poll every 2 seconds while running
    },
  });
}

// =============================================================================
// MUTATIONS
// =============================================================================

export function useTriggerSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ request, authToken }: { request: SyncRequest; authToken: string }) =>
      api.sync.trigger(request, authToken),
    onSuccess: () => {
      // Invalidate sync queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['sync'] });
    },
  });
}

export function useResolveError() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ errorId, authToken }: { errorId: string; authToken: string }) =>
      api.sync.resolveError(errorId, authToken),
    onSuccess: () => {
      // Invalidate sync error queries
      queryClient.invalidateQueries({ queryKey: ['sync', 'errors'] });
    },
  });
}
