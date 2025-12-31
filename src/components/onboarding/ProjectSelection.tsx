/**
 * ProjectSelection Component
 * @governance COMPONENT-001, DOC-002
 * @doc-sync PAGE_DATA_API_REFERENCE.md:10.4
 *
 * Step 4 of the Onboarding Wizard.
 * Displays P6 projects for selection to sync with SAP.
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
import type { ProjectSelectionProps, ProjectSelectionState, P6Project } from './types';

/**
 * Loading Spinner component
 */
const LoadingSpinner = memo(function LoadingSpinner() {
  return (
    <div
      data-testid="loading-spinner"
      className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"
      aria-hidden="true"
    />
  );
});

/**
 * Progress Bar component
 */
const ProgressBar = memo(function ProgressBar({ progress }: { progress: number }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${progress}% complete`}
      className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2"
    >
      <div
        className={`h-2 rounded-full transition-all duration-300 ${
          progress === 100
            ? 'bg-green-500'
            : progress > 50
            ? 'bg-blue-500'
            : 'bg-amber-500'
        }`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
});

/**
 * Status Badge component
 */
const StatusBadge = memo(function StatusBadge({
  status,
}: {
  status: P6Project['status'];
}) {
  const styles: Record<string, string> = {
    Active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Inactive: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400',
    Planned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    Complete: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };

  const displayStatus = status ?? 'Unknown';
  const styleClass = styles[displayStatus] ?? 'bg-slate-100 text-slate-600';

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styleClass}`}>
      {displayStatus}
    </span>
  );
});

/**
 * Project Card component
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
        p-4 rounded-lg border-2 cursor-pointer
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-400
        ${
          isSelected
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
        }
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="font-semibold text-slate-900 dark:text-white">
            {project.projectName}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{project.projectCode}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span>Progress</span>
          <span>{project.percentComplete ?? 0}%</span>
        </div>
        <ProgressBar progress={project.percentComplete ?? 0} />
      </div>

      <div className="mt-3 flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Start: {formatDate(project.startDate)}</span>
        <span>End: {formatDate(project.finishDate)}</span>
      </div>

      {/* Selection indicator */}
      <div className="absolute top-3 right-3">
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
            ${
              isSelected
                ? 'border-blue-500 bg-blue-500'
                : 'border-slate-300 dark:border-slate-600'
            }
          `}
        >
          {isSelected && (
            <svg
              className="w-3 h-3 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
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
 * ProjectSelection - Step 4 of the Onboarding Wizard
 *
 * @param props - ProjectSelectionProps
 * @returns JSX.Element
 */
export const ProjectSelection = memo(function ProjectSelection({
  onNext,
  onBack,
  p6Config,
}: ProjectSelectionProps) {
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
        className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-8"
      >
        <LoadingSpinner />
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          Loading projects from P6...
        </p>
      </main>
    );
  }

  // Error state
  if (state.error) {
    return (
      <main
        role="main"
        aria-label="Project Selection"
        className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-8"
      >
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{state.error}</p>
          <button
            onClick={fetchProjects}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      role="main"
      aria-label="Project Selection"
      className="min-h-screen bg-white dark:bg-slate-900 flex flex-col p-8"
    >
      <div className="max-w-4xl w-full mx-auto">
        {/* Step Indicator */}
        <div className="mb-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <span>Step 4</span> <span>of 5</span>
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            Select Projects to Sync
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Choose which P6 projects to integrate with SAP
          </p>
        </div>

        {/* Search and Actions Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <label htmlFor="project-search" className="sr-only">
              Search projects
            </label>
            <input
              id="project-search"
              type="text"
              value={state.searchQuery}
              onChange={(e) => updateSearchQuery(e.target.value)}
              placeholder="Search by name or code..."
              className="
                w-full pl-10 pr-10 py-2 rounded-lg border
                border-slate-300 dark:border-slate-600
                bg-white dark:bg-slate-800
                text-slate-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-200
              "
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Select All
            </button>
            <button
              onClick={clearSelection}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-700 dark:text-slate-400"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Project Count and Selection Count */}
        <div className="mb-4 flex justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>{state.projects.length} projects</span>
          <span>{state.selectedProjectIds.length} selected</span>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            No projects found
          </div>
        ) : (
          <div
            role="listbox"
            aria-label="Available projects"
            aria-multiselectable="true"
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
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
        <div className="mt-8 flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="
              flex-1 px-6 py-3 rounded-lg font-medium
              bg-white dark:bg-slate-800
              text-slate-700 dark:text-slate-300
              border border-slate-300 dark:border-slate-600
              hover:bg-slate-50 dark:hover:bg-slate-700
              focus:outline-none focus:ring-2 focus:ring-blue-200
              transition-all duration-200
            "
          >
            Back
          </button>

          <button
            type="button"
            onClick={handleContinue}
            disabled={state.selectedProjectIds.length === 0}
            className={`
              flex-1 px-6 py-3 rounded-lg font-medium
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-200
              ${
                state.selectedProjectIds.length > 0
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            Continue
          </button>
        </div>
      </div>
    </main>
  );
});

// Default export for dynamic imports
export default ProjectSelection;
