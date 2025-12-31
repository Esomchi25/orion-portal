/**
 * Progress Indicator Component
 * @governance COMPONENT-001
 * @design-system ORION Command Center
 */

'use client';

import type { ProgressIndicatorProps } from './types';

/**
 * ORION Progress Indicator
 *
 * Step progress indicator for multi-step flows like onboarding.
 * Shows completed, current, and upcoming steps with animations.
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
  return (
    <nav aria-label="Progress" className="w-full">
      <ol
        role="list"
        className={`
          flex items-center
          ${compact ? 'justify-center gap-2' : 'justify-between'}
        `}
      >
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <li
              key={stepNumber}
              className={`
                flex items-center
                ${index < totalSteps - 1 ? 'flex-1' : ''}
              `}
            >
              {/* Step dot/number */}
              <div className="relative flex items-center">
                <div
                  className={`
                    progress-dot
                    flex items-center justify-center
                    ${compact ? 'w-3 h-3' : 'w-8 h-8 sm:w-10 sm:h-10'}
                    ${isCompleted ? 'completed' : ''}
                    ${isCurrent ? 'active' : ''}
                    transition-all duration-300 ease-orion-out
                  `}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {!compact && (
                    <span
                      className={`
                        font-mono text-sm font-semibold
                        ${isCompleted ? 'text-[var(--orion-bg-primary)]' : ''}
                        ${isCurrent ? 'text-[var(--orion-bg-primary)]' : ''}
                        ${isUpcoming ? 'text-[var(--orion-text-muted)]' : ''}
                      `}
                    >
                      {isCompleted ? (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        stepNumber
                      )}
                    </span>
                  )}
                </div>

                {/* Label */}
                {labels && labels[index] && !compact && (
                  <span
                    className={`
                      absolute -bottom-6 left-1/2 -translate-x-1/2
                      whitespace-nowrap text-xs font-medium
                      ${isCurrent ? 'text-[var(--orion-cyan)]' : ''}
                      ${isCompleted ? 'text-[var(--orion-emerald)]' : ''}
                      ${isUpcoming ? 'text-[var(--orion-text-muted)]' : ''}
                    `}
                  >
                    {labels[index]}
                  </span>
                )}
              </div>

              {/* Connecting line */}
              {index < totalSteps - 1 && (
                <div
                  className={`
                    progress-line
                    flex-1 mx-2 sm:mx-4
                    ${isCompleted ? 'completed' : ''}
                    ${compact ? 'h-0.5' : 'h-1'}
                  `}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Screen reader announcement */}
      <p className="sr-only">
        Step {currentStep} of {totalSteps}
        {labels && labels[currentStep - 1] && `: ${labels[currentStep - 1]}`}
      </p>
    </nav>
  );
}

export default ProgressIndicator;
