/**
 * Status Dot Component
 * @governance COMPONENT-001
 * @design-system ORION Command Center
 */

'use client';

import type { StatusDotProps } from './types';

const statusStyles: Record<string, string> = {
  success: 'bg-[var(--orion-emerald)]',
  warning: 'bg-[var(--orion-amber)]',
  error: 'bg-red-500',
  info: 'bg-[var(--orion-cyan)]',
  neutral: 'bg-[var(--orion-text-muted)]',
};

const sizeStyles: Record<string, string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-3 h-3',
};

/**
 * ORION Status Dot Component
 *
 * Small circular status indicator.
 * Supports pulse animation for live/active states.
 *
 * @example
 * ```tsx
 * <StatusDot status="success" pulse />
 * <StatusDot status="error" label="Connection failed" />
 * ```
 */
export function StatusDot({
  status,
  pulse = false,
  size = 'md',
  label,
}: StatusDotProps) {
  return (
    <span className="relative inline-flex">
      <span
        className={`
          ${sizeStyles[size]}
          ${statusStyles[status]}
          rounded-full
          flex-shrink-0
        `}
        role="status"
        aria-label={label || `Status: ${status}`}
      />

      {pulse && (
        <span
          className={`
            absolute inset-0
            ${sizeStyles[size]}
            ${statusStyles[status]}
            rounded-full
            animate-ping
            opacity-75
          `}
          aria-hidden="true"
        />
      )}

      {label && <span className="sr-only">{label}</span>}
    </span>
  );
}

export default StatusDot;
