/**
 * P6ConnectionForm Component
 * @governance COMPONENT-001, DOC-002
 * @doc-sync PAGE_DATA_API_REFERENCE.md:10.2
 *
 * Step 2 of the Onboarding Wizard.
 * Collects Primavera P6 SOAP API connection details and tests connectivity.
 *
 * @coverage
 * - Unit: 90%+ (render, state, validation, interaction)
 * - Integration: API connectivity test
 * - E2E: Full onboarding flow
 * - Accessibility: WCAG 2.1 AA
 * - Performance: < 100ms render
 */

'use client';

import { useState, useCallback, memo, useId } from 'react';
import type { P6ConnectionFormProps, P6ConnectionState, P6TestResult } from './types';

/**
 * Loading Spinner component
 */
const LoadingSpinner = memo(function LoadingSpinner() {
  return (
    <div
      data-testid="loading-spinner"
      className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"
      aria-hidden="true"
    />
  );
});

/**
 * Form Field component with label and error handling
 */
const FormField = memo(function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required = true,
  describedById,
}: {
  id: string;
  label: string;
  type?: 'text' | 'password' | 'url';
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  describedById?: string;
}) {
  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`
          w-full px-4 py-2 rounded-lg border
          ${error
            ? 'border-red-500 focus:ring-red-200'
            : 'border-slate-300 dark:border-slate-600 focus:ring-blue-200'
          }
          bg-white dark:bg-slate-800
          text-slate-900 dark:text-white
          focus:outline-none focus:ring-2
          transition-colors duration-200
        `}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? describedById : undefined}
      />
      {error && (
        <p
          id={describedById}
          className="mt-1 text-sm text-red-500"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});

/**
 * Connection Result component
 */
const ConnectionResult = memo(function ConnectionResult({
  result,
}: {
  result: P6TestResult;
}) {
  if (result.success) {
    return (
      <div
        className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
        role="alert"
      >
        <p className="font-medium text-green-800 dark:text-green-200">
          Connection successful
        </p>
        <div className="mt-2 text-sm text-green-700 dark:text-green-300 space-y-1">
          {result.projectCount !== undefined && (
            <p>Found {result.projectCount} projects</p>
          )}
          {result.databaseVersion && (
            <p>Version: {result.databaseVersion}</p>
          )}
          {result.latencyMs !== undefined && (
            <p>Latency: {result.latencyMs} ms</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
      role="alert"
    >
      <p className="font-medium text-red-800 dark:text-red-200">
        {result.message}
      </p>
    </div>
  );
});

/**
 * P6ConnectionForm - Step 2 of the Onboarding Wizard
 *
 * @param props - P6ConnectionFormProps
 * @returns JSX.Element
 */
export const P6ConnectionForm = memo(function P6ConnectionForm({
  onNext,
  onBack,
  initialState,
}: P6ConnectionFormProps) {
  // Generate unique IDs for accessibility
  const formId = useId();

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

  // Track if connection has been successfully tested
  const [connectionTested, setConnectionTested] = useState(false);

  // Update a single field
  const updateField = useCallback((field: keyof P6ConnectionState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
      // Clear validation error for this field when updated
      validationErrors: {
        ...prev.validationErrors,
        [field]: undefined,
      },
    }));
  }, []);

  // Validate WSDL URL format
  const validateWsdlUrl = useCallback((url: string): string | undefined => {
    if (!url.trim()) {
      return 'WSDL URL is required';
    }
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

  // Validate all fields
  const validateForm = useCallback((): Record<string, string> => {
    const errors: Record<string, string> = {};

    const wsdlError = validateWsdlUrl(formState.wsdlBaseUrl);
    if (wsdlError) {
      errors.wsdlBaseUrl = wsdlError;
    }

    if (!formState.databaseInstance.trim()) {
      errors.databaseInstance = 'Database instance is required';
    }

    if (!formState.username.trim()) {
      errors.username = 'Username is required';
    }

    if (!formState.password.trim()) {
      errors.password = 'Password is required';
    }

    return errors;
  }, [formState, validateWsdlUrl]);

  // Handle field blur for validation
  const handleBlur = useCallback((field: keyof P6ConnectionState) => {
    let error: string | undefined;

    switch (field) {
      case 'wsdlBaseUrl':
        error = validateWsdlUrl(formState.wsdlBaseUrl);
        break;
      case 'databaseInstance':
        if (!formState.databaseInstance.trim()) {
          error = 'Database instance is required';
        }
        break;
      case 'username':
        if (!formState.username.trim()) {
          error = 'Username is required';
        }
        break;
      case 'password':
        if (!formState.password.trim()) {
          error = 'Password is required';
        }
        break;
    }

    if (error) {
      setFormState((prev) => ({
        ...prev,
        validationErrors: {
          ...prev.validationErrors,
          [field]: error,
        },
      }));
    }
  }, [formState, validateWsdlUrl]);

  // Test P6 connection
  const handleTestConnection = useCallback(async () => {
    // Validate all fields first
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormState((prev) => ({
        ...prev,
        validationErrors: errors,
      }));
      return;
    }

    // Set testing state
    setFormState((prev) => ({
      ...prev,
      isTesting: true,
      testResult: null,
    }));

    try {
      const response = await fetch('/api/v1/onboarding/p6/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wsdlBaseUrl: formState.wsdlBaseUrl,
          databaseInstance: formState.databaseInstance,
          username: formState.username,
          password: formState.password,
        }),
      });

      const result: P6TestResult = await response.json();

      setFormState((prev) => ({
        ...prev,
        isTesting: false,
        testResult: result,
      }));

      if (result.success) {
        setConnectionTested(true);
      }
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        isTesting: false,
        testResult: {
          success: false,
          message: 'Network error: Unable to reach the server',
        },
      }));
    }
  }, [formState, validateForm]);

  // Handle Continue button
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
      className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-8"
    >
      <div className="max-w-lg w-full">
        {/* Step Indicator */}
        <div className="mb-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <span>Step 2</span> <span>of 5</span>
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            Connect to Primavera P6
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Enter your P6 SOAP API credentials to connect
          </p>
        </div>

        {/* Connection Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleTestConnection();
          }}
          className="space-y-4"
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
            describedById={`${formId}-wsdl-error`}
          />

          <FormField
            id={`${formId}-database`}
            label="Database Instance"
            value={formState.databaseInstance}
            onChange={(value) => updateField('databaseInstance', value)}
            onBlur={() => handleBlur('databaseInstance')}
            error={formState.validationErrors.databaseInstance}
            placeholder="PMDB"
            describedById={`${formId}-database-error`}
          />

          <FormField
            id={`${formId}-username`}
            label="Username"
            value={formState.username}
            onChange={(value) => updateField('username', value)}
            onBlur={() => handleBlur('username')}
            error={formState.validationErrors.username}
            placeholder="p6admin"
            describedById={`${formId}-username-error`}
          />

          <FormField
            id={`${formId}-password`}
            label="Password"
            type="password"
            value={formState.password}
            onChange={(value) => updateField('password', value)}
            onBlur={() => handleBlur('password')}
            error={formState.validationErrors.password}
            describedById={`${formId}-password-error`}
          />

          {/* Test Connection Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={formState.isTesting}
              className={`
                w-full inline-flex items-center justify-center gap-2
                px-6 py-3 rounded-lg font-medium
                transition-all duration-200
                ${formState.isTesting
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-200
              `}
            >
              {formState.isTesting && <LoadingSpinner />}
              <span>Test Connection</span>
            </button>
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
            disabled={!connectionTested}
            className={`
              flex-1 px-6 py-3 rounded-lg font-medium
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-200
              ${connectionTested
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
export default P6ConnectionForm;
