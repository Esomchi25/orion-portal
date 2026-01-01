/**
 * GlassCard Component
 * @governance COMPONENT-001
 * @design-system ORION Command Center
 */

'use client';

import type { GlassCardProps } from './types';

const variantStyles: Record<string, string> = {
  default: 'glass-card',
  elevated: 'glass-card-elevated',
  outlined: `
    bg-transparent
    border-2 border-[var(--orion-border)]
    rounded-orion
  `,
};

const paddingStyles: Record<string, string> = {
  none: '',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
};

const accentStyles: Record<string, string> = {
  cyan: 'border-l-4 border-l-[var(--orion-cyan)]',
  amber: 'border-l-4 border-l-[var(--orion-amber)]',
  emerald: 'border-l-4 border-l-[var(--orion-emerald)]',
  violet: 'border-l-4 border-l-[var(--orion-violet)]',
};

/**
 * ORION Glass Card Component
 *
 * Glassmorphism card with backdrop blur and subtle borders.
 * Supports accent colors for category indication.
 *
 * @example
 * ```tsx
 * <GlassCard variant="elevated" accentColor="amber" padding="md">
 *   <h3>P6 Connection</h3>
 *   <p>Configure your Primavera P6 credentials</p>
 * </GlassCard>
 * ```
 */
export function GlassCard({
  children,
  variant = 'default',
  className = '',
  onClick,
  padding = 'md',
  accentColor,
  hoverable = false,
  style,
}: GlassCardProps) {
  const isInteractive = !!onClick || hoverable;
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      style={style}
      className={`
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${accentColor ? accentStyles[accentColor] : ''}
        ${isInteractive ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''}
        transition-all duration-200 ease-orion-out
        ${className}
      `}
      {...(onClick && { type: 'button' })}
    >
      {children}
    </Component>
  );
}

export default GlassCard;
