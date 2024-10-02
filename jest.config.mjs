/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
export default {
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  // testMatch: ['./src/?(*.)+(spec|test).[jt]s?(x)'],
  testMatch: ['**/src/**/*.spec.js'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  transform: {},
};
