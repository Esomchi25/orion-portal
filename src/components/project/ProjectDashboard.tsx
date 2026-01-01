/**
 * Project Dashboard Component - ORION Command Center Design
 * @governance COMPONENT-001, DOC-002
 * @doc-sync PAGE_DATA_API_REFERENCE.md:3
 *
 * Detailed project view with CPI/SPI gauges, domain progress, and budget analytics.
 * Uses ORION Command Center dark theme with glassmorphism effects.
 */

'use client';

import { useState, useEffect, memo, useId } from 'react';
import { GlassCard, Badge } from '@/components/ui';
import type {
  ProjectDashboardProps,
  ProjectDashboardState,
  ProjectHeader,
  PerformanceMetrics,
  DomainProgress,
  BudgetAnalytics,
  ScheduleIntelligence,
  SCurveDataPoint,
  DomainType,
} from './types';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function getStatusColor(status: 'on_track' | 'at_risk' | 'critical'): string {
  if (status === 'on_track') return 'text-[var(--orion-emerald)]';
  if (status === 'at_risk') return 'text-[var(--orion-amber)]';
  return 'text-red-400';
}

function getMetricColor(value: number, threshold: number = 1.0): string {
  if (value >= threshold) return 'text-[var(--orion-emerald)]';
  if (value >= threshold * 0.9) return 'text-[var(--orion-amber)]';
  return 'text-red-400';
}

function getDomainColor(domain: DomainType): string {
  const colors: Record<DomainType, string> = {
    engineering: 'var(--orion-cyan)',
    procurement: 'var(--orion-amber)',
    construction: 'var(--orion-emerald)',
    installation: 'var(--orion-violet)',
    commissioning: '#f472b6', // Pink
  };
  return colors[domain];
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
// PROJECT HEADER COMPONENT
// ============================================================================

const ProjectHeaderSection = memo(function ProjectHeaderSection({
  data,
  isLoading,
}: {
  data: ProjectHeader | null;
  isLoading: boolean;
}) {
  if (isLoading) return <SkeletonCard className="h-32" />;
  if (!data) return null;

  const statusStyles: Record<string, string> = {
    on_track: 'bg-[var(--orion-emerald)]/10 border-[var(--orion-emerald)]/30 text-[var(--orion-emerald)]',
    at_risk: 'bg-[var(--orion-amber)]/10 border-[var(--orion-amber)]/30 text-[var(--orion-amber)]',
    critical: 'bg-red-500/10 border-red-500/30 text-red-400',
  };

  return (
    <GlassCard variant="elevated" className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-mono text-[var(--orion-text-muted)]">{data.projectCode}</span>
            <span className={`px-2 py-0.5 text-xs font-bold font-mono rounded border ${statusStyles[data.status]}`}>
              {data.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--orion-text-primary)] font-display">
            {data.projectName}
          </h1>
          <p className="text-sm text-[var(--orion-text-secondary)] mt-1">
            P6: {data.p6ProjectId} {data.sapWbsElement && `• SAP: ${data.sapWbsElement}`}
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="text-center p-3 rounded-lg bg-[var(--orion-bg-secondary)]">
            <p className="text-xs text-[var(--orion-text-muted)] font-mono mb-1">Complete</p>
            <p className="text-2xl font-bold font-mono text-[var(--orion-cyan)]">{data.percentComplete}%</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-[var(--orion-bg-secondary)]">
            <p className="text-xs text-[var(--orion-text-muted)] font-mono mb-1">Data Date</p>
            <p className="text-sm font-mono text-[var(--orion-text-primary)]">
              {new Date(data.dataDate).toLocaleDateString()}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-[var(--orion-bg-secondary)]">
            <p className="text-xs text-[var(--orion-text-muted)] font-mono mb-1">Finish</p>
            <p className="text-sm font-mono text-[var(--orion-text-primary)]">
              {new Date(data.plannedFinish).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
});

// ============================================================================
// PERFORMANCE GAUGES (CPI/SPI)
// ============================================================================

const PerformanceGaugeCard = memo(function PerformanceGaugeCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  // Calculate gauge fill percentage (0-100 maps to 0.5-1.5 range)
  const normalizedValue = Math.max(0.5, Math.min(1.5, value));
  const fillPercent = ((normalizedValue - 0.5) / 1.0) * 100;

  return (
    <GlassCard variant="elevated" className="p-4">
      <p className="text-xs text-[var(--orion-text-muted)] font-mono mb-3 text-center">{label}</p>
      <div className="relative h-4 bg-[var(--orion-bg-secondary)] rounded-full overflow-hidden mb-2">
        {/* Target line at 1.0 */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/50 z-10"
          style={{ left: '50%' }}
        />
        {/* Fill bar */}
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
          style={{
            width: `${fillPercent}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <p className={`text-3xl font-bold font-mono text-center ${getMetricColor(value)}`}>
        {value.toFixed(2)}
      </p>
    </GlassCard>
  );
});

const PerformanceGauges = memo(function PerformanceGauges({
  data,
  isLoading,
}: {
  data: PerformanceMetrics | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <PerformanceGaugeCard
        label="SPI (Schedule)"
        value={data.spi}
        color={data.spi >= 1 ? 'var(--orion-emerald)' : data.spi >= 0.9 ? 'var(--orion-amber)' : '#ef4444'}
      />
      <PerformanceGaugeCard
        label="CPI (Cost)"
        value={data.cpi}
        color={data.cpi >= 1 ? 'var(--orion-emerald)' : data.cpi >= 0.9 ? 'var(--orion-amber)' : '#ef4444'}
      />
      <GlassCard variant="elevated" className="p-4">
        <p className="text-xs text-[var(--orion-text-muted)] font-mono mb-3 text-center">Health Score</p>
        <div className="relative h-20 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border-4 border-[var(--orion-bg-secondary)] relative">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke={data.healthScore >= 80 ? 'var(--orion-emerald)' : data.healthScore >= 60 ? 'var(--orion-amber)' : '#ef4444'}
                strokeWidth="3"
                strokeDasharray={`${data.healthScore} 100`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xl font-bold font-mono text-[var(--orion-text-primary)]">
              {data.healthScore}
            </span>
          </div>
        </div>
      </GlassCard>
      <GlassCard variant="elevated" className="p-4">
        <p className="text-xs text-[var(--orion-text-muted)] font-mono mb-3 text-center">TCPI</p>
        <p className={`text-3xl font-bold font-mono text-center ${getMetricColor(data.tcpi)}`}>
          {data.tcpi.toFixed(2)}
        </p>
        <p className="text-xs text-[var(--orion-text-muted)] text-center mt-2">To-Complete PI</p>
      </GlassCard>
    </div>
  );
});

// ============================================================================
// DOMAIN PROGRESS CHART (EPCIC)
// ============================================================================

const DomainProgressChart = memo(function DomainProgressChart({
  data,
  isLoading,
}: {
  data: DomainProgress[];
  isLoading: boolean;
}) {
  if (isLoading) return <SkeletonCard className="h-64" />;
  if (data.length === 0) return null;

  return (
    <GlassCard variant="elevated" className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[var(--orion-cyan)]/10 border border-[var(--orion-cyan)]/30 flex items-center justify-center">
          <svg width="20" height="20" fill="none" stroke="var(--orion-cyan)" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-[var(--orion-text-primary)] font-display">Domain Progress</h3>
          <p className="text-xs text-[var(--orion-text-muted)] font-mono">EPCIC Breakdown</p>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((domain) => (
          <div key={domain.domain} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-[var(--orion-text-primary)]">{domain.label}</span>
              <div className="flex items-center gap-4">
                <span className={`text-xs font-mono ${getMetricColor(domain.spi)}`}>
                  SPI: {domain.spi.toFixed(2)}
                </span>
                <span className={`text-xs font-mono ${getMetricColor(domain.cpi)}`}>
                  CPI: {domain.cpi.toFixed(2)}
                </span>
                <span className="text-sm font-bold font-mono text-[var(--orion-text-primary)]">
                  {domain.percentComplete}%
                </span>
              </div>
            </div>
            <div className="relative h-3 bg-[var(--orion-bg-secondary)] rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${domain.percentComplete}%`,
                  backgroundColor: getDomainColor(domain.domain),
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
});

// ============================================================================
// BUDGET ANALYTICS CHART
// ============================================================================

const BudgetChart = memo(function BudgetChart({
  data,
  isLoading,
}: {
  data: BudgetAnalytics | null;
  isLoading: boolean;
}) {
  if (isLoading) return <SkeletonCard className="h-64" />;
  if (!data) return null;

  const metrics = [
    { label: 'BAC', value: data.bac, color: 'var(--orion-cyan)' },
    { label: 'EAC', value: data.eac, color: 'var(--orion-violet)' },
    { label: 'Actual Cost', value: data.ac, color: 'var(--orion-amber)' },
    { label: 'Earned Value', value: data.ev, color: 'var(--orion-emerald)' },
  ];

  const maxValue = Math.max(...metrics.map((m) => m.value));

  return (
    <GlassCard variant="elevated" className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[var(--orion-emerald)]/10 border border-[var(--orion-emerald)]/30 flex items-center justify-center">
          <svg width="20" height="20" fill="none" stroke="var(--orion-emerald)" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-[var(--orion-text-primary)] font-display">Budget Analytics</h3>
          <p className="text-xs text-[var(--orion-text-muted)] font-mono">EVM Financial Metrics</p>
        </div>
      </div>

      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--orion-text-secondary)]">{metric.label}</span>
              <span className="text-sm font-bold font-mono" style={{ color: metric.color }}>
                {formatCurrency(metric.value)}
              </span>
            </div>
            <div className="relative h-2 bg-[var(--orion-bg-secondary)] rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(metric.value / maxValue) * 100}%`,
                  backgroundColor: metric.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-[var(--orion-border)] grid grid-cols-2 gap-4">
        <div className="text-center p-2 rounded bg-[var(--orion-bg-secondary)]">
          <p className="text-xs text-[var(--orion-text-muted)] font-mono">VAC</p>
          <p className={`text-lg font-bold font-mono ${data.vac >= 0 ? 'text-[var(--orion-emerald)]' : 'text-red-400'}`}>
            {formatCurrency(data.vac)}
          </p>
        </div>
        <div className="text-center p-2 rounded bg-[var(--orion-bg-secondary)]">
          <p className="text-xs text-[var(--orion-text-muted)] font-mono">ETC</p>
          <p className="text-lg font-bold font-mono text-[var(--orion-text-primary)]">
            {formatCurrency(data.etc)}
          </p>
        </div>
      </div>
    </GlassCard>
  );
});

// ============================================================================
// SCHEDULE INTELLIGENCE
// ============================================================================

const ScheduleIntelligenceCard = memo(function ScheduleIntelligenceCard({
  data,
  isLoading,
}: {
  data: ScheduleIntelligence | null;
  isLoading: boolean;
}) {
  if (isLoading) return <SkeletonCard className="h-48" />;
  if (!data) return null;

  return (
    <GlassCard variant="elevated" className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[var(--orion-amber)]/10 border border-[var(--orion-amber)]/30 flex items-center justify-center">
          <svg width="20" height="20" fill="none" stroke="var(--orion-amber)" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-[var(--orion-text-primary)] font-display">P6 Schedule Intelligence</h3>
          <p className="text-xs text-[var(--orion-text-muted)] font-mono">Activity Analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-[var(--orion-bg-secondary)] text-center">
          <p className="text-xs text-[var(--orion-text-muted)] font-mono mb-1">Activities</p>
          <p className="text-xl font-bold font-mono text-[var(--orion-cyan)]">{data.totalActivities.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-lg bg-[var(--orion-bg-secondary)] text-center">
          <p className="text-xs text-[var(--orion-text-muted)] font-mono mb-1">Completed</p>
          <p className="text-xl font-bold font-mono text-[var(--orion-emerald)]">{data.completedActivities.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-lg bg-[var(--orion-bg-secondary)] text-center">
          <p className="text-xs text-[var(--orion-text-muted)] font-mono mb-1">Critical</p>
          <p className="text-xl font-bold font-mono text-red-400">{data.criticalPathActivities}</p>
        </div>
        <div className="p-3 rounded-lg bg-[var(--orion-bg-secondary)] text-center">
          <p className="text-xs text-[var(--orion-text-muted)] font-mono mb-1">WBS Elements</p>
          <p className="text-xl font-bold font-mono text-[var(--orion-violet)]">{data.wbsElements}</p>
        </div>
      </div>

      <div className="mt-4 flex justify-between text-sm">
        <span className="text-[var(--orion-text-secondary)]">
          Remaining: <span className="font-mono text-[var(--orion-amber)]">{data.remainingDuration} days</span>
        </span>
        <span className="text-[var(--orion-text-secondary)]">
          Float: <span className="font-mono text-[var(--orion-text-primary)]">{data.totalFloat} days</span>
        </span>
      </div>
    </GlassCard>
  );
});

// ============================================================================
// MAIN PROJECT DASHBOARD COMPONENT
// ============================================================================

// Mock data for development
const MOCK_HEADER: ProjectHeader = {
  projectId: '10481',
  projectName: 'AKK SEG-1 Gas Pipeline Project',
  projectCode: 'AKK-SEG1',
  percentComplete: 77,
  status: 'at_risk',
  dataDate: '2026-01-01',
  plannedStart: '2023-01-15',
  plannedFinish: '2025-12-31',
  p6ProjectId: '10481',
  sapWbsElement: 'OSL-AKK-001',
};

const MOCK_PERFORMANCE: PerformanceMetrics = {
  spi: 0.83,
  cpi: 2.40,
  healthScore: 72,
  sv: -42_500_000,
  cv: 112_500_000,
  tcpi: 0.65,
};

const MOCK_DOMAINS: DomainProgress[] = [
  { domain: 'engineering', label: 'Engineering', plannedValue: 50_000_000, earnedValue: 48_000_000, actualCost: 45_000_000, percentComplete: 96, spi: 0.96, cpi: 1.07 },
  { domain: 'procurement', label: 'Procurement', plannedValue: 80_000_000, earnedValue: 72_000_000, actualCost: 68_000_000, percentComplete: 90, spi: 0.90, cpi: 1.06 },
  { domain: 'construction', label: 'Construction', plannedValue: 100_000_000, earnedValue: 65_000_000, actualCost: 55_000_000, percentComplete: 65, spi: 0.65, cpi: 1.18 },
  { domain: 'installation', label: 'Installation', plannedValue: 15_000_000, earnedValue: 7_500_000, actualCost: 6_500_000, percentComplete: 50, spi: 0.50, cpi: 1.15 },
  { domain: 'commissioning', label: 'Commissioning', plannedValue: 5_000_000, earnedValue: 0, actualCost: 0, percentComplete: 0, spi: 0, cpi: 0 },
];

const MOCK_BUDGET: BudgetAnalytics = {
  bac: 250_000_000,
  ev: 192_500_000,
  ac: 80_000_000,
  pv: 235_000_000,
  eac: 104_166_667,
  etc: 24_166_667,
  vac: 145_833_333,
  currency: 'USD',
};

const MOCK_SCHEDULE: ScheduleIntelligence = {
  totalActivities: 3544,
  completedActivities: 2744,
  inProgressActivities: 234,
  notStartedActivities: 566,
  criticalPathActivities: 127,
  wbsElements: 553,
  originalDuration: 1080,
  remainingDuration: 365,
  totalFloat: 45,
};

export const ProjectDashboard = memo(function ProjectDashboard({
  projectId,
  tenantId,
  onNavigate,
}: ProjectDashboardProps) {
  const headingId = useId();
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<ProjectDashboardState>({
    header: null,
    performance: null,
    domains: [],
    budget: null,
    schedule: null,
    scurve: [],
    isLoading: {
      header: true,
      performance: true,
      domains: true,
      budget: true,
      schedule: true,
      scurve: true,
    },
    errors: {
      header: null,
      performance: null,
      domains: null,
      budget: null,
      schedule: null,
      scurve: null,
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      // Simulate API call - in production these would be real API calls
      await new Promise((resolve) => setTimeout(resolve, 600));

      setState({
        header: MOCK_HEADER,
        performance: MOCK_PERFORMANCE,
        domains: MOCK_DOMAINS,
        budget: MOCK_BUDGET,
        schedule: MOCK_SCHEDULE,
        scurve: [],
        isLoading: {
          header: false,
          performance: false,
          domains: false,
          budget: false,
          schedule: false,
          scurve: false,
        },
        errors: {
          header: null,
          performance: null,
          domains: null,
          budget: null,
          schedule: null,
          scurve: null,
        },
      });
    };

    fetchData();
  }, [projectId, tenantId]);

  return (
    <main
      role="main"
      aria-labelledby={headingId}
      className="min-h-screen p-4 sm:p-6 md:p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className={`mb-6 ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="amber">P6 SCHEDULE</Badge>
            <Badge variant="emerald">SAP FINANCE</Badge>
            <Badge variant="cyan">LIVE DATA</Badge>
          </div>
          <ProjectHeaderSection data={state.header} isLoading={state.isLoading.header} />
        </header>

        {/* Performance Gauges */}
        <section className={`mb-6 ${mounted ? 'animate-slide-up delay-100' : 'opacity-0'}`}>
          <h2 id={headingId} className="sr-only">Performance Metrics</h2>
          <PerformanceGauges data={state.performance} isLoading={state.isLoading.performance} />
        </section>

        {/* Domain Progress + Budget */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 ${mounted ? 'animate-slide-up delay-200' : 'opacity-0'}`}>
          <DomainProgressChart data={state.domains} isLoading={state.isLoading.domains} />
          <BudgetChart data={state.budget} isLoading={state.isLoading.budget} />
        </div>

        {/* Schedule Intelligence */}
        <section className={`${mounted ? 'animate-slide-up delay-300' : 'opacity-0'}`}>
          <ScheduleIntelligenceCard data={state.schedule} isLoading={state.isLoading.schedule} />
        </section>
      </div>
    </main>
  );
});

export default ProjectDashboard;
