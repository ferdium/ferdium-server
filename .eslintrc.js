/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  ignorePatterns: ['node_modules', 'build', 'recipes', '.eslintrc.js'],
  extends: [
    'plugin:adonis/typescriptApp',
    'plugin:unicorn/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'jest', 'prettier'],
  globals: {
    use: true,
  },
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  reportUnusedDisableDirectives: true,
  overrides: [
    {
      files: ['**/*.ts'],
      extends: [
        'plugin:adonis/typescriptApp',
        'plugin:unicorn/recommended',
        'plugin:prettier/recommended',
      ],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint', 'jest'],
      rules: {
        // eslint
        'arrow-parens': 0,
        'array-callback-return': 1,
        'class-methods-use-this': 0,
        'consistent-return': 0,
        'function-paren-newline': 0,
        'implicit-arrow-linebreak': 0,
        'linebreak-style': 0,
        'max-len': 0,
        'no-confusing-arrow': 0,
        'no-console': 0,
        'no-param-reassign': 0,
        'no-restricted-syntax': 0,
        'no-return-assign': 1,
        'no-underscore-dangle': 0,
        'no-use-before-define': 0,
        'prefer-destructuring': 1,
        'object-curly-newline': 0,
        'operator-linebreak': 0,
        // @typescript-eslint
        // TODO: Turn this rule on
        // gulp-typescript doesn't consider custom index.d.ts in @types
        // This is necessary as workaround for window.ferdium vs window['ferdium']
        '@typescript-eslint/dot-notation': 0,
        '@typescript-eslint/indent': 0,
        '@typescript-eslint/no-shadow': 0,
        '@typescript-eslint/no-unused-expressions': 0,
        // eslint-plugin-import
        'import/extensions': 0,
        // TODO: Turn this rule on
        // 'import/no-cycle': 1,
        'import/no-extraneous-dependencies': 0,
        'import/no-unresolved': 0,
        'import/prefer-default-export': 0,
        //  eslint-plugin-unicorn
        'unicorn/filename-case': 0,
        'unicorn/no-await-expression-member': 0,
        'unicorn/no-null': 0,
        'unicorn/no-useless-undefined': 0,
        'unicorn/prefer-module': 0,
        'unicorn/prevent-abbreviations': 0,
        'unicorn/prefer-node-protocol': 0,
        'unicorn/import-style': [
          2,
          {
            styles: {
              path: {
                named: true,
              },
            },
          },
        ],
        'unicorn/consistent-destructuring': 0,
        // INFO: Turned off due to src/internal-server/database/factory.js
        'unicorn/no-empty-file': 0,
        'unicorn/prefer-top-level-await': 0,
      },
    },
  ],
  rules: {
    // eslint
    'arrow-parens': 0,
    'class-methods-use-this': 0,
    'consistent-return': 1,
    'implicit-arrow-linebreak': 0,
    indent: 0,
    // TODO: Turn this rule on once the js to ts conversions are over
    // This is necessary as workaround for window.ferdium vs window['ferdium']
    'dot-notation': 0,
    'function-paren-newline': 0,
    'linebreak-style': 0,
    'max-len': 0,
    // TODO: Turn this rule on
    'no-await-in-loop': 0,
    'no-console': [
      1,
      {
        allow: ['warn', 'error'],
      },
    ],
    'no-param-reassign': 1,
    'no-restricted-syntax': 0,
    'no-underscore-dangle': 0,
    'operator-linebreak': 0,
    'prefer-destructuring': 1,
    'object-curly-newline': 0,
    // eslint-plugin-import
    'import/extensions': 0,
    'import/prefer-default-export': 0,
    'import/no-extraneous-dependencies': 0, // various false positives, re-enable at some point
    'import/no-unresolved': 0,
    //  eslint-plugin-unicorn
    'unicorn/filename-case': 0,
    'unicorn/no-await-expression-member': 0,
    'unicorn/no-null': 0,
    'unicorn/no-useless-undefined': 0,
    'unicorn/prefer-module': 0,
    'unicorn/prevent-abbreviations': 0,
    'unicorn/prefer-node-protocol': 0,
    'unicorn/import-style': [
      2,
      {
        styles: {
          path: {
            named: true,
          },
        },
      },
    ],
    'unicorn/consistent-destructuring': 0,
    // INFO: Turned off due to src/internal-server/database/factory.js
    'unicorn/no-empty-file': 0,
    'unicorn/prefer-top-level-await': 0,
  },
};
