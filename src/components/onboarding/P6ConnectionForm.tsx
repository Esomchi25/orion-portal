/**
 * P6ConnectionForm Component - ORION Command Center Design
 * @governance COMPONENT-001, DOC-002
 * @doc-sync PAGE_DATA_API_REFERENCE.md:10.2
 *
 * Step 2 of the Onboarding Wizard.
 * Collects Primavera P6 SOAP API connection details and tests connectivity.
 * Uses AMBER accent color to represent P6/Schedule data.
 *
 * @coverage
 * - Unit: 90%+ (render, state, validation, interaction)
 * - Integration: API connectivity test
 * - E2E: Full onboarding flow
 * - Accessibility: WCAG 2.1 AA
 * - Performance: < 100ms render
 */

'use client';

import { useState, useCallback, memo, useId, useEffect } from 'react';
import {
  FormField,
  Button,
  GlassCard,
  LoadingSpinner,
  ProgressIndicator,
  Badge,
} from '@/components/ui';
import type { P6ConnectionFormProps, P6ConnectionState, P6TestResult } from './types';

// Step labels for progress indicator
const STEP_LABELS = ['Welcome', 'P6', 'SAP', 'Projects', 'Complete'];

/**
 * Connection Result component with ORION styling
 */
const ConnectionResult = memo(function ConnectionResult({
  result,
}: {
  result: P6TestResult;
}) {
  if (result.success) {
    return (
      <div
        className="p-4 rounded-xl border border-[var(--orion-emerald)]/30 bg-[var(--orion-emerald)]/10 animate-scale-in"
        role="alert"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--orion-emerald)]/20 flex items-center justify-center">
            <svg
              style={{ width: '20px', height: '20px' }}
              className="text-[var(--orion-emerald)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-[var(--orion-emerald)] font-display">
              Connection Successful
            </p>
            <div className="flex flex-wrap gap-3 mt-1">
              {result.projectCount !== undefined && (
                <span className="text-sm text-[var(--orion-text-secondary)] font-mono">
                  {result.projectCount} projects found
                </span>
              )}
              {result.databaseVersion && (
                <span className="text-sm text-[var(--orion-text-secondary)] font-mono">
                  v{result.databaseVersion}
                </span>
              )}
              {result.latencyMs !== undefined && (
                <span className="text-sm text-[var(--orion-text-secondary)] font-mono">
                  {result.latencyMs}ms
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 animate-scale-in"
      role="alert"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
          <svg
            style={{ width: '20px', height: '20px' }}
            className="text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-red-400 font-display">Connection Failed</p>
          <p className="text-sm text-red-300/80">{result.message}</p>
        </div>
      </div>
    </div>
  );
});

/**
 * P6ConnectionForm - Step 2 of the Onboarding Wizard
 * Features ORION Command Center dark theme with amber P6 accents
 */
export const P6ConnectionForm = memo(function P6ConnectionForm({
  onNext,
  onBack,
  initialState,
}: P6ConnectionFormProps) {
  const formId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form state
  const [formState, setFormState] = useState<P6ConnectionState>({
    wsdlBaseUrl: initialState?.wsdlBaseUrl ?? '',
    databaseInstance: initialState?.databaseInstance ?? '',
    username: initialState?.username ?? '',
    password: initialState?.password ?? '',
    isTesting: false,
    testResult: null,
    validationErrors: {},
  });

  const [connectionTested, setConnectionTested] = useState(false);

  const updateField = useCallback((field: keyof P6ConnectionState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
      validationErrors: {
        ...prev.validationErrors,
        [field]: undefined,
      },
    }));
  }, []);

  const validateWsdlUrl = useCallback((url: string): string | undefined => {
    if (!url.trim()) return 'WSDL URL is required';
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return 'Please enter a valid URL';
      }
    } catch {
      return 'Please enter a valid URL';
    }
    return undefined;
  }, []);

  const validateForm = useCallback((): Record<string, string> => {
    const errors: Record<string, string> = {};
    const wsdlError = validateWsdlUrl(formState.wsdlBaseUrl);
    if (wsdlError) errors.wsdlBaseUrl = wsdlError;
    if (!formState.databaseInstance.trim()) errors.databaseInstance = 'Database instance is required';
    if (!formState.username.trim()) errors.username = 'Username is required';
    if (!formState.password.trim()) errors.password = 'Password is required';
    return errors;
  }, [formState, validateWsdlUrl]);

  const handleBlur = useCallback((field: keyof P6ConnectionState) => {
    let error: string | undefined;
    switch (field) {
      case 'wsdlBaseUrl':
        error = validateWsdlUrl(formState.wsdlBaseUrl);
        break;
      case 'databaseInstance':
        if (!formState.databaseInstance.trim()) error = 'Database instance is required';
        break;
      case 'username':
        if (!formState.username.trim()) error = 'Username is required';
        break;
      case 'password':
        if (!formState.password.trim()) error = 'Password is required';
        break;
    }
    if (error) {
      setFormState((prev) => ({
        ...prev,
        validationErrors: { ...prev.validationErrors, [field]: error },
      }));
    }
  }, [formState, validateWsdlUrl]);

  const handleTestConnection = useCallback(async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormState((prev) => ({ ...prev, validationErrors: errors }));
      return;
    }

    setFormState((prev) => ({ ...prev, isTesting: true, testResult: null }));

    try {
      const response = await fetch('/api/v1/onboarding/p6/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wsdlBaseUrl: formState.wsdlBaseUrl,
          databaseInstance: formState.databaseInstance,
          username: formState.username,
          password: formState.password,
        }),
      });

      const result: P6TestResult = await response.json();
      setFormState((prev) => ({ ...prev, isTesting: false, testResult: result }));
      if (result.success) setConnectionTested(true);
    } catch {
      setFormState((prev) => ({
        ...prev,
        isTesting: false,
        testResult: { success: false, message: 'Network error: Unable to reach the server' },
      }));
    }
  }, [formState, validateForm]);

  const handleContinue = useCallback(() => {
    if (connectionTested) {
      onNext({
        wsdlBaseUrl: formState.wsdlBaseUrl,
        databaseInstance: formState.databaseInstance,
        username: formState.username,
        password: formState.password,
      });
    }
  }, [connectionTested, formState, onNext]);

  return (
    <main
      role="main"
      aria-label="P6 Connection Setup"
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8"
    >
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className={`mb-8 sm:mb-12 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
          <ProgressIndicator
            currentStep={2}
            totalSteps={5}
            labels={STEP_LABELS}
          />
        </div>

        {/* Header */}
        <div className={`text-center mb-8 ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 mb-4">
            <Badge variant="amber">SCHEDULE</Badge>
            <Badge variant="cyan">STEP 2 OF 5</Badge>
          </div>
          <h1 className="orion-h1 text-[var(--orion-text-primary)] mb-3">
            Connect to <span className="text-gradient-amber">Primavera P6</span>
          </h1>
          <p className="text-[var(--orion-text-secondary)] max-w-lg mx-auto">
            Enter your P6 SOAP API credentials to sync schedule data including
            projects, WBS, activities, and resources.
          </p>
        </div>

        {/* Form Card */}
        <GlassCard
          variant="elevated"
          className={`p-6 sm:p-8 border-l-4 border-l-[var(--orion-amber)] ${mounted ? 'animate-scale-in delay-200' : 'opacity-0'}`}
        >
          {/* P6 Icon Header */}
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[var(--orion-border)]">
            <div className="w-12 h-12 rounded-xl bg-[var(--orion-amber)]/10 border border-[var(--orion-amber)]/30 flex items-center justify-center glow-box-amber">
              <span className="text-lg font-bold font-mono text-[var(--orion-amber)]">P6</span>
            </div>
            <div>
              <h2 className="font-semibold text-[var(--orion-text-primary)] font-display">
                Primavera P6 SOAP API
              </h2>
              <p className="text-sm text-[var(--orion-text-muted)]">
                Enterprise project scheduling
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTestConnection();
            }}
            className="space-y-5"
          >
            <FormField
              id={`${formId}-wsdl-url`}
              label="WSDL Base URL"
              type="url"
              value={formState.wsdlBaseUrl}
              onChange={(value) => updateField('wsdlBaseUrl', value)}
              onBlur={() => handleBlur('wsdlBaseUrl')}
              error={formState.validationErrors.wsdlBaseUrl}
              placeholder="https://p6server.company.com/p6ws/services/"
              required
              hint="The P6 Web Services endpoint URL"
            />

            <FormField
              id={`${formId}-database`}
              label="Database Instance"
              value={formState.databaseInstance}
              onChange={(value) => updateField('databaseInstance', value)}
              onBlur={() => handleBlur('databaseInstance')}
              error={formState.validationErrors.databaseInstance}
              placeholder="PMDB"
              required
              hint="The P6 database instance name"
            />

            <div className="orion-form-grid">
              <FormField
                id={`${formId}-username`}
                label="Username"
                value={formState.username}
                onChange={(value) => updateField('username', value)}
                onBlur={() => handleBlur('username')}
                error={formState.validationErrors.username}
                placeholder="p6admin"
                required
                autoComplete="username"
              />

              <FormField
                id={`${formId}-password`}
                label="Password"
                type="password"
                value={formState.password}
                onChange={(value) => updateField('password', value)}
                onBlur={() => handleBlur('password')}
                error={formState.validationErrors.password}
                required
                autoComplete="current-password"
              />
            </div>

            {/* Test Connection Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                disabled={formState.isTesting}
                loading={formState.isTesting}
                fullWidth
                className="border-[var(--orion-amber)]/30 hover:border-[var(--orion-amber)] hover:text-[var(--orion-amber)]"
              >
                {formState.isTesting ? 'Testing Connection...' : 'Test Connection'}
              </Button>
            </div>
          </form>

          {/* Loading Status for Screen Readers */}
          {formState.isTesting && (
            <div role="status" className="sr-only">
              Testing connection...
            </div>
          )}

          {/* Test Result */}
          {formState.testResult && (
            <div className="mt-6">
              <ConnectionResult result={formState.testResult} />
            </div>
          )}
        </GlassCard>

        {/* Navigation Buttons */}
        <div className={`mt-8 flex gap-4 ${mounted ? 'animate-slide-up delay-400' : 'opacity-0'}`}>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={onBack}
            className="flex-1"
          >
            <svg
              style={{ width: '20px', height: '20px' }}
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
            disabled={!connectionTested}
            className="flex-1"
          >
            Continue
            <svg
              style={{ width: '20px', height: '20px' }}
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

        {/* Help Text */}
        <p className={`text-center text-sm text-[var(--orion-text-muted)] mt-6 font-mono ${mounted ? 'animate-fade-in delay-600' : 'opacity-0'}`}>
          Need help? Check the{' '}
          <a href="#" className="text-[var(--orion-cyan)] hover:underline">
            P6 Integration Guide
          </a>
        </p>
      </div>
    </main>
  );
});

export default P6ConnectionForm;
