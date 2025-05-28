# Automation Challenge - Playwright Test Suite

## Project Overview

This project contains an automated test script developed using Playwright with TypeScript. The primary goal of the script is to interact with the dynamic web form on [The Automation Challenge](https://www.theautomationchallenge.com/). It logs into the site, reads test data from an Excel file, and then iteratively populates and submits the form based on this data. The script is designed to handle dynamic elements and potential reCAPTCHA challenges.

## Key Features & Best Practices Implemented

- **Page Object Model (POM):** The codebase is structured using the Page Object Model design pattern, promoting maintainability, readability, and reusability of test logic. Page-specific elements and interaction methods are encapsulated in `src/pages/LoginPage.ts` and `src/pages/ChallengePage.ts`.
- **Data-Driven Testing:** Test data is externalized into an Excel file (`src/data/challenge.xlsx`), allowing for easy management and modification of test cases without altering the script code. An Excel reader utility (`src/utils/excelReader.ts`) handles data parsing.
- **Dynamic Locator Strategy:** A robust strategy is implemented in `ChallengePage.ts` to locate form fields dynamically based on their visible labels. This is crucial for handling forms where element IDs or classes may change.
- **Professional Logging:** Instead of `console.log`, a `winston` logger (`src/utils/logger.ts`) is used for structured and leveled logging, providing better insights during test execution and debugging.
- **ESLint & Prettier:** The project is configured with ESLint for code linting and Prettier for consistent code formatting, ensuring high code quality and adherence to best practices.
- **Cross-Browser & Multi-Device Testing:** Tests are configured to run across multiple desktop browsers (Chromium, Firefox, WebKit/Safari) and can be easily extended to include mobile device emulation (e.g., Pixel 5, iPhone 14) via `playwright.config.ts`.
- **Environment Configuration:** Sensitive data like login credentials and the base URL are managed through environment variables (expected in a `.env` file), keeping them separate from the codebase.
- **TypeScript:** The project is written in TypeScript, providing static typing and improved code maintainability.
- **Error Handling:** The script incorporates error handling for operations like Excel data reading and form processing, ensuring graceful failure and informative logging when issues occur.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended, e.g., v18.x, v20.x or higher)
- npm (comes with Node.js)
- Access to a terminal or command prompt.

## Setup Instructions

1.  **Clone the Repository (if applicable):**

    ```bash
    git clone https://github.com/alejoWeb/neostella-challenge.git
    cd neostella-challenge
    ```

2.  **Install Dependencies:**
    Navigate to the project's root directory in your terminal and run:

    ```bash
    npm install
    ```

    This command will install all necessary project dependencies, including Playwright and its browser binaries (due to the `postinstall` script).

3.  **Set Up Environment Variables:**
    Create a `.env` file in the root of the project. This file will store your test credentials and other environment-specific configurations.
    Add the following variables to your `.env` file, replacing the placeholder values with the testing credentials:

    ```env
    TEST_USERNAME="your_email@example.com"
    TEST_PASSWORD="your_password"
    # Use these valid Credentials (for challenge purposes only)
    #TEST_USERNAME="hi@alejo.dev"
    #TEST_PASSWORD="NeostellaRocks"
    # BASE_URL="https://www.theautomationchallenge.com/" (Optional, defaults to this if not set)
    # LOG_LEVEL="info" (Optional, can be debug, warn, error. Defaults to info)
    # HEADED="true" (Optional, set to true to run tests in headed mode. Defaults to false/headless)
    ```

## Running the Tests

To execute the test suite, run the following command from the project root:

```bash
npx playwright test
```

This command will typically run the tests across the configured browsers (Chromium, Firefox, WebKit). The test suite, including login and form submissions for multiple data rows from Excel, across three different desktop browsers, generally completes in under one minute.

**Other useful test commands (defined in `package.json`):**

- Run tests in headed mode (to see the browser interactions):
  ```bash
  npm run test:headed
  ```
  (Alternatively, set `HEADED=true` in your `.env` file).
- View the HTML test report (automatically generated after a test run in the `playwright-report` directory):
  ```bash
  npx playwright show-report
  ```

## Code Quality Checks

- **Linting (ESLint):**
  To check for code quality issues:
  ```bash
  npm run lint
  ```
- **Formatting (Prettier):**
  To automatically format the codebase:
  ```bash
  npm run format
  ```

## Browser & Device Configuration

The tests are configured in `playwright.config.ts` to run on the following desktop browsers by default:

- Chromium
- Firefox
- WebKit (Safari)

The configuration file (`playwright.config.ts`) also includes commented-out examples for running tests on emulated mobile devices like:

- Pixel 5 (Mobile Chrome)
- iPhone 14 (Mobile Safari)

These can be enabled by uncommenting the respective sections in the `projects` array within `playwright.config.ts`.

## Assumptions Made During Development

- Valid login credentials (`TEST_USERNAME`, `TEST_PASSWORD`) are provided via a `.env` file.
- The structure of the target website (`https://www.theautomationchallenge.com/`) remains reasonably consistent with the locators implemented, especially concerning the dynamic form fields and their associated labels.
- The Excel file (`src/data/challenge.xlsx`) exists with a sheet named `data` and contains columns matching the `FormRowData` interface expected by the script.
- The reCAPTCHA, when it appears, is of a type that can be handled by a simple checkbox click.

---

This README provides a guide to understanding, setting up, and running the automation script. For further details on specific implementations, please refer to the source code and inline comments.
