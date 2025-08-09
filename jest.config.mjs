/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
export default {
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  testMatch: ['**/src/**/*.spec.js'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  transform: {},
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
