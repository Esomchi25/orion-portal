/**
 * SAPConnectionForm Component Tests
 * @governance COMPONENT-001
 *
 * Test Types:
 * 1. Unit Tests - Form rendering, validation, state
 * 2. Integration Tests - API interactions
 * 3. Accessibility Tests - WCAG 2.1 AA compliance
 * 4. Performance Tests - Render time < 100ms
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { SAPConnectionForm } from '../SAPConnectionForm';
import type { SAPConnectionFormProps, SAPConnectionState } from '../types';

// Extend expect with accessibility matchers
expect.extend(toHaveNoViolations);

// ============================================================================
// TEST FIXTURES
// ============================================================================

const defaultProps: SAPConnectionFormProps = {
  onNext: vi.fn(),
  onBack: vi.fn(),
};

const validFormData: Partial<SAPConnectionState> = {
  hostUrl: 'https://hana.acme-epc.com:30015',
  systemId: 'PRD',
  client: '100',
  username: 'sapuser',
  password: 'sapsecret123',
};

const mockTestSuccess = {
  success: true,
  message: 'Connection successful',
  tableCount: 156,
  connectionType: 'HANA' as const,
  latencyMs: 85,
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

describe('SAPConnectionForm - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  describe('Rendering', () => {
    it('renders all form fields', () => {
      render(<SAPConnectionForm {...defaultProps} />);

      expect(screen.getByLabelText(/host.*url/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/system.*id/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/client/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('renders Test Connection button', () => {
      render(<SAPConnectionForm {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /test connection/i })
      ).toBeInTheDocument();
    });

    it('renders Back and Continue buttons', () => {
      render(<SAPConnectionForm {...defaultProps} />);

      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /continue/i })
      ).toBeInTheDocument();
    });

    it('displays step indicator showing step 3 of 5', () => {
      render(<SAPConnectionForm {...defaultProps} />);

      expect(screen.getByText(/step 3/i)).toBeInTheDocument();
      expect(screen.getByText(/of 5/i)).toBeInTheDocument();
    });

    it('masks password field', () => {
      render(<SAPConnectionForm {...defaultProps} />);

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('shows placeholder with SAP host URL example', () => {
      render(<SAPConnectionForm {...defaultProps} />);

      const hostInput = screen.getByLabelText(/host.*url/i);
      expect(hostInput).toHaveAttribute(
        'placeholder',
        expect.stringMatching(/https:\/\/.*hana/i)
      );
    });

    it('shows placeholder for client number', () => {
      render(<SAPConnectionForm {...defaultProps} />);

      const clientInput = screen.getByLabelText(/client/i);
      expect(clientInput).toHaveAttribute('placeholder', '100');
    });
  });

  describe('Form Validation', () => {
    it('validates Host URL format', async () => {
      const user = userEvent.setup();
      render(<SAPConnectionForm {...defaultProps} />);

      const hostInput = screen.getByLabelText(/host.*url/i);
      await user.type(hostInput, 'not-a-valid-url');
      await user.tab(); // Trigger blur

      expect(screen.getByText(/valid.*url/i)).toBeInTheDocument();
    });

    it('requires all fields before test connection', async () => {
      const user = userEvent.setup();
      render(<SAPConnectionForm {...defaultProps} />);

      const testButton = screen.getByRole('button', { name: /test connection/i });
      await user.click(testButton);

      // Should show all 5 required field errors
      const requiredErrors = screen.getAllByText(/required/i);
      expect(requiredErrors.length).toBe(5);
    });

    it('validates client is numeric', async () => {
      const user = userEvent.setup();
      render(<SAPConnectionForm {...defaultProps} />);

      const clientInput = screen.getByLabelText(/client/i);
      await user.type(clientInput, 'abc');
      await user.tab();

      expect(screen.getByText(/numeric/i)).toBeInTheDocument();
    });

    it('clears validation errors when field is corrected', async () => {
      const user = userEvent.setup();
      render(<SAPConnectionForm {...defaultProps} />);

      const hostInput = screen.getByLabelText(/host.*url/i);
      await user.type(hostInput, 'not-valid');
      await user.tab();

      expect(screen.getByText(/valid.*url/i)).toBeInTheDocument();

      await user.clear(hostInput);
      await user.type(hostInput, 'https://hana.example.com:30015');
      await user.tab();

      expect(screen.queryByText(/valid.*url/i)).not.toBeInTheDocument();
    });

    it('validates System ID is 3 characters', async () => {
      const user = userEvent.setup();
      render(<SAPConnectionForm {...defaultProps} />);

      const sidInput = screen.getByLabelText(/system.*id/i);
      await user.type(sidInput, 'AB');
      await user.tab();

      expect(screen.getByText(/3 characters/i)).toBeInTheDocument();
    });
  });

  describe('User Interaction', () => {
    it('calls onBack when Back button is clicked', async () => {
      const onBack = vi.fn();
      const user = userEvent.setup();
      render(<SAPConnectionForm {...defaultProps} onBack={onBack} />);

      await user.click(screen.getByRole('button', { name: /back/i }));

      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('disables Continue button until connection is tested', () => {
      render(<SAPConnectionForm {...defaultProps} />);

      const continueButton = screen.getByRole('button', { name: /continue/i });
      expect(continueButton).toBeDisabled();
    });

    it('enables Continue button after successful connection test', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTestSuccess),
      });

      const user = userEvent.setup();
      render(<SAPConnectionForm {...defaultProps} initialState={validFormData} />);

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
      render(<SAPConnectionForm {...defaultProps} initialState={validFormData} />);

      const testButton = screen.getByRole('button', { name: /test connection/i });
      await user.click(testButton);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(testButton).toBeDisabled();
    });
  });

  describe('Connection Test Results', () => {
    it('displays success message with table count', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTestSuccess),
      });

      const user = userEvent.setup();
      render(<SAPConnectionForm {...defaultProps} initialState={validFormData} />);

      await user.click(screen.getByRole('button', { name: /test connection/i }));

      await waitFor(() => {
        expect(screen.getByText(/connection successful/i)).toBeInTheDocument();
        expect(screen.getByText(/156.*tables/i)).toBeInTheDocument();
      });
    });

    it('displays connection type (HANA)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTestSuccess),
      });

      const user = userEvent.setup();
      render(<SAPConnectionForm {...defaultProps} initialState={validFormData} />);

      await user.click(screen.getByRole('button', { name: /test connection/i }));

      await waitFor(() => {
        // Specifically look for "Connection: HANA" text
        expect(screen.getByText(/connection:.*hana/i)).toBeInTheDocument();
      });
    });

    it('displays error message on connection failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTestFailure),
      });

      const user = userEvent.setup();
      render(<SAPConnectionForm {...defaultProps} initialState={validFormData} />);

      await user.click(screen.getByRole('button', { name: /test connection/i }));

      await waitFor(() => {
        expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
      });
    });

    it('displays network error on fetch failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const user = userEvent.setup();
      render(<SAPConnectionForm {...defaultProps} initialState={validFormData} />);

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
      render(<SAPConnectionForm {...defaultProps} initialState={validFormData} />);

      await user.click(screen.getByRole('button', { name: /test connection/i }));

      await waitFor(() => {
        expect(screen.getByText(/85.*ms/i)).toBeInTheDocument();
      });
    });
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('SAPConnectionForm - Accessibility Tests', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<SAPConnectionForm {...defaultProps} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper labels for all form fields', () => {
    render(<SAPConnectionForm {...defaultProps} />);

    const hostInput = screen.getByLabelText(/host.*url/i);
    const sidInput = screen.getByLabelText(/system.*id/i);
    const clientInput = screen.getByLabelText(/client/i);
    const userInput = screen.getByLabelText(/username/i);
    const passInput = screen.getByLabelText(/password/i);

    expect(hostInput).toHaveAccessibleName();
    expect(sidInput).toHaveAccessibleName();
    expect(clientInput).toHaveAccessibleName();
    expect(userInput).toHaveAccessibleName();
    expect(passInput).toHaveAccessibleName();
  });

  it('associates error messages with form fields', async () => {
    const user = userEvent.setup();
    render(<SAPConnectionForm {...defaultProps} />);

    const testButton = screen.getByRole('button', { name: /test connection/i });
    await user.click(testButton);

    const hostInput = screen.getByLabelText(/host.*url/i);
    expect(hostInput).toHaveAccessibleDescription(/required/i);
  });

  it('supports keyboard navigation', async () => {
    render(<SAPConnectionForm {...defaultProps} />);

    const hostInput = screen.getByLabelText(/host.*url/i);
    hostInput.focus();

    // Tab through all fields
    await userEvent.tab();
    expect(screen.getByLabelText(/system.*id/i)).toHaveFocus();

    await userEvent.tab();
    expect(screen.getByLabelText(/client/i)).toHaveFocus();

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
    render(<SAPConnectionForm {...defaultProps} initialState={validFormData} />);

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

describe('SAPConnectionForm - Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('calls the correct API endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTestSuccess),
    });

    const user = userEvent.setup();
    render(<SAPConnectionForm {...defaultProps} initialState={validFormData} />);

    await user.click(screen.getByRole('button', { name: /test connection/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/onboarding/sap/test',
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
    render(<SAPConnectionForm {...defaultProps} initialState={validFormData} />);

    await user.click(screen.getByRole('button', { name: /test connection/i }));

    await waitFor(() => {
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody).toEqual({
        hostUrl: validFormData.hostUrl,
        systemId: validFormData.systemId,
        client: validFormData.client,
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
      <SAPConnectionForm
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

describe('SAPConnectionForm - Performance Tests', () => {
  it('renders under 100ms', () => {
    const start = performance.now();
    render(<SAPConnectionForm {...defaultProps} />);
    const end = performance.now();

    const renderTime = end - start;
    expect(renderTime).toBeLessThan(100);
  });

  it('does not cause unnecessary re-renders on typing', async () => {
    const renderCount = vi.fn();

    const TrackedComponent = () => {
      renderCount();
      return <SAPConnectionForm {...defaultProps} />;
    };

    const user = userEvent.setup();
    render(<TrackedComponent />);

    const initialRenderCount = renderCount.mock.calls.length;

    // Type in field
    const hostInput = screen.getByLabelText(/host.*url/i);
    await user.type(hostInput, 'https://test.com');

    // Should not cause excessive re-renders (allow some for controlled input)
    const totalRenders = renderCount.mock.calls.length;
    expect(totalRenders - initialRenderCount).toBeLessThan(20);
  });
});

// ============================================================================
// SNAPSHOT TESTS
// ============================================================================

describe('SAPConnectionForm - Snapshot Tests', () => {
  it('matches snapshot for initial state', () => {
    const { container } = render(<SAPConnectionForm {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with validation errors', async () => {
    const user = userEvent.setup();
    const { container } = render(<SAPConnectionForm {...defaultProps} />);

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
      <SAPConnectionForm {...defaultProps} initialState={validFormData} />
    );

    await user.click(screen.getByRole('button', { name: /test connection/i }));

    await waitFor(() => {
      expect(screen.getByText(/connection successful/i)).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});
