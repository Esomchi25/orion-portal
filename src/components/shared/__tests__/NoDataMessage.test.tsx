/**
 * NoDataMessage Component Tests
 * @governance COMPONENT-001
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import {
  NoDataMessage,
  getServiceNoDataMessage,
  hasServiceNoDataMessage,
} from '../NoDataMessage';

expect.extend(toHaveNoViolations);

describe('NoDataMessage', () => {
  // ============================================================================
  // UNIT TESTS - Basic Rendering
  // ============================================================================

  describe('Unit Tests - Basic Rendering', () => {
    it('renders with default message for unknown service', () => {
      render(<NoDataMessage service="UnknownService" />);
      expect(screen.getByText('No Data Available')).toBeInTheDocument();
      expect(screen.getByText('No data available for this service.')).toBeInTheDocument();
    });

    it('renders ProjectService specific message', () => {
      render(<NoDataMessage service="ProjectService" />);
      expect(screen.getByText(/No projects found/)).toBeInTheDocument();
    });

    it('renders WBSService specific message', () => {
      render(<NoDataMessage service="WBSService" />);
      expect(screen.getByText(/No WBS elements found/)).toBeInTheDocument();
    });

    it('renders ActivityService specific message', () => {
      render(<NoDataMessage service="ActivityService" />);
      expect(screen.getByText(/No activities found/)).toBeInTheDocument();
    });

    it('renders ResourceService specific message', () => {
      render(<NoDataMessage service="ResourceService" />);
      expect(screen.getByText(/No resources found/)).toBeInTheDocument();
    });

    it('renders EPSService specific message', () => {
      render(<NoDataMessage service="EPSService" />);
      expect(screen.getByText(/No EPS nodes found/)).toBeInTheDocument();
    });

    it('renders RiskService specific message', () => {
      render(<NoDataMessage service="RiskService" />);
      expect(screen.getByText(/No risks defined/)).toBeInTheDocument();
    });

    it('renders custom message when provided', () => {
      render(
        <NoDataMessage service="ProjectService" message="Custom test message here" />
      );
      expect(screen.getByText('Custom test message here')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // UNIT TESTS - Props Handling
  // ============================================================================

  describe('Unit Tests - Props Handling', () => {
    it('uses provided icon prop over service default', () => {
      const { container } = render(
        <NoDataMessage service="ProjectService" icon="chart" />
      );
      // Chart icon has specific path
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders action button when provided', () => {
      const onClickMock = vi.fn();
      render(
        <NoDataMessage
          service="ProjectService"
          action={{ label: 'Retry', onClick: onClickMock }}
        />
      );
      const button = screen.getByText('Retry');
      expect(button).toBeInTheDocument();
    });

    it('calls action onClick when button clicked', () => {
      const onClickMock = vi.fn();
      render(
        <NoDataMessage
          service="ProjectService"
          action={{ label: 'Click Me', onClick: onClickMock }}
        />
      );
      fireEvent.click(screen.getByText('Click Me'));
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('applies compact styling when compact=true', () => {
      const { container } = render(
        <NoDataMessage service="ProjectService" compact />
      );
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('py-6');
    });

    it('applies full padding when compact=false', () => {
      const { container } = render(
        <NoDataMessage service="ProjectService" compact={false} />
      );
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('py-12');
    });

    it('uses custom testId when provided', () => {
      render(<NoDataMessage service="ProjectService" testId="custom-id" />);
      expect(screen.getByTestId('custom-id')).toBeInTheDocument();
    });

    it('generates default testId from service name', () => {
      render(<NoDataMessage service="WBSService" />);
      expect(screen.getByTestId('no-data-WBSService')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // UNIT TESTS - Utility Functions
  // ============================================================================

  describe('Unit Tests - Utility Functions', () => {
    it('getServiceNoDataMessage returns correct message for known service', () => {
      const message = getServiceNoDataMessage('ProjectService');
      expect(message).toContain('No projects found');
    });

    it('getServiceNoDataMessage returns default for unknown service', () => {
      const message = getServiceNoDataMessage('FakeService');
      expect(message).toBe('No data available for this service.');
    });

    it('hasServiceNoDataMessage returns true for known service', () => {
      expect(hasServiceNoDataMessage('ProjectService')).toBe(true);
      expect(hasServiceNoDataMessage('WBSService')).toBe(true);
      expect(hasServiceNoDataMessage('RiskService')).toBe(true);
    });

    it('hasServiceNoDataMessage returns false for unknown service', () => {
      expect(hasServiceNoDataMessage('FakeService')).toBe(false);
      expect(hasServiceNoDataMessage('UnknownService')).toBe(false);
    });
  });

  // ============================================================================
  // ACCESSIBILITY TESTS
  // ============================================================================

  describe('Accessibility Tests', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<NoDataMessage service="ProjectService" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has appropriate role="status"', () => {
      render(<NoDataMessage service="ProjectService" />);
      const element = screen.getByRole('status');
      expect(element).toBeInTheDocument();
    });

    it('has aria-label with message content', () => {
      render(<NoDataMessage service="ProjectService" />);
      const element = screen.getByRole('status');
      expect(element).toHaveAttribute('aria-label');
      expect(element.getAttribute('aria-label')).toContain('No data');
    });

    it('action button is focusable', () => {
      render(
        <NoDataMessage
          service="ProjectService"
          action={{ label: 'Test Action', onClick: vi.fn() }}
        />
      );
      const button = screen.getByText('Test Action');
      button.focus();
      expect(document.activeElement).toBe(button);
    });
  });

  // ============================================================================
  // INTEGRATION TESTS - Multiple Services
  // ============================================================================

  describe('Integration Tests - Service Coverage', () => {
    const services = [
      'ProjectService',
      'WBSService',
      'ActivityService',
      'ResourceService',
      'ResourceAssignmentService',
      'EPSService',
      'RiskService',
      'IssueService',
      'BaselineService',
      'UserService',
      'OBSService',
      'CalendarService',
      'TimesheetService',
      'DocumentService',
    ];

    services.forEach((service) => {
      it(`renders without error for ${service}`, () => {
        expect(() => render(<NoDataMessage service={service} />)).not.toThrow();
      });
    });
  });

  // ============================================================================
  // SNAPSHOT TESTS
  // ============================================================================

  describe('Snapshot Tests', () => {
    it('matches snapshot for ProjectService', () => {
      const { container } = render(<NoDataMessage service="ProjectService" />);
      expect(container).toMatchSnapshot();
    });

    it('matches snapshot with action button', () => {
      const { container } = render(
        <NoDataMessage
          service="WBSService"
          action={{ label: 'Retry', onClick: vi.fn() }}
        />
      );
      expect(container).toMatchSnapshot();
    });

    it('matches snapshot in compact mode', () => {
      const { container } = render(
        <NoDataMessage service="ActivityService" compact />
      );
      expect(container).toMatchSnapshot();
    });
  });
});
