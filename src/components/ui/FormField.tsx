/**
 * FormField Component
 * @governance COMPONENT-001
 * @design-system ORION Command Center
 */

'use client';

import { useId } from 'react';
import { Input } from './Input';
import type { FormFieldProps } from './types';

/**
 * ORION Form Field Component
 *
 * Complete form field with label, input, hint, and error display.
 * Handles accessibility attributes automatically.
 *
 * @example
 * ```tsx
 * <FormField
 *   id="wsdl-url"
 *   label="WSDL URL"
 *   type="url"
 *   value={url}
 *   onChange={setUrl}
 *   error={errors.url}
 *   required
 *   hint="The P6 Web Services endpoint URL"
 * />
 * ```
 */
export function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required = false,
  disabled = false,
  hint,
  autoComplete,
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  const describedBy = [error && errorId, hint && hintId]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className="orion-form-group">
      <label
        htmlFor={fieldId}
        className="orion-label"
      >
        {label}
        {required && <span className="orion-required" aria-hidden="true">*</span>}
      </label>

      <Input
        id={fieldId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        state={error ? 'error' : 'default'}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={describedBy}
      />

      {hint && !error && (
        <p id={hintId} className="orion-hint">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} className="orion-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default FormField;
