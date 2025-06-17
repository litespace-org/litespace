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
    "<rootDir>/../../packages/tests/dist/cjs/mocks/global/s3",
    "<rootDir>/../../packages/tests/dist/cjs/mocks/global/worker",
    "<rootDir>/../../packages/tests/dist/cjs/mocks/global/telegram",
    "<rootDir>/../../packages/tests/dist/cjs/mocks/global/kafka",
  ],
};
