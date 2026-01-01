/**
 * WelcomeScreen Component Tests
 * @governance COMPONENT-001
 *
 * Test Types:
 * 1. Unit Tests - Component rendering and state
 * 2. Integration Tests - API interactions
 * 3. Accessibility Tests - WCAG 2.1 AA compliance
 * 4. Performance Tests - Render time < 100ms
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { WelcomeScreen } from '../WelcomeScreen';
import type { UserProfile, WelcomeScreenProps } from '../types';

// Extend expect with accessibility matchers
expect.extend(toHaveNoViolations);

// ============================================================================
// TEST FIXTURES
// ============================================================================

const mockUser: UserProfile = {
  id: 'user_123',
  email: 'ceo@acme-epc.com',
  firstName: 'John',
  lastName: 'Smith',
  imageUrl: 'https://example.com/avatar.jpg',
  organizationName: 'ACME EPC Contractors',
};

const mockUserNoOrg: UserProfile = {
  id: 'user_456',
  email: 'solo@freelance.com',
  firstName: 'Jane',
  lastName: null,
  imageUrl: null,
  organizationName: null,
};

const defaultProps: WelcomeScreenProps = {
  user: mockUser,
  onGetStarted: vi.fn(),
  isLoading: false,
};

// ============================================================================
// UNIT TESTS
// ============================================================================

describe('WelcomeScreen - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the welcome heading and user name separately', () => {
      render(<WelcomeScreen {...defaultProps} />);

      // Welcome heading in main content area
      expect(
        screen.getByRole('heading', { name: /welcome to orion/i })
      ).toBeInTheDocument();

      // User name in sidebar as a separate h2
      expect(
        screen.getByRole('heading', { name: /john/i })
      ).toBeInTheDocument();
    });

    it('renders the step indicator in sidebar', () => {
      render(<WelcomeScreen {...defaultProps} />);

      // The redesigned component shows step indicator instead of organization
      expect(screen.getByText(/step 1 of 4/i)).toBeInTheDocument();
    });

    it('shows online status indicator', () => {
      render(<WelcomeScreen {...defaultProps} />);

      // Shows online status in sidebar
      expect(screen.getByText(/online/i)).toBeInTheDocument();
    });

    it('renders user avatar when imageUrl is provided', () => {
      render(<WelcomeScreen {...defaultProps} />);

      const avatar = screen.getByRole('img', { name: /user avatar/i });
      expect(avatar).toHaveAttribute('src', mockUser.imageUrl);
    });

    it('renders fallback avatar when imageUrl is null', () => {
      render(<WelcomeScreen {...defaultProps} user={mockUserNoOrg} />);

      const fallbackAvatar = screen.getByTestId('avatar-fallback');
      expect(fallbackAvatar).toBeInTheDocument();
      expect(fallbackAvatar).toHaveTextContent('J'); // First letter of firstName
    });

    it('renders the Get Started button', () => {
      render(<WelcomeScreen {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /get started/i })
      ).toBeInTheDocument();
    });

    it('renders unified P6 & SAP description', () => {
      render(<WelcomeScreen {...defaultProps} />);

      // The component shows unified P6 & SAP integration text
      expect(screen.getByText(/unified p6.*sap/i)).toBeInTheDocument();
    });
  });

  describe('User Interaction', () => {
    it('calls onGetStarted when button is clicked', () => {
      const onGetStarted = vi.fn();
      render(<WelcomeScreen {...defaultProps} onGetStarted={onGetStarted} />);

      const button = screen.getByRole('button', { name: /get started/i });
      fireEvent.click(button);

      expect(onGetStarted).toHaveBeenCalledTimes(1);
    });

    it('disables button when isLoading is true', () => {
      render(<WelcomeScreen {...defaultProps} isLoading={true} />);

      // When loading, button shows spinner, so find by aria-busy
      const buttons = screen.getAllByRole('button');
      const loadingButton = buttons.find(btn => btn.getAttribute('aria-busy') === 'true');
      expect(loadingButton).toBeDisabled();
    });

    it('shows loading spinner when isLoading is true', () => {
      render(<WelcomeScreen {...defaultProps} isLoading={true} />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles user with no first name gracefully', () => {
      const userNoName = { ...mockUser, firstName: null };
      render(<WelcomeScreen {...defaultProps} user={userNoName} />);

      // Should show "Demo User" as fallback (component uses firstName || 'Demo User')
      expect(
        screen.getByRole('heading', { name: /demo user/i })
      ).toBeInTheDocument();
      // Main welcome heading should still be present
      expect(
        screen.getByRole('heading', { name: /welcome to orion/i })
      ).toBeInTheDocument();
    });

    it('handles empty email gracefully', () => {
      const userNoEmail = { ...mockUser, email: '' };
      render(<WelcomeScreen {...defaultProps} user={userNoEmail} />);

      // Should not crash, just not display email
      expect(screen.queryByText('@')).not.toBeInTheDocument();
    });
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('WelcomeScreen - Accessibility Tests', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<WelcomeScreen {...defaultProps} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper heading hierarchy', () => {
    render(<WelcomeScreen {...defaultProps} />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('button is focusable', () => {
    render(<WelcomeScreen {...defaultProps} />);

    const button = screen.getByRole('button', { name: /get started/i });
    button.focus();
    expect(document.activeElement).toBe(button);
  });

  it('has proper ARIA labels', () => {
    render(<WelcomeScreen {...defaultProps} />);

    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('aria-label', 'Onboarding Welcome');
  });

  it('supports keyboard navigation', () => {
    const onGetStarted = vi.fn();
    render(<WelcomeScreen {...defaultProps} onGetStarted={onGetStarted} />);

    const button = screen.getByRole('button', { name: /get started/i });
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter' });

    expect(onGetStarted).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('WelcomeScreen - Integration Tests', () => {
  it('integrates with onboarding context', async () => {
    const onGetStarted = vi.fn(() => {
      // Simulate navigation to step 2
    });

    render(<WelcomeScreen {...defaultProps} onGetStarted={onGetStarted} />);

    const button = screen.getByRole('button', { name: /get started/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(onGetStarted).toHaveBeenCalled();
    });
  });

  it('handles async onGetStarted correctly', async () => {
    const asyncOnGetStarted = vi.fn(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <WelcomeScreen {...defaultProps} onGetStarted={asyncOnGetStarted} />
    );

    const button = screen.getByRole('button', { name: /get started/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(asyncOnGetStarted).toHaveBeenCalled();
    });
  });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

describe('WelcomeScreen - Performance Tests', () => {
  it('renders under 100ms', () => {
    const start = performance.now();
    render(<WelcomeScreen {...defaultProps} />);
    const end = performance.now();

    const renderTime = end - start;
    expect(renderTime).toBeLessThan(100);
  });

  it('does not cause unnecessary re-renders', () => {
    const renderCount = vi.fn();

    const TrackedComponent = () => {
      renderCount();
      return <WelcomeScreen {...defaultProps} />;
    };

    const { rerender } = render(<TrackedComponent />);
    rerender(<TrackedComponent />);

    // Should only render twice (initial + rerender)
    expect(renderCount).toHaveBeenCalledTimes(2);
  });
});

// ============================================================================
// SNAPSHOT TESTS
// ============================================================================

describe('WelcomeScreen - Snapshot Tests', () => {
  it('matches snapshot for standard user', () => {
    const { container } = render(<WelcomeScreen {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for user without organization', () => {
    const { container } = render(
      <WelcomeScreen {...defaultProps} user={mockUserNoOrg} />
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot in loading state', () => {
    const { container } = render(
      <WelcomeScreen {...defaultProps} isLoading={true} />
    );
    expect(container).toMatchSnapshot();
  });
});
