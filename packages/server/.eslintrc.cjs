module.exports = {
  root: true,
  env: {
    node: true,
    es2020: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off', // Allow console.log in server code
    'no-undef': 'error'
  },
  ignorePatterns: [
    'node_modules/',
    'logs/',
    'dist/',
    '*.pid',
    '*.log'
  ]
}