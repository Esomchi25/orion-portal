/**
 * Progress Indicator Component
 * @governance COMPONENT-001
 * @design-system ORION Command Center
 *
 * Premium progress indicator with modern styling, smooth animations,
 * and responsive design. Features glass morphism effects and
 * color-coded step indicators.
 *
 * NOTE: Uses inline styles as fallback for Tailwind JIT class generation issues.
 */

'use client';

import type { ProgressIndicatorProps } from './types';

// Design tokens for inline styles (Tailwind JIT fallback)
const COLORS = {
  emerald: '#10b981',
  emeraldGlow: 'rgba(16,185,129,0.4)',
  cyan: '#00d4ff',
  cyanGlow: 'rgba(0,212,255,0.4)',
  bgPrimary: '#0a0f1a',
  bgSecondary: '#111827',
  bgGlass: 'rgba(17,24,39,0.8)',
  border: 'rgba(148,163,184,0.15)',
  textPrimary: '#f1f5f9',
  textMuted: '#64748b',
};

/**
 * ORION Progress Indicator - Premium Edition
 *
 * Modern step progress indicator for multi-step flows like onboarding.
 * Features:
 * - Glass morphism container with subtle border
 * - Animated step transitions with pulse effects
 * - Responsive design from mobile to desktop
 * - Color-coded progress: emerald (complete), cyan (current), muted (upcoming)
 */
export function ProgressIndicator({
  currentStep,
  totalSteps,
  labels,
  compact = false,
}: ProgressIndicatorProps) {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  // Inline styles for container (Tailwind JIT fallback)
  const containerStyle: React.CSSProperties = compact ? {
    position: 'relative',
    margin: '0 auto',
    maxWidth: '20rem',
  } : {
    position: 'relative',
    margin: '0 auto',
    maxWidth: '48rem',
    backgroundColor: COLORS.bgGlass,
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '1rem',
    padding: '1.5rem',
  };

  // Step counter badge styles
  const badgeContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  };

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    backgroundColor: COLORS.bgSecondary,
    border: `1px solid ${COLORS.border}`,
  };

  // Track container styles
  const trackContainerStyle: React.CSSProperties = {
    position: 'relative',
    height: '48px',
  };

  // Background track styles
  const backgroundTrackStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '0',
    right: '0',
    transform: 'translateY(-50%)',
    height: compact ? '2px' : '6px',
    backgroundColor: COLORS.border,
    borderRadius: '9999px',
  };

  // Progress fill styles
  const progressFillStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '0',
    transform: 'translateY(-50%)',
    height: compact ? '2px' : '6px',
    width: `${progressPercentage}%`,
    background: `linear-gradient(to right, ${COLORS.emerald}, ${COLORS.cyan})`,
    borderRadius: '9999px',
    transition: 'width 0.5s ease-out',
  };

  // Step list styles
  const stepListStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  };

  return (
    <nav aria-label="Progress" style={{ width: '100%' }}>
      {/* Premium container with glassmorphism */}
      <div style={containerStyle}>
        {/* Step counter badge */}
        {!compact && (
          <div style={badgeContainerStyle}>
            <div style={badgeStyle}>
              <span style={{
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono), monospace',
                color: COLORS.textMuted,
                letterSpacing: '0.05em',
              }}>
                STEP
              </span>
              <span style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                fontFamily: 'var(--font-outfit), system-ui, sans-serif',
                color: COLORS.cyan,
              }}>
                {currentStep}
              </span>
              <span style={{
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono), monospace',
                color: COLORS.textMuted,
                letterSpacing: '0.05em',
              }}>
                OF {totalSteps}
              </span>
            </div>
          </div>
        )}

        {/* Progress track container */}
        <div style={trackContainerStyle}>
          {/* Background track */}
          <div style={backgroundTrackStyle} />

          {/* Animated progress fill */}
          <div style={progressFillStyle} />

          {/* Step dots */}
          <ol role="list" style={stepListStyle}>
            {Array.from({ length: totalSteps }, (_, index) => {
              const stepNumber = index + 1;
              const isCompleted = stepNumber < currentStep;
              const isCurrent = stepNumber === currentStep;

              // Step circle styles
              const circleSize = compact ? 16 : 48;
              const circleStyle: React.CSSProperties = {
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: `${circleSize}px`,
                height: `${circleSize}px`,
                borderRadius: '50%',
                border: '2px solid',
                borderColor: isCompleted
                  ? COLORS.emerald
                  : isCurrent
                    ? COLORS.cyan
                    : COLORS.border,
                backgroundColor: isCompleted
                  ? COLORS.emerald
                  : isCurrent
                    ? COLORS.cyan
                    : COLORS.bgSecondary,
                boxShadow: isCompleted
                  ? `0 0 16px -4px ${COLORS.emeraldGlow}`
                  : isCurrent
                    ? `0 0 20px -4px ${COLORS.cyanGlow}`
                    : 'none',
                transition: 'all 0.3s ease-out',
              };

              // Step item container styles
              const stepItemStyle: React.CSSProperties = {
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              };

              // Label styles
              const labelStyle: React.CSSProperties = {
                position: 'absolute',
                top: '100%',
                marginTop: '0.75rem',
                whiteSpace: 'nowrap',
                fontSize: '0.875rem',
                fontWeight: 500,
                fontFamily: 'var(--font-outfit), system-ui, sans-serif',
                color: isCurrent
                  ? COLORS.cyan
                  : isCompleted
                    ? COLORS.emerald
                    : COLORS.textMuted,
                transition: 'color 0.2s',
              };

              // Number/checkmark text styles
              const numberStyle: React.CSSProperties = {
                position: 'relative',
                zIndex: 10,
                fontFamily: 'var(--font-mono), monospace',
                fontWeight: 700,
                fontSize: compact ? '0.75rem' : '1rem',
                color: (isCompleted || isCurrent) ? COLORS.bgPrimary : COLORS.textMuted,
              };

              return (
                <li key={stepNumber} style={stepItemStyle}>
                  {/* Step circle */}
                  <div
                    style={circleStyle}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {/* Pulse ring for current step - CSS animation handled in globals.css */}
                    {isCurrent && !compact && (
                      <span
                        style={{
                          position: 'absolute',
                          inset: 0,
                          borderRadius: '50%',
                          backgroundColor: COLORS.cyan,
                          opacity: 0.3,
                          animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                        }}
                      />
                    )}

                    {!compact && (
                      <span style={numberStyle}>
                        {isCompleted ? (
                          <svg
                            width="20"
                            height="20"
                            style={{ width: '20px', height: '20px', flexShrink: 0 }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          stepNumber
                        )}
                      </span>
                    )}
                  </div>

                  {/* Label below step */}
                  {labels && labels[index] && !compact && (
                    <span style={labelStyle}>
                      {labels[index]}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {/* Bottom spacing for labels */}
        {labels && !compact && <div style={{ height: '2.5rem' }} />}
      </div>

      {/* Screen reader announcement */}
      <p style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0,0,0,0)',
        whiteSpace: 'nowrap',
        border: 0
      }}>
        Step {currentStep} of {totalSteps}
        {labels && labels[currentStep - 1] && `: ${labels[currentStep - 1]}`}
      </p>
    </nav>
  );
}

export default ProgressIndicator;
