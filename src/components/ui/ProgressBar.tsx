/**
 * Progress Bar Component
 * @governance COMPONENT-001
 * @design-system ORION Command Center
 */

'use client';

import type { ProgressBarProps } from './types';

const colorStyles: Record<string, string> = {
  cyan: 'bg-[var(--orion-cyan)]',
  amber: 'bg-[var(--orion-amber)]',
  emerald: 'bg-[var(--orion-emerald)]',
  violet: 'bg-[var(--orion-violet)]',
};

const sizeStyles: Record<string, string> = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

/**
 * Determines color based on value (auto mode)
 * >= 80% = emerald (on track)
 * 50-79% = amber (at risk)
 * < 50% = red (critical)
 */
function getAutoColor(value: number, max: number): string {
  const percentage = (value / max) * 100;
  if (percentage >= 80) return 'bg-[var(--orion-emerald)]';
  if (percentage >= 50) return 'bg-[var(--orion-amber)]';
  return 'bg-red-500';
}

/**
 * ORION Progress Bar Component
 *
 * Horizontal progress bar with status-based coloring.
 * Supports auto-color mode based on value thresholds.
 *
 * @example
 * ```tsx
 * <ProgressBar value={75} showLabel />
 *
 * <ProgressBar
 *   value={45}
 *   max={100}
 *   color="auto"
 *   labelFormat={(v, m) => `${v}/${m} activities`}
 * />
 * ```
 */
export function ProgressBar({
  value,
  max = 100,
  color = 'cyan',
  showLabel = false,
  labelFormat,
  size = 'md',
  animated = true,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor =
    color === 'auto' ? getAutoColor(value, max) : colorStyles[color];

  const label = labelFormat
    ? labelFormat(value, max)
    : `${Math.round(percentage)}%`;

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-[var(--orion-text-secondary)]">
            {label}
          </span>
        </div>
      )}

      <div
        className={`
          w-full
          bg-[var(--orion-bg-elevated)]
          rounded-full
          overflow-hidden
          ${sizeStyles[size]}
        `}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`Progress: ${label}`}
      >
        <div
          className={`
            h-full
            rounded-full
            ${barColor}
            ${animated ? 'transition-all duration-500 ease-orion-out' : ''}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
