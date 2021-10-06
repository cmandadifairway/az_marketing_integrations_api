module.exports = {
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
    testPathIgnorePatterns: ["/dist/", "/node_modules/"],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    coverageReporters: [
        "lcov",
        "cobertura"
    ],
    reporters: [
        "default",
        [ "jest-junit", { outputName: "test-report.xml" } ]
    ],
    setupFiles: [
        "<rootDir>/mock/setEnvVars.js",
        "<rootDir>/inversify.config.ts"
    ],
    testEnvironment: "node"
}
