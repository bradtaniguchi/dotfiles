import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginTypescript from '@typescript-eslint/eslint-plugin';
import pluginJsDoc from 'eslint-plugin-jsdoc';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginImport from 'eslint-plugin-import';

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
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'always',
        },
      ],
    },
  },
  pluginJs.configs.recommended,
];
