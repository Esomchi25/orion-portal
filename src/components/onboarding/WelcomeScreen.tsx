/**
 * WelcomeScreen Component - ORION Command Center Design
 * @governance COMPONENT-001, DOC-002
 * @doc-sync PAGE_DATA_API_REFERENCE.md:10.1
 *
 * Step 1 of the Onboarding Wizard.
 * Features PREMIUM split-layout design with sidebar + metallic glassmorphism main card.
 * Industrial-premium dark mode aesthetic matching the redesign mockups.
 *
 * Layout: Left sidebar (user info, step indicator) + Right main content (orbital hero, CTA)
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

/**
 * Premium Orbital Animation - Visual representation of P6 ↔ SAP sync
 * Features actual orbital paths, data stream particles, and synchronized glow
 */
const OrbitalAnimation = memo(function OrbitalAnimation() {
  return (
    <div
      className="orbital-container relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 mx-auto mb-8 md:mb-10"
      style={{
        position: 'relative',
        width: '16rem',
        height: '16rem',
        margin: '0 auto 2.5rem auto',
      }}
      aria-hidden="true"
    >
      {/* Outer orbit ring with gradient */}
      <div
        className="absolute inset-0 rounded-full border-2 border-[var(--orion-border)] opacity-30"
        style={{ position: 'absolute', inset: 0, borderRadius: '9999px', borderWidth: '2px', borderStyle: 'solid', borderColor: 'rgba(148,163,184,0.3)', opacity: 0.3 }}
      />

      {/* Middle orbit ring - pulsing */}
      <div
        className="absolute inset-6 rounded-full border border-[var(--orion-cyan)]/20 animate-pulse-glow"
        style={{ position: 'absolute', inset: '1.5rem', borderRadius: '9999px', borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(0,212,255,0.2)' }}
      />

      {/* Inner orbit ring */}
      <div
        className="absolute inset-12 rounded-full border border-[var(--orion-cyan)]/30"
        style={{ position: 'absolute', inset: '3rem', borderRadius: '9999px', borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(0,212,255,0.3)' }}
      />

      {/* Gradient glow backdrop */}
      <div
        className="absolute inset-8 rounded-full bg-gradient-to-br from-[var(--orion-cyan)]/5 via-transparent to-[var(--orion-violet)]/5 blur-xl"
        style={{ position: 'absolute', inset: '2rem', borderRadius: '9999px' }}
      />

      {/* Center ORION hub with premium styling */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div className="relative w-24 h-24 sm:w-28 sm:h-28" style={{ position: 'relative', width: '6rem', height: '6rem' }}>
          {/* Outer glow ring */}
          <div
            className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-[var(--orion-cyan)]/20 to-[var(--orion-violet)]/20 blur-lg animate-pulse-glow"
            style={{ position: 'absolute', inset: '-0.5rem', borderRadius: '1rem' }}
          />

          {/* Main hub */}
          <div
            className="relative w-full h-full rounded-2xl bg-gradient-to-br from-[var(--orion-bg-elevated)] via-[var(--orion-bg-secondary)] to-[var(--orion-bg-elevated)] border border-[var(--orion-border)] shadow-2xl flex items-center justify-center overflow-hidden"
            style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
          >
            {/* Inner gradient overlay */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-transparent via-white/[0.02] to-white/[0.05]"
              style={{ position: 'absolute', inset: 0 }}
            />

            {/* ORION text */}
            <div className="relative flex flex-col items-center" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
          position: 'absolute',
          top: '0',
          left: '50%',
          transform: 'translateX(-50%) translateY(-50%)',
          animation: 'orbit-path 12s linear infinite',
        }}
      >
        <div className="relative group" style={{ position: 'relative' }}>
          {/* Glow effect */}
          <div
            className="absolute -inset-1 rounded-xl bg-[var(--orion-amber)]/30 blur-md group-hover:blur-lg transition-all"
            style={{ position: 'absolute', inset: '-0.25rem', borderRadius: '0.75rem' }}
          />

          {/* Badge */}
          <div
            className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[var(--orion-bg-elevated)] to-[var(--orion-bg-primary)] border-2 border-[var(--orion-amber)]/50 flex items-center justify-center shadow-lg backdrop-blur-sm"
            style={{ position: 'relative', width: '3rem', height: '3rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <span className="text-sm sm:text-base font-bold font-mono text-[var(--orion-amber)]">P6</span>
          </div>
        </div>
      </div>

      {/* SAP Orbiting element - Bottom path (reverse) */}
      <div
        className="orbital-element absolute"
        style={{
          position: 'absolute',
          bottom: '0',
          left: '50%',
          transform: 'translateX(-50%) translateY(50%)',
          animation: 'orbit-path-reverse 15s linear infinite',
        }}
      >
        <div className="relative group" style={{ position: 'relative' }}>
          {/* Glow effect */}
          <div
            className="absolute -inset-1 rounded-xl bg-[var(--orion-emerald)]/30 blur-md group-hover:blur-lg transition-all"
            style={{ position: 'absolute', inset: '-0.25rem', borderRadius: '0.75rem' }}
          />

          {/* Badge */}
          <div
            className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[var(--orion-bg-elevated)] to-[var(--orion-bg-primary)] border-2 border-[var(--orion-emerald)]/50 flex items-center justify-center shadow-lg backdrop-blur-sm"
            style={{ position: 'relative', width: '3rem', height: '3rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <span className="text-xs sm:text-sm font-bold font-mono text-[var(--orion-emerald)]">SAP</span>
          </div>
        </div>
      </div>

      {/* Data stream particles */}
      <div className="absolute inset-0 pointer-events-none" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[var(--orion-cyan)]"
            style={{
              position: 'absolute',
              width: '0.25rem',
              height: '0.25rem',
              borderRadius: '9999px',
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
      <div
        className="absolute inset-0 rounded-full border border-[var(--orion-cyan)]/20 animate-ping"
        style={{ position: 'absolute', inset: 0, borderRadius: '9999px', animationDuration: '3s' }}
      />
      <div
        className="absolute inset-0 rounded-full border border-[var(--orion-cyan)]/10 animate-ping"
        style={{ position: 'absolute', inset: 0, borderRadius: '9999px', animationDuration: '3s', animationDelay: '1s' }}
      />
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
 * NEW: Split-layout design matching redesign mockups
 * Left sidebar (user info, navigation) + Right main card (hero content)
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

  const welcomeName = user.firstName || 'Demo User';

  return (
    <main
      role="main"
      aria-label="Onboarding Welcome"
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
    >
      {/* Animated cosmic background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Orbital rings in background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-[var(--orion-cyan)]/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full border border-[var(--orion-cyan)]/5 rotate-45" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full border border-[var(--orion-violet)]/5 -rotate-12" />

        {/* Glow points */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--orion-cyan)]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--orion-violet)]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Horizon glow at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[var(--orion-cyan)]/5 via-transparent to-transparent" />
      </div>

      {/* Split Layout Container - inline styles as fallback for Tailwind JIT issues */}
      <div
        className={`relative w-full max-w-5xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-0 ${mounted ? 'animate-slide-up' : 'opacity-0'}`}
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '0',
          maxWidth: '64rem',
          margin: '0 auto',
          width: '100%',
          position: 'relative',
        }}
      >

        {/* LEFT SIDEBAR - User info and navigation */}
        <aside
          className="lg:w-64 flex-shrink-0 flex flex-col items-center lg:items-start text-center lg:text-left lg:pr-8 lg:border-r lg:border-[var(--orion-border)]/30"
          style={{
            width: '16rem',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'left',
            paddingRight: '2rem',
            borderRight: '1px solid rgba(148, 163, 184, 0.1)',
          }}
        >
          {/* User Avatar */}
          <Avatar
            imageUrl={user.imageUrl}
            firstName={user.firstName}
            lastName={user.lastName}
          />

          {/* User Name */}
          <h2 className="mt-4 text-lg font-semibold text-[var(--orion-text-primary)] font-display">
            {welcomeName}
          </h2>

          {/* Online indicator */}
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-[var(--orion-emerald)] animate-pulse" />
            <span className="text-xs text-[var(--orion-text-muted)] font-mono">Online</span>
          </div>

          {/* Step indicator */}
          <div className="mt-6 lg:mt-8 flex items-center gap-2 text-sm text-[var(--orion-text-secondary)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[var(--orion-cyan)]" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="font-mono">Getting Started</span>
            <span className="text-[var(--orion-text-muted)]">•</span>
            <span className="text-[var(--orion-cyan)] font-mono">Step 1 of 4</span>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT - Metallic glassmorphism card */}
        <div
          className="flex-1 lg:pl-8"
          style={{
            flex: 1,
            paddingLeft: '2rem',
          }}
        >
          <div
            className="relative overflow-hidden rounded-2xl lg:rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.95) 50%, rgba(30,41,59,0.9) 100%)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            {/* Metallic shine overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.05) 100%)',
              }}
            />

            {/* Corner accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[var(--orion-cyan)]/10 to-transparent" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[var(--orion-violet)]/10 to-transparent" />

            {/* Card content */}
            <div className="relative z-10 p-8 sm:p-10 lg:p-12">
              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--orion-text-primary)] font-display text-center leading-tight">
                Welcome to <span className="text-gradient-cyan">ORION</span>
              </h1>

              {/* Subtitle */}
              <p className="mt-3 text-center text-[var(--orion-text-secondary)] text-lg sm:text-xl font-light">
                Unified P6 & SAP Integration Platform
              </p>

              {/* Orbital Animation - Centered */}
              <div className="mt-8 sm:mt-10" style={{ animationDelay: '200ms' }}>
                <OrbitalAnimation />
              </div>

              {/* CTA Button - Premium cyan with glow */}
              <div className="mt-8 sm:mt-10 flex flex-col items-center gap-4">
                <button
                  type="button"
                  onClick={handleGetStarted}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="
                    group relative overflow-hidden
                    w-full sm:w-auto
                    px-12 py-4 sm:px-16 sm:py-5
                    font-display font-semibold text-lg
                    text-[var(--orion-bg-primary)]
                    bg-gradient-to-r from-[var(--orion-cyan)] via-[#06b6d4] to-[var(--orion-cyan)]
                    rounded-xl
                    border border-[var(--orion-cyan)]/50
                    transition-all duration-300
                    shadow-[0_0_30px_var(--orion-cyan-glow),inset_0_1px_0_rgba(255,255,255,0.2)]
                    hover:shadow-[0_0_50px_var(--orion-cyan-glow),inset_0_1px_0_rgba(255,255,255,0.3)]
                    hover:-translate-y-1
                    disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orion-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--orion-bg-primary)]
                  "
                  aria-busy={isLoading}
                >
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                  <span className="relative flex items-center justify-center gap-2">
                    {isLoading ? (
                      <LoadingSpinner />
                    ) : (
                      <>
                        <span>Get Started</span>
                      </>
                    )}
                  </span>
                </button>

                {/* Secondary actions */}
                <div className="flex items-center gap-6 text-sm">
                  <button
                    type="button"
                    className="text-[var(--orion-text-muted)] hover:text-[var(--orion-text-secondary)] transition-colors font-mono"
                  >
                    Skip Intro
                  </button>
                  <button
                    type="button"
                    className="text-[var(--orion-cyan)] hover:text-[var(--orion-cyan)]/80 transition-colors font-mono underline underline-offset-4"
                  >
                    Watch Tutorial
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom border glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[var(--orion-cyan)]/50 to-transparent" />
          </div>
        </div>
      </div>
    </main>
  );
});

export default WelcomeScreen;
