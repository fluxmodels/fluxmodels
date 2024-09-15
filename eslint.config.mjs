import { fileURLToPath } from 'node:url'
import path from 'node:path'
import globals from 'globals'

import js from '@eslint/js'
import react from 'eslint-plugin-react'
import { FlatCompat } from '@eslint/eslintrc'
import { fixupConfigRules, fixupPluginRules } from '@eslint/compat'

import tsParser from '@typescript-eslint/parser'
import typescriptEslint from '@typescript-eslint/eslint-plugin'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
})

export default [
    ...fixupConfigRules(
        compat.extends(
            'eslint:recommended',
            'plugin:react/recommended',
            'plugin:@typescript-eslint/recommended',
            'plugin:prettier/recommended'
        )
    ),
    {
        ignores: ['node_modules/**'],

        plugins: {
            react: fixupPluginRules(react),
            '@typescript-eslint': fixupPluginRules(typescriptEslint)
        },

        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node
            },

            parser: tsParser,
            ecmaVersion: 2021,
            sourceType: 'module',

            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                }
            }
        },

        settings: {
            react: {
                version: 'detect'
            }
        },

        rules: {
            'prettier/prettier': [
                'warn',
                {
                    endOfLine: 'auto'
                }
            ],

            'padding-line-between-statements': [
                'warn',
                {
                    blankLine: 'always',
                    prev: '*',
                    next: 'multiline-block-like'
                },
                {
                    blankLine: 'always',
                    prev: 'multiline-block-like',
                    next: '*'
                },
                {
                    blankLine: 'always',
                    prev: '*',
                    next: ['const', 'let', 'export']
                },
                {
                    blankLine: 'always',
                    prev: ['const', 'let', 'export'],
                    next: '*'
                },
                {
                    blankLine: 'always',
                    prev: '*',
                    next: ['if', 'class', 'for', 'do', 'while', 'switch', 'try']
                },
                {
                    blankLine: 'always',
                    prev: ['if', 'class', 'for', 'do', 'while', 'switch', 'try'],
                    next: '*'
                },
                {
                    blankLine: 'any',
                    prev: ['const', 'let', 'export'],
                    next: ['const', 'let', 'export']
                },
                {
                    blankLine: 'always',
                    prev: '*',
                    next: 'return'
                }
            ],

            'react/no-is-mounted': 'off',

            curly: ['warn', 'multi-line', 'consistent'],
            eqeqeq: 'error',
            'arrow-parens': ['error', 'always'],
            'prefer-const': 'error',
            'no-constant-condition': 'off',
            'no-fallthrough': 'off',
            'getter-return': 'off',
            'no-var': 'error',
            'no-console': 'off',
            'require-yield': 'off',
            'no-extra-semi': 'off',
            'no-undef': 'off',
            'no-redeclare': 'off',

            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_'
                }
            ],

            '@typescript-eslint/no-this-alias': 'off',
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'off'
        }
    }
]
