/**
 * OnboardingComplete Component - ORION Command Center Design
 * @governance COMPONENT-001, DOC-002
 * @doc-sync PAGE_DATA_API_REFERENCE.md:10.5
 *
 * Step 5 of the Onboarding Wizard.
 * Shows configuration summary and completes onboarding setup.
 * Features premium success celebration animation.
 *
 * @coverage
 * - Unit: 90%+ (render, summary, completion)
 * - Integration: API completion call
 * - E2E: Full onboarding flow
 * - Accessibility: WCAG 2.1 AA
 * - Performance: < 100ms render
 */

'use client';

import { useState, useCallback, memo, useEffect } from 'react';
import {
  Button,
  GlassCard,
  LoadingSpinner,
  ProgressIndicator,
  Badge,
} from '@/components/ui';
import type { OnboardingCompleteProps } from './types';

// Step labels for progress indicator
const STEP_LABELS = ['Welcome', 'P6', 'SAP', 'Projects', 'Complete'];

type CompletionState = 'idle' | 'syncing' | 'complete' | 'error';

/**
 * Success Animation component with premium styling
 */
const SuccessAnimation = memo(function SuccessAnimation() {
  return (
    <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-6">
      {/* Outer glow ring */}
      <div className="absolute -inset-4 rounded-full bg-[var(--orion-emerald)]/20 blur-xl animate-pulse" />

      {/* Pulsing rings */}
      <div className="absolute inset-0 rounded-full border-2 border-[var(--orion-emerald)]/30 animate-ping" style={{ animationDuration: '2s' }} />
      <div className="absolute inset-2 rounded-full border border-[var(--orion-emerald)]/20 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />

      {/* Main circle */}
      <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[var(--orion-emerald)] to-[#059669] flex items-center justify-center shadow-[0_0_40px_-10px_var(--orion-emerald-glow)] animate-scale-in">
        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
  );
});

/**
 * Configuration Summary Card with ORION styling
 */
const SummaryCard = memo(function SummaryCard({
  title,
  icon,
  accentColor,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  accentColor: 'amber' | 'emerald' | 'violet';
  children: React.ReactNode;
}) {
  const colorStyles = {
    amber: {
      bg: 'bg-[var(--orion-amber)]/10',
      border: 'border-l-[var(--orion-amber)]',
      icon: 'text-[var(--orion-amber)]',
    },
    emerald: {
      bg: 'bg-[var(--orion-emerald)]/10',
      border: 'border-l-[var(--orion-emerald)]',
      icon: 'text-[var(--orion-emerald)]',
    },
    violet: {
      bg: 'bg-[var(--orion-violet)]/10',
      border: 'border-l-[var(--orion-violet)]',
      icon: 'text-[var(--orion-violet)]',
    },
  };

  const styles = colorStyles[accentColor];

  return (
    <div className={`p-4 sm:p-5 rounded-xl border border-[var(--orion-border)] border-l-4 ${styles.border} bg-[var(--orion-bg-glass)] backdrop-blur-sm`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2.5 rounded-lg ${styles.bg} ${styles.icon}`}>
          {icon}
        </div>
        <p className="font-semibold text-[var(--orion-text-primary)] font-display">{title}</p>
      </div>
      <div className="text-sm text-[var(--orion-text-secondary)] space-y-1.5 pl-12">{children}</div>
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
 */
export const OnboardingComplete = memo(function OnboardingComplete({
  selectedProjects,
  p6Config,
  sapConfig,
  onComplete,
  onBack,
}: OnboardingCompleteProps) {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<CompletionState>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12"
      >
        {/* Animated background elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-[var(--orion-emerald)]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[var(--orion-cyan)]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative w-full max-w-xl mx-auto text-center">
          <div className="animate-scale-in">
            <SuccessAnimation />
          </div>

          <div role="alert" className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-[var(--orion-text-primary)] mb-3 sm:mb-4">
              Setup <span className="text-gradient-emerald">Complete!</span>
            </h1>
            <p className="text-base sm:text-lg text-[var(--orion-text-secondary)] mb-8 sm:mb-10 max-w-md mx-auto leading-relaxed">
              Your ORION portal is ready. <span className="text-[var(--orion-cyan)] font-semibold">{selectedProjects.length} projects</span> are now connected and syncing.
            </p>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={onComplete}
              className="w-full sm:w-auto min-w-[240px]"
            >
              Go to Dashboard
              <svg
                width="20"
                height="20"
                className="ml-2 flex-shrink-0 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </div>

          {/* Confetti-like particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 rounded-full ${
                  i % 3 === 0 ? 'bg-[var(--orion-cyan)]' : i % 3 === 1 ? 'bg-[var(--orion-emerald)]' : 'bg-[var(--orion-violet)]'
                }`}
                style={{
                  left: `${10 + (i * 7)}%`,
                  top: `${20 + (i % 4) * 15}%`,
                  animation: `float ${3 + (i % 3)}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                  opacity: 0.5,
                }}
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      role="main"
      aria-label="Complete Onboarding"
      className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12"
    >
      {/* Centered container with optimal width */}
      <div className="w-full max-w-3xl mx-auto">
        {/* Progress Indicator */}
        <div className={`mb-6 sm:mb-8 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
          <ProgressIndicator
            currentStep={5}
            totalSteps={5}
            labels={STEP_LABELS}
          />
        </div>

        {/* Header - Better responsive sizing */}
        <div className={`text-center mb-8 sm:mb-10 ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
            <Badge variant="emerald">FINAL STEP</Badge>
            <Badge variant="cyan">STEP 5 OF 5</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-display text-[var(--orion-text-primary)] mb-3 sm:mb-4">
            Review & <span className="text-gradient-cyan">Complete</span>
          </h1>
          <p className="text-base sm:text-lg text-[var(--orion-text-secondary)] max-w-xl mx-auto leading-relaxed">
            Verify your configuration and complete the setup
          </p>
        </div>

        {/* Configuration Summary */}
        <div className={`space-y-4 mb-8 ${mounted ? 'animate-scale-in delay-200' : 'opacity-0'}`}>
          {/* P6 Connection */}
          <SummaryCard
            title="P6 Connection"
            accentColor="amber"
            icon={
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          >
            <p className="flex items-center gap-2">
              <span className="text-[var(--orion-text-muted)]">Server:</span>
              <span className="font-mono text-[var(--orion-text-primary)]">{extractHost(p6Config.wsdlBaseUrl)}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-[var(--orion-text-muted)]">Database:</span>
              <span className="font-mono text-[var(--orion-text-primary)]">{p6Config.databaseInstance}</span>
            </p>
          </SummaryCard>

          {/* SAP Connection */}
          <SummaryCard
            title="SAP Connection"
            accentColor="emerald"
            icon={
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          >
            {sapConfig ? (
              <>
                <p className="flex items-center gap-2">
                  <span className="text-[var(--orion-text-muted)]">Server:</span>
                  <span className="font-mono text-[var(--orion-text-primary)]">{extractHost(sapConfig.hostUrl)}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-[var(--orion-text-muted)]">System:</span>
                  <span className="font-mono text-[var(--orion-text-primary)]">{sapConfig.systemId} / Client {sapConfig.client}</span>
                </p>
              </>
            ) : (
              <p className="text-[var(--orion-text-muted)] italic">Skipped — P6 data only</p>
            )}
          </SummaryCard>

          {/* Selected Projects */}
          <SummaryCard
            title="Selected Projects"
            accentColor="violet"
            icon={
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          >
            <p className="font-semibold text-[var(--orion-cyan)] mb-2">
              {selectedProjects.length} projects selected
            </p>
            <ul className="space-y-1.5">
              {selectedProjects.slice(0, 5).map((project) => (
                <li key={project.id} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--orion-cyan)] flex-shrink-0" />
                  <span className="text-[var(--orion-text-primary)] truncate">{project.name}</span>
                  <span className="text-[var(--orion-text-muted)] font-mono text-xs">({project.code})</span>
                </li>
              ))}
              {selectedProjects.length > 5 && (
                <li className="text-[var(--orion-text-muted)] italic">
                  +{selectedProjects.length - 5} more projects
                </li>
              )}
            </ul>
          </SummaryCard>
        </div>

        {/* Error Message */}
        {state === 'error' && error && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 animate-scale-in"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-red-400">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Syncing Status */}
        {state === 'syncing' && (
          <div role="status" className="mb-6 text-center py-4">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-[var(--orion-text-secondary)] font-mono">
              Setting up your projects...
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className={`mt-8 flex flex-col sm:flex-row gap-4 ${mounted ? 'animate-slide-up delay-400' : 'opacity-0'}`}>
          {state === 'error' ? (
            <>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={onBack}
                className="flex-1"
              >
                <svg width="20" height="20" className="mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                Back
              </Button>
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleRetry}
                className="flex-1"
              >
                <svg width="20" height="20" className="mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={onBack}
                disabled={state === 'syncing'}
                className="flex-1"
              >
                <svg width="20" height="20" className="mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                Back
              </Button>

              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleCompleteSetup}
                disabled={state === 'syncing'}
                loading={state === 'syncing'}
                className="flex-1"
              >
                {state === 'syncing' ? 'Completing Setup...' : 'Complete Setup'}
                {state !== 'syncing' && (
                  <svg width="20" height="20" className="ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </Button>
            </>
          )}
        </div>

        {/* Help Text */}
        <p className={`text-center text-sm text-[var(--orion-text-muted)] mt-6 font-mono ${mounted ? 'animate-fade-in delay-600' : 'opacity-0'}`}>
          This will create the sync configuration and start initial synchronization
        </p>
      </div>
    </main>
  );
});

export default OnboardingComplete;
