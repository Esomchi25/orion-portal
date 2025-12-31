/**
 * Avatar Component
 * @governance COMPONENT-001
 * @design-system ORION Command Center
 */

'use client';

import { useState } from 'react';
import type { AvatarProps } from './types';

const sizeStyles: Record<string, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

const statusColors: Record<string, string> = {
  online: 'bg-[var(--orion-emerald)]',
  offline: 'bg-[var(--orion-text-muted)]',
  busy: 'bg-red-500',
  away: 'bg-[var(--orion-amber)]',
};

/**
 * Generates initials from a name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * ORION Avatar Component
 *
 * User avatar with image support, fallback initials, and status indicators.
 *
 * @example
 * ```tsx
 * <Avatar
 *   src="/user.jpg"
 *   alt="John Doe"
 *   size="md"
 *   status="online"
 * />
 *
 * <Avatar alt="Jane Smith" size="lg" />
 * ```
 */
export function Avatar({
  src,
  alt,
  size = 'md',
  fallback,
  status,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const showImage = src && !imageError;

  return (
    <div className="relative inline-flex">
      <div
        className={`
          ${sizeStyles[size]}
          rounded-full
          bg-[var(--orion-bg-elevated)]
          border-2 border-[var(--orion-border)]
          flex items-center justify-center
          overflow-hidden
          font-display font-semibold
          text-[var(--orion-text-secondary)]
        `}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : fallback ? (
          fallback
        ) : (
          <span aria-hidden="true">{getInitials(alt)}</span>
        )}
      </div>

      {/* Status indicator */}
      {status && (
        <span
          className={`
            absolute bottom-0 right-0
            w-2.5 h-2.5
            rounded-full
            border-2 border-[var(--orion-bg-primary)]
            ${statusColors[status]}
          `}
          aria-label={`Status: ${status}`}
        />
      )}

      <span className="sr-only">{alt}</span>
    </div>
  );
}

export default Avatar;
