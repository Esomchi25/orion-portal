/**
 * CFO Dashboard Component - ORION Command Center Design
 * @governance COMPONENT-001, DOC-002
 * @doc-sync PAGE_DATA_API_REFERENCE.md:2
 *
 * Executive financial dashboard for CFO-level visibility.
 * Uses ORION Command Center dark theme with glassmorphism effects.
 */

'use client';

import { useState, useEffect, useCallback, memo, useId } from 'react';
import { GlassCard, Badge } from '@/components/ui';
import type {
  CFODashboardProps,
  CFODashboardState,
  PortfolioHealth,
  PortfolioFinancials,
  ProjectBudget,
  ProjectComparison,
} from './types';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatCurrency(value: number, currency: 'USD' | 'NGN' = 'USD'): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function getStatusColor(status: 'ON_TRACK' | 'AT_RISK' | 'CRITICAL' | 'on_track' | 'at_risk' | 'critical'): string {
  const normalized = status.toLowerCase();
  if (normalized === 'on_track') return 'text-[var(--orion-emerald)]';
  if (normalized === 'at_risk') return 'text-[var(--orion-amber)]';
  return 'text-red-400';
}

function getStatusBg(status: 'ON_TRACK' | 'AT_RISK' | 'CRITICAL'): string {
  if (status === 'ON_TRACK') return 'bg-[var(--orion-emerald)]/10 border-[var(--orion-emerald)]/30';
  if (status === 'AT_RISK') return 'bg-[var(--orion-amber)]/10 border-[var(--orion-amber)]/30';
  return 'bg-red-500/10 border-red-500/30';
}

// ============================================================================
// SKELETON COMPONENT
// ============================================================================

const SkeletonCard = memo(function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`p-6 rounded-xl border border-[var(--orion-border)] bg-[var(--orion-bg-glass)] animate-pulse ${className}`}>
      <div className="h-4 bg-[var(--orion-bg-elevated)] rounded w-1/3 mb-4" />
      <div className="h-8 bg-[var(--orion-bg-elevated)] rounded w-1/2" />
    </div>
  );
});

// ============================================================================
// PORTFOLIO HEALTH BANNER
// ============================================================================

const PortfolioHealthBanner = memo(function PortfolioHealthBanner({
  data,
  isLoading,
}: {
  data: PortfolioHealth | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <SkeletonCard className="h-32" />;
  }

  if (!data) return null;

  return (
    <GlassCard
      variant="elevated"
      className={`p-6 border-l-4 ${
        data.status === 'ON_TRACK'
          ? 'border-l-[var(--orion-emerald)]'
          : data.status === 'AT_RISK'
          ? 'border-l-[var(--orion-amber)]'
          : 'border-l-red-500'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-lg border ${getStatusBg(data.status)}`}>
            <span className={`text-2xl font-bold font-display ${getStatusColor(data.status)}`}>
              {data.status.replace('_', ' ')}
            </span>
          </div>
          <div>
            <p className="text-sm text-[var(--orion-text-muted)] font-mono">Portfolio Health</p>
            <p className="text-[var(--orion-text-secondary)]">
              {data.totalProjects} projects monitored
            </p>
          </div>
        </div>

        <div className="flex gap-8">
          <div className="text-center">
            <p className="text-xs text-[var(--orion-text-muted)] font-mono mb-1">AVG CPI</p>
            <p className={`text-3xl font-bold font-mono ${data.avgCPI >= 1 ? 'text-[var(--orion-emerald)]' : data.avgCPI >= 0.9 ? 'text-[var(--orion-amber)]' : 'text-red-400'}`}>
              {data.avgCPI.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[var(--orion-text-muted)] font-mono mb-1">AVG SPI</p>
            <p className={`text-3xl font-bold font-mono ${data.avgSPI >= 1 ? 'text-[var(--orion-emerald)]' : data.avgSPI >= 0.9 ? 'text-[var(--orion-amber)]' : 'text-red-400'}`}>
              {data.avgSPI.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
});

// ============================================================================
// KPI SUMMARY CARDS
// ============================================================================

const KPISummaryCards = memo(function KPISummaryCards({
  data,
  isLoading,
}: {
  data: PortfolioHealth | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!data) return null;

  const cards = [
    { label: 'Total Projects', value: data.totalProjects, color: 'cyan' },
    { label: 'On Track', value: data.onTrackCount, color: 'emerald' },
    { label: 'At Risk', value: data.atRiskCount, color: 'amber' },
    { label: 'Critical', value: data.criticalCount, color: 'red' },
  ];

  const colorStyles: Record<string, string> = {
    cyan: 'text-[var(--orion-cyan)] border-[var(--orion-cyan)]/30',
    emerald: 'text-[var(--orion-emerald)] border-[var(--orion-emerald)]/30',
    amber: 'text-[var(--orion-amber)] border-[var(--orion-amber)]/30',
    red: 'text-red-400 border-red-500/30',
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <GlassCard
          key={card.label}
          variant="elevated"
          className={`p-4 ${colorStyles[card.color]} animate-slide-up`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <p className="text-xs text-[var(--orion-text-muted)] font-mono mb-1">{card.label}</p>
          <p className={`text-3xl font-bold font-mono ${colorStyles[card.color].split(' ')[0]}`}>
            {card.value}
          </p>
        </GlassCard>
      ))}
    </div>
  );
});

// ============================================================================
// PORTFOLIO FINANCIALS CARD
// ============================================================================

const PortfolioFinancialsCard = memo(function PortfolioFinancialsCard({
  data,
  isLoading,
}: {
  data: PortfolioFinancials | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <SkeletonCard className="h-48" />;
  }

  if (!data) return null;

  const metrics = [
    { label: 'Total BAC', value: data.totalBAC, color: 'text-[var(--orion-cyan)]' },
    { label: 'Actual Costs', value: data.actualCosts, color: 'text-[var(--orion-amber)]' },
    { label: 'Open Commitments', value: data.openCommitments, color: 'text-[var(--orion-violet)]' },
  ];

  return (
    <GlassCard variant="elevated" className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[var(--orion-emerald)]/10 border border-[var(--orion-emerald)]/30 flex items-center justify-center">
          <svg width="20" height="20" fill="none" stroke="var(--orion-emerald)" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-[var(--orion-text-primary)] font-display">
            Portfolio Financials
          </h3>
          <p className="text-xs text-[var(--orion-text-muted)] font-mono">
            SAP Finance Integration
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="text-center p-3 rounded-lg bg-[var(--orion-bg-secondary)]">
            <p className="text-xs text-[var(--orion-text-muted)] font-mono mb-1">{metric.label}</p>
            <p className={`text-xl font-bold font-mono ${metric.color}`}>
              {formatCurrency(metric.value, data.currency)}
            </p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
});

// ============================================================================
// REVENUE POSITION CARD
// ============================================================================

const RevenuePositionCard = memo(function RevenuePositionCard({
  data,
  isLoading,
}: {
  data: PortfolioFinancials | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <SkeletonCard className="h-48" />;
  }

  if (!data) return null;

  return (
    <GlassCard variant="elevated" className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[var(--orion-cyan)]/10 border border-[var(--orion-cyan)]/30 flex items-center justify-center">
          <svg width="20" height="20" fill="none" stroke="var(--orion-cyan)" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-[var(--orion-text-primary)] font-display">
            Revenue Position
          </h3>
          <p className="text-xs text-[var(--orion-text-muted)] font-mono">
            Cash Flow Status
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 rounded-lg bg-[var(--orion-bg-secondary)]">
          <span className="text-[var(--orion-text-secondary)]">Revenue Received</span>
          <span className="text-xl font-bold font-mono text-[var(--orion-cyan)]">
            {formatCurrency(data.revenueReceived, data.currency)}
          </span>
        </div>
        <div className="flex justify-between items-center p-3 rounded-lg bg-[var(--orion-bg-secondary)]">
          <span className="text-[var(--orion-text-secondary)]">Net Cash Position</span>
          <span className={`text-xl font-bold font-mono ${data.netCashPosition >= 0 ? 'text-[var(--orion-emerald)]' : 'text-red-400'}`}>
            {formatCurrency(data.netCashPosition, data.currency)}
          </span>
        </div>
      </div>
    </GlassCard>
  );
});

// ============================================================================
// PROJECT COMPARISON TABLE
// ============================================================================

const ProjectComparisonTable = memo(function ProjectComparisonTable({
  data,
  isLoading,
  onProjectClick,
}: {
  data: ProjectComparison[];
  isLoading: boolean;
  onProjectClick?: (projectId: string) => void;
}) {
  if (isLoading) {
    return <SkeletonCard className="h-96" />;
  }

  if (data.length === 0) {
    return (
      <GlassCard variant="elevated" className="p-6">
        <p className="text-[var(--orion-text-muted)] text-center">No projects to compare</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="elevated" className="p-6 overflow-hidden">
      <h3 className="text-lg font-semibold text-[var(--orion-text-primary)] font-display mb-4">
        Project Portfolio Comparison
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--orion-border)]">
              <th className="text-left py-3 px-2 text-xs font-mono text-[var(--orion-text-muted)]">PROJECT</th>
              <th className="text-right py-3 px-2 text-xs font-mono text-[var(--orion-text-muted)]">%</th>
              <th className="text-right py-3 px-2 text-xs font-mono text-[var(--orion-text-muted)]">SPI</th>
              <th className="text-right py-3 px-2 text-xs font-mono text-[var(--orion-text-muted)]">CPI</th>
              <th className="text-right py-3 px-2 text-xs font-mono text-[var(--orion-text-muted)]">BAC</th>
              <th className="text-right py-3 px-2 text-xs font-mono text-[var(--orion-text-muted)]">EAC</th>
              <th className="text-right py-3 px-2 text-xs font-mono text-[var(--orion-text-muted)]">VAC</th>
              <th className="text-center py-3 px-2 text-xs font-mono text-[var(--orion-text-muted)]">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {data.map((project) => (
              <tr
                key={project.projectId}
                onClick={() => onProjectClick?.(project.projectId)}
                className="border-b border-[var(--orion-border)]/50 hover:bg-[var(--orion-bg-secondary)] cursor-pointer transition-colors"
              >
                <td className="py-3 px-2">
                  <p className="font-medium text-[var(--orion-text-primary)] truncate max-w-[200px]">
                    {project.projectName}
                  </p>
                </td>
                <td className="py-3 px-2 text-right font-mono text-[var(--orion-text-secondary)]">
                  {project.percentComplete}%
                </td>
                <td className={`py-3 px-2 text-right font-mono font-bold ${getStatusColor(project.spi >= 0.95 ? 'on_track' : project.spi >= 0.85 ? 'at_risk' : 'critical')}`}>
                  {project.spi.toFixed(2)}
                </td>
                <td className={`py-3 px-2 text-right font-mono font-bold ${getStatusColor(project.cpi >= 0.95 ? 'on_track' : project.cpi >= 0.85 ? 'at_risk' : 'critical')}`}>
                  {project.cpi.toFixed(2)}
                </td>
                <td className="py-3 px-2 text-right font-mono text-[var(--orion-text-secondary)]">
                  {formatCurrency(project.bac)}
                </td>
                <td className="py-3 px-2 text-right font-mono text-[var(--orion-text-secondary)]">
                  {formatCurrency(project.eac)}
                </td>
                <td className={`py-3 px-2 text-right font-mono font-bold ${project.vac >= 0 ? 'text-[var(--orion-emerald)]' : 'text-red-400'}`}>
                  {formatCurrency(project.vac)}
                </td>
                <td className="py-3 px-2 text-center">
                  <span className={`px-2 py-1 text-xs font-bold font-mono rounded-md border ${
                    project.status === 'on_track'
                      ? 'bg-[var(--orion-emerald)]/10 text-[var(--orion-emerald)] border-[var(--orion-emerald)]/30'
                      : project.status === 'at_risk'
                      ? 'bg-[var(--orion-amber)]/10 text-[var(--orion-amber)] border-[var(--orion-amber)]/30'
                      : 'bg-red-500/10 text-red-400 border-red-500/30'
                  }`}>
                    {project.status.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
});

// ============================================================================
// MAIN CFO DASHBOARD COMPONENT
// ============================================================================

// Mock data for development
const MOCK_HEALTH: PortfolioHealth = {
  status: 'AT_RISK',
  avgCPI: 1.02,
  avgSPI: 0.76,
  totalProjects: 5,
  onTrackCount: 2,
  atRiskCount: 2,
  criticalCount: 1,
};

const MOCK_FINANCIALS: PortfolioFinancials = {
  totalBAC: 1_100_000_000,
  actualCosts: 464_600_000,
  openCommitments: 481_600_000,
  revenueReceived: 1_200_000_000,
  netCashPosition: 711_700_000,
  currency: 'USD',
};

const MOCK_COMPARISON: ProjectComparison[] = [
  { projectId: '10481', projectName: 'AKK SEG-1 Gas Pipeline Project', percentComplete: 77, spi: 0.83, cpi: 2.40, bac: 250_000_000, ac: 80_000_000, ev: 192_500_000, eac: 104_166_667, vac: 145_833_333, status: 'at_risk' },
  { projectId: 'OSLNNPC', projectName: 'NNPC - NLNG Project', percentComplete: 92, spi: 1.05, cpi: 0.98, bac: 400_000_000, ac: 375_510_204, ev: 368_000_000, eac: 408_163_265, vac: -8_163_265, status: 'on_track' },
  { projectId: 'OSLSDPC', projectName: 'SDPC Project', percentComplete: 45, spi: 0.72, cpi: 0.88, bac: 180_000_000, ac: 91_800_000, ev: 81_000_000, eac: 204_545_455, vac: -24_545_455, status: 'critical' },
  { projectId: 'OSLUBET', projectName: 'UBET Project', percentComplete: 68, spi: 0.91, cpi: 0.94, bac: 150_000_000, ac: 108_510_638, ev: 102_000_000, eac: 159_574_468, vac: -9_574_468, status: 'at_risk' },
  { projectId: 'OSLOB3', projectName: 'OB3 Project', percentComplete: 85, spi: 0.97, cpi: 1.02, bac: 120_000_000, ac: 100_000_000, ev: 102_000_000, eac: 117_647_059, vac: 2_352_941, status: 'on_track' },
];

export const CFODashboard = memo(function CFODashboard({
  tenantId,
  onProjectClick,
}: CFODashboardProps) {
  const headingId = useId();
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<CFODashboardState>({
    health: null,
    financials: null,
    budgets: [],
    comparison: [],
    isLoading: {
      health: true,
      financials: true,
      budgets: true,
      comparison: true,
    },
    errors: {
      health: null,
      financials: null,
      budgets: null,
      comparison: null,
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch portfolio health
  const fetchHealth = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isLoading: { ...prev.isLoading, health: true },
      errors: { ...prev.errors, health: null },
    }));

    try {
      const response = await fetch(`/api/v1/cfo/health?tenant=${tenantId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      setState((prev) => ({
        ...prev,
        health: data,
        isLoading: { ...prev.isLoading, health: false },
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: { ...prev.isLoading, health: false },
        errors: { ...prev.errors, health: 'Failed to load portfolio health' },
      }));
    }
  }, [tenantId]);

  // Fetch portfolio financials
  const fetchFinancials = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isLoading: { ...prev.isLoading, financials: true },
      errors: { ...prev.errors, financials: null },
    }));

    try {
      const response = await fetch(`/api/v1/cfo/financials?tenant=${tenantId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      setState((prev) => ({
        ...prev,
        financials: data,
        isLoading: { ...prev.isLoading, financials: false },
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: { ...prev.isLoading, financials: false },
        errors: { ...prev.errors, financials: 'Failed to load financials' },
      }));
    }
  }, [tenantId]);

  // Fetch project comparison
  const fetchComparison = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isLoading: { ...prev.isLoading, comparison: true },
      errors: { ...prev.errors, comparison: null },
    }));

    try {
      const response = await fetch(`/api/v1/cfo/comparison?tenant=${tenantId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      setState((prev) => ({
        ...prev,
        comparison: data.projects || [],
        isLoading: { ...prev.isLoading, comparison: false },
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: { ...prev.isLoading, comparison: false },
        errors: { ...prev.errors, comparison: 'Failed to load comparison' },
      }));
    }
  }, [tenantId]);

  // Fetch all data on mount
  useEffect(() => {
    fetchHealth();
    fetchFinancials();
    fetchComparison();
  }, [fetchHealth, fetchFinancials, fetchComparison]);

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
            <Badge variant="emerald">EXECUTIVE</Badge>
            <Badge variant="violet">SAP FINANCE</Badge>
          </div>
          <h1
            id={headingId}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--orion-text-primary)] font-display"
          >
            <span className="text-gradient-emerald">CFO Insights Center</span>
          </h1>
          <p className="mt-2 text-[var(--orion-text-secondary)] max-w-2xl">
            Executive financial dashboard with real-time SAP integration and portfolio health metrics.
          </p>
        </header>

        {/* Portfolio Health Banner */}
        <section className={`mb-6 ${mounted ? 'animate-slide-up delay-100' : 'opacity-0'}`}>
          <PortfolioHealthBanner data={state.health} isLoading={state.isLoading.health} />
        </section>

        {/* KPI Summary Cards */}
        <section className={`mb-8 ${mounted ? 'animate-slide-up delay-200' : 'opacity-0'}`}>
          <KPISummaryCards data={state.health} isLoading={state.isLoading.health} />
        </section>

        {/* Financials Row */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 ${mounted ? 'animate-slide-up delay-300' : 'opacity-0'}`}>
          <PortfolioFinancialsCard data={state.financials} isLoading={state.isLoading.financials} />
          <RevenuePositionCard data={state.financials} isLoading={state.isLoading.financials} />
        </div>

        {/* Project Comparison Table */}
        <section className={`${mounted ? 'animate-slide-up delay-400' : 'opacity-0'}`}>
          <ProjectComparisonTable
            data={state.comparison}
            isLoading={state.isLoading.comparison}
            onProjectClick={onProjectClick}
          />
        </section>
      </div>
    </main>
  );
});

export default CFODashboard;
