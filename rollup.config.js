import postcss from 'rollup-plugin-postcss'
import babel from 'rollup-plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs'
import globals from 'rollup-plugin-node-globals';


export default {
    input: 'src/index.js',
    output: {
        file: 'build/bundle.js',
        format: 'umd',
        name: 'ChataAI',
    },
    plugins: [
        nodeResolve(),
        babel(),
        commonjs({
            include: 'node_modules/**',
            browser: true,
            preferBuiltins: false,
            ignoreGlobal: false,
            sourceMap: false
        }),
        postcss({
            extract: 'autoql-styles.css'
        }),
        globals(),
    ],
};
