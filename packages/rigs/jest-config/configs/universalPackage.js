module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  moduleFileExtensions: ['json', 'js', 'ts', 'tsx'],
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
    '^.+\\.(t|j)sx?$': [
      'jest-esbuild',
      {
        target: 'node16',
      },
    ],
  },
  moduleNameMapper: {
    '@/(.*)$': '<rootDir>/src/$1',
    '#/(.*)$': '<rootDir>/test/$1',
  },
  rootDir: '.',
  testEnvironment: 'node',
  cacheDirectory: '.cache',
};
