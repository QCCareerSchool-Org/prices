const config = {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: [ '.ts', '.tsx' ],
  transform: {
    '^.+\\.(t|j)sx?$': [ '@swc/jest' ],
  },
};

export default config;
