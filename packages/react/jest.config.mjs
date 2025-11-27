export default {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    rootDir: './',
    moduleNameMapper: {
        '^@fluxmodels/react(.*)$': '<rootDir>/src$1',
        '^@fluxmodels/core(.*)$': '<rootDir>/../core/src$1'
    },
    testPathIgnorePatterns: ['/node_modules/', '/lib/'],
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    roots: ['<rootDir>/src', '<rootDir>/tests']
}
