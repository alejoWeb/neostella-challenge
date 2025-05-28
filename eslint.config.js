import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended'; // For Prettier integration

export default [
  {
    ignores: ['node_modules/', 'dist/', 'playwright-report/', 'test-results/'],
  },
  {
    files: ['**/*.ts'], // Apply this configuration to all TypeScript files
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json', // Important for type-aware linting rules
      },
      globals: {
        ...globals.node, // Add Node.js globals
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      // Your existing rules from .eslintrc.js would go here if you had any custom ones.
      // e.g. "@typescript-eslint/explicit-function-return-type": "off",

      // It's common to also include tseslint.configs.recommended-type-checked.rules
      // if you want type-aware linting, which requires the parserOptions.project setting.
      // Example: ...tseslint.configs.recommendedTypeChecked.rules,
    },
  },
  // Prettier integration should usually be last to override other formatting rules.
  pluginPrettierRecommended,
];
