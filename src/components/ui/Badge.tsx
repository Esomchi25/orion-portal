/**
 * Badge Component
 * @governance COMPONENT-001
 * @design-system ORION Command Center
 */

'use client';

import type { BadgeProps } from './types';

const variantStyles: Record<string, string> = {
  cyan: 'badge-cyan',
  amber: 'badge-amber',
  emerald: 'badge-emerald',
  violet: `
    text-[var(--orion-violet)]
    bg-[rgba(139,92,246,0.1)]
    border border-[rgba(139,92,246,0.3)]
  `,
  red: `
    text-red-400
    bg-red-500/10
    border border-red-500/30
  `,
  neutral: `
    text-[var(--orion-text-secondary)]
    bg-[var(--orion-bg-elevated)]
    border border-[var(--orion-border)]
  `,
};

const sizeStyles: Record<string, string> = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-3 py-1 text-sm gap-1.5',
};

/**
 * ORION Badge Component
 *
 * Pill-shaped badge for status indicators and labels.
 * Uses JetBrains Mono for technical text.
 *
 * @example
 * ```tsx
 * <Badge variant="emerald" icon={<CheckIcon />}>
 *   Connected
 * </Badge>
 *
 * <Badge variant="amber" pulse>
 *   LIVE
 * </Badge>
 * ```
 */
export function Badge({
  children,
  variant = 'cyan',
  size = 'md',
  icon,
  pulse = false,
}: BadgeProps) {
  return (
    <span
      className={`
        badge
        inline-flex items-center
        font-mono font-medium
        rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${pulse ? 'animate-pulse' : ''}
      `}
    >
      {icon && (
        <span className="flex-shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}

export default Badge;
