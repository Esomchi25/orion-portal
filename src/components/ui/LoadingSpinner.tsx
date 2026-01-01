/**
 * Loading Spinner Component
 * @governance COMPONENT-001
 * @design-system ORION Command Center
 */

'use client';

import type { LoadingSpinnerProps } from './types';

const sizeStyles: Record<string, string> = {
  xs: 'w-3 h-3 border',
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-2',
};

const colorStyles: Record<string, string> = {
  cyan: 'border-[var(--orion-cyan)]',
  amber: 'border-[var(--orion-amber)]',
  emerald: 'border-[var(--orion-emerald)]',
  violet: 'border-[var(--orion-violet)]',
};

/**
 * ORION Loading Spinner
 *
 * Unified loading indicator with orbital animation.
 * Uses ORION color palette and timing functions.
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="md" color="cyan" />
 * <LoadingSpinner size="sm" label="Loading projects..." />
 * ```
 */
export function LoadingSpinner({
  size = 'md',
  color = 'cyan',
  label = 'Loading...',
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      data-testid="loading-spinner"
      className={`
        ${sizeStyles[size]}
        rounded-full
        border-[var(--orion-border)]
        ${colorStyles[color]}
        border-t-transparent
        animate-spin
      `}
      style={{
        borderTopColor: 'transparent',
      }}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}

export default LoadingSpinner;
