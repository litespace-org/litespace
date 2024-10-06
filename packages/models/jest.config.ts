/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  transformIgnorePatterns: ["<rootDir>/node_modules/"],
  transform: {
    "^.+\\.(ts)?$": "ts-jest",
    "^.+\\.(js)$": "babel-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@fixtures/(.*)$": "<rootDir>/fixtures/$1",
  },
  globalSetup: "<rootDir>/fixtures/setup.ts",
  globalTeardown: "<rootDir>/fixtures/teardown.ts",
};
