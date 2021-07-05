module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
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
    "class-methods-use-this": 'off',
    "no-restricted-syntax": 'off',
    "max-len": 0,
  },
};
