/**
 * Dashboard Component - ORION Command Center Design
 * @governance COMPONENT-001, DOC-002
 * @doc-sync PAGE_DATA_API_REFERENCE.md:1
 *
 * Main dashboard displaying portfolio summary, project health, and sync status.
 * Uses ORION Command Center dark theme with glassmorphism effects.
 *
 * @coverage
 * - Unit: 90%+ (render, data display, interactions)
 * - Integration: API calls
 * - E2E: Full dashboard flow
 * - Accessibility: WCAG 2.1 AA
 * - Performance: < 100ms render
 */

'use client';

import { useState, useEffect, useCallback, memo, useId } from 'react';
import {
  GlassCard,
  Badge,
  LoadingSpinner,
  ProgressBar,
  StatusDot,
} from '@/components/ui';
import type {
  DashboardProps,
  DashboardState,
  PortfolioSummary,
  ProjectHealth,
  SyncStatus,
  HealthStatus,
} from './types';

// ============================================================================
// SKELETON COMPONENTS (ORION Styled)
// ============================================================================

const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div
      data-testid="skeleton-card"
      className="p-6 rounded-xl border border-[var(--orion-border)] bg-[var(--orion-bg-glass)] animate-pulse"
    >
      <div className="h-4 bg-[var(--orion-bg-elevated)] rounded w-1/3 mb-4" />
      <div className="h-8 bg-[var(--orion-bg-elevated)] rounded w-1/2" />
    </div>
  );
});

// ============================================================================
// PORTFOLIO SUMMARY CARDS (Command Center Style)
// ============================================================================

const SummaryCard = memo(function SummaryCard({
  title,
  value,
  variant,
  icon,
  onClick,
}: {
  title: string;
  value: number;
  variant: 'cyan' | 'emerald' | 'amber' | 'red';
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  const variantStyles = {
    cyan: 'border-[var(--orion-cyan)]/30 hover:border-[var(--orion-cyan)] glow-box-cyan',
    emerald: 'border-[var(--orion-emerald)]/30 hover:border-[var(--orion-emerald)] glow-box-emerald',
    amber: 'border-[var(--orion-amber)]/30 hover:border-[var(--orion-amber)] glow-box-amber',
    red: 'border-red-500/30 hover:border-red-500',
  };

  const textStyles = {
    cyan: 'text-[var(--orion-cyan)]',
    emerald: 'text-[var(--orion-emerald)]',
    amber: 'text-[var(--orion-amber)]',
    red: 'text-red-400',
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className={`
        glass-card-elevated p-6 cursor-pointer
        transition-all duration-300 hover:scale-[1.02]
        ${variantStyles[variant]}
      `}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg bg-[var(--orion-bg-secondary)] ${textStyles[variant]}`}>
          {icon}
        </div>
        <p className="text-sm font-medium text-[var(--orion-text-secondary)] font-display">
          {title}
        </p>
      </div>
      <p className={`text-4xl font-bold font-mono ${textStyles[variant]}`}>
        {value}
      </p>
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
      <GlassCard variant="elevated" className="p-6 border-red-500/30">
        <p className="text-red-400 mb-4 font-display">Failed to load portfolio summary</p>
        <button
          onClick={onRetry}
          className="btn-secondary text-red-400 border-red-500/30 hover:border-red-500"
        >
          Retry
        </button>
      </GlassCard>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        title="Total Projects"
        value={data.totalProjects}
        variant="cyan"
        icon={
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        }
      />
      <SummaryCard
        title="On Track"
        value={data.onTrack}
        variant="emerald"
        icon={
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      <SummaryCard
        title="At Risk"
        value={data.atRisk}
        variant="amber"
        icon={
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        }
      />
      <SummaryCard
        title="Critical"
        value={data.critical}
        variant="red"
        icon={
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
    </div>
  );
});

// ============================================================================
// PROJECT HEALTH CARD (Command Center Style)
// ============================================================================

const StatusBadge = memo(function StatusBadge({ status }: { status: HealthStatus }) {
  const variants: Record<HealthStatus, 'emerald' | 'amber' | 'red'> = {
    on_track: 'emerald',
    at_risk: 'amber',
    critical: 'red',
  };

  const labels = {
    on_track: 'On Track',
    at_risk: 'At Risk',
    critical: 'Critical',
  };

  // Using inline badge style to match ORION design
  const badgeStyles = {
    emerald: 'bg-[var(--orion-emerald)]/10 text-[var(--orion-emerald)] border-[var(--orion-emerald)]/30',
    amber: 'bg-[var(--orion-amber)]/10 text-[var(--orion-amber)] border-[var(--orion-amber)]/30',
    red: 'bg-red-500/10 text-red-400 border-red-500/30',
  };

  return (
    <span className={`px-2 py-1 text-xs font-bold font-mono rounded-md border ${badgeStyles[variants[status]]}`}>
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

  const getCPISPIColor = (value: number) => {
    if (value >= 0.95) return 'text-[var(--orion-emerald)]';
    if (value >= 0.85) return 'text-[var(--orion-amber)]';
    return 'text-red-400';
  };

  return (
    <div
      data-testid={`project-card-${project.id}`}
      data-status={project.status}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="glass-card-elevated p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-[var(--orion-cyan)]/50"
    >
      <div className="flex items-start justify-between mb-4">
        <p className="font-semibold text-[var(--orion-text-primary)] font-display line-clamp-1">
          {project.name}
        </p>
        <StatusBadge status={project.status} />
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-[var(--orion-text-secondary)] mb-2 font-mono">
          <span>Progress</span>
          <span className="text-[var(--orion-cyan)]">{project.percentComplete}%</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={project.percentComplete}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${project.percentComplete}% complete`}
          className="w-full bg-[var(--orion-bg-secondary)] rounded-full h-2 overflow-hidden"
        >
          <div
            className="h-2 rounded-full bg-gradient-to-r from-[var(--orion-cyan)] to-[var(--orion-violet)] transition-all duration-500"
            style={{ width: `${project.percentComplete}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--orion-border)]">
        <div>
          <p className="text-xs text-[var(--orion-text-muted)] font-mono mb-1">SPI</p>
          <p className={`text-xl font-bold font-mono ${getCPISPIColor(project.spi)}`}>
            {project.spi.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--orion-text-muted)] font-mono mb-1">CPI</p>
          <p className={`text-xl font-bold font-mono ${getCPISPIColor(project.cpi)}`}>
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
      <GlassCard variant="elevated" className="p-6 border-red-500/30">
        <p className="text-red-400 mb-4 font-display">Failed to load projects</p>
        <button
          onClick={onRetry}
          className="btn-secondary text-red-400 border-red-500/30 hover:border-red-500"
        >
          Retry
        </button>
      </GlassCard>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[var(--orion-text-primary)] font-display">
          Project Health Overview
        </h2>
        <button
          onClick={onViewAll}
          className="text-sm text-[var(--orion-cyan)] hover:text-[var(--orion-cyan)]/80 font-medium font-mono transition-colors"
        >
          View All →
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project, index) => (
          <div
            key={project.id}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ProjectHealthCard
              project={project}
              onClick={() => onProjectClick?.(project.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

// ============================================================================
// SYNC STATUS CARD (Command Center Style)
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
      <GlassCard variant="elevated" className="p-6 border-red-500/30">
        <p className="text-red-400 mb-4 font-display">Failed to load sync status</p>
        <button
          onClick={onRetry}
          className="btn-secondary text-red-400 border-red-500/30 hover:border-red-500"
        >
          Retry
        </button>
      </GlassCard>
    );
  }

  if (!data) return null;

  return (
    <GlassCard
      variant="elevated"
      data-testid="sync-status-card"
      className="p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[var(--orion-text-primary)] font-display">
          Sync Status
        </h2>
        <button
          onClick={onSettings}
          aria-label="Sync settings"
          className="p-2 rounded-lg hover:bg-[var(--orion-bg-secondary)] text-[var(--orion-text-muted)] hover:text-[var(--orion-cyan)] transition-colors"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {/* P6 Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--orion-bg-secondary)] border border-[var(--orion-amber)]/20">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${data.p6.connected ? 'bg-[var(--orion-emerald)] animate-pulse' : 'bg-red-500'}`} />
            <span className="font-bold text-[var(--orion-amber)] font-mono">P6</span>
          </div>
          <div className="text-sm font-mono">
            {data.p6.connected ? (
              <span className="text-[var(--orion-text-secondary)]">
                <span className="text-[var(--orion-emerald)]">Connected</span>
                <span className="mx-2 text-[var(--orion-text-muted)]">•</span>
                <span>{formatRelativeTime(data.p6.lastSync)}</span>
              </span>
            ) : (
              <span className="text-red-400">Not Connected</span>
            )}
          </div>
        </div>

        {/* SAP Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--orion-bg-secondary)] border border-[var(--orion-emerald)]/20">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${data.sap.connected ? 'bg-[var(--orion-emerald)] animate-pulse' : 'bg-red-500'}`} />
            <span className="font-bold text-[var(--orion-emerald)] font-mono">SAP</span>
          </div>
          <div className="text-sm font-mono">
            {data.sap.connected ? (
              <span className="text-[var(--orion-text-secondary)]">
                <span className="text-[var(--orion-emerald)]">Connected</span>
                <span className="mx-2 text-[var(--orion-text-muted)]">•</span>
                <span>{formatRelativeTime(data.sap.lastSync)}</span>
              </span>
            ) : (
              <span className="text-red-400">Not Connected</span>
            )}
          </div>
        </div>

        {/* Next Sync */}
        {data.nextScheduled && (
          <div className="pt-4 border-t border-[var(--orion-border)]">
            <p className="text-sm text-[var(--orion-text-muted)] font-mono">
              <span className="text-[var(--orion-text-secondary)]">Next sync:</span>{' '}
              {new Date(data.nextScheduled).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </GlassCard>
  );
});

// ============================================================================
// MAIN DASHBOARD COMPONENT (Command Center Style)
// ============================================================================

export const Dashboard = memo(function Dashboard({
  tenantId,
  onProjectClick,
  onViewAllProjects,
  onSyncSettings,
}: DashboardProps) {
  const headingId = useId();
  const [mounted, setMounted] = useState(false);
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

  useEffect(() => {
    setMounted(true);
  }, []);

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
      aria-labelledby={headingId}
      className="min-h-screen p-4 sm:p-6 md:p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className={`mb-8 sm:mb-12 ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="cyan">PORTFOLIO</Badge>
            <Badge variant="violet">LIVE DATA</Badge>
          </div>
          <h1
            id={headingId}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--orion-text-primary)] font-display"
          >
            <span className="text-gradient-cyan">Dashboard</span>
          </h1>
          <p className="mt-2 text-[var(--orion-text-secondary)] max-w-2xl">
            Portfolio overview and project health metrics with real-time P6 and SAP integration.
          </p>
        </header>

        {/* Loading indicator for screen readers */}
        {isAnyLoading && (
          <div role="status" className="sr-only">
            Loading dashboard data...
          </div>
        )}

        {/* Portfolio Summary */}
        <section
          aria-labelledby="portfolio-heading"
          className={`mb-8 sm:mb-12 ${mounted ? 'animate-slide-up delay-100' : 'opacity-0'}`}
        >
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Project Health (2/3 width) */}
          <section
            aria-labelledby="projects-heading"
            className={`lg:col-span-2 ${mounted ? 'animate-slide-up delay-200' : 'opacity-0'}`}
          >
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
          <section
            aria-labelledby="sync-heading"
            className={`${mounted ? 'animate-slide-up delay-300' : 'opacity-0'}`}
          >
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
