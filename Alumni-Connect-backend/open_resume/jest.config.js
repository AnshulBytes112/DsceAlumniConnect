/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^lib/parse-resume-from-pdf/(.*)$': '<rootDir>/parse-resume-from-pdf/$1',
        '^lib/redux/(.*)$': '<rootDir>/lib/redux/$1',
    },
};
