module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  transformIgnorePatterns: [
    '/node_modules/.pnpm/(?!lodash-es)',
    '/.build/',
    '/.serverless/',
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '/.build/'],
  watchPathIgnorePatterns: ['/node_modules/', '/.build/'],
  modulePathIgnorePatterns: ['node_modules', '.build'],
  testMatch: ['**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/next/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  moduleNameMapper: {
    '@/(.*)$': '<rootDir>/src/$1',
    '#/(.*)$': '<rootDir>/test/$1',
  },
  rootDir: '.',
  testEnvironment: 'node',
  cacheDirectory: '.cache',
  passWithNoTests: true,
};
