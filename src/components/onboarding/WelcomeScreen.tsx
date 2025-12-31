/**
 * WelcomeScreen Component
 * @governance COMPONENT-001, DOC-002
 * @doc-sync PAGE_DATA_API_REFERENCE.md:10.1
 *
 * Step 1 of the Onboarding Wizard.
 * Displays a welcome message and introduces the ORION platform.
 *
 * @coverage
 * - Unit: 90%+ (render, state, interaction)
 * - Integration: API context
 * - E2E: Full onboarding flow
 * - Accessibility: WCAG 2.1 AA
 * - Performance: < 100ms render
 */

'use client';

import { useState, useCallback, memo } from 'react';
import type { WelcomeScreenProps, WelcomeScreenState } from './types';

// Feature highlights for the welcome screen
const FEATURES = [
  {
    icon: '📅',
    title: 'P6 Schedule Data',
    description: 'View projects, WBS, activities, and resources from Primavera P6',
  },
  {
    icon: '💰',
    title: 'SAP Financial Data',
    description: 'Budget, actuals, commitments, and purchase orders from SAP',
  },
  {
    icon: '🔄',
    title: 'Real-time Sync',
    description: 'Automatic synchronization keeps your data always up-to-date',
  },
  {
    icon: '📊',
    title: 'Unified Dashboard',
    description: 'Cross-project visibility with KPIs and health indicators',
  },
] as const;

/**
 * Avatar Fallback component - displays initials when no image
 */
const AvatarFallback = memo(function AvatarFallback({
  firstName,
  lastName,
}: {
  firstName: string | null;
  lastName: string | null;
}) {
  const initials = [firstName?.[0], lastName?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || '?';

  return (
    <div
      data-testid="avatar-fallback"
      className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-semibold"
      aria-hidden="true"
    >
      {initials}
    </div>
  );
});

/**
 * Loading Spinner component
 */
const LoadingSpinner = memo(function LoadingSpinner() {
  return (
    <div
      data-testid="loading-spinner"
      className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"
      aria-hidden="true"
    />
  );
});

/**
 * Feature Card component
 */
const FeatureCard = memo(function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
      <span className="text-2xl" role="img" aria-hidden="true">
        {icon}
      </span>
      <div>
        <p className="font-medium text-slate-900 dark:text-white">{title}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
});

/**
 * WelcomeScreen - Step 1 of the Onboarding Wizard
 *
 * @param props - WelcomeScreenProps
 * @returns JSX.Element
 */
export const WelcomeScreen = memo(function WelcomeScreen({
  user,
  onGetStarted,
  isLoading = false,
}: WelcomeScreenProps) {
  const [state, setState] = useState<WelcomeScreenState>({
    hasReadIntro: false,
    isAnimating: true,
  });

  // Handle Get Started button click
  const handleGetStarted = useCallback(() => {
    if (!isLoading) {
      onGetStarted();
    }
  }, [isLoading, onGetStarted]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleGetStarted();
      }
    },
    [handleGetStarted]
  );

  // Generate welcome message
  const welcomeName = user.firstName || 'there';
  const welcomeMessage = `Welcome, ${welcomeName}!`;

  return (
    <main
      role="main"
      aria-label="Onboarding Welcome"
      className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-8"
    >
      <div className="max-w-2xl w-full text-center">
        {/* User Avatar */}
        <div className="flex justify-center mb-6">
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt="User avatar"
              className="w-16 h-16 rounded-full object-cover border-4 border-blue-100"
            />
          ) : (
            <AvatarFallback
              firstName={user.firstName}
              lastName={user.lastName}
            />
          )}
        </div>

        {/* Welcome Heading */}
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          {welcomeMessage}
        </h1>

        {/* Organization Name (if available) */}
        {user.organizationName && (
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
            {user.organizationName}
          </p>
        )}

        {/* Email (if available) */}
        {user.email && (
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-8">
            {user.email}
          </p>
        )}

        {/* Introduction Text */}
        <div className="text-slate-600 dark:text-slate-300 mb-8 text-left">
          <p className="mb-4">
            ORION is your unified platform for connecting Primavera P6 schedules
            with SAP financials. In the next few steps, we&apos;ll help you:
          </p>
        </div>

        {/* Feature Cards */}
        <h2 className="sr-only">What you can do with ORION</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
          {FEATURES.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>

        {/* Get Started Button */}
        <button
          type="button"
          onClick={handleGetStarted}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className={`
            inline-flex items-center justify-center gap-2
            px-8 py-4 rounded-lg font-semibold text-lg
            transition-all duration-200
            ${
              isLoading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
            }
            text-white shadow-lg hover:shadow-xl
            focus:outline-none
          `}
          aria-busy={isLoading}
        >
          {isLoading && <LoadingSpinner />}
          <span>Get Started</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </button>

        {/* Setup Time Estimate */}
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-500">
          Setup takes about 5 minutes
        </p>
      </div>
    </main>
  );
});

// Default export for dynamic imports
export default WelcomeScreen;
