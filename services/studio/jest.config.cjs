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
      },
    ],
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  testPathIgnorePatterns: ["dist"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};
