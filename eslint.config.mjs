import pluginJs from '@eslint/js';
import pluginTypescript from '@typescript-eslint/eslint-plugin';
import pluginImport from 'eslint-plugin-import';
import pluginJsDoc from 'eslint-plugin-jsdoc';
import pluginPrettier from 'eslint-plugin-prettier';
import globals from 'globals';

/**
 * @type {import('eslint').Linter.Config}
 */
export default [
  {
    languageOptions: {
      globals: {
        // **note** both are combined according to eslint
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      typescript: pluginTypescript,
      prettier: pluginPrettier,
      jsdoc: pluginJsDoc,
      import: pluginImport,
    },
    rules: {
      'no-console': 'error', // Disallow all console methods in non-test files
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'always',
        },
      ],
    },
  },
  // Separate config for test files
  {
    files: ['**/*.spec.js'],
    rules: {
      'no-console': 'off', // Allow console methods in test files
    },
  },
  pluginJs.configs.recommended,
];
