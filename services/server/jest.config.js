/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transformIgnorePatterns: ["<rootDir>/node_modules/"],
  transform: {
    "^.+\\.(ts|tsx)?$": [
      "ts-jest",
      {
        diagnostics: {
          exclude: ["**"],
        },
        tsconfig: "tsconfig.test.json",
      },
    ],
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@fixtures/(.*)$": "<rootDir>/fixtures/$1",
  },
  globalSetup: "<rootDir>/fixtures/setup.ts",
  globalTeardown: "<rootDir>/fixtures/teardown.ts",
  setupFiles: [
    "<rootDir>/fixtures/jest/s3.ts",
    "<rootDir>/fixtures/jest/worker.ts",
    "<rootDir>/fixtures/jest/telegram.ts",
    "<rootDir>/fixtures/jest/kafka.ts",
  ],
};
