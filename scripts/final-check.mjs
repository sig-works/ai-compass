import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { validateProjectShiftAssets } from './check-project-shift-assets.mjs';
import { validateProjectShiftStages } from './check-project-shift-stages.mjs';

const root = process.cwd();
const targets = ['src', 'public', '.github', 'scripts', 'AGENTS.md'];
const errors = [];

const mojibakeTokens = ['繝', '縺', '譁', '逕', '髢', '螳', '隱', '驕', '蜈', '豕'];
const forbiddenStrings = [
  '社内AI',
  '社内ナレッジ',
  '生成AI入門',
  'LLM比較',
  '一部情報の更新に失敗しました',
  '8領域'
];

function listFiles(path) {
  const absolute = join(root, path);
  const stats = statSync(absolute);

  if (stats.isFile()) return [absolute];

  return readdirSync(absolute).flatMap((name) => {
    const child = join(absolute, name);
    const childStats = statSync(child);
    if (childStats.isDirectory()) {
      if (['dist', 'node_modules', '.astro'].includes(name)) return [];
      return listFiles(relative(root, child));
    }
    return [child];
  });
}

if (existsSync(join(root, 'src/pages/search.astro'))) {
  errors.push('src/pages/search.astro: 不要な検索ページが復活しています。');
}

const files = targets.flatMap((target) => listFiles(target));
const textExtensions = new Set(['.astro', '.css', '.html', '.js', '.json', '.jsx', '.md', '.mdx', '.mjs', '.ts', '.tsx', '.txt', '.yml', '.yaml']);

for (const file of files) {
  const relativePath = relative(root, file).replaceAll('\\', '/');
  if (relativePath === 'scripts/final-check.mjs') continue;
  const extension = relativePath.slice(relativePath.lastIndexOf('.'));
  if (!textExtensions.has(extension)) continue;

  const text = readFileSync(file, 'utf8');

  if (relativePath.startsWith('src/content/') && relativePath.endsWith('.mdx')) {
    errors.push(`${relativePath}: MDX が残っています。Astro ページへ移行してください。`);
  }

  for (const token of mojibakeTokens) {
    if (text.includes(token)) {
      errors.push(`${relativePath}: 文字化けらしき文字列が残っています。`);
      break;
    }
  }

  for (const forbidden of forbiddenStrings) {
    if (forbidden === '8領域' && relativePath === 'AGENTS.md') continue;
    if (text.includes(forbidden)) {
      errors.push(`${relativePath}: 禁止語句 "${forbidden}" が残っています。`);
    }
  }
}

errors.push(...validateProjectShiftAssets(root));
errors.push(...validateProjectShiftStages(root));

const navigation = readFileSync(join(root, 'src/lib/navigation.ts'), 'utf8');
if (/search/i.test(navigation)) {
  errors.push('src/lib/navigation.ts: search 導線が残っています。');
}

const labels = [...navigation.matchAll(/label: '([^']+)'/g)].map((match) => match[1]);
const duplicates = labels.filter((label, index) => labels.indexOf(label) !== index);
if (duplicates.length > 0) {
  errors.push(`src/lib/navigation.ts: ナビゲーションのラベルが重複しています (${[...new Set(duplicates)].join(', ')})`);
}

const promptSwitcher = readFileSync(join(root, 'src/components/common/PromptPatternSwitcher.tsx'), 'utf8');
if (!/min-h-\[calc\(100dvh-12rem\)\]/.test(promptSwitcher) || !/Copy/.test(promptSwitcher)) {
  errors.push('src/components/common/PromptPatternSwitcher.tsx: プロンプト集の主要UIが崩れています。');
}

if (errors.length > 0) {
  console.error('Final check failed.');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('Final check passed.');
