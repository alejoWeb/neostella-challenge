import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly signUpOrLoginButton: Locator;
  readonly orLoginButton: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly finalLoginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.signUpOrLoginButton = page.getByRole('button', { name: 'SIGN UP OR LOGIN' });
    this.orLoginButton = page.getByRole('button', { name: 'OR LOGIN', exact: true });
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    //this.emailInput = page.getByPlaceholder('Email');
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.finalLoginButton = page.getByRole('button', { name: 'LOG IN', exact: true });
  } 

  async login(email: string, password: string): Promise<void> {
    await this.signUpOrLoginButton.click();
    await this.orLoginButton.click();
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.finalLoginButton.click();
  }
} 