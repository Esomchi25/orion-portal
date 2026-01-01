/**
 * Progress Indicator Component
 * @governance COMPONENT-001
 * @design-system ORION Command Center
 *
 * Premium progress indicator with modern styling, smooth animations,
 * and responsive design. Features glass morphism effects and
 * color-coded step indicators.
 */

'use client';

import type { ProgressIndicatorProps } from './types';

/**
 * ORION Progress Indicator - Premium Edition
 *
 * Modern step progress indicator for multi-step flows like onboarding.
 * Features:
 * - Glass morphism container with subtle border
 * - Animated step transitions with pulse effects
 * - Responsive design from mobile to desktop
 * - Color-coded progress: emerald (complete), cyan (current), muted (upcoming)
 *
 * @example
 * ```tsx
 * <ProgressIndicator
 *   currentStep={2}
 *   totalSteps={5}
 *   labels={['Welcome', 'P6', 'SAP', 'Projects', 'Complete']}
 * />
 * ```
 */
export function ProgressIndicator({
  currentStep,
  totalSteps,
  labels,
  compact = false,
}: ProgressIndicatorProps) {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <nav aria-label="Progress" className="w-full">
      {/* Premium container with glassmorphism */}
      <div className={`
        relative mx-auto
        ${compact ? 'max-w-xs' : 'max-w-3xl'}
        ${compact ? '' : 'bg-[var(--orion-bg-glass)] backdrop-blur-xl border border-[var(--orion-border)] rounded-2xl p-4 sm:p-6 md:p-8'}
      `}>
        {/* Step counter badge */}
        {!compact && (
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--orion-bg-secondary)] border border-[var(--orion-border)]">
              <span className="text-xs font-mono text-[var(--orion-text-muted)]">STEP</span>
              <span className="text-lg font-bold font-display text-[var(--orion-cyan)]">{currentStep}</span>
              <span className="text-xs font-mono text-[var(--orion-text-muted)]">OF {totalSteps}</span>
            </div>
          </div>
        )}

        {/* Progress track container */}
        <div className="relative">
          {/* Background track */}
          <div className={`
            absolute top-1/2 left-0 right-0 -translate-y-1/2
            ${compact ? 'h-0.5' : 'h-1 sm:h-1.5'}
            bg-[var(--orion-border)] rounded-full
          `} />

          {/* Animated progress fill */}
          <div
            className={`
              absolute top-1/2 left-0 -translate-y-1/2
              ${compact ? 'h-0.5' : 'h-1 sm:h-1.5'}
              bg-gradient-to-r from-[var(--orion-emerald)] via-[var(--orion-cyan)] to-[var(--orion-cyan)]
              rounded-full transition-all duration-500 ease-out
            `}
            style={{ width: `${progressPercentage}%` }}
          />

          {/* Step dots */}
          <ol role="list" className="relative flex items-center justify-between">
            {Array.from({ length: totalSteps }, (_, index) => {
              const stepNumber = index + 1;
              const isCompleted = stepNumber < currentStep;
              const isCurrent = stepNumber === currentStep;
              const isUpcoming = stepNumber > currentStep;

              return (
                <li
                  key={stepNumber}
                  className="relative flex flex-col items-center"
                >
                  {/* Step circle */}
                  <div
                    className={`
                      relative flex items-center justify-center
                      ${compact ? 'w-4 h-4' : 'w-10 h-10 sm:w-12 sm:h-12'}
                      rounded-full border-2
                      transition-all duration-300 ease-out
                      ${isCompleted
                        ? 'bg-[var(--orion-emerald)] border-[var(--orion-emerald)] shadow-[0_0_16px_-4px_var(--orion-emerald-glow)]'
                        : isCurrent
                          ? 'bg-[var(--orion-cyan)] border-[var(--orion-cyan)] shadow-[0_0_20px_-4px_var(--orion-cyan-glow)]'
                          : 'bg-[var(--orion-bg-secondary)] border-[var(--orion-border)]'
                      }
                    `}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {/* Pulse ring for current step */}
                    {isCurrent && !compact && (
                      <span className="absolute inset-0 rounded-full bg-[var(--orion-cyan)] animate-ping opacity-30" />
                    )}

                    {!compact && (
                      <span
                        className={`
                          relative z-10 font-mono font-bold
                          ${compact ? 'text-xs' : 'text-sm sm:text-base'}
                          ${isCompleted || isCurrent ? 'text-[var(--orion-bg-primary)]' : 'text-[var(--orion-text-muted)]'}
                        `}
                      >
                        {isCompleted ? (
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
                    <span
                      className={`
                        absolute top-full mt-2 sm:mt-3
                        whitespace-nowrap text-xs sm:text-sm font-medium font-display
                        transition-colors duration-200
                        ${isCurrent
                          ? 'text-[var(--orion-cyan)]'
                          : isCompleted
                            ? 'text-[var(--orion-emerald)]'
                            : 'text-[var(--orion-text-muted)]'
                        }
                      `}
                    >
                      {labels[index]}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {/* Bottom spacing for labels */}
        {labels && !compact && <div className="h-8 sm:h-10" />}
      </div>

      {/* Screen reader announcement */}
      <p className="sr-only">
        Step {currentStep} of {totalSteps}
        {labels && labels[currentStep - 1] && `: ${labels[currentStep - 1]}`}
      </p>
    </nav>
  );
}

export default ProgressIndicator;
