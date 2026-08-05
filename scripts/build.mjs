import { mkdir, readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';
import { context } from 'esbuild';

const isWatch = process.argv.includes('--watch');
const outputDirectory = 'dist';
const outputFile = `${outputDirectory}/hsguru-zh-cn.user.js`;
const repository = process.env.GITHUB_REPOSITORY;
const version = process.env.npm_package_version ?? '0.1.0';

const metadata = [
  '// ==UserScript==',
  '// @name         HSGuru 中文助手',
  '// @namespace    https://github.com/hsguru-zh-cn',
  `// @version      ${version}`,
  '// @description  为 HSGuru 网站提供简体中文界面',
  '// @author       HSGuru 中文脚本贡献者',
  '// @match        https://www.hsguru.com/*',
  '// @match        https://hsguru.com/*',
  '// @icon         https://www.google.com/s2/favicons?sz=64&domain=hsguru.com',
  '// @grant        GM_registerMenuCommand',
  '// @grant        GM_unregisterMenuCommand',
  '// @grant        GM_getValue',
  '// @grant        GM_setValue',
  '// @grant        GM_setClipboard',
  '// @grant        GM_xmlhttpRequest',
  '// @grant        unsafeWindow',
  '// @connect      api.hearthstonejson.com',
  '// @run-at       document-start',
  ...(repository
    ? [
        `// @downloadURL  https://github.com/${repository}/releases/latest/download/hsguru-zh-cn.user.js`,
        `// @updateURL    https://github.com/${repository}/releases/latest/download/hsguru-zh-cn.user.js`,
      ]
    : []),
  '// @license      MIT',
  '// ==/UserScript==',
  '',
].join('\n');

await mkdir(outputDirectory, { recursive: true });

const buildContext = await context({
  entryPoints: ['src/index.ts'],
  outfile: outputFile,
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['chrome105'],
  charset: 'utf8',
  legalComments: 'none',
  minify: false,
  sourcemap: isWatch ? 'inline' : false,
  banner: { js: metadata },
  plugins: [
    {
      name: 'ensure-trailing-newline',
      setup(build) {
        build.onEnd(async (result) => {
          if (result.errors.length > 0) return;
          const contents = await readFile(outputFile, 'utf8');
          await writeFile(outputFile, `${contents.trimEnd()}\n`);
        });
      },
    },
  ],
});

if (isWatch) {
  await buildContext.watch();
  console.log(`Watching source files; output: ${outputFile}`);
} else {
  await buildContext.rebuild();
  await buildContext.dispose();
  console.log(`Built ${outputFile}`);
}
