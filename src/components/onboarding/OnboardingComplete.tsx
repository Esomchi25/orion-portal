/**
 * OnboardingComplete Component
 * @governance COMPONENT-001, DOC-002
 * @doc-sync PAGE_DATA_API_REFERENCE.md:10.5
 *
 * Step 5 of the Onboarding Wizard.
 * Shows configuration summary and completes onboarding setup.
 *
 * @coverage
 * - Unit: 90%+ (render, summary, completion)
 * - Integration: API completion call
 * - E2E: Full onboarding flow
 * - Accessibility: WCAG 2.1 AA
 * - Performance: < 100ms render
 */

'use client';

import { useState, useCallback, memo } from 'react';
import type { OnboardingCompleteProps } from './types';

type CompletionState = 'idle' | 'syncing' | 'complete' | 'error';

/**
 * Loading Spinner component
 */
const LoadingSpinner = memo(function LoadingSpinner() {
  return (
    <div
      data-testid="loading-spinner"
      className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"
      aria-hidden="true"
    />
  );
});

/**
 * Success Icon component
 */
const SuccessIcon = memo(function SuccessIcon() {
  return (
    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
      <svg
        className="w-8 h-8 text-green-600 dark:text-green-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    </div>
  );
});

/**
 * Configuration Summary Card
 */
const SummaryCard = memo(function SummaryCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
          {icon}
        </div>
        <p className="font-semibold text-slate-900 dark:text-white">{title}</p>
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-400">{children}</div>
    </div>
  );
});

/**
 * Extract host from URL for display
 */
function extractHost(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.host;
  } catch {
    return url;
  }
}

/**
 * OnboardingComplete - Step 5 of the Onboarding Wizard
 *
 * @param props - OnboardingCompleteProps
 * @returns JSX.Element
 */
export const OnboardingComplete = memo(function OnboardingComplete({
  selectedProjects,
  p6Config,
  sapConfig,
  onComplete,
  onBack,
}: OnboardingCompleteProps) {
  const [state, setState] = useState<CompletionState>('idle');
  const [error, setError] = useState<string | null>(null);

  // Handle Complete Setup
  const handleCompleteSetup = useCallback(async () => {
    setState('syncing');
    setError(null);

    try {
      const response = await fetch('/api/v1/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          p6Config,
          sapConfig,
          selectedProjectIds: selectedProjects.map((p) => p.id),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setState('complete');
      } else {
        setState('error');
        setError(result.message || 'Setup failed. Please try again.');
      }
    } catch (err) {
      setState('error');
      setError('Network error. Setup failed. Please check your connection.');
    }
  }, [p6Config, sapConfig, selectedProjects]);

  // Handle Retry
  const handleRetry = useCallback(() => {
    handleCompleteSetup();
  }, [handleCompleteSetup]);

  // Completion view
  if (state === 'complete') {
    return (
      <main
        role="main"
        aria-label="Onboarding Complete"
        className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-8"
      >
        <div className="max-w-lg w-full text-center">
          <SuccessIcon />
          <div role="alert">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Setup Complete!
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Your ORION portal is ready. {selectedProjects.length} projects are now
              connected and syncing.
            </p>
          </div>
          <button
            type="button"
            onClick={onComplete}
            className="
              w-full px-8 py-4 rounded-lg font-semibold text-lg
              bg-blue-600 hover:bg-blue-700 text-white
              focus:outline-none focus:ring-4 focus:ring-blue-200
              transition-all duration-200
            "
          >
            Go to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      role="main"
      aria-label="Complete Onboarding"
      className="min-h-screen bg-white dark:bg-slate-900 flex flex-col p-8"
    >
      <div className="max-w-2xl w-full mx-auto">
        {/* Step Indicator */}
        <div className="mb-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <span>Step 5</span> <span>of 5</span>
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            Review & Complete
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Review your configuration and complete the setup
          </p>
        </div>

        {/* Configuration Summary */}
        <div className="space-y-4 mb-8">
          {/* P6 Connection */}
          <SummaryCard
            title="P6 Connection"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
          >
            <p className="mb-1">
              <span className="text-slate-500">Server: </span>
              <span className="font-medium text-slate-900 dark:text-white">
                {extractHost(p6Config.wsdlBaseUrl)}
              </span>
            </p>
            <p>
              <span className="text-slate-500">Database: </span>
              <span className="font-medium text-slate-900 dark:text-white">
                {p6Config.databaseInstance}
              </span>
            </p>
          </SummaryCard>

          {/* SAP Connection */}
          <SummaryCard
            title="SAP Connection"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            }
          >
            {sapConfig ? (
              <>
                <p className="mb-1">
                  <span className="text-slate-500">Server: </span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {extractHost(sapConfig.hostUrl)}
                  </span>
                </p>
                <p>
                  <span className="text-slate-500">System: </span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {sapConfig.systemId} / Client {sapConfig.client}
                  </span>
                </p>
              </>
            ) : (
              <p className="text-slate-500 italic">Skipped - P6 data only</p>
            )}
          </SummaryCard>

          {/* Selected Projects */}
          <SummaryCard
            title="Selected Projects"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            }
          >
            <p className="mb-2 font-medium text-slate-900 dark:text-white">
              {selectedProjects.length} projects selected
            </p>
            <ul className="space-y-1">
              {selectedProjects.map((project) => (
                <li key={project.id} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>{project.name}</span>
                  <span className="text-slate-400">({project.code})</span>
                </li>
              ))}
            </ul>
          </SummaryCard>
        </div>

        {/* Error Message */}
        {state === 'error' && error && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          >
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Syncing Status */}
        {state === 'syncing' && (
          <div role="status" className="mb-6 text-center">
            <LoadingSpinner />
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Setting up your projects...
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex gap-4">
          {state === 'error' ? (
            <>
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
                onClick={handleRetry}
                className="
                  flex-1 px-6 py-3 rounded-lg font-medium
                  bg-blue-600 hover:bg-blue-700 text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-200
                  transition-all duration-200
                "
              >
                Retry
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onBack}
                disabled={state === 'syncing'}
                className={`
                  flex-1 px-6 py-3 rounded-lg font-medium
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-200
                  ${
                    state === 'syncing'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }
                `}
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleCompleteSetup}
                disabled={state === 'syncing'}
                className={`
                  flex-1 px-6 py-3 rounded-lg font-medium
                  inline-flex items-center justify-center gap-2
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-200
                  ${
                    state === 'syncing'
                      ? 'bg-blue-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }
                `}
              >
                {state === 'syncing' && <LoadingSpinner />}
                Complete Setup
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
});

// Default export for dynamic imports
export default OnboardingComplete;
