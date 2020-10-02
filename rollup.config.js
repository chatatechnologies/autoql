import postcss from 'rollup-plugin-postcss'
import babel from 'rollup-plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve';
import pkg from './package.json'
import commonjs from 'rollup-plugin-commonjs'

const external = [
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.dependencies || {}),
]

const makeExternalPredicate = externalArr => {
    if (externalArr.length === 0) {
        return () => false
    }
    const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`)
    return id => pattern.test(id)
}


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
    ],
    external: external,
};
