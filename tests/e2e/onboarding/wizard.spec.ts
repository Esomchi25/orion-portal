/**
 * Onboarding Wizard E2E Tests
 * @governance COMPONENT-001 (Phase C: Full E2E with Real Data)
 *
 * Tests the complete onboarding flow:
 * 1. Welcome screen
 * 2. P6 connection form
 * 3. SAP connection form
 * 4. Completion and navigation to dashboard
 */

import { test, expect, mockP6Connection, mockSAPConnection } from '../fixtures/base';

test.describe('Onboarding Wizard', () => {
  test.beforeEach(async ({ page, mockAPI }) => {
    // mockAPI fixture sets up all route handlers
    await page.goto('/onboarding');
  });

  test.describe('Welcome Screen', () => {
    test('displays welcome message and get started button', async ({ onboardingPage }) => {
      const heading = await onboardingPage.welcomeHeading();
      await expect(heading).toBeVisible();

      const button = await onboardingPage.getStartedButton();
      await expect(button).toBeVisible();
    });

    test('navigates to P6 form when get started is clicked', async ({ page, onboardingPage }) => {
      const button = await onboardingPage.getStartedButton();
      await button.click();

      // Should show P6 connection form
      await expect(page.getByText(/p6 connection/i)).toBeVisible();
    });

    test('has no accessibility violations', async ({ page, axeBuilder }) => {
      const results = await axeBuilder.analyze();
      expect(results.violations).toEqual([]);
    });
  });

  test.describe('P6 Connection Form', () => {
    test.beforeEach(async ({ onboardingPage }) => {
      const button = await onboardingPage.getStartedButton();
      await button.click();
    });

    test('validates required fields', async ({ page, onboardingPage }) => {
      const nextButton = await onboardingPage.p6NextButton();
      await nextButton.click();

      // Should show validation errors
      await expect(page.getByText(/wsdl url is required/i)).toBeVisible();
    });

    test('validates WSDL URL format', async ({ page, onboardingPage }) => {
      const wsdlInput = await onboardingPage.p6WsdlInput();
      await wsdlInput.fill('not-a-url');
      await wsdlInput.blur();

      await expect(page.getByText(/invalid wsdl url/i)).toBeVisible();
    });

    test('allows testing connection with valid inputs', async ({ page, onboardingPage }) => {
      // Fill in valid values
      const wsdlInput = await onboardingPage.p6WsdlInput();
      await wsdlInput.fill(mockP6Connection.wsdlUrl);

      const usernameInput = await onboardingPage.p6UsernameInput();
      await usernameInput.fill(mockP6Connection.username);

      const passwordInput = await onboardingPage.p6PasswordInput();
      await passwordInput.fill(mockP6Connection.password);

      const databaseInput = await onboardingPage.p6DatabaseInput();
      await databaseInput.fill(mockP6Connection.databaseInstance);

      // Test connection
      const testButton = await onboardingPage.p6TestConnectionButton();
      await testButton.click();

      // Should show success
      await expect(page.getByText(/connection successful/i)).toBeVisible();
    });

    test('enables next button after successful connection test', async ({ page, onboardingPage }) => {
      // Fill in valid values
      const wsdlInput = await onboardingPage.p6WsdlInput();
      await wsdlInput.fill(mockP6Connection.wsdlUrl);

      const usernameInput = await onboardingPage.p6UsernameInput();
      await usernameInput.fill(mockP6Connection.username);

      const passwordInput = await onboardingPage.p6PasswordInput();
      await passwordInput.fill(mockP6Connection.password);

      const databaseInput = await onboardingPage.p6DatabaseInput();
      await databaseInput.fill(mockP6Connection.databaseInstance);

      // Test connection
      const testButton = await onboardingPage.p6TestConnectionButton();
      await testButton.click();

      await expect(page.getByText(/connection successful/i)).toBeVisible();

      // Next button should be enabled
      const nextButton = await onboardingPage.p6NextButton();
      await expect(nextButton).toBeEnabled();
    });

    test('has no accessibility violations', async ({ page, axeBuilder }) => {
      const results = await axeBuilder.analyze();
      expect(results.violations).toEqual([]);
    });
  });

  test.describe('SAP Connection Form', () => {
    test.beforeEach(async ({ page, onboardingPage }) => {
      // Navigate through P6 form
      const getStartedButton = await onboardingPage.getStartedButton();
      await getStartedButton.click();

      const wsdlInput = await onboardingPage.p6WsdlInput();
      await wsdlInput.fill(mockP6Connection.wsdlUrl);

      const usernameInput = await onboardingPage.p6UsernameInput();
      await usernameInput.fill(mockP6Connection.username);

      const passwordInput = await onboardingPage.p6PasswordInput();
      await passwordInput.fill(mockP6Connection.password);

      const databaseInput = await onboardingPage.p6DatabaseInput();
      await databaseInput.fill(mockP6Connection.databaseInstance);

      const testButton = await onboardingPage.p6TestConnectionButton();
      await testButton.click();

      await page.getByText(/connection successful/i).waitFor();

      const nextButton = await onboardingPage.p6NextButton();
      await nextButton.click();
    });

    test('displays SAP connection form', async ({ page }) => {
      await expect(page.getByText(/sap connection/i)).toBeVisible();
    });

    test('allows testing SAP connection', async ({ page, onboardingPage }) => {
      const hostInput = await onboardingPage.sapHostInput();
      await hostInput.fill(mockSAPConnection.hostUrl);

      const clientInput = await onboardingPage.sapClientInput();
      await clientInput.fill(mockSAPConnection.client);

      const usernameInput = await onboardingPage.sapUsernameInput();
      await usernameInput.fill(mockSAPConnection.username);

      const passwordInput = await onboardingPage.sapPasswordInput();
      await passwordInput.fill(mockSAPConnection.password);

      const systemIdInput = await onboardingPage.sapSystemIdInput();
      await systemIdInput.fill(mockSAPConnection.systemId);

      const testButton = await onboardingPage.sapTestConnectionButton();
      await testButton.click();

      await expect(page.getByText(/connection successful/i)).toBeVisible();
    });
  });

  test.describe('Completion Step', () => {
    test('shows setup complete after both connections', async ({ page, onboardingPage }) => {
      // Navigate through entire wizard
      const getStartedButton = await onboardingPage.getStartedButton();
      await getStartedButton.click();

      // P6 form
      const wsdlInput = await onboardingPage.p6WsdlInput();
      await wsdlInput.fill(mockP6Connection.wsdlUrl);
      const p6UsernameInput = await onboardingPage.p6UsernameInput();
      await p6UsernameInput.fill(mockP6Connection.username);
      const p6PasswordInput = await onboardingPage.p6PasswordInput();
      await p6PasswordInput.fill(mockP6Connection.password);
      const databaseInput = await onboardingPage.p6DatabaseInput();
      await databaseInput.fill(mockP6Connection.databaseInstance);

      const p6TestButton = await onboardingPage.p6TestConnectionButton();
      await p6TestButton.click();
      await page.getByText(/connection successful/i).waitFor();

      const p6NextButton = await onboardingPage.p6NextButton();
      await p6NextButton.click();

      // SAP form
      const hostInput = await onboardingPage.sapHostInput();
      await hostInput.fill(mockSAPConnection.hostUrl);
      const clientInput = await onboardingPage.sapClientInput();
      await clientInput.fill(mockSAPConnection.client);
      const sapUsernameInput = await onboardingPage.sapUsernameInput();
      await sapUsernameInput.fill(mockSAPConnection.username);
      const sapPasswordInput = await onboardingPage.sapPasswordInput();
      await sapPasswordInput.fill(mockSAPConnection.password);
      const systemIdInput = await onboardingPage.sapSystemIdInput();
      await systemIdInput.fill(mockSAPConnection.systemId);

      const sapTestButton = await onboardingPage.sapTestConnectionButton();
      await sapTestButton.click();
      await page.getByText(/connection successful/i).waitFor();

      // Navigate to completion
      const sapNextButton = page.getByRole('button', { name: /next/i });
      await sapNextButton.click();

      // Should show completion screen
      const completionHeading = await onboardingPage.completionHeading();
      await expect(completionHeading).toBeVisible();
    });

    test('navigates to dashboard when go to dashboard is clicked', async ({ page, onboardingPage }) => {
      // Complete wizard (simplified - would need full flow in real test)
      await page.goto('/onboarding/complete');

      const dashboardButton = await onboardingPage.goToDashboardButton();
      await dashboardButton.click();

      await expect(page).toHaveURL(/.*dashboard/);
    });
  });

  test.describe('Full Flow', () => {
    test('completes entire onboarding wizard', async ({ page, onboardingPage }) => {
      // Welcome
      const getStartedButton = await onboardingPage.getStartedButton();
      await getStartedButton.click();

      // P6
      const wsdlInput = await onboardingPage.p6WsdlInput();
      await wsdlInput.fill(mockP6Connection.wsdlUrl);
      const p6UsernameInput = await onboardingPage.p6UsernameInput();
      await p6UsernameInput.fill(mockP6Connection.username);
      const p6PasswordInput = await onboardingPage.p6PasswordInput();
      await p6PasswordInput.fill(mockP6Connection.password);
      const databaseInput = await onboardingPage.p6DatabaseInput();
      await databaseInput.fill(mockP6Connection.databaseInstance);

      const p6TestButton = await onboardingPage.p6TestConnectionButton();
      await p6TestButton.click();
      await page.getByText(/connection successful/i).waitFor();

      const p6NextButton = await onboardingPage.p6NextButton();
      await p6NextButton.click();

      // SAP
      const hostInput = await onboardingPage.sapHostInput();
      await hostInput.fill(mockSAPConnection.hostUrl);
      const clientInput = await onboardingPage.sapClientInput();
      await clientInput.fill(mockSAPConnection.client);
      const sapUsernameInput = await onboardingPage.sapUsernameInput();
      await sapUsernameInput.fill(mockSAPConnection.username);
      const sapPasswordInput = await onboardingPage.sapPasswordInput();
      await sapPasswordInput.fill(mockSAPConnection.password);
      const systemIdInput = await onboardingPage.sapSystemIdInput();
      await systemIdInput.fill(mockSAPConnection.systemId);

      const sapTestButton = await onboardingPage.sapTestConnectionButton();
      await sapTestButton.click();
      await page.getByText(/connection successful/i).waitFor();

      const sapNextButton = page.getByRole('button', { name: /next/i });
      await sapNextButton.click();

      // Completion
      const completionHeading = await onboardingPage.completionHeading();
      await expect(completionHeading).toBeVisible();

      const dashboardButton = await onboardingPage.goToDashboardButton();
      await dashboardButton.click();

      // Should be on dashboard
      await expect(page).toHaveURL(/.*dashboard/);
    });
  });
});
