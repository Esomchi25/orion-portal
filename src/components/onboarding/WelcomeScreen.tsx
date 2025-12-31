/**
 * WelcomeScreen Component - ORION Command Center Design
 * @governance COMPONENT-001, DOC-002
 * @doc-sync PAGE_DATA_API_REFERENCE.md:10.1
 *
 * Step 1 of the Onboarding Wizard.
 * Features animated orbital sync visualization and glassmorphism cards.
 *
 * @coverage
 * - Unit: 90%+ (render, state, interaction)
 * - Integration: API context
 * - E2E: Full onboarding flow
 * - Accessibility: WCAG 2.1 AA
 * - Performance: < 100ms render
 */

'use client';

import { useState, useCallback, memo, useEffect } from 'react';
import type { WelcomeScreenProps, WelcomeScreenState } from './types';

// Feature highlights with color-coded categories - icons sized appropriately
const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'P6 Schedule Data',
    description: 'Projects, WBS, activities, and resources from Primavera P6',
    category: 'p6',
    badge: 'SCHEDULE',
  },
  {
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'SAP Financial Data',
    description: 'Budget, actuals, commitments, and purchase orders',
    category: 'sap',
    badge: 'FINANCE',
  },
  {
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: 'Real-time Sync',
    description: 'Automatic synchronization keeps data always current',
    category: 'sync',
    badge: 'LIVE',
  },
  {
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Unified Dashboard',
    description: 'Cross-project visibility with KPIs and health metrics',
    category: 'dashboard',
    badge: 'ANALYTICS',
  },
] as const;

/**
 * Orbital Animation - Visual representation of P6 ↔ SAP sync
 */
const OrbitalAnimation = memo(function OrbitalAnimation() {
  return (
    <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto mb-6 md:mb-8" aria-hidden="true">
      {/* Outer orbit ring */}
      <div className="absolute inset-0 rounded-full border border-[var(--orion-border)] animate-orbit-reverse" />

      {/* Middle orbit ring */}
      <div className="absolute inset-4 rounded-full border border-[var(--orion-cyan)]/20 animate-orbit" />

      {/* Inner glow */}
      <div className="absolute inset-8 rounded-full bg-gradient-to-br from-[var(--orion-cyan)]/10 to-transparent" />

      {/* Center ORION logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[var(--orion-bg-elevated)] to-[var(--orion-bg-secondary)] border border-[var(--orion-border)] flex items-center justify-center shadow-lg">
          <span className="text-2xl font-bold text-gradient-cyan font-display">O</span>
        </div>
      </div>

      {/* P6 Orbiting element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit" style={{ animationDuration: '12s' }}>
        <div className="w-10 h-10 rounded-lg bg-[var(--orion-bg-elevated)] border border-[var(--orion-amber)]/50 flex items-center justify-center glow-box-amber">
          <span className="text-xs font-mono font-semibold text-[var(--orion-amber)]">P6</span>
        </div>
      </div>

      {/* SAP Orbiting element */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 animate-orbit-reverse" style={{ animationDuration: '15s' }}>
        <div className="w-10 h-10 rounded-lg bg-[var(--orion-bg-elevated)] border border-[var(--orion-emerald)]/50 flex items-center justify-center glow-box-emerald">
          <span className="text-xs font-mono font-semibold text-[var(--orion-emerald)]">SAP</span>
        </div>
      </div>

      {/* Sync pulse */}
      <div className="absolute inset-0 rounded-full border-2 border-[var(--orion-cyan)]/30 animate-pulse-glow" />
    </div>
  );
});

/**
 * Avatar component with gradient fallback
 */
const Avatar = memo(function Avatar({
  imageUrl,
  firstName,
  lastName,
}: {
  imageUrl: string | null;
  firstName: string | null;
  lastName: string | null;
}) {
  const initials = [firstName?.[0], lastName?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || '?';

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt="User avatar"
        className="w-14 h-14 rounded-xl object-cover border-2 border-[var(--orion-cyan)]/30"
      />
    );
  }

  return (
    <div
      data-testid="avatar-fallback"
      className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--orion-cyan)] to-[var(--orion-violet)] flex items-center justify-center text-[var(--orion-bg-primary)] text-lg font-bold font-display"
      aria-hidden="true"
    >
      {initials}
    </div>
  );
});

/**
 * Feature Card component with category styling
 */
const FeatureCard = memo(function FeatureCard({
  icon,
  title,
  description,
  category,
  badge,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  category: string;
  badge: string;
  index: number;
}) {
  const categoryColors: Record<string, string> = {
    p6: 'text-[var(--orion-amber)]',
    sap: 'text-[var(--orion-emerald)]',
    sync: 'text-[var(--orion-cyan)]',
    dashboard: 'text-[var(--orion-violet)]',
  };

  const badgeColors: Record<string, string> = {
    p6: 'badge-amber',
    sap: 'badge-emerald',
    sync: 'badge-cyan',
    dashboard: 'badge-cyan',
  };

  return (
    <div
      className={`feature-card ${category} animate-initial animate-slide-up`}
      style={{ animationDelay: `${300 + index * 100}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className={`${categoryColors[category]} flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-[var(--orion-text-primary)] font-display">
              {title}
            </h3>
            <span className={`badge ${badgeColors[category]}`}>{badge}</span>
          </div>
          <p className="text-sm text-[var(--orion-text-secondary)] leading-relaxed">
            {description}
          </p>
        </div>
      </div>
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
      className="spinner"
      aria-hidden="true"
    />
  );
});

/**
 * WelcomeScreen - Step 1 of the Onboarding Wizard
 */
export const WelcomeScreen = memo(function WelcomeScreen({
  user,
  onGetStarted,
  isLoading = false,
}: WelcomeScreenProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGetStarted = useCallback(() => {
    if (!isLoading) {
      onGetStarted();
    }
  }, [isLoading, onGetStarted]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleGetStarted();
      }
    },
    [handleGetStarted]
  );

  const welcomeName = user.firstName || 'there';

  return (
    <main
      role="main"
      aria-label="Onboarding Welcome"
      className="min-h-screen flex flex-col items-center justify-center p-6 md:p-8"
    >
      <div className="max-w-3xl w-full">
        {/* Header with User Info */}
        <div className={`flex items-center gap-4 mb-8 ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
          <Avatar
            imageUrl={user.imageUrl}
            firstName={user.firstName}
            lastName={user.lastName}
          />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--orion-text-primary)] font-display">
              Welcome, <span className="text-gradient-cyan">{welcomeName}</span>
            </h1>
            {user.organizationName && (
              <p className="text-[var(--orion-text-secondary)] font-mono text-sm">
                {user.organizationName}
              </p>
            )}
          </div>
        </div>

        {/* Orbital Animation */}
        <div className={mounted ? 'animate-scale-in delay-100' : 'opacity-0'}>
          <OrbitalAnimation />
        </div>

        {/* Platform Introduction */}
        <div className={`text-center mb-8 ${mounted ? 'animate-slide-up delay-200' : 'opacity-0'}`}>
          <h2 className="text-lg md:text-xl font-semibold text-[var(--orion-text-primary)] mb-3 font-display">
            Your P6 + SAP Command Center
          </h2>
          <p className="text-[var(--orion-text-secondary)] max-w-xl mx-auto leading-relaxed">
            ORION unifies Primavera P6 schedules with SAP financials, giving you
            real-time visibility across your entire project portfolio.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <h2 className="sr-only">What you can do with ORION</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {FEATURES.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              category={feature.category}
              badge={feature.badge}
              index={index}
            />
          ))}
        </div>

        {/* CTA Section */}
        <div className={`flex flex-col items-center gap-4 ${mounted ? 'animate-slide-up delay-700' : 'opacity-0'}`}>
          <button
            type="button"
            onClick={handleGetStarted}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="btn-primary group"
            aria-busy={isLoading}
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <svg className="w-5 h-5" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
            <span>Begin Setup</span>
            <svg
              className="w-5 h-5 transition-transform group-hover:translate-x-1"
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          <p className="text-sm text-[var(--orion-text-muted)] font-mono">
            Setup takes ~5 minutes
          </p>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-[var(--orion-cyan)] glow-box-cyan" />
            <span className="w-2 h-2 rounded-full bg-[var(--orion-border)]" />
            <span className="w-2 h-2 rounded-full bg-[var(--orion-border)]" />
            <span className="w-2 h-2 rounded-full bg-[var(--orion-border)]" />
            <span className="w-2 h-2 rounded-full bg-[var(--orion-border)]" />
          </div>
        </div>
      </div>
    </main>
  );
});

export default WelcomeScreen;
