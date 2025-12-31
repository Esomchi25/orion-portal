/**
 * No Data Message Component
 * @governance COMPONENT-001
 *
 * Displays a consistent "no data" message when P6 services return empty results.
 * Uses service-specific messages from the backend to inform users why data is missing.
 *
 * CEO Direction: "If client doesn't have data in any service, show message indicating
 * they don't currently capture that data"
 */

'use client';

import React, { memo } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface NoDataMessageProps {
  /** P6 service name (e.g., 'ProjectService', 'WBSService') */
  service: string;
  /** Custom message to display (optional, uses service default if not provided) */
  message?: string;
  /** Icon variant: 'info' | 'folder' | 'chart' | 'settings' | 'resource' */
  icon?: 'info' | 'folder' | 'chart' | 'settings' | 'resource';
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Whether to show in compact mode (less padding) */
  compact?: boolean;
  /** Test ID for testing */
  testId?: string;
}

// ============================================================================
// DEFAULT MESSAGES BY SERVICE
// Messages match backend NO_DATA_MESSAGE values from models.py
// ============================================================================

const SERVICE_MESSAGES: Record<string, { message: string; icon: NoDataMessageProps['icon'] }> = {
  // Tier 1 - Schedule (Core)
  ProjectService: {
    message: 'No projects found. Please configure P6 connection and ensure projects are accessible.',
    icon: 'folder',
  },
  WBSService: {
    message: 'No WBS elements found. This project may not have a work breakdown structure defined.',
    icon: 'folder',
  },
  ActivityService: {
    message: 'No activities found. This project may not have activities defined in P6.',
    icon: 'chart',
  },
  ResourceService: {
    message: 'No resources found. This P6 instance may not have resources configured.',
    icon: 'resource',
  },
  ResourceAssignmentService: {
    message: 'No resource assignments found. Activities may not have resources assigned.',
    icon: 'resource',
  },
  EPSService: {
    message: 'No EPS nodes found. Enterprise Project Structure may not be configured.',
    icon: 'folder',
  },

  // Tier 2 - Financial
  ProjectBudgetChangeLogService: {
    message: 'No budget change logs. This project may not track budget changes in P6.',
    icon: 'chart',
  },
  ResourceRateService: {
    message: 'No resource rates defined. Resources may use default rates.',
    icon: 'resource',
  },
  ExpenseCategoryService: {
    message: 'No expense categories defined. This P6 instance may not use expense tracking.',
    icon: 'settings',
  },

  // Tier 3 - Analytics/Risk
  RiskService: {
    message: 'No risks defined. This project may not use P6 risk management.',
    icon: 'info',
  },
  IssueService: {
    message: 'No issues logged. This project may not use P6 issue tracking.',
    icon: 'info',
  },
  BaselineService: {
    message: 'No baselines found. This project may not have baseline schedules.',
    icon: 'chart',
  },

  // Tier 4 - Admin/Setup
  UserService: {
    message: 'No users available. You may not have permission to view users.',
    icon: 'resource',
  },
  OBSService: {
    message: 'No OBS nodes found. Organization Breakdown Structure may not be configured.',
    icon: 'folder',
  },
  CalendarService: {
    message: 'No calendars found. This P6 instance may not have project calendars defined.',
    icon: 'settings',
  },
  CurrencyService: {
    message: 'No currencies defined. This P6 instance uses the default currency.',
    icon: 'settings',
  },

  // Tier 5 - Enterprise
  TimesheetService: {
    message: 'No timesheets submitted. Time may be tracked elsewhere.',
    icon: 'chart',
  },
  DocumentService: {
    message: 'No documents attached. This project may not use P6 document management.',
    icon: 'folder',
  },
};

// Default fallback
const DEFAULT_MESSAGE = {
  message: 'No data available for this service.',
  icon: 'info' as const,
};

// ============================================================================
// ICON COMPONENTS
// ============================================================================

const icons: Record<string, React.ReactNode> = {
  info: (
    <svg className="w-12 h-12 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  folder: (
    <svg className="w-12 h-12 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  chart: (
    <svg className="w-12 h-12 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  settings: (
    <svg className="w-12 h-12 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  resource: (
    <svg className="w-12 h-12 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const NoDataMessage = memo(function NoDataMessage({
  service,
  message,
  icon,
  action,
  compact = false,
  testId,
}: NoDataMessageProps) {
  // Get service-specific defaults
  const serviceConfig = SERVICE_MESSAGES[service] || DEFAULT_MESSAGE;

  // Use provided values or fall back to service defaults
  const displayMessage = message || serviceConfig.message;
  const displayIcon = icon || serviceConfig.icon || 'info';

  const paddingClass = compact ? 'py-6' : 'py-12';

  return (
    <div
      data-testid={testId || `no-data-${service}`}
      role="status"
      aria-label={`No data: ${displayMessage}`}
      className={`flex flex-col items-center justify-center ${paddingClass} text-center`}
    >
      {icons[displayIcon]}
      <p className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
        No Data Available
      </p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-md">
        {displayMessage}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
});

// ============================================================================
// UTILITY: Get No Data Message for Service
// ============================================================================

/**
 * Get the default no-data message for a P6 service
 * Useful when you need just the message text without the component
 */
export function getServiceNoDataMessage(service: string): string {
  return SERVICE_MESSAGES[service]?.message || DEFAULT_MESSAGE.message;
}

/**
 * Check if a service has a custom no-data message defined
 */
export function hasServiceNoDataMessage(service: string): boolean {
  return service in SERVICE_MESSAGES;
}

export default NoDataMessage;
