/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  collectCoverageFrom: ['**/*.ts', '!**/index.ts', '!**/*.spec.ts', '!**/*.interface.ts', '!**/*.interfaces.ts'],
  coverageDirectory: '../coverage',
};
