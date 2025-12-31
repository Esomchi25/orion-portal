/**
 * Button Component
 * @governance COMPONENT-001
 * @design-system ORION Command Center
 */

'use client';

import { forwardRef } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import type { ButtonProps } from './types';

const variantStyles: Record<string, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: `
    bg-transparent text-[var(--orion-text-secondary)]
    hover:bg-[var(--orion-bg-elevated)] hover:text-[var(--orion-text-primary)]
    border-none
  `,
  danger: `
    bg-red-500/10 text-red-400 border-2 border-red-500/30
    hover:bg-red-500/20 hover:border-red-500/50
  `,
};

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5 min-h-[36px]',
  md: 'px-4 py-2 text-base gap-2 min-h-[44px]',
  lg: 'px-6 py-3 text-lg gap-3 min-h-[52px]',
};

/**
 * ORION Button Component
 *
 * Implements the Command Center design system button styles.
 * Supports primary, secondary, ghost, and danger variants.
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={handleClick}>
 *   Get Started
 * </Button>
 *
 * <Button variant="secondary" leftIcon={<ArrowLeft />}>
 *   Go Back
 * </Button>
 *
 * <Button loading disabled>
 *   Processing...
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center
          font-display font-semibold
          rounded-orion-sm
          transition-all duration-200 ease-orion-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orion-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--orion-bg-primary)]
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
          ${className}
        `}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <LoadingSpinner
            size={size === 'sm' ? 'xs' : 'sm'}
            color={variant === 'primary' ? 'cyan' : undefined}
          />
        ) : leftIcon ? (
          <span className="flex-shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        ) : null}

        {children && <span>{children}</span>}

        {!loading && rightIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
