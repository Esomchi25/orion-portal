/**
 * Gantt Chart Components
 * @governance COMPONENT-001
 * @doc-sync PAGE_DATA_API_REFERENCE.md:4
 *
 * Components:
 * - GanttChart: Main Gantt chart visualization
 * - GanttToolbar: Scale and display controls
 * - GanttBar: Individual activity bar
 * - GanttDependencyLine: Relationship line
 */

'use client';

import React, { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import type {
  GanttActivity,
  GanttState,
  GanttChartProps,
  GanttToolbarProps,
  GanttBarProps,
  GanttBar as GanttBarType,
  TimelineScale,
  TimelineConfig,
  ActivitiesResponse,
  ActivityRelationship,
} from './types';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const DAY_MS = 24 * 60 * 60 * 1000;

const getPixelsPerDay = (scale: TimelineScale): number => {
  switch (scale) {
    case 'day': return 40;
    case 'week': return 20;
    case 'month': return 8;
    case 'quarter': return 3;
    case 'year': return 1;
    default: return 8;
  }
};

const formatDate = (date: Date, scale: TimelineScale): string => {
  switch (scale) {
    case 'day':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'week':
      return `Week ${getWeekNumber(date)}`;
    case 'month':
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    case 'quarter':
      return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
    case 'year':
      return date.getFullYear().toString();
    default:
      return date.toLocaleDateString();
  }
};

const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / DAY_MS;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

const getStatusColor = (status: GanttActivity['status'], isCritical: boolean): string => {
  if (isCritical) {
    switch (status) {
      case 'complete': return '#059669'; // green-600
      case 'in_progress': return '#dc2626'; // red-600 (critical in progress)
      case 'not_started': return '#ef4444'; // red-500
    }
  }
  switch (status) {
    case 'complete': return '#10b981'; // green-500
    case 'in_progress': return '#3b82f6'; // blue-500
    case 'not_started': return '#9ca3af'; // gray-400
  }
};

const calculateBarPosition = (
  activity: GanttActivity,
  timeline: TimelineConfig,
  rowIndex: number,
  rowHeight: number
): GanttBarType => {
  const startDate = new Date(activity.plannedStart);
  const endDate = new Date(activity.plannedFinish);

  const startDays = (startDate.getTime() - timeline.startDate.getTime()) / DAY_MS;
  const durationDays = (endDate.getTime() - startDate.getTime()) / DAY_MS;

  const x = startDays * timeline.pixelsPerDay;
  const width = Math.max(durationDays * timeline.pixelsPerDay, activity.isMilestone ? 16 : 20);
  const progressWidth = (activity.percentComplete / 100) * width;

  return {
    activityId: activity.activityId,
    x,
    width,
    y: rowIndex * rowHeight,
    color: getStatusColor(activity.status, activity.isCritical),
    progressWidth,
    isMilestone: activity.isMilestone,
    isCritical: activity.isCritical,
  };
};

// ============================================================================
// GANTT TOOLBAR COMPONENT
// ============================================================================

export const GanttToolbar = memo(function GanttToolbar({
  scale,
  showCriticalPath,
  showDependencies,
  onScaleChange,
  onCriticalPathToggle,
  onDependenciesToggle,
  onZoomIn,
  onZoomOut,
  onGoToToday,
}: GanttToolbarProps) {
  const scales: TimelineScale[] = ['day', 'week', 'month', 'quarter', 'year'];

  return (
    <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Scale buttons */}
      <div className="flex items-center gap-1">
        {scales.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onScaleChange(s)}
            aria-pressed={scale === s}
            className={`px-3 py-1.5 text-xs font-medium rounded ${
              scale === s
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

      {/* Zoom controls */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onZoomIn}
          aria-label="Zoom in"
          className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onZoomOut}
          aria-label="Zoom out"
          className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>
      </div>

      <button
        type="button"
        onClick={onGoToToday}
        className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
      >
        Today
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

      {/* Toggles */}
      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
        <input
          type="checkbox"
          checked={showCriticalPath}
          onChange={(e) => onCriticalPathToggle(e.target.checked)}
          aria-label="Critical Path"
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        Critical Path
      </label>

      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
        <input
          type="checkbox"
          checked={showDependencies}
          onChange={(e) => onDependenciesToggle(e.target.checked)}
          aria-label="Dependencies"
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        Dependencies
      </label>
    </div>
  );
});

// ============================================================================
// GANTT BAR COMPONENT
// ============================================================================

export const GanttBar = memo(function GanttBar({
  activity,
  bar,
  isSelected,
  onClick,
  onDoubleClick,
}: GanttBarProps) {
  const handleClick = () => onClick(activity);
  const handleDoubleClick = () => onDoubleClick(activity);

  if (bar.isMilestone) {
    // Diamond shape for milestones
    return (
      <g
        role="graphics-symbol"
        aria-label={`${activity.name} milestone`}
        style={{ cursor: 'pointer' }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        <polygon
          points={`${bar.x + 8},${bar.y + 4} ${bar.x + 16},${bar.y + 12} ${bar.x + 8},${bar.y + 20} ${bar.x},${bar.y + 12}`}
          fill={bar.color}
          stroke={isSelected ? '#2563eb' : 'none'}
          strokeWidth={isSelected ? 2 : 0}
        />
      </g>
    );
  }

  return (
    <g
      role="graphics-symbol"
      aria-label={`${activity.name}: ${activity.percentComplete}% complete`}
      style={{ cursor: 'pointer' }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Background bar */}
      <rect
        x={bar.x}
        y={bar.y + 4}
        width={bar.width}
        height={16}
        rx={2}
        fill={bar.color}
        opacity={0.3}
        stroke={isSelected ? '#2563eb' : 'none'}
        strokeWidth={isSelected ? 2 : 0}
      />
      {/* Progress bar */}
      <rect
        x={bar.x}
        y={bar.y + 4}
        width={bar.progressWidth}
        height={16}
        rx={2}
        fill={bar.color}
      />
      {/* Critical indicator */}
      {bar.isCritical && (
        <line
          x1={bar.x}
          y1={bar.y + 22}
          x2={bar.x + bar.width}
          y2={bar.y + 22}
          stroke="#dc2626"
          strokeWidth={2}
        />
      )}
    </g>
  );
});

// ============================================================================
// GANTT CHART COMPONENT
// ============================================================================

export const GanttChart = memo(function GanttChart({
  projectObjectId,
  tenantId,
  initialScale = 'month',
  showCriticalPath = true,
  showDependencies = true,
  onActivitySelect,
  onActivityDoubleClick,
  rowHeight = 32,
  headerHeight = 48,
}: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<GanttState>({
    activities: [],
    relationships: [],
    timeline: {
      startDate: new Date(),
      endDate: new Date(),
      scale: initialScale,
      pixelsPerDay: getPixelsPerDay(initialScale),
      today: new Date(),
      dataDate: new Date(),
    },
    selectedActivityId: null,
    expandedWbsIds: new Set(),
    isLoading: true,
    error: null,
    showCriticalOnly: false,
    showDependencies,
  });

  // Fetch activities
  useEffect(() => {
    const fetchActivities = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch(
          `/api/v1/p6/projects/${projectObjectId}/activities`,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Tenant-ID': tenantId,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to load activities');
        }

        const data: ActivitiesResponse = await response.json();

        // Calculate timeline bounds
        let minDate = new Date();
        let maxDate = new Date();

        if (data.activities.length > 0) {
          const dates = data.activities.flatMap((a) => [
            new Date(a.plannedStart),
            new Date(a.plannedFinish),
          ]);
          minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
          maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

          // Add padding
          minDate.setDate(minDate.getDate() - 14);
          maxDate.setDate(maxDate.getDate() + 14);
        }

        setState((prev) => ({
          ...prev,
          activities: data.activities,
          relationships: data.relationships,
          timeline: {
            ...prev.timeline,
            startDate: minDate,
            endDate: maxDate,
            dataDate: new Date(data.dataDate),
          },
          isLoading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load activities',
        }));
      }
    };

    fetchActivities();
  }, [projectObjectId, tenantId]);

  // Scale change handler
  const handleScaleChange = useCallback((scale: TimelineScale) => {
    setState((prev) => ({
      ...prev,
      timeline: {
        ...prev.timeline,
        scale,
        pixelsPerDay: getPixelsPerDay(scale),
      },
    }));
  }, []);

  // Critical path toggle
  const handleCriticalPathToggle = useCallback((show: boolean) => {
    setState((prev) => ({ ...prev, showCriticalOnly: show }));
  }, []);

  // Dependencies toggle
  const handleDependenciesToggle = useCallback((show: boolean) => {
    setState((prev) => ({ ...prev, showDependencies: show }));
  }, []);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    const scales: TimelineScale[] = ['year', 'quarter', 'month', 'week', 'day'];
    const currentIndex = scales.indexOf(state.timeline.scale);
    if (currentIndex < scales.length - 1) {
      handleScaleChange(scales[currentIndex + 1]);
    }
  }, [state.timeline.scale, handleScaleChange]);

  const handleZoomOut = useCallback(() => {
    const scales: TimelineScale[] = ['year', 'quarter', 'month', 'week', 'day'];
    const currentIndex = scales.indexOf(state.timeline.scale);
    if (currentIndex > 0) {
      handleScaleChange(scales[currentIndex - 1]);
    }
  }, [state.timeline.scale, handleScaleChange]);

  // Go to today
  const handleGoToToday = useCallback(() => {
    if (containerRef.current) {
      const today = new Date();
      const daysSinceStart = (today.getTime() - state.timeline.startDate.getTime()) / DAY_MS;
      const scrollX = daysSinceStart * state.timeline.pixelsPerDay - containerRef.current.clientWidth / 2;
      containerRef.current.scrollLeft = Math.max(0, scrollX);
    }
  }, [state.timeline]);

  // Activity selection
  const handleActivityClick = useCallback((activity: GanttActivity) => {
    setState((prev) => ({ ...prev, selectedActivityId: activity.activityId }));
    onActivitySelect?.(activity);
  }, [onActivitySelect]);

  const handleActivityDoubleClick = useCallback((activity: GanttActivity) => {
    onActivityDoubleClick?.(activity);
  }, [onActivityDoubleClick]);

  // Calculate bars
  const bars = useMemo(() => {
    return state.activities.map((activity, index) =>
      calculateBarPosition(activity, state.timeline, index, rowHeight)
    );
  }, [state.activities, state.timeline, rowHeight]);

  // Calculate chart dimensions
  const totalDays = (state.timeline.endDate.getTime() - state.timeline.startDate.getTime()) / DAY_MS;
  const chartWidth = totalDays * state.timeline.pixelsPerDay;
  const chartHeight = state.activities.length * rowHeight;

  // Loading state
  if (state.isLoading) {
    return (
      <div role="status" className="flex items-center justify-center p-8">
        <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading Gantt chart...</span>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div role="alert" className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-800 dark:text-red-200">Failed to load activities: {state.error}</p>
      </div>
    );
  }

  // Empty state
  if (state.activities.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        <p>No activities found for this project.</p>
      </div>
    );
  }

  // Calculate today and data date positions
  const todayX = ((new Date().getTime() - state.timeline.startDate.getTime()) / DAY_MS) * state.timeline.pixelsPerDay;
  const dataDateX = ((state.timeline.dataDate.getTime() - state.timeline.startDate.getTime()) / DAY_MS) * state.timeline.pixelsPerDay;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <GanttToolbar
        scale={state.timeline.scale}
        showCriticalPath={showCriticalPath}
        showDependencies={state.showDependencies}
        onScaleChange={handleScaleChange}
        onCriticalPathToggle={handleCriticalPathToggle}
        onDependenciesToggle={handleDependenciesToggle}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onGoToToday={handleGoToToday}
      />

      {/* Chart container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Row labels (fixed) */}
        <div className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          {/* Header */}
          <div
            className="sticky top-0 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 flex items-center font-medium text-sm text-gray-700 dark:text-gray-200"
            style={{ height: headerHeight }}
          >
            Activity
          </div>
          {/* Activity rows */}
          <div role="listbox" aria-label="Activities">
            {state.activities.map((activity) => (
              <div
                key={activity.id}
                role="option"
                data-milestone={activity.isMilestone ? 'true' : undefined}
                data-critical={activity.isCritical ? 'true' : undefined}
                data-status={activity.status}
                aria-selected={state.selectedActivityId === activity.activityId}
                aria-label={`${activity.activityId}: ${activity.name}, ${activity.percentComplete}% complete`}
                className={`flex items-center px-3 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  state.selectedActivityId === activity.activityId ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                style={{ height: rowHeight }}
                onClick={() => handleActivityClick(activity)}
                onDoubleClick={() => handleActivityDoubleClick(activity)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                      {activity.activityId}
                    </span>
                    {activity.isMilestone && (
                      <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-1 rounded">
                        Milestone
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-900 dark:text-gray-100 truncate">
                    {activity.name}
                  </div>
                </div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-300 ml-2">
                  {activity.percentComplete}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart area (scrollable) */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto"
          role="application"
          aria-label="Gantt Chart"
          tabIndex={0}
        >
          {/* Timeline header */}
          <div
            className="sticky top-0 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10"
            style={{ height: headerHeight, width: chartWidth }}
          >
            {/* Generate timeline labels */}
            <div className="flex h-full">
              {Array.from({ length: Math.ceil(totalDays / 30) + 1 }).map((_, i) => {
                const date = new Date(state.timeline.startDate);
                date.setDate(date.getDate() + i * 30);
                const x = i * 30 * state.timeline.pixelsPerDay;
                return (
                  <div
                    key={i}
                    className="flex-shrink-0 flex items-center justify-start px-2 border-r border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300"
                    style={{ width: 30 * state.timeline.pixelsPerDay }}
                  >
                    {formatDate(date, state.timeline.scale)}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bars area */}
          <svg
            width={chartWidth}
            height={chartHeight}
            className="block"
          >
            {/* Grid lines */}
            {Array.from({ length: Math.ceil(totalDays / 7) }).map((_, i) => (
              <line
                key={i}
                x1={i * 7 * state.timeline.pixelsPerDay}
                y1={0}
                x2={i * 7 * state.timeline.pixelsPerDay}
                y2={chartHeight}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
            ))}

            {/* Today line */}
            <line
              data-testid="today-line"
              x1={todayX}
              y1={0}
              x2={todayX}
              y2={chartHeight}
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="4 4"
            />

            {/* Data date line */}
            <line
              data-testid="data-date-line"
              x1={dataDateX}
              y1={0}
              x2={dataDateX}
              y2={chartHeight}
              stroke="#10b981"
              strokeWidth={2}
            />

            {/* Dependency lines */}
            {state.showDependencies && state.relationships.map((rel, i) => {
              const fromIndex = state.activities.findIndex((a) => a.objectId === rel.predecessorObjectId);
              const toIndex = state.activities.findIndex((a) => a.objectId === rel.successorObjectId);
              if (fromIndex === -1 || toIndex === -1) return null;

              const fromBar = bars[fromIndex];
              const toBar = bars[toIndex];
              const isCritical = state.activities[fromIndex].isCritical && state.activities[toIndex].isCritical;
              const isHighlighted = state.selectedActivityId === state.activities[fromIndex].activityId ||
                                   state.selectedActivityId === state.activities[toIndex].activityId;

              // Simple FS relationship line
              const startX = fromBar.x + fromBar.width;
              const startY = fromBar.y + 12;
              const endX = toBar.x;
              const endY = toBar.y + 12;
              const midX = (startX + endX) / 2;

              return (
                <path
                  key={i}
                  data-testid={isHighlighted ? 'dependency-line-highlighted' : 'dependency-line'}
                  d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                  fill="none"
                  stroke={isCritical ? '#dc2626' : '#9ca3af'}
                  strokeWidth={isHighlighted ? 2 : 1}
                  markerEnd="url(#arrowhead)"
                />
              );
            })}

            {/* Arrowhead marker */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
              </marker>
            </defs>

            {/* Activity bars */}
            {bars.map((bar, index) => (
              <GanttBar
                key={state.activities[index].id}
                activity={state.activities[index]}
                bar={bar}
                isSelected={state.selectedActivityId === state.activities[index].activityId}
                onClick={handleActivityClick}
                onDoubleClick={handleActivityDoubleClick}
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
});

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default GanttChart;
