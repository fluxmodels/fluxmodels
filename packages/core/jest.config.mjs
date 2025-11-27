export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: './',
    moduleNameMapper: {
        '^@fluxmodels/core(.*)$': '<rootDir>/src$1'
    },
    testPathIgnorePatterns: ['/node_modules/', 'lib'],
    moduleFileExtensions: ['ts', 'js'],
    roots: ['<rootDir>/src', '<rootDir>/tests']
}
