// eslint-disable-next-line no-unused-vars
var OFF = 0,
  // eslint-disable-next-line no-unused-vars
  WARN = 1,
  ERROR = 2

module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  extends: ['eslint:recommended', 'plugin:import/recommended'],
  parserOptions: {
    // parser: '@babel/eslint-parser',
  },
  rules: {
    // allow console.log during development only
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // allow debugger during development only
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

    // TODO: enable rule
    semi: [ERROR, 'never'],
    quotes: [ERROR, 'single'],
    eqeqeq: OFF,
    'no-unused-vars': ERROR,
    indent: ['error', 2, { SwitchCase: 1, ignoredNodes: ['TemplateLiteral > *'] }],
    // TODO: enable rule
    // 'arrow-parens': [ERROR, 'always'],
    'arrow-parens': 'off',
    'one-var': OFF,

    'import/first': ERROR,
    'import/named': 'error',
    'import/namespace': 'error',
    'import/default': 'error',
    'import/export': ERROR,
    'import/extensions': OFF,
    'import/no-unresolved': OFF,
    'import/no-extraneous-dependencies': 'off',
    'prefer-promise-reject-errors': ERROR,
    'space-before-function-paren': ['error', 'never'],
    'comma-dangle': [
      'error',
      {
        arrays: 'ignore',
        objects: 'ignore',
        imports: 'ignore',
        exports: 'ignore',
        functions: 'never',
      },
    ],
    // 'keyword-spacing': [
    //   'error',
    //   {
    //     overrides: {
    //       if: { after: false },
    //       for: { after: false },
    //       while: { after: false },
    //     },
    //   },
    // ],
  },
  globals: {
    // _isEqual: true,
    // _cloneDeep: true,
  },
}
