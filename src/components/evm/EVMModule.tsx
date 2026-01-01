/**
 * EVM Module Component - ORION Command Center Design
 * @governance COMPONENT-001, DOC-002
 * @doc-sync PAGE_DATA_API_REFERENCE.md:4
 *
 * Earned Value Management analysis with reference definitions and project data.
 * Uses ORION Command Center dark theme with glassmorphism effects.
 */

'use client';

import { useState, useEffect, memo, useId } from 'react';
import { GlassCard, Badge } from '@/components/ui';
import type {
  EVMModuleProps,
  EVMModuleState,
  EVMDefinition,
  EVMProjectSnapshot,
  EVMMetricCategory,
} from './types';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function getMetricColor(value: number, isVariance: boolean = false): string {
  if (isVariance) {
    if (value > 0) return 'text-[var(--orion-emerald)]';
    if (value < 0) return 'text-red-400';
    return 'text-[var(--orion-text-secondary)]';
  }
  if (value >= 1) return 'text-[var(--orion-emerald)]';
  if (value >= 0.9) return 'text-[var(--orion-amber)]';
  return 'text-red-400';
}

function getCategoryColor(category: EVMMetricCategory): string {
  const colors: Record<EVMMetricCategory, string> = {
    base: 'var(--orion-cyan)',
    variance: 'var(--orion-amber)',
    index: 'var(--orion-emerald)',
    forecast: 'var(--orion-violet)',
  };
  return colors[category];
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
// EVM REFERENCE CARD (Expandable)
// ============================================================================

const EVMReferenceCard = memo(function EVMReferenceCard({
  definitions,
  isLoading,
}: {
  definitions: EVMDefinition[];
  isLoading: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  if (isLoading) return <SkeletonCard className="h-48" />;

  // Group by category
  const grouped = definitions.reduce((acc, def) => {
    if (!acc[def.category]) acc[def.category] = [];
    acc[def.category].push(def);
    return acc;
  }, {} as Record<EVMMetricCategory, EVMDefinition[]>);

  const categoryLabels: Record<EVMMetricCategory, string> = {
    base: 'Base Metrics',
    variance: 'Variances',
    index: 'Performance Indices',
    forecast: 'Forecasts',
  };

  return (
    <GlassCard variant="elevated" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--orion-violet)]/10 border border-[var(--orion-violet)]/30 flex items-center justify-center">
            <svg width="20" height="20" fill="none" stroke="var(--orion-violet)" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--orion-text-primary)] font-display">EVM Reference</h3>
            <p className="text-xs text-[var(--orion-text-muted)] font-mono">{definitions.length} Metrics Defined</p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="px-3 py-1 text-sm font-mono text-[var(--orion-cyan)] hover:bg-[var(--orion-cyan)]/10 rounded transition-colors"
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {expanded && (
        <div className="space-y-6 animate-slide-up">
          {(Object.entries(grouped) as [EVMMetricCategory, EVMDefinition[]][]).map(([category, defs]) => (
            <div key={category}>
              <h4 className="text-sm font-bold text-[var(--orion-text-muted)] font-mono mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getCategoryColor(category) }} />
                {categoryLabels[category]}
              </h4>
              <div className="grid gap-2">
                {defs.map((def) => (
                  <div
                    key={def.abbreviation}
                    className="p-3 rounded-lg bg-[var(--orion-bg-secondary)] flex flex-col md:flex-row md:items-center gap-2"
                  >
                    <span
                      className="text-sm font-bold font-mono w-12"
                      style={{ color: getCategoryColor(category) }}
                    >
                      {def.abbreviation}
                    </span>
                    <span className="text-sm text-[var(--orion-text-primary)] flex-1">{def.name}</span>
                    {def.formula && (
                      <span className="text-xs font-mono text-[var(--orion-text-muted)] bg-[var(--orion-bg-primary)] px-2 py-1 rounded">
                        {def.formula}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!expanded && (
        <div className="flex flex-wrap gap-2">
          {definitions.slice(0, 8).map((def) => (
            <span
              key={def.abbreviation}
              className="px-2 py-1 text-xs font-mono rounded"
              style={{
                backgroundColor: `color-mix(in srgb, ${getCategoryColor(def.category)} 10%, transparent)`,
                color: getCategoryColor(def.category),
              }}
            >
              {def.abbreviation}
            </span>
          ))}
          {definitions.length > 8 && (
            <span className="px-2 py-1 text-xs font-mono text-[var(--orion-text-muted)]">
              +{definitions.length - 8} more
            </span>
          )}
        </div>
      )}
    </GlassCard>
  );
});

// ============================================================================
// EVM ANALYSIS TABLE
// ============================================================================

const EVMAnalysisTable = memo(function EVMAnalysisTable({
  projects,
  isLoading,
  onProjectClick,
}: {
  projects: EVMProjectSnapshot[];
  isLoading: boolean;
  onProjectClick?: (projectId: string) => void;
}) {
  if (isLoading) return <SkeletonCard className="h-96" />;

  if (projects.length === 0) {
    return (
      <GlassCard variant="elevated" className="p-6">
        <p className="text-[var(--orion-text-muted)] text-center">No EVM data available</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="elevated" className="p-6 overflow-hidden">
      <h3 className="text-lg font-semibold text-[var(--orion-text-primary)] font-display mb-4">
        EVM Analysis by Project
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--orion-border)]">
              <th className="text-left py-3 px-2 text-xs font-mono text-[var(--orion-text-muted)]">PROJECT</th>
              <th className="text-right py-3 px-2 text-xs font-mono text-[var(--orion-text-muted)]">%</th>
              <th className="text-right py-3 px-2 text-xs font-mono text-[var(--orion-cyan)]">BAC</th>
              <th className="text-right py-3 px-2 text-xs font-mono text-[var(--orion-cyan)]">EV</th>
              <th className="text-right py-3 px-2 text-xs font-mono text-[var(--orion-cyan)]">AC</th>
              <th className="text-right py-3 px-2 text-xs font-mono text-[var(--orion-amber)]">SV</th>
              <th className="text-right py-3 px-2 text-xs font-mono text-[var(--orion-amber)]">CV</th>
              <th className="text-right py-3 px-2 text-xs font-mono text-[var(--orion-emerald)]">SPI</th>
              <th className="text-right py-3 px-2 text-xs font-mono text-[var(--orion-emerald)]">CPI</th>
              <th className="text-right py-3 px-2 text-xs font-mono text-[var(--orion-violet)]">EAC</th>
              <th className="text-right py-3 px-2 text-xs font-mono text-[var(--orion-violet)]">VAC</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr
                key={project.projectId}
                onClick={() => onProjectClick?.(project.projectId)}
                className="border-b border-[var(--orion-border)]/50 hover:bg-[var(--orion-bg-secondary)] cursor-pointer transition-colors"
              >
                <td className="py-3 px-2">
                  <p className="font-medium text-[var(--orion-text-primary)] truncate max-w-[150px]">
                    {project.projectName}
                  </p>
                </td>
                <td className="py-3 px-2 text-right font-mono text-[var(--orion-text-secondary)]">
                  {project.percentComplete}%
                </td>
                <td className="py-3 px-2 text-right font-mono text-[var(--orion-text-secondary)]">
                  {formatCurrency(project.bac)}
                </td>
                <td className="py-3 px-2 text-right font-mono text-[var(--orion-text-secondary)]">
                  {formatCurrency(project.ev)}
                </td>
                <td className="py-3 px-2 text-right font-mono text-[var(--orion-text-secondary)]">
                  {formatCurrency(project.ac)}
                </td>
                <td className={`py-3 px-2 text-right font-mono font-bold ${getMetricColor(project.sv, true)}`}>
                  {formatCurrency(project.sv)}
                </td>
                <td className={`py-3 px-2 text-right font-mono font-bold ${getMetricColor(project.cv, true)}`}>
                  {formatCurrency(project.cv)}
                </td>
                <td className={`py-3 px-2 text-right font-mono font-bold ${getMetricColor(project.spi)}`}>
                  {project.spi.toFixed(2)}
                </td>
                <td className={`py-3 px-2 text-right font-mono font-bold ${getMetricColor(project.cpi)}`}>
                  {project.cpi.toFixed(2)}
                </td>
                <td className="py-3 px-2 text-right font-mono text-[var(--orion-text-secondary)]">
                  {formatCurrency(project.eac)}
                </td>
                <td className={`py-3 px-2 text-right font-mono font-bold ${getMetricColor(project.vac, true)}`}>
                  {formatCurrency(project.vac)}
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
// MAIN EVM MODULE COMPONENT
// ============================================================================

// EVM Definitions (standard PMI definitions)
const EVM_DEFINITIONS: EVMDefinition[] = [
  // Base Metrics
  { abbreviation: 'BAC', name: 'Budget at Completion', description: 'Total authorized budget', formula: null, category: 'base', unit: '$' },
  { abbreviation: 'PV', name: 'Planned Value (BCWS)', description: 'Budgeted cost for work scheduled', formula: null, category: 'base', unit: '$' },
  { abbreviation: 'EV', name: 'Earned Value (BCWP)', description: 'Budgeted cost for work performed', formula: null, category: 'base', unit: '$' },
  { abbreviation: 'AC', name: 'Actual Cost (ACWP)', description: 'Actual cost of work performed', formula: null, category: 'base', unit: '$' },

  // Variances
  { abbreviation: 'SV', name: 'Schedule Variance', description: 'Schedule ahead/behind', formula: 'EV - PV', category: 'variance', unit: '$' },
  { abbreviation: 'CV', name: 'Cost Variance', description: 'Cost under/over', formula: 'EV - AC', category: 'variance', unit: '$' },
  { abbreviation: 'VAC', name: 'Variance at Completion', description: 'Expected variance at end', formula: 'BAC - EAC', category: 'variance', unit: '$' },

  // Indices
  { abbreviation: 'SPI', name: 'Schedule Performance Index', description: 'Schedule efficiency', formula: 'EV / PV', category: 'index', unit: 'ratio' },
  { abbreviation: 'CPI', name: 'Cost Performance Index', description: 'Cost efficiency', formula: 'EV / AC', category: 'index', unit: 'ratio' },
  { abbreviation: 'TCPI', name: 'To-Complete Performance Index', description: 'Required efficiency to meet BAC', formula: '(BAC - EV) / (BAC - AC)', category: 'index', unit: 'ratio' },

  // Forecasts
  { abbreviation: 'EAC', name: 'Estimate at Completion', description: 'Expected total cost', formula: 'BAC / CPI', category: 'forecast', unit: '$' },
  { abbreviation: 'ETC', name: 'Estimate to Complete', description: 'Cost to finish remaining work', formula: 'EAC - AC', category: 'forecast', unit: '$' },
];

// Mock project data
const MOCK_PROJECTS: EVMProjectSnapshot[] = [
  { projectId: '10481', projectName: 'AKK SEG-1 Gas Pipeline', snapshotDate: '2026-01-01', percentComplete: 77, bac: 250_000_000, pv: 235_000_000, ev: 192_500_000, ac: 80_000_000, sv: -42_500_000, cv: 112_500_000, vac: 145_833_333, spi: 0.83, cpi: 2.40, tcpi: 0.65, eac: 104_166_667, etc: 24_166_667 },
  { projectId: 'OSLNNPC', projectName: 'NNPC - NLNG Project', snapshotDate: '2026-01-01', percentComplete: 92, bac: 400_000_000, pv: 380_000_000, ev: 368_000_000, ac: 375_510_204, sv: -12_000_000, cv: -7_510_204, vac: -8_163_265, spi: 1.05, cpi: 0.98, tcpi: 1.31, eac: 408_163_265, etc: 32_653_061 },
  { projectId: 'OSLSDPC', projectName: 'SDPC Project', snapshotDate: '2026-01-01', percentComplete: 45, bac: 180_000_000, pv: 112_500_000, ev: 81_000_000, ac: 91_800_000, sv: -31_500_000, cv: -10_800_000, vac: -24_545_455, spi: 0.72, cpi: 0.88, tcpi: 1.12, eac: 204_545_455, etc: 112_745_455 },
  { projectId: 'OSLUBET', projectName: 'UBET Project', snapshotDate: '2026-01-01', percentComplete: 68, bac: 150_000_000, pv: 112_000_000, ev: 102_000_000, ac: 108_510_638, sv: -10_000_000, cv: -6_510_638, vac: -9_574_468, spi: 0.91, cpi: 0.94, tcpi: 1.16, eac: 159_574_468, etc: 51_063_830 },
  { projectId: 'OSLOB3', projectName: 'OB3 Project', snapshotDate: '2026-01-01', percentComplete: 85, bac: 120_000_000, pv: 105_000_000, ev: 102_000_000, ac: 100_000_000, sv: -3_000_000, cv: 2_000_000, vac: 2_352_941, spi: 0.97, cpi: 1.02, tcpi: 0.90, eac: 117_647_059, etc: 17_647_059 },
];

export const EVMModule = memo(function EVMModule({
  tenantId,
  projectId,
  onProjectClick,
}: EVMModuleProps) {
  const headingId = useId();
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<EVMModuleState>({
    definitions: [],
    projects: [],
    isLoading: {
      definitions: true,
      projects: true,
    },
    errors: {
      definitions: null,
      projects: null,
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));

      setState({
        definitions: EVM_DEFINITIONS,
        projects: projectId
          ? MOCK_PROJECTS.filter((p) => p.projectId === projectId)
          : MOCK_PROJECTS,
        isLoading: {
          definitions: false,
          projects: false,
        },
        errors: {
          definitions: null,
          projects: null,
        },
      });
    };

    fetchData();
  }, [tenantId, projectId]);

  return (
    <main
      role="main"
      aria-labelledby={headingId}
      className="min-h-screen p-4 sm:p-6 md:p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className={`mb-8 ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="violet">ANALYTICS</Badge>
            <Badge variant="cyan">EVM</Badge>
          </div>
          <h1
            id={headingId}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--orion-text-primary)] font-display"
          >
            <span className="text-gradient-violet">EVM Analysis</span>
          </h1>
          <p className="mt-2 text-[var(--orion-text-secondary)] max-w-2xl">
            Earned Value Management metrics and portfolio performance analysis.
          </p>
        </header>

        {/* EVM Reference */}
        <section className={`mb-6 ${mounted ? 'animate-slide-up delay-100' : 'opacity-0'}`}>
          <EVMReferenceCard definitions={state.definitions} isLoading={state.isLoading.definitions} />
        </section>

        {/* EVM Analysis Table */}
        <section className={`${mounted ? 'animate-slide-up delay-200' : 'opacity-0'}`}>
          <EVMAnalysisTable
            projects={state.projects}
            isLoading={state.isLoading.projects}
            onProjectClick={onProjectClick}
          />
        </section>
      </div>
    </main>
  );
});

export default EVMModule;
