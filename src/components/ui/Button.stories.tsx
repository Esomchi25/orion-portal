/**
 * Button Component Stories
 * @governance UX-001, COMPONENT-001
 * @design-system ORION Command Center
 *
 * Visual documentation and regression testing for Button component.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'ORION/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Premium button component with ORION Command Center styling.
Supports multiple variants, sizes, and loading states.

**Accent Colors:**
- Cyan: Primary actions, sync operations
- Amber: P6/Schedule-related actions
- Emerald: SAP/Finance-related actions
- Violet: Analytics/AI actions
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading spinner',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable button interactions',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Primary Actions
export const Primary: Story = {
  args: {
    children: 'Continue',
    variant: 'primary',
    size: 'md',
  },
};

export const PrimaryLarge: Story = {
  args: {
    children: 'Start Onboarding',
    variant: 'primary',
    size: 'lg',
  },
};

// Secondary Actions
export const Secondary: Story = {
  args: {
    children: 'Back',
    variant: 'secondary',
    size: 'md',
  },
};

// Ghost (Subtle Actions)
export const Ghost: Story = {
  args: {
    children: 'Skip for now',
    variant: 'ghost',
    size: 'md',
  },
};

// Danger Actions
export const Danger: Story = {
  args: {
    children: 'Delete Project',
    variant: 'danger',
    size: 'md',
  },
};

// Loading State
export const Loading: Story = {
  args: {
    children: 'Testing Connection...',
    variant: 'primary',
    loading: true,
    size: 'md',
  },
};

// Disabled State
export const Disabled: Story = {
  args: {
    children: 'Unavailable',
    variant: 'primary',
    disabled: true,
    size: 'md',
  },
};

// With Icon
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Sync Now
      </>
    ),
    variant: 'primary',
    size: 'md',
  },
};

// Size Comparison
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm" variant="primary">Small</Button>
      <Button size="md" variant="primary">Medium</Button>
      <Button size="lg" variant="primary">Large</Button>
    </div>
  ),
};

// All Variants
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};

// Responsive Stacking (Mobile)
export const ResponsiveStack: Story = {
  render: () => (
    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
      <Button variant="secondary" className="flex-1">Back</Button>
      <Button variant="primary" className="flex-1">Continue</Button>
    </div>
  ),
  parameters: {
    viewport: { defaultViewport: 'mobile' },
  },
};
