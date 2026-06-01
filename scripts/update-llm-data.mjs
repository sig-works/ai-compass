import { readFile, writeFile } from 'node:fs/promises';

const DATA_PATH = new URL('../public/data/llm-latest.json', import.meta.url);
const now = new Date().toISOString();

const sourceChecks = [
  { provider: 'OpenAI', url: 'https://openai.com/index/introducing-gpt-5-5/', keywords: ['GPT-5.5'] },
  { provider: 'OpenAI', url: 'https://help.openai.com/en/articles/11909943-gpt-53-and-gpt-54-in-chatgpt', keywords: ['GPT-5.5'] },
  { provider: 'Anthropic', url: 'https://www.anthropic.com/news/claude-opus-4-8', keywords: ['Claude Opus 4.8'] },
  { provider: 'Anthropic', url: 'https://docs.anthropic.com/en/docs/about-claude/models', keywords: ['Claude', 'Sonnet', 'Haiku'] },
  { provider: 'Google', url: 'https://ai.google.dev/gemini-api/docs/models', keywords: ['Gemini'] }
];

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'knowledge-flow-llm-updater/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const raw = await readFile(DATA_PATH, 'utf8');
  const data = JSON.parse(raw);
  const results = new Map();
  const failures = [];

  for (const source of sourceChecks) {
    try {
      const html = await fetchWithTimeout(source.url);
      const ok = source.keywords.some((keyword) => html.includes(keyword));

      if (!ok) {
        throw new Error(`expected keyword missing: ${source.keywords.join(', ')}`);
      }

      results.set(source.url, true);
      console.log(`ok ${source.url}`);
    } catch (error) {
      failures.push(`${source.provider}: ${source.url} (${error.message})`);
      results.set(source.url, false);
      console.warn(`warn ${source.url}: ${error.message}`);
    }
  }

  if (failures.length === sourceChecks.length) {
    console.error('All official source checks failed. Existing JSON was not changed.');
    process.exitCode = 1;
    return;
  }

  const models = data.models.map((model) => {
    const providerConfirmed = sourceChecks
      .filter((source) => source.provider === model.provider)
      .some((source) => results.get(source.url));

    if (results.get(model.officialUrl) || providerConfirmed) {
      return { ...model, lastCheckedAt: now };
    }

    return model;
  });

  const next = {
    ...data,
    generatedAt: now,
    sourcePolicy: 'official-only',
    updateStatus: failures.length > 0 ? 'partial-failure' : 'ok',
    updateMessage:
      failures.length > 0
        ? `Updated only sources that could be confirmed. Failed sources: ${failures.join(' / ')}`
        : 'All configured official sources were confirmed.',
    models
  };

  await writeFile(DATA_PATH, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
