module.exports = {
  testTimeout: 30000,
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    coverageReporters: [
      "lcov",
      "cobertura"
    ],
    reporters: [
      "default",
      [ "jest-junit", { outputName: "test-report.xml" } ]
    ]
  }