/**
 * Dashboard Component
 * @governance COMPONENT-001, DOC-002
 * @doc-sync PAGE_DATA_API_REFERENCE.md:1
 *
 * Main dashboard displaying portfolio summary, project health, and sync status.
 *
 * @coverage
 * - Unit: 90%+ (render, data display, interactions)
 * - Integration: API calls
 * - E2E: Full dashboard flow
 * - Accessibility: WCAG 2.1 AA
 * - Performance: < 100ms render
 */

'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import type {
  DashboardProps,
  DashboardState,
  PortfolioSummary,
  ProjectHealth,
  SyncStatus,
  HealthStatus,
} from './types';

// ============================================================================
// SKELETON COMPONENTS
// ============================================================================

const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div
      data-testid="skeleton-card"
      className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 animate-pulse"
    >
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4" />
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
    </div>
  );
});

// ============================================================================
// PORTFOLIO SUMMARY CARDS
// ============================================================================

const SummaryCard = memo(function SummaryCard({
  title,
  value,
  color,
  icon,
  onClick,
}: {
  title: string;
  value: number;
  color: 'blue' | 'green' | 'amber' | 'red';
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400',
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className={`p-6 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md ${colorClasses[color]}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-white/50 dark:bg-slate-800/50">{icon}</div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
});

const PortfolioSummaryCards = memo(function PortfolioSummaryCards({
  data,
  isLoading,
  error,
  onRetry,
}: {
  data: PortfolioSummary | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400 mb-2">Failed to load portfolio summary</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        title="Total Projects"
        value={data.totalProjects}
        color="blue"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        }
      />
      <SummaryCard
        title="On Track"
        value={data.onTrack}
        color="green"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      <SummaryCard
        title="At Risk"
        value={data.atRisk}
        color="amber"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        }
      />
      <SummaryCard
        title="Critical"
        value={data.critical}
        color="red"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
    </div>
  );
});

// ============================================================================
// PROJECT HEALTH CARD
// ============================================================================

const ProgressBar = memo(function ProgressBar({ value }: { value: number }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${value}% complete`}
      className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2"
    >
      <div
        className={`h-2 rounded-full transition-all duration-300 ${
          value >= 80 ? 'bg-green-500' : value >= 50 ? 'bg-blue-500' : 'bg-amber-500'
        }`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
});

const StatusBadge = memo(function StatusBadge({ status }: { status: HealthStatus }) {
  const styles = {
    on_track: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    at_risk: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  const labels = {
    on_track: 'On Track',
    at_risk: 'At Risk',
    critical: 'Critical',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  );
});

const ProjectHealthCard = memo(function ProjectHealthCard({
  project,
  onClick,
}: {
  project: ProjectHealth;
  onClick?: () => void;
}) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.();
      }
    },
    [onClick]
  );

  return (
    <div
      data-testid={`project-card-${project.id}`}
      data-status={project.status}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="font-semibold text-slate-900 dark:text-white">{project.name}</p>
        <StatusBadge status={project.status} />
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-1">
          <span>Progress</span>
          <span>{project.percentComplete}%</span>
        </div>
        <ProgressBar value={project.percentComplete} />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-slate-500 dark:text-slate-400">SPI</p>
          <p className={`font-medium ${project.spi >= 0.95 ? 'text-green-600' : project.spi < 0.85 ? 'text-red-600' : 'text-amber-600'}`}>
            {project.spi.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400">CPI</p>
          <p className={`font-medium ${project.cpi >= 0.95 ? 'text-green-600' : project.cpi < 0.85 ? 'text-red-600' : 'text-amber-600'}`}>
            {project.cpi.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
});

const ProjectHealthList = memo(function ProjectHealthList({
  projects,
  isLoading,
  error,
  onProjectClick,
  onViewAll,
  onRetry,
}: {
  projects: ProjectHealth[];
  isLoading: boolean;
  error: string | null;
  onProjectClick?: (id: string) => void;
  onViewAll?: () => void;
  onRetry?: () => void;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400 mb-2">Failed to load projects</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Project Health Overview
        </h2>
        <button
          onClick={onViewAll}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          View All
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <ProjectHealthCard
            key={project.id}
            project={project}
            onClick={() => onProjectClick?.(project.id)}
          />
        ))}
      </div>
    </div>
  );
});

// ============================================================================
// SYNC STATUS CARD
// ============================================================================

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

const SyncStatusCard = memo(function SyncStatusCard({
  data,
  isLoading,
  error,
  onSettings,
  onRetry,
}: {
  data: SyncStatus | null;
  isLoading: boolean;
  error: string | null;
  onSettings?: () => void;
  onRetry?: () => void;
}) {
  if (isLoading) {
    return <SkeletonCard />;
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400 mb-2">Failed to load sync status</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div
      data-testid="sync-status-card"
      className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Sync Status</h2>
        <button
          onClick={onSettings}
          aria-label="Sync settings"
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {/* P6 Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${data.p6.connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="font-medium text-slate-900 dark:text-white">P6</span>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {data.p6.connected ? (
              <>
                <span className="text-green-600 dark:text-green-400">Connected</span>
                <span className="mx-2">•</span>
                <span>Last sync: {formatRelativeTime(data.p6.lastSync)}</span>
              </>
            ) : (
              <span className="text-red-600 dark:text-red-400">Not Connected</span>
            )}
          </div>
        </div>

        {/* SAP Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${data.sap.connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="font-medium text-slate-900 dark:text-white">SAP</span>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {data.sap.connected ? (
              <>
                <span className="text-green-600 dark:text-green-400">Connected</span>
                <span className="mx-2">•</span>
                <span>Last sync: {formatRelativeTime(data.sap.lastSync)}</span>
              </>
            ) : (
              <span className="text-red-600 dark:text-red-400">Not Connected</span>
            )}
          </div>
        </div>

        {/* Next Sync */}
        {data.nextScheduled && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Next sync scheduled: {new Date(data.nextScheduled).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export const Dashboard = memo(function Dashboard({
  tenantId,
  onProjectClick,
  onViewAllProjects,
  onSyncSettings,
}: DashboardProps) {
  const [state, setState] = useState<DashboardState>({
    portfolio: null,
    projects: [],
    syncStatus: null,
    isLoading: {
      portfolio: true,
      projects: true,
      sync: true,
    },
    errors: {
      portfolio: null,
      projects: null,
      sync: null,
    },
  });

  // Fetch portfolio summary
  const fetchPortfolio = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isLoading: { ...prev.isLoading, portfolio: true },
      errors: { ...prev.errors, portfolio: null },
    }));

    try {
      const response = await fetch(`/api/v1/portfolio/summary?tenant=${tenantId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      setState((prev) => ({
        ...prev,
        portfolio: data,
        isLoading: { ...prev.isLoading, portfolio: false },
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: { ...prev.isLoading, portfolio: false },
        errors: { ...prev.errors, portfolio: 'Failed to load portfolio' },
      }));
    }
  }, [tenantId]);

  // Fetch project health
  const fetchProjects = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isLoading: { ...prev.isLoading, projects: true },
      errors: { ...prev.errors, projects: null },
    }));

    try {
      const response = await fetch(`/api/v1/projects/health?tenant=${tenantId}&limit=6`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      setState((prev) => ({
        ...prev,
        projects: data.projects || [],
        isLoading: { ...prev.isLoading, projects: false },
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: { ...prev.isLoading, projects: false },
        errors: { ...prev.errors, projects: 'Failed to load projects' },
      }));
    }
  }, [tenantId]);

  // Fetch sync status
  const fetchSyncStatus = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isLoading: { ...prev.isLoading, sync: true },
      errors: { ...prev.errors, sync: null },
    }));

    try {
      const response = await fetch(`/api/v1/sync/status?tenant=${tenantId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      setState((prev) => ({
        ...prev,
        syncStatus: data,
        isLoading: { ...prev.isLoading, sync: false },
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: { ...prev.isLoading, sync: false },
        errors: { ...prev.errors, sync: 'Failed to load sync status' },
      }));
    }
  }, [tenantId]);

  // Fetch all data on mount
  useEffect(() => {
    fetchPortfolio();
    fetchProjects();
    fetchSyncStatus();
  }, [fetchPortfolio, fetchProjects, fetchSyncStatus]);

  // Determine if any data is loading
  const isAnyLoading = state.isLoading.portfolio || state.isLoading.projects || state.isLoading.sync;

  return (
    <main
      role="main"
      aria-label="Dashboard"
      className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 lg:p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Portfolio overview and project health metrics
          </p>
        </div>

        {/* Loading indicator for screen readers */}
        {isAnyLoading && (
          <div role="status" className="sr-only">
            Loading dashboard data...
          </div>
        )}

        {/* Portfolio Summary */}
        <section aria-labelledby="portfolio-heading" className="mb-8">
          <h2 id="portfolio-heading" className="sr-only">
            Portfolio Summary
          </h2>
          <PortfolioSummaryCards
            data={state.portfolio}
            isLoading={state.isLoading.portfolio}
            error={state.errors.portfolio}
            onRetry={fetchPortfolio}
          />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Health (2/3 width) */}
          <section aria-labelledby="projects-heading" className="lg:col-span-2">
            <h2 id="projects-heading" className="sr-only">
              Project Health
            </h2>
            <ProjectHealthList
              projects={state.projects}
              isLoading={state.isLoading.projects}
              error={state.errors.projects}
              onProjectClick={onProjectClick}
              onViewAll={onViewAllProjects}
              onRetry={fetchProjects}
            />
          </section>

          {/* Sync Status (1/3 width) */}
          <section aria-labelledby="sync-heading">
            <h2 id="sync-heading" className="sr-only">
              Sync Status
            </h2>
            <SyncStatusCard
              data={state.syncStatus}
              isLoading={state.isLoading.sync}
              error={state.errors.sync}
              onSettings={onSyncSettings}
              onRetry={fetchSyncStatus}
            />
          </section>
        </div>
      </div>
    </main>
  );
});

// Default export for dynamic imports
export default Dashboard;
