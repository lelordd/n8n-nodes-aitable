module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended'
  ],
  rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-constant-condition': 'off'
  },
  env: {
      node: true,
      es6: true
  }
};
