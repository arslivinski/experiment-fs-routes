'use strict';

const OFF = 'off';
const ERROR = 'error';

module.exports = {
  root: true,
  extends: [
    '@arslivinski/eslint-config',
    '@arslivinski/eslint-config/react',
  ],
  rules: {
    'import/no-unassigned-import': [
      ERROR,
      {
        allow: [
          '**/*.css',
        ],
      },
    ],
  },
  overrides: [
    {
      files: [
        './sources/pages/**/*.js',
      ],
      rules: {
        'import/no-default-export': OFF,
        'import/prefer-default-export': ERROR,
      },
    },
    {
      files: [
        './.*.js',
        './*.js',
        './scripts/**/*.js',
      ],
      env: {
        node: true,
      },
      parserOptions: {
        sourceType: 'script',
      },
      rules: {
        'no-console': OFF,
        'strict': [ERROR, 'global'],
        'import/no-commonjs': OFF,
        'import/no-extraneous-dependencies': [
          ERROR,
          {
            devDependencies: true,
            optionalDependencies: false,
            peerDependencies: false,
          },
        ],
        'import/no-nodejs-modules': OFF,
      },
    },
  ],
};
