/**
 * Data Mode Toggle Component - ORION Command Center Design
 * @governance COMPONENT-001
 *
 * Admin-only toggle to switch between Mock and Live data sources.
 * Displays current mode and sync status when in Live mode.
 */

'use client';

import { memo } from 'react';
import { useDataMode, type DataMode } from '@/contexts/DataModeContext';

interface DataModeToggleProps {
  /** Compact mode (icon only) */
  compact?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * Format relative time for last sync
 */
function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

export const DataModeToggle = memo(function DataModeToggle({
  compact = false,
  className = '',
}: DataModeToggleProps) {
  const { mode, toggleMode, isAdmin, isLoading, syncStatus } = useDataMode();

  // Don't render for non-admins
  if (!isAdmin) return null;

  // Don't render while loading
  if (isLoading) return null;

  const isMock = mode === 'mock';

  if (compact) {
    return (
      <button
        onClick={toggleMode}
        aria-label={`Switch to ${isMock ? 'Live' : 'Mock'} data`}
        title={`Currently: ${isMock ? 'Demo Data' : 'Live Data'}`}
        className={`
          relative p-2 rounded-lg transition-all duration-300
          ${isMock
            ? 'bg-[var(--orion-amber)]/10 border border-[var(--orion-amber)]/30 hover:bg-[var(--orion-amber)]/20'
            : 'bg-[var(--orion-emerald)]/10 border border-[var(--orion-emerald)]/30 hover:bg-[var(--orion-emerald)]/20'
          }
          ${className}
        `}
      >
        {isMock ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--orion-amber)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--orion-emerald)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        )}
        {/* Pulse indicator for live mode */}
        {!isMock && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--orion-emerald)] rounded-full animate-pulse" />
        )}
      </button>
    );
  }

  return (
    <div
      className={`
        glass-card-elevated p-4 rounded-xl
        ${isMock
          ? 'border-[var(--orion-amber)]/30'
          : 'border-[var(--orion-emerald)]/30'
        }
        ${className}
      `}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Mode Label */}
        <div className="flex items-center gap-3">
          <div
            className={`
              w-10 h-10 rounded-lg flex items-center justify-center
              ${isMock
                ? 'bg-[var(--orion-amber)]/10 border border-[var(--orion-amber)]/30'
                : 'bg-[var(--orion-emerald)]/10 border border-[var(--orion-emerald)]/30'
              }
            `}
          >
            {isMock ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--orion-amber)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--orion-emerald)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            )}
          </div>
          <div>
            <p className="text-sm font-bold font-mono text-[var(--orion-text-primary)]">
              {isMock ? 'DEMO DATA' : 'LIVE DATA'}
            </p>
            <p className="text-xs text-[var(--orion-text-muted)]">
              {isMock ? 'Using client_demo schema' : 'Connected to P6 + SAP'}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={toggleMode}
          role="switch"
          aria-checked={!isMock}
          aria-label={`Switch to ${isMock ? 'Live' : 'Mock'} data`}
          className={`
            relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2
            ${isMock
              ? 'bg-[var(--orion-amber)]/30 focus:ring-[var(--orion-amber)]'
              : 'bg-[var(--orion-emerald)]/30 focus:ring-[var(--orion-emerald)]'
            }
          `}
        >
          <span
            className={`
              absolute top-1 w-5 h-5 rounded-full transition-all duration-300 shadow-lg
              ${isMock
                ? 'left-1 bg-[var(--orion-amber)]'
                : 'left-8 bg-[var(--orion-emerald)]'
              }
            `}
          />
          <span className="sr-only">
            {isMock ? 'Switch to Live data' : 'Switch to Demo data'}
          </span>
        </button>
      </div>

      {/* Sync Status (Live mode only) */}
      {!isMock && (
        <div className="mt-4 pt-4 border-t border-[var(--orion-border)] grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-[var(--orion-amber)] animate-pulse" />
            <span className="text-[var(--orion-text-muted)]">P6:</span>
            <span className="font-mono text-[var(--orion-text-secondary)]">
              {formatRelativeTime(syncStatus.p6LastSync)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-[var(--orion-emerald)] animate-pulse" />
            <span className="text-[var(--orion-text-muted)]">SAP:</span>
            <span className="font-mono text-[var(--orion-text-secondary)]">
              {formatRelativeTime(syncStatus.sapLastSync)}
            </span>
          </div>
        </div>
      )}

      {/* Admin Badge */}
      <div className="mt-3 flex items-center gap-2">
        <span className="px-2 py-0.5 text-[10px] font-bold font-mono rounded bg-[var(--orion-violet)]/10 text-[var(--orion-violet)] border border-[var(--orion-violet)]/30">
          ADMIN ONLY
        </span>
        <span className="text-[10px] text-[var(--orion-text-muted)]">
          Toggle visible only to administrators
        </span>
      </div>
    </div>
  );
});

export default DataModeToggle;
