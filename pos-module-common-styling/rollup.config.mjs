import { globSync } from 'glob';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import styles from 'rollup-plugin-styler';
import typescript from '@rollup/plugin-typescript';

// Existing glob-based entries — one independent ES-module output per src/js/*.js file
// (e.g. dependency-uppy.js, loaded via dynamic import() in init.liquid).
// Only top-level src/js/*.js files are picked up (non-recursive) — anything under a
// subfolder (e.g. src/js/styleguide-component-page/*.ts) is a supporting module for the
// dedicated entry below, not an independent Rollup entry in its own right.
const globEntries = {
  input: Object.fromEntries(
		globSync('src/js/*.js').map(file => [
			path.relative(
				'src/js',
				file.slice(0, file.length - path.extname(file).length)
			),
			fileURLToPath(new URL(file, import.meta.url))
		])
	),
  output: {
    dir: 'modules/common-styling/public/assets/',
    entryFileNames: 'js/[name].js',
    assetFileNames: 'style/[name][extname]',
    plugins: [
      terser()
    ]
  },
  plugins: [
    styles({
      mode: 'extract',
      minimize: true
    }),
    nodeResolve(),
    json(),
    commonjs({
      include: /node_modules/,
    }),
  ],
  treeshake: false
};

// The /style-guide component-template page's script — a single self-contained
// classic <script defer> (not type="module"), so it needs 'iife' output specifically,
// which can't share the glob entries' output block above. Source lives as TypeScript
// under src/js/styleguide-component-page/ purely for compile-time type checking; ships as plain bundled/minified JS.
const styleguideComponentPage = {
  input: 'src/js/styleguide-component-page.ts',
  output: {
    file: 'modules/common-styling/public/assets/js/styleguide-component-page.js',
    format: 'iife',
    plugins: [
      terser()
    ]
  },
  plugins: [
    typescript()
  ],
  treeshake: false
};

export default [globEntries, styleguideComponentPage];