import { test, expect, type Dialog } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ChallengePage, type FormRowData } from '../pages/ChallengePage';
import { readExcelData } from '../utils/excelReader';
import * as path from 'path';
import logger from '../utils/logger';

// These variables will be used for the successful login attempt.
const validUsername = process.env.TEST_USERNAME;
const validPassword = process.env.TEST_PASSWORD;

// We expect an exact match with this message, including the curly apostrophe ’
const exactExpectedErrorMessage = "We didn’t find an account with those login credentials";

test.describe('Automation Challenge', () => {
  test('should successfully login and complete the end-to-end automation challenge using Excel data', async ({ page }) => {
    if (!validUsername || !validPassword) {
      logger.warn('TEST_USERNAME or TEST_PASSWORD not set in .env. Skipping login test.');
      test.skip(true, 'Skipping test due to missing credentials in .env');
      return;
    }

    await page.goto('/');
    const loginPage = new LoginPage(page);
    let dialogMessage: string | null = null;
    let dialogPromiseResolver: (value?: unknown) => void;
    const dialogPromise = new Promise(resolve => {
      dialogPromiseResolver = resolve;
    });

    page.on('dialog', async (dialog: Dialog) => {
      const message = dialog.message();
      logger.info(`Dialog detected: "${message}"`);
      dialogMessage = message;
      await dialog.accept();
      dialogPromiseResolver();
    });

    logger.info(`Attempting login with username: ${validUsername}`);
    await loginPage.login(validUsername, validPassword);

    await Promise.race([
        dialogPromise, 
        page.waitForTimeout(2500)
    ]);

    if (dialogMessage !== null) {
      if (dialogMessage === exactExpectedErrorMessage) {
        test.fail(true, `Login attempt with credentials ("${validUsername}") failed as the site reported the expected error dialog: "${dialogMessage}". If credentials were valid, this is unexpected.`);
        logger.error(`Login with credentials ("${validUsername}") failed as expected for invalid ones. Dialog: "${dialogMessage}"`);
      } else {
        // If the dialog is not exactly as expected, it's a different kind of failure.
        test.fail(true, `Login attempt resulted in an UNEXPECTED dialog message. Received: "${dialogMessage}". Expected: "${exactExpectedErrorMessage}".`);
        logger.error(`Unexpected dialog message. Received: "${dialogMessage}". Expected: "${exactExpectedErrorMessage}"`);
      }
      return; 
    } else {
      logger.info('No dialog appeared. Proceeding with successful login verifications.');
      await expect(page.getByRole('button', { name: 'Alejo' }), 'User button with text "Alejo" should be visible after successful login')
        .toBeVisible({ timeout: 15000 });
      logger.info('Login appears successful. User button is visible.');

      // Click the "Start" button to initiate the challenge/form
      const startButton = page.getByRole('button', { name: 'Start' });
      await expect(startButton, 'Start button should be visible after login').toBeVisible({ timeout: 10000 });
      await startButton.click();
      logger.info('Clicked the Start button. Proceeding to form filling.');

      const challengePage = new ChallengePage(page);
      const excelFilePath = path.join(__dirname, '..', 'data', 'challenge.xlsx');
      const sheetName = 'data';

      let allRowsData: FormRowData[];
      try {
        allRowsData = readExcelData(excelFilePath, sheetName) as FormRowData[];
      } catch (error) {
        logger.error(`Failed to read Excel data from "${excelFilePath}", sheet "${sheetName}":`, { error: (error as Error).message, stack: (error as Error).stack });
        test.fail(true, `Critical error: Could not read test data from Excel. ${(error as Error).message}`);
        return;
      }

      if (!allRowsData || allRowsData.length === 0) {
        logger.warn('No data found in Excel file or sheet. Skipping form submissions.');
        // If no data, the test for login success still passed, but form filling is skipped.
        // Depending on requirements, this could be a test.skip or just a log.
        // For now, just logging and the test will complete as passed if login was ok.
        return;
      }

      for (const [index, rowData] of allRowsData.entries()) {
        logger.info(`Processing Excel row ${index + 1}:`, { rowData });
        try {
          await challengePage.fillForm(rowData);
          await challengePage.submitForm();
          logger.info(`Form submitted successfully for row ${index + 1}.`);
          await challengePage.handleRecaptchaIfNeeded();
        } catch (error) {
          logger.error(`Error processing row ${index + 1} (Data: ${JSON.stringify(rowData)}):`, { error: (error as Error).message, stack: (error as Error).stack });
          test.fail(true, `Failed to process form for row ${index + 1}: ${(error as Error).message}`);
          break; 
        }
      }
    }
  });
}); 