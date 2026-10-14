import {build} from 'esbuild';
import {mkdir, copyFile, cp} from 'node:fs/promises';
await mkdir('public/vendor', {recursive: true});
await build({entryPoints: ['public/import.js', 'public/voice-ai.js'], bundle: true, format: 'esm', platform: 'browser', target: 'es2022', outdir: 'public/vendor', minify: true, legalComments: 'linked'});
await copyFile('node_modules/pdfjs-dist/build/pdf.worker.mjs', 'public/vendor/pdf.worker.mjs');
await cp('node_modules/pdfjs-dist/cmaps', 'public/vendor/cmaps', {recursive: true});
await cp('node_modules/pdfjs-dist/standard_fonts', 'public/vendor/standard_fonts', {recursive: true});
await cp('node_modules/pdfjs-dist/wasm', 'public/vendor/wasm', {recursive: true});
