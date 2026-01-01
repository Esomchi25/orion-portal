/**
 * WelcomeScreen Component - ORION Command Center Design
 * @governance COMPONENT-001, DOC-002
 * @doc-sync PAGE_DATA_API_REFERENCE.md:10.1
 *
 * Step 1 of the Onboarding Wizard.
 * Features PREMIUM animated orbital sync visualization and glassmorphism cards.
 * Industrial-premium dark mode aesthetic that rivals $500/hr design agencies.
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

// Feature highlights with color-coded categories
const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
 * Premium Orbital Animation - Visual representation of P6 ↔ SAP sync
 * Features actual orbital paths, data stream particles, and synchronized glow
 */
const OrbitalAnimation = memo(function OrbitalAnimation() {
  return (
    <div
      className="orbital-container relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 mx-auto mb-8 md:mb-10"
      aria-hidden="true"
    >
      {/* Outer orbit ring with gradient */}
      <div className="absolute inset-0 rounded-full border-2 border-[var(--orion-border)] opacity-30" />

      {/* Middle orbit ring - pulsing */}
      <div className="absolute inset-6 rounded-full border border-[var(--orion-cyan)]/20 animate-pulse-glow" />

      {/* Inner orbit ring */}
      <div className="absolute inset-12 rounded-full border border-[var(--orion-cyan)]/30" />

      {/* Gradient glow backdrop */}
      <div className="absolute inset-8 rounded-full bg-gradient-to-br from-[var(--orion-cyan)]/5 via-transparent to-[var(--orion-violet)]/5 blur-xl" />

      {/* Center ORION hub with premium styling */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28">
          {/* Outer glow ring */}
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-[var(--orion-cyan)]/20 to-[var(--orion-violet)]/20 blur-lg animate-pulse-glow" />

          {/* Main hub */}
          <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-[var(--orion-bg-elevated)] via-[var(--orion-bg-secondary)] to-[var(--orion-bg-elevated)] border border-[var(--orion-border)] shadow-2xl flex items-center justify-center overflow-hidden">
            {/* Inner gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/[0.02] to-white/[0.05]" />

            {/* ORION text */}
            <div className="relative flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-black text-gradient-cyan font-display tracking-tight">O</span>
              <span className="text-[10px] font-mono text-[var(--orion-text-muted)] tracking-widest mt-1">ORION</span>
            </div>
          </div>
        </div>
      </div>

      {/* P6 Orbiting element - Top path */}
      <div
        className="orbital-element absolute"
        style={{
          top: '0',
          left: '50%',
          transform: 'translateX(-50%) translateY(-50%)',
          animation: 'orbit-path 12s linear infinite',
        }}
      >
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute -inset-1 rounded-xl bg-[var(--orion-amber)]/30 blur-md group-hover:blur-lg transition-all" />

          {/* Badge */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[var(--orion-bg-elevated)] to-[var(--orion-bg-primary)] border-2 border-[var(--orion-amber)]/50 flex items-center justify-center shadow-lg backdrop-blur-sm">
            <span className="text-sm sm:text-base font-bold font-mono text-[var(--orion-amber)]">P6</span>
          </div>
        </div>
      </div>

      {/* SAP Orbiting element - Bottom path (reverse) */}
      <div
        className="orbital-element absolute"
        style={{
          bottom: '0',
          left: '50%',
          transform: 'translateX(-50%) translateY(50%)',
          animation: 'orbit-path-reverse 15s linear infinite',
        }}
      >
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute -inset-1 rounded-xl bg-[var(--orion-emerald)]/30 blur-md group-hover:blur-lg transition-all" />

          {/* Badge */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[var(--orion-bg-elevated)] to-[var(--orion-bg-primary)] border-2 border-[var(--orion-emerald)]/50 flex items-center justify-center shadow-lg backdrop-blur-sm">
            <span className="text-xs sm:text-sm font-bold font-mono text-[var(--orion-emerald)]">SAP</span>
          </div>
        </div>
      </div>

      {/* Data stream particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[var(--orion-cyan)]"
            style={{
              top: '50%',
              left: '50%',
              animation: `data-particle ${3 + i * 0.5}s linear infinite`,
              animationDelay: `${i * 0.5}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      {/* Sync pulse rings */}
      <div className="absolute inset-0 rounded-full border border-[var(--orion-cyan)]/20 animate-ping" style={{ animationDuration: '3s' }} />
      <div className="absolute inset-0 rounded-full border border-[var(--orion-cyan)]/10 animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} />
    </div>
  );
});

/**
 * Premium Avatar component with gradient fallback
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
      <div className="relative group">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[var(--orion-cyan)] to-[var(--orion-violet)] opacity-50 blur-sm group-hover:opacity-70 transition-opacity" />
        <img
          src={imageUrl}
          alt="User avatar"
          className="relative w-16 h-16 rounded-2xl object-cover border-2 border-[var(--orion-cyan)]/30"
        />
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[var(--orion-cyan)] to-[var(--orion-violet)] opacity-60 blur-sm group-hover:opacity-80 transition-opacity" />
      <div
        data-testid="avatar-fallback"
        className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--orion-cyan)] via-[var(--orion-cyan)]/80 to-[var(--orion-violet)] flex items-center justify-center text-[var(--orion-bg-primary)] text-xl font-bold font-display shadow-lg"
        aria-hidden="true"
      >
        {initials}
      </div>
    </div>
  );
});

/**
 * Premium Feature Card with category styling and hover effects
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
  const categoryStyles: Record<string, { text: string; border: string; glow: string; badge: string }> = {
    p6: {
      text: 'text-[var(--orion-amber)]',
      border: 'border-l-[var(--orion-amber)]',
      glow: 'group-hover:shadow-[0_8px_30px_-10px_var(--orion-amber-glow)]',
      badge: 'bg-[var(--orion-amber)]/10 border-[var(--orion-amber)]/30 text-[var(--orion-amber)]',
    },
    sap: {
      text: 'text-[var(--orion-emerald)]',
      border: 'border-l-[var(--orion-emerald)]',
      glow: 'group-hover:shadow-[0_8px_30px_-10px_var(--orion-emerald-glow)]',
      badge: 'bg-[var(--orion-emerald)]/10 border-[var(--orion-emerald)]/30 text-[var(--orion-emerald)]',
    },
    sync: {
      text: 'text-[var(--orion-cyan)]',
      border: 'border-l-[var(--orion-cyan)]',
      glow: 'group-hover:shadow-[0_8px_30px_-10px_var(--orion-cyan-glow)]',
      badge: 'bg-[var(--orion-cyan)]/10 border-[var(--orion-cyan)]/30 text-[var(--orion-cyan)]',
    },
    dashboard: {
      text: 'text-[var(--orion-violet)]',
      border: 'border-l-[var(--orion-violet)]',
      glow: 'group-hover:shadow-[0_8px_30px_-10px_rgba(139,92,246,0.3)]',
      badge: 'bg-[var(--orion-violet)]/10 border-[var(--orion-violet)]/30 text-[var(--orion-violet)]',
    },
  };

  const styles = categoryStyles[category];

  return (
    <div
      className={`
        group feature-card relative overflow-hidden
        p-5 sm:p-6
        bg-[var(--orion-bg-glass)] backdrop-blur-xl
        border border-[var(--orion-border)] border-l-4 ${styles.border}
        rounded-xl
        transition-all duration-300 ease-out
        hover:bg-[var(--orion-bg-elevated)]/80
        hover:border-[var(--orion-border-glow)]
        hover:-translate-y-1
        ${styles.glow}
        animate-initial animate-slide-up
      `}
      style={{ animationDelay: `${400 + index * 100}ms` }}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative flex items-start gap-4">
        {/* Icon container */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--orion-bg-secondary)] border border-[var(--orion-border)] flex items-center justify-center ${styles.text} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h3 className="font-semibold text-[var(--orion-text-primary)] font-display text-base sm:text-lg">
              {title}
            </h3>
            <span className={`px-2 py-0.5 text-[10px] font-mono font-medium rounded-full border ${styles.badge}`}>
              {badge}
            </span>
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
      className="w-5 h-5 border-2 border-[var(--orion-bg-primary)]/30 border-t-[var(--orion-bg-primary)] rounded-full animate-spin"
      aria-hidden="true"
    />
  );
});

/**
 * WelcomeScreen - Step 1 of the Onboarding Wizard
 * Premium ORION Command Center aesthetic with world-class UI/UX
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
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10"
    >
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-[var(--orion-cyan)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[var(--orion-violet)]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-[var(--orion-cyan)]/5 to-transparent rounded-full blur-2xl" />
      </div>

      <div className="relative max-w-4xl w-full">
        {/* Header with User Info */}
        <header className={`flex items-center gap-5 mb-10 ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
          <Avatar
            imageUrl={user.imageUrl}
            firstName={user.firstName}
            lastName={user.lastName}
          />
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--orion-text-primary)] font-display leading-tight">
              Welcome, <span className="text-gradient-cyan">{welcomeName}</span>
            </h1>
            {user.organizationName && (
              <p className="text-[var(--orion-text-secondary)] font-mono text-sm mt-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--orion-emerald)] animate-pulse" />
                {user.organizationName}
              </p>
            )}
          </div>
        </header>

        {/* Orbital Animation */}
        <div className={mounted ? 'animate-scale-in' : 'opacity-0'} style={{ animationDelay: '100ms' }}>
          <OrbitalAnimation />
        </div>

        {/* Platform Introduction */}
        <div className={`text-center mb-10 ${mounted ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-[var(--orion-cyan)]/10 border border-[var(--orion-cyan)]/30 text-[var(--orion-cyan)]">
              ENTERPRISE
            </span>
            <span className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-[var(--orion-violet)]/10 border border-[var(--orion-violet)]/30 text-[var(--orion-violet)]">
              EPC READY
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--orion-text-primary)] mb-4 font-display">
            Your P6 + SAP <span className="text-gradient-cyan">Command Center</span>
          </h2>
          <p className="text-[var(--orion-text-secondary)] max-w-2xl mx-auto leading-relaxed text-base sm:text-lg">
            ORION unifies Primavera P6 schedules with SAP financials, giving you
            real-time visibility across your entire project portfolio.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <h2 className="sr-only">What you can do with ORION</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-12">
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
        <div className={`flex flex-col items-center gap-5 ${mounted ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '800ms' }}>
          {/* Primary CTA Button */}
          <button
            type="button"
            onClick={handleGetStarted}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="
              group relative overflow-hidden
              inline-flex items-center justify-center gap-3
              px-8 py-4 sm:px-10 sm:py-5
              font-display font-semibold text-base sm:text-lg
              text-[var(--orion-bg-primary)]
              bg-gradient-to-r from-[var(--orion-cyan)] to-[#0ea5e9]
              rounded-xl
              transition-all duration-300
              hover:shadow-[0_8px_30px_-10px_var(--orion-cyan)]
              hover:-translate-y-0.5
              disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orion-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--orion-bg-primary)]
            "
            aria-busy={isLoading}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
            <span>Begin Setup</span>
            <svg
              width="20"
              height="20"
              className="transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          <p className="text-sm text-[var(--orion-text-muted)] font-mono flex items-center gap-2">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-[var(--orion-text-muted)]" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Setup takes ~5 minutes
          </p>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mt-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`
                  relative w-2.5 h-2.5 rounded-full transition-all duration-300
                  ${step === 1
                    ? 'bg-[var(--orion-cyan)] shadow-[0_0_10px_var(--orion-cyan-glow)]'
                    : 'bg-[var(--orion-border)]'
                  }
                `}
              >
                {step === 1 && (
                  <span className="absolute inset-0 rounded-full bg-[var(--orion-cyan)] animate-ping opacity-50" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
});

export default WelcomeScreen;
