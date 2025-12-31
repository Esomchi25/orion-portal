/**
 * Shared UI Component Types
 * @governance COMPONENT-001
 * @design-system ORION Command Center
 */

import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';

// ============================================
// Color Variants
// ============================================

/** ORION accent color variants */
export type OrionColor = 'cyan' | 'amber' | 'emerald' | 'violet';

/** Status variants for indicators */
export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

// ============================================
// Button Types
// ============================================

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button visual variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Show loading spinner */
  loading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Icon to display before text */
  leftIcon?: ReactNode;
  /** Icon to display after text */
  rightIcon?: ReactNode;
}

// ============================================
// Input Types
// ============================================

export type InputSize = 'sm' | 'md' | 'lg';
export type InputState = 'default' | 'error' | 'success';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input size variant */
  size?: InputSize;
  /** Validation state */
  state?: InputState;
  /** Left addon content */
  leftAddon?: ReactNode;
  /** Right addon content */
  rightAddon?: ReactNode;
}

// ============================================
// Form Field Types
// ============================================

export interface FormFieldProps {
  /** Unique field identifier */
  id: string;
  /** Field label text */
  label: string;
  /** Input type */
  type?: 'text' | 'password' | 'email' | 'number' | 'url' | 'tel';
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Error message */
  error?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Required field */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Hint text below input */
  hint?: string;
  /** Auto-complete attribute */
  autoComplete?: string;
}

// ============================================
// Card Types
// ============================================

export type CardVariant = 'default' | 'elevated' | 'outlined';

export interface GlassCardProps {
  /** Content inside the card */
  children: ReactNode;
  /** Card visual variant */
  variant?: CardVariant;
  /** Additional CSS classes */
  className?: string;
  /** Click handler (makes card interactive) */
  onClick?: () => void;
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Accent border color */
  accentColor?: OrionColor;
  /** Hover effects enabled */
  hoverable?: boolean;
}

// ============================================
// Badge Types
// ============================================

export type BadgeVariant = 'cyan' | 'amber' | 'emerald' | 'violet' | 'red' | 'neutral';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  /** Badge content */
  children: ReactNode;
  /** Color variant */
  variant?: BadgeVariant;
  /** Badge size */
  size?: BadgeSize;
  /** Icon to display */
  icon?: ReactNode;
  /** Pulse animation (for live indicators) */
  pulse?: boolean;
}

// ============================================
// Progress Types
// ============================================

export interface ProgressIndicatorProps {
  /** Current step (1-indexed) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Optional step labels */
  labels?: string[];
  /** Compact mode (dots only) */
  compact?: boolean;
}

export interface ProgressBarProps {
  /** Progress value (0-100) */
  value: number;
  /** Maximum value */
  max?: number;
  /** Color variant */
  color?: OrionColor | 'auto';
  /** Show percentage label */
  showLabel?: boolean;
  /** Custom label format */
  labelFormat?: (value: number, max: number) => string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Animated fill */
  animated?: boolean;
}

// ============================================
// Loading Types
// ============================================

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';

export interface LoadingSpinnerProps {
  /** Spinner size */
  size?: SpinnerSize;
  /** Color */
  color?: OrionColor;
  /** Screen reader label */
  label?: string;
}

// ============================================
// Avatar Types
// ============================================

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  /** Image source URL */
  src?: string;
  /** Alt text / User name */
  alt: string;
  /** Avatar size */
  size?: AvatarSize;
  /** Fallback content (initials or icon) */
  fallback?: ReactNode;
  /** Status indicator */
  status?: 'online' | 'offline' | 'busy' | 'away';
}

// ============================================
// Tooltip Types
// ============================================

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  /** Trigger element */
  children: ReactNode;
  /** Tooltip content */
  content: ReactNode;
  /** Position relative to trigger */
  position?: TooltipPosition;
  /** Delay before showing (ms) */
  delay?: number;
}

// ============================================
// Status Indicator Types
// ============================================

export interface StatusDotProps {
  /** Status variant */
  status: StatusVariant;
  /** Pulse animation */
  pulse?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Screen reader label */
  label?: string;
}

// ============================================
// KPI Card Types
// ============================================

export interface KPICardProps {
  /** Card title/label */
  label: string;
  /** Main value to display */
  value: string | number;
  /** Trend direction */
  trend?: 'up' | 'down' | 'neutral';
  /** Trend value (e.g., "+5%") */
  trendValue?: string;
  /** Icon to display */
  icon?: ReactNode;
  /** Accent color */
  color?: OrionColor;
  /** Loading state */
  loading?: boolean;
}
