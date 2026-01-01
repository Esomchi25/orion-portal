/**
 * ProjectSelection Component - ORION Command Center Design
 * @governance COMPONENT-001, DOC-002
 * @doc-sync PAGE_DATA_API_REFERENCE.md:10.4
 *
 * Step 4 of the Onboarding Wizard.
 * Displays P6 projects for selection to sync with SAP.
 * Uses VIOLET accent color to represent analytics/multi-project.
 *
 * @coverage
 * - Unit: 90%+ (render, selection, search)
 * - Integration: API project fetch
 * - E2E: Full onboarding flow
 * - Accessibility: WCAG 2.1 AA
 * - Performance: < 100ms render
 */

'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  Button,
  GlassCard,
  LoadingSpinner,
  ProgressIndicator,
  Badge,
} from '@/components/ui';
import type { ProjectSelectionProps, ProjectSelectionState, P6Project } from './types';

// Step labels for progress indicator
const STEP_LABELS = ['Welcome', 'P6', 'SAP', 'Projects', 'Complete'];

/**
 * Progress Bar component with ORION styling
 */
const ProgressBar = memo(function ProgressBar({ progress }: { progress: number }) {
  const getColor = () => {
    if (progress === 100) return 'bg-[var(--orion-emerald)]';
    if (progress > 50) return 'bg-[var(--orion-cyan)]';
    return 'bg-[var(--orion-amber)]';
  };

  return (
    <div
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${progress}% complete`}
      className="w-full bg-[var(--orion-bg-secondary)] rounded-full h-1.5"
    >
      <div
        className={`h-1.5 rounded-full transition-all duration-300 ${getColor()}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
});

/**
 * Status Badge component with ORION styling
 */
const StatusBadge = memo(function StatusBadge({
  status,
}: {
  status: P6Project['status'];
}) {
  const styles: Record<string, string> = {
    Active: 'bg-[var(--orion-emerald)]/10 text-[var(--orion-emerald)] border-[var(--orion-emerald)]/30',
    Inactive: 'bg-[var(--orion-text-muted)]/10 text-[var(--orion-text-muted)] border-[var(--orion-border)]',
    Planned: 'bg-[var(--orion-cyan)]/10 text-[var(--orion-cyan)] border-[var(--orion-cyan)]/30',
    Complete: 'bg-[var(--orion-violet)]/10 text-[var(--orion-violet)] border-[var(--orion-violet)]/30',
  };

  const displayStatus = status ?? 'Unknown';
  const styleClass = styles[displayStatus] ?? 'bg-[var(--orion-bg-secondary)] text-[var(--orion-text-muted)]';

  return (
    <span className={`px-2 py-0.5 text-[10px] font-mono font-medium rounded-full border ${styleClass}`}>
      {displayStatus}
    </span>
  );
});

/**
 * Format date for display
 */
function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Project Card component with ORION styling
 */
const ProjectCard = memo(function ProjectCard({
  project,
  isSelected,
  onToggle,
}: {
  project: P6Project;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onToggle();
      }
    },
    [onToggle]
  );

  return (
    <div
      data-testid={`project-${project.projectId}`}
      data-selected={isSelected ? 'true' : 'false'}
      tabIndex={0}
      role="option"
      aria-selected={isSelected}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      className={`
        relative p-4 sm:p-5 rounded-xl cursor-pointer
        transition-all duration-300 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orion-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--orion-bg-primary)]
        ${
          isSelected
            ? 'bg-[var(--orion-cyan)]/10 border-2 border-[var(--orion-cyan)] shadow-[0_0_20px_-5px_var(--orion-cyan-glow)]'
            : 'bg-[var(--orion-bg-glass)] border border-[var(--orion-border)] hover:border-[var(--orion-cyan)]/30 hover:bg-[var(--orion-bg-elevated)]/50'
        }
      `}
    >
      {/* Selection indicator */}
      <div className="absolute top-4 right-4">
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
            ${
              isSelected
                ? 'border-[var(--orion-cyan)] bg-[var(--orion-cyan)]'
                : 'border-[var(--orion-border)]'
            }
          `}
        >
          {isSelected && (
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20" className="text-[var(--orion-bg-primary)]">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>

      <div className="pr-8">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <p className="font-semibold text-[var(--orion-text-primary)] font-display text-base">
              {project.projectName}
            </p>
            <p className="text-sm text-[var(--orion-text-muted)] font-mono">{project.projectCode}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <StatusBadge status={project.status} />
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-xs text-[var(--orion-text-secondary)] mb-1.5 font-mono">
            <span>Progress</span>
            <span className="text-[var(--orion-text-primary)]">{project.percentComplete ?? 0}%</span>
          </div>
          <ProgressBar progress={project.percentComplete ?? 0} />
        </div>

        <div className="mt-3 flex justify-between text-xs text-[var(--orion-text-muted)] font-mono">
          <span>Start: {formatDate(project.startDate)}</span>
          <span>End: {formatDate(project.finishDate)}</span>
        </div>
      </div>
    </div>
  );
});

/**
 * ProjectSelection - Step 4 of the Onboarding Wizard
 */
export const ProjectSelection = memo(function ProjectSelection({
  onNext,
  onBack,
  p6Config,
}: ProjectSelectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // State
  const [state, setState] = useState<ProjectSelectionState>({
    projects: [],
    selectedProjectIds: [],
    isLoading: true,
    error: null,
    searchQuery: '',
  });

  // Fetch projects on mount
  const fetchProjects = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/v1/onboarding/p6/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wsdlBaseUrl: p6Config.wsdlBaseUrl,
          databaseInstance: p6Config.databaseInstance,
          username: p6Config.username,
          password: p6Config.password,
        }),
      });

      const data = await response.json();

      setState((prev) => ({
        ...prev,
        projects: data.projects || [],
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load projects. Please check your connection.',
      }));
    }
  }, [p6Config]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Toggle project selection
  const toggleProject = useCallback((projectId: number) => {
    setState((prev) => {
      const isSelected = prev.selectedProjectIds.includes(projectId);
      return {
        ...prev,
        selectedProjectIds: isSelected
          ? prev.selectedProjectIds.filter((id) => id !== projectId)
          : [...prev.selectedProjectIds, projectId],
      };
    });
  }, []);

  // Select all projects
  const selectAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedProjectIds: prev.projects.map((p) => p.projectId),
    }));
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedProjectIds: [],
    }));
  }, []);

  // Update search query
  const updateSearchQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setState((prev) => ({ ...prev, searchQuery: '' }));
  }, []);

  // Filter projects by search query
  const filteredProjects = useMemo(() => {
    if (!state.searchQuery.trim()) {
      return state.projects;
    }
    const query = state.searchQuery.toLowerCase();
    return state.projects.filter(
      (p) =>
        p.projectName.toLowerCase().includes(query) ||
        p.projectCode.toLowerCase().includes(query)
    );
  }, [state.projects, state.searchQuery]);

  // Get selected projects
  const selectedProjects = useMemo(() => {
    return state.projects.filter((p) => state.selectedProjectIds.includes(p.projectId));
  }, [state.projects, state.selectedProjectIds]);

  // Handle Continue
  const handleContinue = useCallback(() => {
    if (selectedProjects.length > 0) {
      onNext({
        selectedProjects: selectedProjects.map((p) => ({
          id: p.projectId,
          name: p.projectName,
          code: p.projectCode,
        })),
      });
    }
  }, [selectedProjects, onNext]);

  // Loading state
  if (state.isLoading) {
    return (
      <main
        role="main"
        aria-label="Project Selection"
        className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12"
      >
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-[var(--orion-text-secondary)] font-mono">
            Loading projects from P6...
          </p>
        </div>
      </main>
    );
  }

  // Error state
  if (state.error) {
    return (
      <main
        role="main"
        aria-label="Project Selection"
        className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12"
      >
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-red-400">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-400 mb-6">{state.error}</p>
          <Button variant="primary" onClick={fetchProjects}>
            Retry
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main
      role="main"
      aria-label="Project Selection"
      className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12"
    >
      {/* Centered container with wider max-width for project grid */}
      <div className="w-full max-w-5xl mx-auto">
        {/* Progress Indicator */}
        <div className={`mb-6 sm:mb-8 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
          <ProgressIndicator
            currentStep={4}
            totalSteps={5}
            labels={STEP_LABELS}
          />
        </div>

        {/* Header - Better responsive sizing */}
        <div className={`text-center mb-8 sm:mb-10 ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
            <Badge variant="violet">PROJECTS</Badge>
            <Badge variant="cyan">STEP 4 OF 5</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-display text-[var(--orion-text-primary)] mb-3 sm:mb-4">
            Select <span className="text-gradient-cyan">Projects</span> to Sync
          </h1>
          <p className="text-base sm:text-lg text-[var(--orion-text-secondary)] max-w-xl mx-auto leading-relaxed">
            Choose which P6 projects to integrate with SAP for unified visibility
          </p>
        </div>

        {/* Search and Actions Bar */}
        <GlassCard
          variant="elevated"
          className={`p-4 mb-6 ${mounted ? 'animate-scale-in delay-200' : 'opacity-0'}`}
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md w-full">
              <label htmlFor="project-search" className="sr-only">
                Search projects
              </label>
              <input
                id="project-search"
                type="text"
                value={state.searchQuery}
                onChange={(e) => updateSearchQuery(e.target.value)}
                placeholder="Search by name or code..."
                className="input-field pl-10 pr-10"
              />
              <svg
                width="20"
                height="20"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--orion-text-muted)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {state.searchQuery && (
                <button
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--orion-text-muted)] hover:text-[var(--orion-text-primary)] transition-colors"
                >
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="px-4 py-2 text-sm font-medium text-[var(--orion-cyan)] hover:text-[var(--orion-cyan)]/80 transition-colors font-display"
              >
                Select All
              </button>
              <button
                onClick={clearSelection}
                className="px-4 py-2 text-sm font-medium text-[var(--orion-text-muted)] hover:text-[var(--orion-text-secondary)] transition-colors font-display"
              >
                Clear
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Project Count and Selection Count */}
        <div className={`mb-4 flex justify-between text-sm font-mono ${mounted ? 'animate-fade-in delay-300' : 'opacity-0'}`}>
          <span className="text-[var(--orion-text-muted)]">{state.projects.length} projects</span>
          <span className="text-[var(--orion-cyan)]">{state.selectedProjectIds.length} selected</span>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 text-[var(--orion-text-muted)]">
            No projects found
          </div>
        ) : (
          <div
            role="listbox"
            aria-label="Available projects"
            aria-multiselectable="true"
            className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 ${mounted ? 'animate-fade-in delay-400' : 'opacity-0'}`}
          >
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.projectId}
                project={project}
                isSelected={state.selectedProjectIds.includes(project.projectId)}
                onToggle={() => toggleProject(project.projectId)}
              />
            ))}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className={`mt-8 flex gap-4 ${mounted ? 'animate-slide-up delay-500' : 'opacity-0'}`}>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={onBack}
            className="flex-1"
          >
            <svg
              width="20"
              height="20"
              className="mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Back
          </Button>

          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleContinue}
            disabled={state.selectedProjectIds.length === 0}
            className="flex-1"
          >
            Continue
            <svg
              width="20"
              height="20"
              className="ml-2 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Button>
        </div>
      </div>
    </main>
  );
});

export default ProjectSelection;
