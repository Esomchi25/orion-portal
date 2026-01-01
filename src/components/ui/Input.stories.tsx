/**
 * Input Component Stories
 * @governance UX-001, COMPONENT-001
 * @design-system ORION Command Center
 *
 * Visual documentation and regression testing for Input component.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'ORION/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Premium input component with glassmorphism effects and validation states.

**Features:**
- JetBrains Mono font for technical inputs
- Smooth focus transition with cyan glow
- Error/success states with appropriate colors
- Glass morphism background
- Left/right addon support
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Input size',
    },
    state: {
      control: 'select',
      options: ['default', 'error', 'success'],
      description: 'Validation state',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable input',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

// Default Input
export const Default: Story = {
  args: {
    placeholder: 'Enter value...',
    size: 'md',
    state: 'default',
  },
};

// With Value
export const WithValue: Story = {
  args: {
    defaultValue: 'https://p6.company.com/wsdl',
    size: 'md',
    state: 'default',
  },
};

// URL Input with Icon
export const URLInput: Story = {
  args: {
    placeholder: 'Enter P6 WSDL URL...',
    size: 'md',
    leftAddon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
};

// Password Input
export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password...',
    size: 'md',
    leftAddon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
};

// Error State
export const Error: Story = {
  args: {
    defaultValue: 'invalid-url',
    state: 'error',
    size: 'md',
    'aria-describedby': 'error-message',
  },
  decorators: [
    (Story) => (
      <div className="space-y-2">
        <Story />
        <p id="error-message" className="text-sm text-red-400">
          Please enter a valid URL
        </p>
      </div>
    ),
  ],
};

// Success State
export const Success: Story = {
  args: {
    defaultValue: 'https://p6.company.com/wsdl',
    state: 'success',
    size: 'md',
  },
  decorators: [
    (Story) => (
      <div className="space-y-2">
        <Story />
        <p className="text-sm text-[var(--orion-emerald)]">
          ✓ Connection verified
        </p>
      </div>
    ),
  ],
};

// Disabled State
export const Disabled: Story = {
  args: {
    defaultValue: 'Read-only value',
    disabled: true,
    size: 'md',
  },
};

// Size Comparison
export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input size="sm" placeholder="Small input" />
      <Input size="md" placeholder="Medium input" />
      <Input size="lg" placeholder="Large input" />
    </div>
  ),
};

// Form Field Pattern
export const FormField: Story = {
  render: () => (
    <div className="space-y-1.5 w-80">
      <label
        htmlFor="wsdl-url"
        className="text-sm font-medium text-[var(--orion-text-primary)]"
      >
        P6 WSDL URL <span className="text-red-400">*</span>
      </label>
      <Input
        id="wsdl-url"
        placeholder="https://p6.example.com/p6ws/services"
        size="md"
        leftAddon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        }
      />
      <p className="text-xs text-[var(--orion-text-muted)]">
        The endpoint for your Oracle Primavera P6 web services
      </p>
    </div>
  ),
};

// All States
export const AllStates: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <label className="text-sm text-[var(--orion-text-secondary)] mb-1 block">Default</label>
        <Input placeholder="Default state" state="default" />
      </div>
      <div>
        <label className="text-sm text-[var(--orion-text-secondary)] mb-1 block">Error</label>
        <Input defaultValue="Invalid input" state="error" />
      </div>
      <div>
        <label className="text-sm text-[var(--orion-text-secondary)] mb-1 block">Success</label>
        <Input defaultValue="Valid input" state="success" />
      </div>
      <div>
        <label className="text-sm text-[var(--orion-text-secondary)] mb-1 block">Disabled</label>
        <Input defaultValue="Disabled input" disabled />
      </div>
    </div>
  ),
};
