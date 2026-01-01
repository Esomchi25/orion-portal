/**
 * ORION PMS API Client
 * @governance DATA-001, DOC-002
 *
 * All API calls go to the real backend - NO hardcoded data.
 * DATA-001: If backend returns null, we show null/empty - NEVER invent values.
 */

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
  WBSHierarchy,
  FinancialSummary,
  EVMMetrics,
  EVMByPhase,
  EVMTrend,
  EVMReference,
  DomainProgressDetail,
  SyncDashboard,
  SyncHistory,
  SyncErrorList,
  SyncJobStatus,
  SyncRequest,
  SyncResponse,
  ProjectUniverse,
} from './types';

// =============================================================================
// CONFIGURATION
// =============================================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

/**
 * Base fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `API Error: ${response.status}`);
  }

  return response.json();
}

// =============================================================================
// PORTFOLIO API (Universe Level)
// =============================================================================

export const portfolioApi = {
  /**
   * GET /api/v1/portfolio/summary
   * Returns portfolio summary statistics
   */
  getSummary: (tenant?: string): Promise<PortfolioSummary> => {
    const params = tenant ? `?tenant=${tenant}` : '';
    return apiFetch<PortfolioSummary>(`/api/v1/portfolio/summary${params}`);
  },

  /**
   * GET /api/v1/portfolio/financials
   * Returns aggregate financial metrics from SAP
   */
  getFinancials: (tenant?: string): Promise<PortfolioFinancials> => {
    const params = tenant ? `?tenant=${tenant}` : '';
    return apiFetch<PortfolioFinancials>(`/api/v1/portfolio/financials${params}`);
  },

  /**
   * GET /api/v1/portfolio/domain-progress
   * Returns aggregate EPCIC domain progress
   */
  getDomainProgress: (tenant?: string): Promise<DomainProgress> => {
    const params = tenant ? `?tenant=${tenant}` : '';
    return apiFetch<DomainProgress>(`/api/v1/portfolio/domain-progress${params}`);
  },

  /**
   * GET /api/v1/portfolio/projects
   * Returns project cards for portfolio grid
   */
  getProjects: (options?: {
    tenant?: string;
    status?: string;
    limit?: number;
  }): Promise<ProjectCard[]> => {
    const params = new URLSearchParams();
    if (options?.tenant) params.set('tenant', options.tenant);
    if (options?.status) params.set('status', options.status);
    if (options?.limit) params.set('limit', options.limit.toString());
    const queryString = params.toString();
    return apiFetch<ProjectCard[]>(`/api/v1/portfolio/projects${queryString ? '?' + queryString : ''}`);
  },

  /**
   * GET /api/v1/portfolio/cfo/health
   * Returns CFO-level health banner
   */
  getCfoHealth: (tenant?: string): Promise<PortfolioHealth> => {
    const params = tenant ? `?tenant=${tenant}` : '';
    return apiFetch<PortfolioHealth>(`/api/v1/portfolio/cfo/health${params}`);
  },

  /**
   * GET /api/v1/portfolio/cfo/budget-comparison
   * Returns budget vs actual comparison for all projects
   */
  getCfoBudgetComparison: (tenant?: string): Promise<BudgetComparison[]> => {
    const params = tenant ? `?tenant=${tenant}` : '';
    return apiFetch<BudgetComparison[]>(`/api/v1/portfolio/cfo/budget-comparison${params}`);
  },
};

// =============================================================================
// PROJECTS API (Galaxy Level)
// =============================================================================

export const projectsApi = {
  /**
   * GET /api/v1/projects/health
   * Returns project health metrics for dashboard
   */
  getHealth: (options?: {
    tenant?: string;
    limit?: number;
  }): Promise<ProjectHealthResponse> => {
    const params = new URLSearchParams();
    if (options?.tenant) params.set('tenant', options.tenant);
    if (options?.limit) params.set('limit', options.limit.toString());
    const queryString = params.toString();
    return apiFetch<ProjectHealthResponse>(`/api/v1/projects/health${queryString ? '?' + queryString : ''}`);
  },

  /**
   * GET /api/v1/projects
   * Lists all projects
   */
  list: (activeOnly = false): Promise<ProjectSummary[]> => {
    const params = activeOnly ? '?active_only=true' : '';
    return apiFetch<ProjectSummary[]>(`/api/v1/projects${params}`);
  },

  /**
   * GET /api/v1/projects/{projectId}
   * Get project details
   */
  getById: (projectId: number): Promise<ProjectDetail> => {
    return apiFetch<ProjectDetail>(`/api/v1/projects/${projectId}`);
  },

  /**
   * GET /api/v1/projects/{projectId}/schedule
   * Returns schedule summary for project
   */
  getSchedule: (projectId: number): Promise<ScheduleSummary> => {
    return apiFetch<ScheduleSummary>(`/api/v1/projects/${projectId}/schedule`);
  },

  /**
   * GET /api/v1/projects/{projectId}/critical-path
   * Returns critical path activities
   */
  getCriticalPath: (projectId: number, limit = 50): Promise<CriticalPathActivity[]> => {
    return apiFetch<CriticalPathActivity[]>(`/api/v1/projects/${projectId}/critical-path?limit=${limit}`);
  },

  /**
   * GET /api/v1/projects/{projectId}/wbs
   * Returns WBS elements
   */
  getWbs: (projectId: number, hierarchical = false): Promise<WBSHierarchy | { wbs: any[]; total: number }> => {
    const params = hierarchical ? '?hierarchical=true' : '';
    return apiFetch(`/api/v1/projects/${projectId}/wbs${params}`);
  },

  /**
   * GET /api/v1/projects/{projectId}/activities
   * Returns activities
   */
  getActivities: (
    projectId: number,
    options?: {
      status?: string;
      criticalOnly?: boolean;
      limit?: number;
    }
  ): Promise<{ activities: any[]; total: number; returned: number }> => {
    const params = new URLSearchParams();
    if (options?.status) params.set('status', options.status);
    if (options?.criticalOnly) params.set('critical_only', 'true');
    if (options?.limit) params.set('limit', options.limit.toString());
    const queryString = params.toString();
    return apiFetch(`/api/v1/projects/${projectId}/activities${queryString ? '?' + queryString : ''}`);
  },

  /**
   * GET /api/v1/projects/{projectId}/financial
   * Returns financial summary from SAP
   */
  getFinancial: (projectId: number): Promise<FinancialSummary> => {
    return apiFetch<FinancialSummary>(`/api/v1/projects/${projectId}/financial`);
  },

  /**
   * GET /api/v1/projects/{projectId}/evm
   * Returns EVM snapshot
   */
  getEvm: (projectId: number): Promise<EVMMetrics> => {
    return apiFetch<EVMMetrics>(`/api/v1/projects/${projectId}/evm`);
  },

  /**
   * GET /api/v1/projects/{projectId}/domains
   * Returns EPCIC domain progress
   */
  getDomains: (projectId: number): Promise<DomainProgressDetail[]> => {
    return apiFetch<DomainProgressDetail[]>(`/api/v1/projects/${projectId}/domains`);
  },

  /**
   * GET /api/v1/projects/{projectId}/{domain}
   * Returns single domain details
   */
  getDomain: (
    projectId: number,
    domain: 'engineering' | 'procurement' | 'construction' | 'commissioning'
  ): Promise<DomainProgressDetail> => {
    return apiFetch<DomainProgressDetail>(`/api/v1/projects/${projectId}/${domain}`);
  },

  /**
   * GET /api/v1/projects/{projectId}/universe
   * Returns complete project universe view (P6 + SAP combined)
   */
  getUniverse: (projectId: number): Promise<ProjectUniverse> => {
    return apiFetch<ProjectUniverse>(`/api/v1/projects/${projectId}/universe`);
  },
};

// =============================================================================
// EVM API
// =============================================================================

export const evmApi = {
  /**
   * GET /api/v1/evm/{projectId}
   * Get EVM metrics for a project
   */
  getMetrics: (projectId: number, asOfDate?: string): Promise<EVMMetrics> => {
    const params = asOfDate ? `?asOfDate=${asOfDate}` : '';
    return apiFetch<EVMMetrics>(`/api/v1/evm/${projectId}${params}`);
  },

  /**
   * GET /api/v1/evm/{projectId}/by-phase
   * Get EVM metrics broken down by E/P/C/COM phase
   */
  getByPhase: (projectId: number): Promise<{
    projectId: number;
    phases: EVMByPhase[];
    currency: string;
    currencyLayer: string;
    dataSource: string;
  }> => {
    return apiFetch(`/api/v1/evm/${projectId}/by-phase`);
  },

  /**
   * GET /api/v1/evm/{projectId}/trend
   * Get EVM trend over time
   */
  getTrend: (projectId: number, periods = 12): Promise<EVMTrend> => {
    return apiFetch<EVMTrend>(`/api/v1/evm/${projectId}/trend?periods=${periods}`);
  },

  /**
   * GET /api/v1/evm/reference/definitions
   * Get EVM term definitions for reference page
   */
  getReference: (): Promise<{
    definitions: EVMReference[];
    categories: Record<string, string>;
  }> => {
    return apiFetch(`/api/v1/evm/reference/definitions`);
  },
};

// =============================================================================
// SYNC API
// =============================================================================

export const syncApi = {
  /**
   * POST /api/v1/sync/trigger
   * Trigger a sync operation
   */
  trigger: (request: SyncRequest, authToken: string): Promise<SyncResponse> => {
    return apiFetch<SyncResponse>('/api/v1/sync/trigger', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(request),
    });
  },

  /**
   * GET /api/v1/sync/jobs/{jobId}
   * Get status of a specific sync job
   */
  getJobStatus: (jobId: string): Promise<SyncJobStatus> => {
    return apiFetch<SyncJobStatus>(`/api/v1/sync/jobs/${jobId}`);
  },

  /**
   * GET /api/v1/sync/jobs
   * List recent sync jobs
   */
  listJobs: (limit = 10): Promise<{ jobs: SyncJobStatus[]; total: number }> => {
    return apiFetch(`/api/v1/sync/jobs?limit=${limit}`);
  },

  /**
   * GET /api/v1/sync/dashboard
   * Returns sync dashboard data
   */
  getDashboard: (tenant?: string): Promise<SyncDashboard> => {
    const params = tenant ? `?tenant=${tenant}` : '';
    return apiFetch<SyncDashboard>(`/api/v1/sync/dashboard${params}`);
  },

  /**
   * GET /api/v1/sync/history
   * Returns sync batch history
   */
  getHistory: (options?: {
    page?: number;
    pageSize?: number;
    status?: string;
    batchType?: string;
  }): Promise<SyncHistory> => {
    const params = new URLSearchParams();
    if (options?.page) params.set('page', options.page.toString());
    if (options?.pageSize) params.set('pageSize', options.pageSize.toString());
    if (options?.status) params.set('status', options.status);
    if (options?.batchType) params.set('batchType', options.batchType);
    const queryString = params.toString();
    return apiFetch<SyncHistory>(`/api/v1/sync/history${queryString ? '?' + queryString : ''}`);
  },

  /**
   * GET /api/v1/sync/errors
   * Returns sync errors
   */
  getErrors: (options?: {
    page?: number;
    pageSize?: number;
    unresolvedOnly?: boolean;
    source?: string;
    errorType?: string;
  }): Promise<SyncErrorList> => {
    const params = new URLSearchParams();
    if (options?.page) params.set('page', options.page.toString());
    if (options?.pageSize) params.set('pageSize', options.pageSize.toString());
    if (options?.unresolvedOnly) params.set('unresolvedOnly', 'true');
    if (options?.source) params.set('source', options.source);
    if (options?.errorType) params.set('errorType', options.errorType);
    const queryString = params.toString();
    return apiFetch<SyncErrorList>(`/api/v1/sync/errors${queryString ? '?' + queryString : ''}`);
  },

  /**
   * POST /api/v1/sync/errors/{errorId}/resolve
   * Mark a sync error as resolved
   */
  resolveError: (
    errorId: string,
    authToken: string
  ): Promise<{ success: boolean; errorId: string; resolved: boolean }> => {
    return apiFetch(`/api/v1/sync/errors/${errorId}/resolve`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
  },
};

// =============================================================================
// HEALTH API
// =============================================================================

export const healthApi = {
  /**
   * GET /health
   * Health check endpoint
   */
  check: (): Promise<{ status: string; timestamp: string }> => {
    return apiFetch('/health');
  },

  /**
   * GET /ready
   * Readiness check endpoint
   */
  ready: (): Promise<{ status: string; services: Record<string, string> }> => {
    return apiFetch('/ready');
  },
};

// =============================================================================
// COMBINED API EXPORT
// =============================================================================

export const api = {
  portfolio: portfolioApi,
  projects: projectsApi,
  evm: evmApi,
  sync: syncApi,
  health: healthApi,
};

export default api;
