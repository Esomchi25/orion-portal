/**
 * Input Component
 * @governance COMPONENT-001
 * @design-system ORION Command Center
 *
 * Premium input component with glassmorphism effects,
 * smooth focus transitions, and validation states.
 */

'use client';

import { forwardRef } from 'react';
import type { InputProps } from './types';

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-2 text-sm min-h-[40px]',
  md: 'px-4 py-3 text-base min-h-[48px]',
  lg: 'px-5 py-3.5 text-lg min-h-[56px]',
};

const stateStyles: Record<string, string> = {
  default: '',
  error: 'error',
  success: 'success',
};

/**
 * ORION Input Component - Premium Edition
 *
 * Text input with premium ORION styling and validation states.
 * Features:
 * - JetBrains Mono font for technical inputs
 * - Smooth focus transition with cyan glow
 * - Error/success states with appropriate colors
 * - Glass morphism background
 *
 * @example
 * ```tsx
 * <Input
 *   placeholder="Enter URL..."
 *   state="error"
 *   leftAddon={<GlobeIcon />}
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      state = 'default',
      leftAddon,
      rightAddon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const hasAddons = leftAddon || rightAddon;

    const inputElement = (
      <input
        ref={ref}
        disabled={disabled}
        style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
        className={`
          input-field
          ${sizeStyles[size]}
          ${stateStyles[state]}
          ${hasAddons ? 'px-0 border-0 bg-transparent focus:ring-0 focus:shadow-none' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          w-full rounded-xl
          ${className}
        `}
        aria-invalid={state === 'error'}
        {...props}
      />
    );

    if (!hasAddons) {
      return inputElement;
    }

    return (
      <div
        className={`
          flex items-center
          bg-[var(--orion-bg-secondary)]
          border-2 border-[var(--orion-border)]
          rounded-xl
          transition-all duration-300 ease-out
          hover:border-[rgba(148,163,184,0.2)]
          focus-within:border-[var(--orion-cyan)]
          focus-within:shadow-[0_0_0_4px_var(--orion-cyan-glow)]
          ${state === 'error' ? 'border-red-500 focus-within:border-red-500 focus-within:shadow-[0_0_0_4px_rgba(239,68,68,0.2)]' : ''}
          ${state === 'success' ? 'border-[var(--orion-emerald)] focus-within:border-[var(--orion-emerald)] focus-within:shadow-[0_0_0_4px_var(--orion-emerald-glow)]' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {leftAddon && (
          <div className="flex items-center pl-4 text-[var(--orion-text-muted)]">
            {leftAddon}
          </div>
        )}
        {inputElement}
        {rightAddon && (
          <div className="flex items-center pr-4 text-[var(--orion-text-muted)]">
            {rightAddon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
