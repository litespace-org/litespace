// Ref: https://sentry.io/answers/jest-encountered-an-unexpected-token-syntaxerror-unexpected-token-export/
/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!(chai))"],
  transform: {
    "\\.[jt]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@fixtures/(.*)$": "<rootDir>/fixtures/$1",
  },
  globalSetup: "<rootDir>/fixtures/setup.ts",
  globalTeardown: "<rootDir>/fixtures/teardown.ts",
  coverageprovider: "v8",
};
