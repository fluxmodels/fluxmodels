import filesize from 'rollup-plugin-filesize'
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
        external: ['react', 'metatyper', '@fluxmodels/core']
    }
]
