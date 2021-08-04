module.exports = {
  root: true,
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: ['airbnb-base'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    use: 'readonly',
    window: 'readonly',
    document: 'readonly',
    ENV: 'readonly',
    session: 'readonly',
    response: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    'arrow-parens': 0,
    'class-methods-use-this': 0,
    eqeqeq: 1,
    'implicit-arrow-linebreak': 0,
    'max-len': 0,
    'no-await-in-loop': 1,
    'no-restricted-syntax': 0,
    'operator-linebreak': 0,
    'object-curly-newline': 0,
  },
};
