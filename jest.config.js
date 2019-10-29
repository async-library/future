module.exports = {
  rootDir: "./",
  collectCoverage: true,
  coverageDirectory: "<rootDir>/coverage",
  verbose: true,
  bail: true,
  transform: { "^.+\\.js$": "babel-jest" },
  testPathIgnorePatterns: ["/node_modules/", "/pkg/"],
}
