import { type Page, type Locator, expect } from '@playwright/test';
import logger from '../utils/logger.js';

// Define an interface for the data structure from Excel
export interface FormRowData {
  employer_identification_number: string;
  company_name: string;
  sector: string;
  company_address: string;
  automation_tool: string;
  annual_automation_saving: string;
  date_of_first_project: string;
  [key: string]: string;
}

export class ChallengePage {
  readonly page: Page;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.submitButton = page.getByRole('button', { name: 'Submit' });
  }

  /**
   * Finds a form field dynamically based on its label.
   * @param labelText The text that accompanies the field (e.g., "First Name", "Email Address")
   */
  async findFieldByLabel(labelText: string): Promise<Locator | null> {
    try {
      const escapedLabelText = labelText.replace(
        /[.*+?^${}()|[\\\]\\]/g,
        '\\\\$&',
      );
      const labelDivs = this.page
        .locator('div.content')
        .filter({ hasText: new RegExp(`^${escapedLabelText}$`) });
      const count = await labelDivs.count();

      if (count === 0) {
        logger.warn(
          `Group Anchor Strategy: Label div.content with exact text "${labelText}" not found.`,
        );
        return null;
      }

      for (let i = 0; i < count; i++) {
        const specificLabelDiv = labelDivs.nth(i);
        if (!(await specificLabelDiv.isVisible())) {
          continue;
        }

        // Strategy: From div.content -> ancestor Group -> input/textarea within that Group
        const groupAncestor = specificLabelDiv.locator(
          'xpath=ancestor::div[contains(@class, "bubble-element") and contains(@class, "Group")][1]',
        );

        if (
          (await groupAncestor.count()) > 0 &&
          (await groupAncestor.isVisible())
        ) {
          const inputField = groupAncestor.locator('input, textarea').first(); // Find the first input/textarea within THIS group

          if (
            (await inputField.count()) > 0 &&
            (await inputField.isVisible()) &&
            (await inputField.isEditable())
          ) {
            logger.info(
              `Group Anchor Strategy: Found visible and editable input/textarea for label "${labelText}" within its Group.`,
            );
            return inputField;
          }
        }
      }

      logger.warn(
        `Group Anchor Strategy: After checking all ${count} label instance(s) for "${labelText}", no suitable input field was found.`,
      );
      return null;
    } catch (error) {
      const e = error as Error;
      logger.warn(
        `Error during findFieldByLabel for "${labelText}" using Group Anchor strategy: ${e.message}`,
        { stack: e.stack },
      );
      return null;
    }
  }

  async fillForm(data: FormRowData): Promise<void> {
    // Order of fields might change, so we fetch them by label dynamically
    const fieldMappings: { [K in keyof FormRowData]?: string } = {
      company_name: 'Company Name',
      company_address: 'Address',
      employer_identification_number: 'EIN',
      sector: 'Sector',
      automation_tool: 'Automation Tool',
      annual_automation_saving: 'Annual Saving',
      date_of_first_project: 'Date',
    };

    for (const key in data) {
      if (
        Object.prototype.hasOwnProperty.call(data, key) &&
        fieldMappings[key]
      ) {
        const labelText = fieldMappings[key];
        const field = await this.findFieldByLabel(labelText as string);
        if (field && (await field.isVisible())) {
          await field.fill(data[key]);
          logger.info(`Filled "${labelText}" with "${data[key]}"`);
        } else {
          logger.error(
            `Failed to find or interact with field for label: "${labelText}"`,
          );
          throw new Error(`Field not found or not interactable: ${labelText}`);
        }
      }
    }
  }

  async submitForm(): Promise<void> {
    await expect(
      this.submitButton,
      'Submit button should be visible and enabled',
    ).toBeEnabled();
    await this.submitButton.click();
    // Wait for DOM to be ready to ensure the submit action completed and the page is ready for the next iteration.
    await this.page.waitForLoadState('domcontentloaded');
  }

  // Placeholder for reCAPTCHA handling logic.
  async handleRecaptchaIfNeeded(): Promise<void> {
    // Locate the popup container. We'll use its visibility to determine if the reCAPTCHA is active.
    const popupLocator = this.page.locator(
      'div.bubble-element.Popup:has-text("Get through this reCAPTCHA to continue")',
    );

    try {
      await popupLocator.waitFor({ state: 'visible', timeout: 100 });
      logger.info('reCAPTCHA popup detected.');

      // Within the visible popup, find the clickable checkbox button.
      const checkboxButton = popupLocator.locator(
        'button.bubble-element.Button.clickable-element[style*="z-index: 9"]',
      );

      if (
        (await checkboxButton.count()) > 0 &&
        (await checkboxButton.isVisible())
      ) {
        await checkboxButton.click();
        logger.info('Clicked the reCAPTCHA checkbox.');
        // Wait 1 second for the reCAPTCHA click to be processed and UI to update
        await this.page.waitForTimeout(1000);
      } else {
        logger.warn(
          'reCAPTCHA popup was visible, but the checkbox button was not found or not visible.',
        );
      }
    } catch (error) {
      // This catch block executes if popupLocator.waitFor times out (no popup found)
      // or if any other error occurs during the process.
      logger.info(
        'No active reCAPTCHA popup detected (or timed out waiting for it).',
      );
    }
  }
}
