import type { Config as SwcConfig } from '@swc/core';
import type { Config as JestConfig } from 'jest';

const swcCongfig: SwcConfig = {
  jsc: {
    parser: { syntax: 'typescript' },
    target: 'esnext',
  },
  sourceMaps: 'inline',
};

const config: JestConfig = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.[cm]?[jt]sx?$': [ '@swc/jest', swcCongfig ],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!@faker-js/faker/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^(\\.{1,2}/.*)\\.(js|mjs|cjs)$': '$1',
  },
  setupFiles: [
    '<rootDir>/jest.env.ts',
  ],
  collectCoverage: true,
};

export default config;
