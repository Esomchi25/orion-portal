/**
 * SAPConnectionForm Component - ORION Command Center Design
 * @governance COMPONENT-001, DOC-002
 * @doc-sync PAGE_DATA_API_REFERENCE.md:10.3
 *
 * Step 3 of the Onboarding Wizard.
 * Collects SAP HANA/RFC connection details and tests connectivity.
 * Uses EMERALD accent color to represent SAP/Finance data.
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
import type { SAPConnectionFormProps, SAPConnectionState, SAPTestResult } from './types';

// Step labels for progress indicator
const STEP_LABELS = ['Welcome', 'P6', 'SAP', 'Projects', 'Complete'];

/**
 * Connection Result component with ORION styling
 */
const ConnectionResult = memo(function ConnectionResult({
  result,
}: {
  result: SAPTestResult;
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
              {result.tableCount !== undefined && (
                <span className="text-sm text-[var(--orion-text-secondary)] font-mono">
                  {result.tableCount} tables accessible
                </span>
              )}
              {result.connectionType && (
                <span className="text-sm text-[var(--orion-text-secondary)] font-mono">
                  {result.connectionType}
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
 * SAPConnectionForm - Step 3 of the Onboarding Wizard
 * Features ORION Command Center dark theme with emerald SAP accents
 */
export const SAPConnectionForm = memo(function SAPConnectionForm({
  onNext,
  onBack,
  initialState,
}: SAPConnectionFormProps) {
  const formId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form state
  const [formState, setFormState] = useState<SAPConnectionState>({
    hostUrl: initialState?.hostUrl ?? '',
    port: initialState?.port ?? 443,
    systemId: initialState?.systemId ?? '',
    client: initialState?.client ?? '',
    username: initialState?.username ?? '',
    password: initialState?.password ?? '',
    useHana: initialState?.useHana ?? false,
    isTesting: false,
    testResult: null,
    validationErrors: {},
  });

  const [connectionTested, setConnectionTested] = useState(false);

  const updateField = useCallback((field: keyof SAPConnectionState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
      validationErrors: { ...prev.validationErrors, [field]: undefined },
    }));
  }, []);

  const validateHostUrl = useCallback((url: string): string | undefined => {
    if (!url.trim()) return 'Host URL is required';
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

  const validateSystemId = useCallback((sid: string): string | undefined => {
    if (!sid.trim()) return 'System ID is required';
    if (sid.length !== 3) return 'System ID must be 3 characters';
    return undefined;
  }, []);

  const validateClient = useCallback((client: string): string | undefined => {
    if (!client.trim()) return 'Client is required';
    if (!/^\d+$/.test(client)) return 'Client must be numeric';
    return undefined;
  }, []);

  const validateForm = useCallback((): Record<string, string> => {
    const errors: Record<string, string> = {};
    const hostError = validateHostUrl(formState.hostUrl);
    if (hostError) errors.hostUrl = hostError;
    const sidError = validateSystemId(formState.systemId);
    if (sidError) errors.systemId = sidError;
    const clientError = validateClient(formState.client);
    if (clientError) errors.client = clientError;
    if (!formState.username.trim()) errors.username = 'Username is required';
    if (!formState.password.trim()) errors.password = 'Password is required';
    return errors;
  }, [formState, validateHostUrl, validateSystemId, validateClient]);

  const handleBlur = useCallback((field: keyof SAPConnectionState) => {
    let error: string | undefined;
    switch (field) {
      case 'hostUrl':
        error = validateHostUrl(formState.hostUrl);
        break;
      case 'systemId':
        error = validateSystemId(formState.systemId);
        break;
      case 'client':
        error = validateClient(formState.client);
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
  }, [formState, validateHostUrl, validateSystemId, validateClient]);

  const handleTestConnection = useCallback(async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormState((prev) => ({ ...prev, validationErrors: errors }));
      return;
    }

    setFormState((prev) => ({ ...prev, isTesting: true, testResult: null }));

    try {
      const response = await fetch('/api/v1/onboarding/sap/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostUrl: formState.hostUrl,
          systemId: formState.systemId,
          client: formState.client,
          username: formState.username,
          password: formState.password,
        }),
      });

      const result: SAPTestResult = await response.json();
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
        hostUrl: formState.hostUrl,
        port: formState.port,
        systemId: formState.systemId,
        client: formState.client,
        username: formState.username,
        password: formState.password,
        useHana: formState.useHana,
      });
    }
  }, [connectionTested, formState, onNext]);

  return (
    <main
      role="main"
      aria-label="SAP Connection Setup"
      className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12"
    >
      {/* Centered container with optimal width for form readability */}
      <div className="w-full max-w-3xl mx-auto">
        {/* Progress Indicator - Now spans wider with glassmorphism */}
        <div className={`mb-6 sm:mb-8 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
          <ProgressIndicator
            currentStep={3}
            totalSteps={5}
            labels={STEP_LABELS}
          />
        </div>

        {/* Header - Centered with better responsive sizing */}
        <div className={`text-center mb-8 sm:mb-10 ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
            <Badge variant="emerald">FINANCE</Badge>
            <Badge variant="cyan">STEP 3 OF 5</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-display text-[var(--orion-text-primary)] mb-3 sm:mb-4">
            Connect to <span className="text-gradient-emerald">SAP</span>
          </h1>
          <p className="text-base sm:text-lg text-[var(--orion-text-secondary)] max-w-xl mx-auto leading-relaxed">
            Enter your SAP HANA or RFC credentials to sync financial data
            including budgets, actuals, and commitments.
          </p>
        </div>

        {/* Form Card */}
        <GlassCard
          variant="elevated"
          className={`p-6 sm:p-8 border-l-4 border-l-[var(--orion-emerald)] ${mounted ? 'animate-scale-in delay-200' : 'opacity-0'}`}
        >
          {/* SAP Icon Header */}
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[var(--orion-border)]">
            <div className="w-12 h-12 rounded-xl bg-[var(--orion-emerald)]/10 border border-[var(--orion-emerald)]/30 flex items-center justify-center glow-box-emerald">
              <span className="text-lg font-bold font-mono text-[var(--orion-emerald)]">SAP</span>
            </div>
            <div>
              <h2 className="font-semibold text-[var(--orion-text-primary)] font-display">
                SAP HANA / S/4HANA
              </h2>
              <p className="text-sm text-[var(--orion-text-muted)]">
                Enterprise financial data
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
              id={`${formId}-host-url`}
              label="Host URL"
              type="url"
              value={formState.hostUrl}
              onChange={(value) => updateField('hostUrl', value)}
              onBlur={() => handleBlur('hostUrl')}
              error={formState.validationErrors.hostUrl}
              placeholder="https://hana.company.com:30015"
              required
              hint="SAP HANA database endpoint"
            />

            <div className="orion-form-grid">
              <FormField
                id={`${formId}-system-id`}
                label="System ID (SID)"
                value={formState.systemId}
                onChange={(value) => updateField('systemId', value.toUpperCase())}
                onBlur={() => handleBlur('systemId')}
                error={formState.validationErrors.systemId}
                placeholder="PRD"
                required
                hint="3-character system ID"
              />

              <FormField
                id={`${formId}-client`}
                label="Client"
                value={formState.client}
                onChange={(value) => updateField('client', value)}
                onBlur={() => handleBlur('client')}
                error={formState.validationErrors.client}
                placeholder="100"
                required
                hint="SAP client number"
              />
            </div>

            <div className="orion-form-grid">
              <FormField
                id={`${formId}-username`}
                label="Username"
                value={formState.username}
                onChange={(value) => updateField('username', value)}
                onBlur={() => handleBlur('username')}
                error={formState.validationErrors.username}
                placeholder="sapuser"
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
                className="border-[var(--orion-emerald)]/30 hover:border-[var(--orion-emerald)] hover:text-[var(--orion-emerald)]"
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

        {/* Navigation Buttons - Responsive sizing */}
        <div className={`mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 ${mounted ? 'animate-slide-up delay-400' : 'opacity-0'}`}>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={onBack}
            className="flex-1 order-2 sm:order-1"
          >
            <svg
              width="20"
              height="20"
              className="mr-2 flex-shrink-0"
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
            className="flex-1 order-1 sm:order-2"
          >
            Continue
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

        {/* Help Text - Centered with better styling */}
        <p className={`text-center text-sm text-[var(--orion-text-muted)] mt-6 sm:mt-8 font-mono ${mounted ? 'animate-fade-in delay-600' : 'opacity-0'}`}>
          Need help? Check the{' '}
          <a href="#" className="text-[var(--orion-cyan)] hover:underline hover:text-[var(--orion-cyan)] transition-colors">
            SAP Integration Guide
          </a>
        </p>
      </div>
    </main>
  );
});

export default SAPConnectionForm;
