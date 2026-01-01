/**
 * OnboardingComplete Component Tests
 * @governance COMPONENT-001
 *
 * Test Types:
 * 1. Unit Tests - Summary rendering, progress, completion
 * 2. Integration Tests - API interactions
 * 3. Accessibility Tests - WCAG 2.1 AA compliance
 * 4. Performance Tests - Render time < 100ms
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { OnboardingComplete } from '../OnboardingComplete';
import type { OnboardingCompleteProps, SelectedProject } from '../types';

// Extend expect with accessibility matchers
expect.extend(toHaveNoViolations);

// ============================================================================
// TEST FIXTURES
// ============================================================================

// OnboardingComplete uses SelectedProject (id, name, code) not P6Project
const mockSelectedProjects: SelectedProject[] = [
  {
    id: 1,
    name: 'ACME Refinery Expansion',
    code: 'ACME-REF-001',
  },
  {
    id: 2,
    name: 'Offshore Platform Alpha',
    code: 'OFF-PLT-A',
  },
];

const defaultProps: OnboardingCompleteProps = {
  selectedProjects: mockSelectedProjects,
  p6Config: {
    wsdlBaseUrl: 'https://p6.acme-epc.com/p6ws/services/',
    databaseInstance: 'PMDB',
    username: 'admin',
    password: 'secret123',
  },
  sapConfig: {
    hostUrl: 'https://hana.acme-epc.com:30015',
    systemId: 'PRD',
    client: '100',
    username: 'sapuser',
    password: 'sapsecret123',
  },
  onComplete: vi.fn(),
  onBack: vi.fn(),
};

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// ============================================================================
// UNIT TESTS
// ============================================================================

describe('OnboardingComplete - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  describe('Rendering', () => {
    it('displays step indicator showing step 5 of 5', () => {
      render(<OnboardingComplete {...defaultProps} />);

      // The ProgressIndicator renders "STEP X OF Y" in a badge
      // Use getAllByText since step number appears in multiple places (badge + step circle)
      expect(screen.getByText('STEP')).toBeInTheDocument();
      expect(screen.getAllByText('5').length).toBeGreaterThan(0);
      expect(screen.getByText('OF 5')).toBeInTheDocument();
    });

    it('shows configuration summary', () => {
      render(<OnboardingComplete {...defaultProps} />);

      expect(screen.getByText(/p6 connection/i)).toBeInTheDocument();
      expect(screen.getByText(/sap connection/i)).toBeInTheDocument();
      expect(screen.getByText(/selected projects/i)).toBeInTheDocument();
    });

    it('displays selected project count', () => {
      render(<OnboardingComplete {...defaultProps} />);

      expect(screen.getByText(/2 projects/i)).toBeInTheDocument();
    });

    it('lists selected project names', () => {
      render(<OnboardingComplete {...defaultProps} />);

      expect(screen.getByText('ACME Refinery Expansion')).toBeInTheDocument();
      expect(screen.getByText('Offshore Platform Alpha')).toBeInTheDocument();
    });

    it('shows P6 server URL (masked credentials)', () => {
      render(<OnboardingComplete {...defaultProps} />);

      expect(screen.getByText(/p6\.acme-epc\.com/i)).toBeInTheDocument();
      // Password should NOT be visible
      expect(screen.queryByText('secret123')).not.toBeInTheDocument();
    });

    it('shows SAP server URL (masked credentials)', () => {
      render(<OnboardingComplete {...defaultProps} />);

      expect(screen.getByText(/hana\.acme-epc\.com/i)).toBeInTheDocument();
      // Password should NOT be visible
      expect(screen.queryByText('sapsecret123')).not.toBeInTheDocument();
    });

    it('renders Back and Complete Setup buttons', () => {
      render(<OnboardingComplete {...defaultProps} />);

      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /complete setup/i })).toBeInTheDocument();
    });
  });

  describe('User Interaction', () => {
    it('calls onBack when Back button is clicked', async () => {
      const onBack = vi.fn();
      const user = userEvent.setup();
      render(<OnboardingComplete {...defaultProps} onBack={onBack} />);

      await user.click(screen.getByRole('button', { name: /back/i }));

      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('initiates sync when Complete Setup is clicked', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            message: 'Onboarding complete',
          }),
      });

      const user = userEvent.setup();
      render(<OnboardingComplete {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /complete setup/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });

    it('shows loading state during sync', async () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));

      const user = userEvent.setup();
      render(<OnboardingComplete {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /complete setup/i }));

      // Multiple spinners may exist (in button and status area)
      const spinners = screen.getAllByTestId('loading-spinner');
      expect(spinners.length).toBeGreaterThanOrEqual(1);
    });

    it('disables buttons during sync', async () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));

      const user = userEvent.setup();
      render(<OnboardingComplete {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /complete setup/i }));

      // Button text changes to "Completing Setup..." during loading
      expect(screen.getByRole('button', { name: /completing setup/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /back/i })).toBeDisabled();
    });
  });

  describe('Completion States', () => {
    it('shows success message after sync completes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            message: 'Onboarding complete',
          }),
      });

      const user = userEvent.setup();
      render(<OnboardingComplete {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /complete setup/i }));

      // The heading is split: "Setup " + <span>"Complete!"</span>
      // Use function matcher to find text across elements
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: (_, element) => {
            return element?.textContent?.toLowerCase().includes('setup') &&
                   element?.textContent?.toLowerCase().includes('complete');
          }})
        ).toBeInTheDocument();
      });
    });

    it('shows "Go to Dashboard" button after completion', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            message: 'Onboarding complete',
          }),
      });

      const user = userEvent.setup();
      render(<OnboardingComplete {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /complete setup/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /go to dashboard/i })).toBeInTheDocument();
      });
    });

    it('calls onComplete when dashboard button is clicked', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            message: 'Onboarding complete',
          }),
      });

      const onComplete = vi.fn();
      const user = userEvent.setup();
      render(<OnboardingComplete {...defaultProps} onComplete={onComplete} />);

      await user.click(screen.getByRole('button', { name: /complete setup/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /go to dashboard/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /go to dashboard/i }));

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('shows error message on sync failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const user = userEvent.setup();
      render(<OnboardingComplete {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /complete setup/i }));

      await waitFor(() => {
        expect(screen.getByText(/failed/i)).toBeInTheDocument();
      });
    });

    it('provides retry button on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const user = userEvent.setup();
      render(<OnboardingComplete {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /complete setup/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });
    });
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('OnboardingComplete - Accessibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<OnboardingComplete {...defaultProps} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('announces sync progress to screen readers', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    const user = userEvent.setup();
    render(<OnboardingComplete {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /complete setup/i }));

    // Look for any status element - there may be multiple due to ProgressIndicator
    const statusElements = screen.getAllByRole('status');
    expect(statusElements.length).toBeGreaterThan(0);
  });

  it('announces completion to screen readers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          message: 'Onboarding complete',
        }),
    });

    const user = userEvent.setup();
    render(<OnboardingComplete {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /complete setup/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('supports keyboard navigation', async () => {
    render(<OnboardingComplete {...defaultProps} />);

    const backButton = screen.getByRole('button', { name: /back/i });
    backButton.focus();

    await userEvent.tab();
    expect(screen.getByRole('button', { name: /complete setup/i })).toHaveFocus();
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('OnboardingComplete - Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('calls the correct API endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const user = userEvent.setup();
    render(<OnboardingComplete {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /complete setup/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/onboarding/complete',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.any(String),
        })
      );
    });
  });

  it('sends correct configuration data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const user = userEvent.setup();
    render(<OnboardingComplete {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /complete setup/i }));

    await waitFor(() => {
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody).toEqual({
        p6Config: defaultProps.p6Config,
        sapConfig: defaultProps.sapConfig,
        selectedProjectIds: mockSelectedProjects.map((p) => p.id),
      });
    });
  });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

describe('OnboardingComplete - Performance Tests', () => {
  it('renders under 100ms', () => {
    const start = performance.now();
    render(<OnboardingComplete {...defaultProps} />);
    const end = performance.now();

    const renderTime = end - start;
    expect(renderTime).toBeLessThan(100);
  });
});

// ============================================================================
// SNAPSHOT TESTS
// ============================================================================

describe('OnboardingComplete - Snapshot Tests', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('matches snapshot for initial state', () => {
    const { container } = render(<OnboardingComplete {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for completion state', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const user = userEvent.setup();
    const { container } = render(<OnboardingComplete {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /complete setup/i }));

    // Text is split: "Setup " + <span>"Complete!"</span> - use heading role with function matcher
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: (_, element) => {
          return element?.textContent?.toLowerCase().includes('setup') &&
                 element?.textContent?.toLowerCase().includes('complete');
        }})
      ).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});
