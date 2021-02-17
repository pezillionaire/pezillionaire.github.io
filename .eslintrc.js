module.exports = {
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module'
  },
  env: {
    es6: true,
    browser: true
  },
  plugins: [
    'svelte3'
  ],
  overrides: [
    {
      files: ['*.svelte'],
      processor: 'svelte3/svelte3'
    }
  ],
  rules: {
    'indent': [ 'error', 2 ],
    'linebreak-style': [ 'error',  'unix' ],
    'quotes': [ 'error', 'single' ],
    'semi': [ 'error', 'always' ],
    'quotes': ['error', 'single'],
    'max-len': [ 0 ],
    'import/no-duplicates': 0,
    'import/no-named-as-default': 0,
    'no-param-reassign': ['error', { props: false }],
    'object-curly-newline': ['error', { ObjectPattern: { multiline: true } }],
    'consistent-return': 0,
    'no-plusplus': 0,
    'no-shadow': 0,
    'no-use-before-define': [
      'error',
      {
        functions: false
      }
    ],
    'prefer-destructuring': 0,
    'guard-for-in': 0,
    'no-restricted-syntax': 0,
    'arrow-parens': 0
  },
  settings: {
    // ...
  }
};
