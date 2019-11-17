import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import external from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import resolve from 'rollup-plugin-node-resolve';
import url from 'rollup-plugin-url';
import image from 'rollup-plugin-img';
import svgr from '@svgr/rollup';
// import minify from "rollup-plugin-babel-minify";
// import flow from "rollup-plugin-flow";

import pkg from './package.json';

export default {
  input: 'src/index.js',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true
    }
  ],
  plugins: [
    external(),
    postcss({
      modules: false,
      sourcemap: false
    }),
    image({
      extensions: /\.(png|jpg|jpeg|gif|svg)$/ // support png|jpg|jpeg|gif|svg, and it's alse the default value
    }),
    url({
      limit: 0, // 0 => copy all files
      include: ['**/*.?(ttf|woff|woff2|png|jpg|svg|gif)'],
      fileName: '[dirname][hash][extname]'
    }),
    svgr(),
    babel({
      exclude: 'node_modules/**',
      plugins: ['@babel/external-helpers']
    }),
    resolve(),
    commonjs()
    // minify()
    // flow()
  ]
}
