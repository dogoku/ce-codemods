module.exports = {
  root: true,
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2015,
    sourceType: 'module',
  },
  env: {
    node: true,
    es6: true
  },
  overrides: [
    {
      files: ['**/__tests__/**/*.js', 'util/*.js'],
      env: {
        jest: true,
      },
    },
  ],
};
