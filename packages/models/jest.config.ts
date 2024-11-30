/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  // preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  transformIgnorePatterns: ["<rootDir>/node_modules/"],
  transform: {
    "^.+\\.(ts)?$": [
      "ts-jest",
      {
        diagnostics: {
          exclude: ["**"],
        },
      },
    ],
    "^.+\\.(js)$": "babel-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@fixtures/(.*)$": "<rootDir>/fixtures/$1",
  },
  globalSetup: "<rootDir>/fixtures/setup.ts",
  globalTeardown: "<rootDir>/fixtures/teardown.ts",
};
