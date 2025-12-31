/**
 * ORION UI Component Library
 * @governance COMPONENT-001
 * @design-system ORION Command Center (Industrial-Premium)
 *
 * Shared UI components implementing the Command Center design system.
 * All components use ORION design tokens from globals.css and Tailwind config.
 */

// ============================================
// Type Exports
// ============================================
export type {
  // Colors & Variants
  OrionColor,
  StatusVariant,

  // Button
  ButtonVariant,
  ButtonSize,
  ButtonProps,

  // Input
  InputSize,
  InputState,
  InputProps,

  // FormField
  FormFieldProps,

  // Card
  CardVariant,
  GlassCardProps,

  // Badge
  BadgeVariant,
  BadgeSize,
  BadgeProps,

  // Progress
  ProgressIndicatorProps,
  ProgressBarProps,

  // Loading
  SpinnerSize,
  LoadingSpinnerProps,

  // Avatar
  AvatarSize,
  AvatarProps,

  // Tooltip
  TooltipPosition,
  TooltipProps,

  // Status
  StatusDotProps,

  // KPI
  KPICardProps,
} from './types';

// ============================================
// Component Exports
// ============================================

// Core inputs
export { Button } from './Button';
export { Input } from './Input';
export { FormField } from './FormField';

// Cards & containers
export { GlassCard } from './GlassCard';

// Indicators & feedback
export { Badge } from './Badge';
export { LoadingSpinner } from './LoadingSpinner';
export { ProgressIndicator } from './ProgressIndicator';
export { ProgressBar } from './ProgressBar';
export { StatusDot } from './StatusDot';

// Display
export { Avatar } from './Avatar';
