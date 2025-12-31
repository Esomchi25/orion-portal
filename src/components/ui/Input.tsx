/**
 * Input Component
 * @governance COMPONENT-001
 * @design-system ORION Command Center
 */

'use client';

import { forwardRef } from 'react';
import type { InputProps } from './types';

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm min-h-[36px]',
  md: 'px-4 py-2.5 text-base min-h-[44px]',
  lg: 'px-5 py-3 text-lg min-h-[52px]',
};

const stateStyles: Record<string, string> = {
  default: '',
  error: 'error',
  success: 'success',
};

/**
 * ORION Input Component
 *
 * Text input with ORION styling and validation states.
 * Uses JetBrains Mono for technical inputs.
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
        className={`
          input-field
          ${sizeStyles[size]}
          ${stateStyles[state]}
          ${hasAddons ? 'px-0 border-0 bg-transparent focus:ring-0 focus:shadow-none' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
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
          rounded-orion-sm
          transition-all duration-200 ease-orion-out
          focus-within:border-[var(--orion-cyan)]
          focus-within:shadow-[0_0_0_4px_var(--orion-cyan-glow)]
          ${state === 'error' ? 'border-red-500 focus-within:border-red-500 focus-within:shadow-[0_0_0_4px_rgba(239,68,68,0.2)]' : ''}
          ${state === 'success' ? 'border-[var(--orion-emerald)] focus-within:border-[var(--orion-emerald)] focus-within:shadow-[0_0_0_4px_var(--orion-emerald-glow)]' : ''}
          ${disabled ? 'opacity-50' : ''}
        `}
      >
        {leftAddon && (
          <div className="flex items-center pl-3 text-[var(--orion-text-muted)]">
            {leftAddon}
          </div>
        )}
        {inputElement}
        {rightAddon && (
          <div className="flex items-center pr-3 text-[var(--orion-text-muted)]">
            {rightAddon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
