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
  plugins: [],
  globals: {
    use: true,
  },
  env: {
    es6: true,
    node: true,
  },
  reportUnusedDisableDirectives: true,
  overrides: [
    {
      files: ['**/*.ts'],
      extends: [
        'plugin:adonis/typescriptApp',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/strict',
        // TODO: Opt-in to a stricter ruleset in the future
        // 'plugin:@typescript-eslint/strict-type-checked',
        'plugin:@typescript-eslint/stylistic-type-checked',
        'plugin:import/typescript',
      ],
      parser: '@typescript-eslint/parser',
      plugins: [],
      rules: {
        // eslint
        'max-len': 0,

        // @typescript-eslint
        '@typescript-eslint/no-non-null-assertion': 0,
        '@typescript-eslint/no-empty-interface': 0,
        '@typescript-eslint/semi': 0,
        '@typescript-eslint/space-before-function-paren': 0,
        '@typescript-eslint/no-extraneous-class': 0,
        '@typescript-eslint/ban-ts-comment': 0,
        '@typescript-eslint/prefer-ts-expect-error': 0,
      },
    },
  ],
  rules: {
    // eslint
    'array-callback-return': 1,
    'consistent-return': 1,
    'max-len': 0,
    'no-await-in-loop': 1,
    'no-return-assign': 1,
    'no-console': [
      1,
      {
        allow: ['warn', 'error'],
      },
    ],
    'no-param-reassign': 1,
    'prefer-destructuring': 1,
    // eslint-plugin-unicorn
    'unicorn/filename-case': 0,
    'unicorn/prefer-module': 0,
    'unicorn/prevent-abbreviations': 0,

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
    'unicorn/no-empty-file': 0,
    'unicorn/prefer-top-level-await': 0,
  },
};
