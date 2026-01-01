/**
 * P6ConnectionForm Component Tests
 * @governance COMPONENT-001
 *
 * Test Types:
 * 1. Unit Tests - Form rendering, validation, state
 * 2. Integration Tests - API interactions
 * 3. Accessibility Tests - WCAG 2.1 AA compliance
 * 4. Performance Tests - Render time < 100ms
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { P6ConnectionForm } from '../P6ConnectionForm';
import type { P6ConnectionFormProps, P6ConnectionState } from '../types';

// Extend expect with accessibility matchers
expect.extend(toHaveNoViolations);

// ============================================================================
// TEST FIXTURES
// ============================================================================

const defaultProps: P6ConnectionFormProps = {
  onNext: vi.fn(),
  onBack: vi.fn(),
};

const validFormData: Partial<P6ConnectionState> = {
  wsdlBaseUrl: 'https://p6.acme-epc.com/p6ws/services/',
  databaseInstance: 'PMDB',
  username: 'admin',
  password: 'secret123',
};

const mockTestSuccess = {
  success: true,
  message: 'Connection successful',
  projectCount: 42,
  databaseVersion: 'P6 EPPM 21.12',
  latencyMs: 150,
};

const mockTestFailure = {
  success: false,
  message: 'Authentication failed: Invalid credentials',
};

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// ============================================================================
// UNIT TESTS
// ============================================================================

describe('P6ConnectionForm - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  describe('Rendering', () => {
    it('renders all form fields', () => {
      render(<P6ConnectionForm {...defaultProps} />);

      expect(screen.getByLabelText(/wsdl.*url/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/database.*instance/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('renders Test Connection button', () => {
      render(<P6ConnectionForm {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /test connection/i })
      ).toBeInTheDocument();
    });

    it('renders Back and Continue buttons', () => {
      render(<P6ConnectionForm {...defaultProps} />);

      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /continue/i })
      ).toBeInTheDocument();
    });

    it('displays step indicator showing step 2 of 5', () => {
      render(<P6ConnectionForm {...defaultProps} />);

      expect(screen.getByText(/step 2/i)).toBeInTheDocument();
      expect(screen.getByText(/of 5/i)).toBeInTheDocument();
    });

    it('masks password field', () => {
      render(<P6ConnectionForm {...defaultProps} />);

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('shows placeholder with WSDL URL example', () => {
      render(<P6ConnectionForm {...defaultProps} />);

      const wsdlInput = screen.getByLabelText(/wsdl.*url/i);
      expect(wsdlInput).toHaveAttribute(
        'placeholder',
        expect.stringMatching(/https:\/\/.*p6ws/i)
      );
    });
  });

  describe('Form Validation', () => {
    it('validates WSDL URL format', async () => {
      const user = userEvent.setup();
      render(<P6ConnectionForm {...defaultProps} />);

      const wsdlInput = screen.getByLabelText(/wsdl.*url/i);
      await user.type(wsdlInput, 'not-a-valid-url');
      await user.tab(); // Trigger blur

      expect(screen.getByText(/valid.*url/i)).toBeInTheDocument();
    });

    it('requires all fields before test connection', async () => {
      const user = userEvent.setup();
      render(<P6ConnectionForm {...defaultProps} />);

      const testButton = screen.getByRole('button', { name: /test connection/i });
      await user.click(testButton);

      // Should show all 4 required field errors
      const requiredErrors = screen.getAllByText(/required/i);
      expect(requiredErrors.length).toBe(4);
    });

    it('clears validation errors when field is corrected', async () => {
      const user = userEvent.setup();
      render(<P6ConnectionForm {...defaultProps} />);

      const wsdlInput = screen.getByLabelText(/wsdl.*url/i);
      await user.type(wsdlInput, 'not-valid');
      await user.tab();

      expect(screen.getByText(/valid.*url/i)).toBeInTheDocument();

      await user.clear(wsdlInput);
      await user.type(wsdlInput, 'https://p6.example.com/p6ws/services/');
      await user.tab();

      expect(screen.queryByText(/valid.*url/i)).not.toBeInTheDocument();
    });

    it('validates database instance is not empty', async () => {
      const user = userEvent.setup();
      render(<P6ConnectionForm {...defaultProps} />);

      const dbInput = screen.getByLabelText(/database.*instance/i);
      await user.click(dbInput);
      await user.tab();

      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });
  });

  describe('User Interaction', () => {
    it('calls onBack when Back button is clicked', async () => {
      const onBack = vi.fn();
      const user = userEvent.setup();
      render(<P6ConnectionForm {...defaultProps} onBack={onBack} />);

      await user.click(screen.getByRole('button', { name: /back/i }));

      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('disables Continue button until connection is tested', () => {
      render(<P6ConnectionForm {...defaultProps} />);

      const continueButton = screen.getByRole('button', { name: /continue/i });
      expect(continueButton).toBeDisabled();
    });

    it('enables Continue button after successful connection test', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTestSuccess),
      });

      const user = userEvent.setup();
      render(<P6ConnectionForm {...defaultProps} initialState={validFormData} />);

      const testButton = screen.getByRole('button', { name: /test connection/i });
      await user.click(testButton);

      await waitFor(() => {
        const continueButton = screen.getByRole('button', { name: /continue/i });
        expect(continueButton).not.toBeDisabled();
      });
    });

    it('shows loading state during connection test', async () => {
      mockFetch.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      const user = userEvent.setup();
      render(<P6ConnectionForm {...defaultProps} initialState={validFormData} />);

      const testButton = screen.getByRole('button', { name: /test connection/i });
      await user.click(testButton);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(testButton).toBeDisabled();
    });
  });

  describe('Connection Test Results', () => {
    it('displays success message with project count', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTestSuccess),
      });

      const user = userEvent.setup();
      render(<P6ConnectionForm {...defaultProps} initialState={validFormData} />);

      await user.click(screen.getByRole('button', { name: /test connection/i }));

      await waitFor(() => {
        expect(screen.getByText(/connection successful/i)).toBeInTheDocument();
        expect(screen.getByText(/42.*projects/i)).toBeInTheDocument();
      });
    });

    it('displays error message on connection failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTestFailure),
      });

      const user = userEvent.setup();
      render(<P6ConnectionForm {...defaultProps} initialState={validFormData} />);

      await user.click(screen.getByRole('button', { name: /test connection/i }));

      await waitFor(() => {
        expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
      });
    });

    it('displays network error on fetch failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const user = userEvent.setup();
      render(<P6ConnectionForm {...defaultProps} initialState={validFormData} />);

      await user.click(screen.getByRole('button', { name: /test connection/i }));

      await waitFor(() => {
        expect(screen.getByText(/network.*error/i)).toBeInTheDocument();
      });
    });

    it('shows latency in success message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTestSuccess),
      });

      const user = userEvent.setup();
      render(<P6ConnectionForm {...defaultProps} initialState={validFormData} />);

      await user.click(screen.getByRole('button', { name: /test connection/i }));

      await waitFor(() => {
        expect(screen.getByText(/150.*ms/i)).toBeInTheDocument();
      });
    });
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('P6ConnectionForm - Accessibility Tests', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<P6ConnectionForm {...defaultProps} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper labels for all form fields', () => {
    render(<P6ConnectionForm {...defaultProps} />);

    const wsdlInput = screen.getByLabelText(/wsdl.*url/i);
    const dbInput = screen.getByLabelText(/database.*instance/i);
    const userInput = screen.getByLabelText(/username/i);
    const passInput = screen.getByLabelText(/password/i);

    expect(wsdlInput).toHaveAccessibleName();
    expect(dbInput).toHaveAccessibleName();
    expect(userInput).toHaveAccessibleName();
    expect(passInput).toHaveAccessibleName();
  });

  it('associates error messages with form fields', async () => {
    const user = userEvent.setup();
    render(<P6ConnectionForm {...defaultProps} />);

    const testButton = screen.getByRole('button', { name: /test connection/i });
    await user.click(testButton);

    const wsdlInput = screen.getByLabelText(/wsdl.*url/i);
    expect(wsdlInput).toHaveAccessibleDescription(/required/i);
  });

  it('supports keyboard navigation', async () => {
    render(<P6ConnectionForm {...defaultProps} />);

    const wsdlInput = screen.getByLabelText(/wsdl.*url/i);
    wsdlInput.focus();

    // Tab through all fields
    await userEvent.tab();
    expect(screen.getByLabelText(/database.*instance/i)).toHaveFocus();

    await userEvent.tab();
    expect(screen.getByLabelText(/username/i)).toHaveFocus();

    await userEvent.tab();
    expect(screen.getByLabelText(/password/i)).toHaveFocus();
  });

  it('announces loading state to screen readers', async () => {
    mockFetch.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    const user = userEvent.setup();
    render(<P6ConnectionForm {...defaultProps} initialState={validFormData} />);

    await user.click(screen.getByRole('button', { name: /test connection/i }));

    // Look for the specific loading status message
    const statusElements = screen.getAllByRole('status');
    const loadingStatus = statusElements.find(el => el.textContent?.toLowerCase().includes('testing'));
    expect(loadingStatus).toBeInTheDocument();
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('P6ConnectionForm - Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('calls the correct API endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTestSuccess),
    });

    const user = userEvent.setup();
    render(<P6ConnectionForm {...defaultProps} initialState={validFormData} />);

    await user.click(screen.getByRole('button', { name: /test connection/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/onboarding/p6/test',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.any(String),
        })
      );
    });
  });

  it('sends correct form data in request body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTestSuccess),
    });

    const user = userEvent.setup();
    render(<P6ConnectionForm {...defaultProps} initialState={validFormData} />);

    await user.click(screen.getByRole('button', { name: /test connection/i }));

    await waitFor(() => {
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody).toEqual({
        wsdlBaseUrl: validFormData.wsdlBaseUrl,
        databaseInstance: validFormData.databaseInstance,
        username: validFormData.username,
        password: validFormData.password,
      });
    });
  });

  it('calls onNext with form data after successful test and continue', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTestSuccess),
    });

    const onNext = vi.fn();
    const user = userEvent.setup();
    render(
      <P6ConnectionForm
        {...defaultProps}
        onNext={onNext}
        initialState={validFormData}
      />
    );

    await user.click(screen.getByRole('button', { name: /test connection/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /continue/i })).not.toBeDisabled();
    });

    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(onNext).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

describe('P6ConnectionForm - Performance Tests', () => {
  it('renders under 100ms', () => {
    const start = performance.now();
    render(<P6ConnectionForm {...defaultProps} />);
    const end = performance.now();

    const renderTime = end - start;
    expect(renderTime).toBeLessThan(100);
  });

  it('does not cause unnecessary re-renders on typing', async () => {
    const renderCount = vi.fn();

    const TrackedComponent = () => {
      renderCount();
      return <P6ConnectionForm {...defaultProps} />;
    };

    const user = userEvent.setup();
    render(<TrackedComponent />);

    const initialRenderCount = renderCount.mock.calls.length;

    // Type in field
    const wsdlInput = screen.getByLabelText(/wsdl.*url/i);
    await user.type(wsdlInput, 'https://test.com');

    // Should not cause excessive re-renders (allow some for controlled input)
    const totalRenders = renderCount.mock.calls.length;
    expect(totalRenders - initialRenderCount).toBeLessThan(20);
  });
});

// ============================================================================
// SNAPSHOT TESTS
// ============================================================================

describe('P6ConnectionForm - Snapshot Tests', () => {
  it('matches snapshot for initial state', () => {
    const { container } = render(<P6ConnectionForm {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with validation errors', async () => {
    const user = userEvent.setup();
    const { container } = render(<P6ConnectionForm {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /test connection/i }));

    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with success result', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTestSuccess),
    });

    const user = userEvent.setup();
    const { container } = render(
      <P6ConnectionForm {...defaultProps} initialState={validFormData} />
    );

    await user.click(screen.getByRole('button', { name: /test connection/i }));

    await waitFor(() => {
      expect(screen.getByText(/connection successful/i)).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});
