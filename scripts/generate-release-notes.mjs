import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const [releaseTag, outputPath] = process.argv.slice(2);

if (!releaseTag || !outputPath) {
  console.error(
    'Usage: node scripts/generate-release-notes.mjs <tag> <output-file>',
  );
  process.exit(1);
}

const repository = process.env.GITHUB_REPOSITORY;
const repositoryUrl = repository ? `https://github.com/${repository}` : '';
const greasyForkUrl =
  'https://greasyfork.org/zh-CN/scripts/590116-hsguru-%E4%B8%AD%E6%96%87%E5%8A%A9%E6%89%8B';

const runGit = (...args) =>
  execFileSync('git', args, { encoding: 'utf8' }).trim();

let previousTag = '';

try {
  previousTag = runGit('describe', '--tags', '--abbrev=0', `${releaseTag}^`);
} catch {
  // The first release does not have a previous tag.
}

const revisionRange = previousTag
  ? `${previousTag}..${releaseTag}`
  : releaseTag;
const log = runGit('log', '--format=%H%x1f%s', revisionRange);

const categories = [
  { title: '新增功能', types: new Set(['feat']) },
  { title: '问题修复', types: new Set(['fix']) },
  { title: '性能优化', types: new Set(['perf']) },
  { title: '代码优化', types: new Set(['refactor']) },
  { title: '文档更新', types: new Set(['docs']) },
  {
    title: '工程维护',
    types: new Set(['build', 'chore', 'ci', 'style', 'test']),
  },
  { title: '其他变更', types: new Set() },
];

const entries = new Map(categories.map(({ title }) => [title, []]));

for (const line of log.split('\n').filter(Boolean)) {
  const [hash, subject] = line.split('\x1f');
  const conventional = subject.match(/^([a-z]+)(?:\([^)]*\))?!?:\s*(.+)$/i);
  const type = conventional?.[1].toLowerCase() ?? '';
  const description = conventional?.[2] ?? subject;

  if (type === 'release' || subject.startsWith('Merge ')) {
    continue;
  }

  const category =
    categories.find(({ types }) => types.has(type)) ?? categories.at(-1);
  const shortHash = hash.slice(0, 7);
  const commitReference = repositoryUrl
    ? `([\`${shortHash}\`](${repositoryUrl}/commit/${hash}))`
    : `\`${shortHash}\``;

  entries.get(category.title).push(`- ${description} ${commitReference}`);
}

const changeSections = [];

for (const { title } of categories) {
  const items = entries.get(title);

  if (items.length === 0) {
    continue;
  }

  changeSections.push(`### ${title}\n\n${items.join('\n')}`);
}

if (changeSections.length === 0) {
  changeSections.push('- 本版本包含常规维护和构建更新。');
}

const downloadInstruction = repositoryUrl
  ? `- [下载 hsguru-zh-cn.user.js](${repositoryUrl}/releases/download/${releaseTag}/hsguru-zh-cn.user.js)`
  : '- 在本次 Release 的附件中下载 `hsguru-zh-cn.user.js`。';
const sections = [
  `## 更新内容\n\n${changeSections.join('\n\n')}`,
  `## 安装与更新\n\n- [从 Greasy Fork 安装或更新脚本](${greasyForkUrl})\n${downloadInstruction}\n- 已安装 Release 版本的用户可通过 Tampermonkey 检查更新。`,
];

if (previousTag && repositoryUrl) {
  sections.push(
    `## 完整变更\n\n[查看 ${previousTag}...${releaseTag} 的全部提交](${repositoryUrl}/compare/${previousTag}...${releaseTag})`,
  );
}

writeFileSync(outputPath, `${sections.join('\n\n')}\n`);
