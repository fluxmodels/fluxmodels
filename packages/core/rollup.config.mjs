import filesize from 'rollup-plugin-filesize'

import nodeResolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'

export default [
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'lib/index.js',
                format: 'cjs',
                sourcemap: !!process.env.ROLLUP_WATCH
            },
            {
                file: 'lib/index.mjs',
                format: 'es',
                sourcemap: !!process.env.ROLLUP_WATCH
            }
        ],
        plugins: [
            typescript({
                tsconfig: 'tsconfig.build.json',
                sourceMap: !!process.env.ROLLUP_WATCH
            }),
            filesize()
        ],
        external: ['metatyper']
    },
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'lib/fluxmodels.min.cjs',
                format: 'cjs',
                sourcemap: !!process.env.ROLLUP_WATCH
            },
            {
                file: 'lib/fluxmodels.min.mjs',
                format: 'es',
                sourcemap: !!process.env.ROLLUP_WATCH
            },
            {
                file: 'lib/fluxmodels.min.js',
                format: 'iife',
                name: 'FluxModels',
                sourcemap: !!process.env.ROLLUP_WATCH
            }
        ],
        plugins: [
            nodeResolve({ dedupe: ['metatyper'] }),
            typescript({
                tsconfig: 'tsconfig.build.json',
                sourceMap: !!process.env.ROLLUP_WATCH,

                downlevelIteration: true
            }),
            terser(),
            filesize()
        ]
    }
]
