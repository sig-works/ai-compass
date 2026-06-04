import { readFile, writeFile } from 'node:fs/promises';

const DATA_PATH = new URL('../src/data/ai-videos.json', import.meta.url);
const MIN_ITEMS_FOR_UPDATE = 10;
const MAX_ITEMS = 48;

const categories = [
  {
    id: 'learn',
    label: '学ぶ',
    description: 'AIやLLMの基本を理解するための定番動画'
  },
  {
    id: 'use',
    label: '使う',
    description: 'ChatGPT、Claude、Gemini、Copilotなどを試すための動画'
  },
  {
    id: 'official',
    label: '公式発表',
    description: '公式・準公式の発表やデモ'
  },
  {
    id: 'developer',
    label: '開発者向け',
    description: 'API、エージェント、実装、モデル理解に関する動画'
  }
];

const includeKeywords = [
  'llm',
  'large language model',
  'language model',
  'chatgpt',
  'gpt',
  'claude',
  'gemini',
  'copilot',
  'prompt',
  'agent',
  'agents',
  'api',
  'machine learning',
  'deep learning',
  'neural network',
  'transformer',
  'tokenizer',
  '生成ai',
  '大規模言語モデル',
  'プロンプト',
  'エージェント',
  '機械学習',
  '深層学習',
  'ニューラルネット',
  '人工知能'
];

const excludeKeywords = [
  '#shorts',
  'shorts',
  'live stream',
  'upcoming live',
  'premiere',
  'waiting room',
  'trailer',
  'teaser',
  'hiring',
  'recruit',
  'career',
  '採用',
  '求人',
  '導入事例',
  '事例紹介',
  'customer story',
  'case study',
  'ships faster',
  'countrywide',
  'claims',
  'frontier town',
  'stargate project',
  'office tour'
];

const curatedVideos = [
  {
    videoId: 'zjkBMFhNj_g',
    title: 'Intro to Large Language Models',
    source: 'Andrej Karpathy',
    sourceId: 'karpathy',
    sourceType: 'educator',
    language: 'en',
    categoryId: 'learn',
    publishedAt: '2023-11-22T00:00:00.000Z',
    rank: 1
  },
  {
    videoId: '7xTGNNLPyMI',
    title: 'Deep Dive into LLMs like ChatGPT',
    source: 'Andrej Karpathy',
    sourceId: 'karpathy',
    sourceType: 'educator',
    language: 'en',
    categoryId: 'learn',
    publishedAt: '2025-02-05T00:00:00.000Z',
    rank: 2
  },
  {
    videoId: 'kCc8FmEb1nY',
    title: "Let's build GPT: from scratch, in code, spelled out.",
    source: 'Andrej Karpathy',
    sourceId: 'karpathy',
    sourceType: 'educator',
    language: 'en',
    categoryId: 'developer',
    publishedAt: '2023-01-17T00:00:00.000Z',
    rank: 3
  },
  {
    videoId: 'zduSFxRajkE',
    title: "Let's build the GPT Tokenizer",
    source: 'Andrej Karpathy',
    sourceId: 'karpathy',
    sourceType: 'educator',
    language: 'en',
    categoryId: 'developer',
    publishedAt: '2024-02-20T00:00:00.000Z',
    rank: 4
  },
  {
    videoId: 'VMj-3S1tku0',
    title: 'The spelled-out intro to neural networks and backpropagation',
    source: 'Andrej Karpathy',
    sourceId: 'karpathy',
    sourceType: 'educator',
    language: 'en',
    categoryId: 'learn',
    publishedAt: '2022-08-16T00:00:00.000Z',
    rank: 5
  },
  {
    videoId: 'cdflu9ZXZGE',
    title: 'Terence Tao on How AI Is Changing Mathematics',
    source: 'OpenAI',
    sourceId: 'openai',
    sourceType: 'official',
    language: 'en',
    categoryId: 'learn',
    publishedAt: '2026-05-21T00:00:00.000Z',
    rank: 10
  },
  {
    videoId: 'MPIAB-8VmCo',
    title: 'Windows Computer Use and mobile access for Codex',
    source: 'OpenAI',
    sourceId: 'openai',
    sourceType: 'official',
    language: 'en',
    categoryId: 'use',
    publishedAt: '2026-05-16T00:00:00.000Z',
    rank: 11
  },
  {
    videoId: 'ZrEc46wUIPU',
    title: 'Lovable on How GPT-5.5 Unlocks Better Planning for Complex Builds',
    source: 'OpenAI',
    sourceId: 'openai',
    sourceType: 'official',
    language: 'en',
    categoryId: 'developer',
    publishedAt: '2026-05-27T00:00:00.000Z',
    rank: 12
  },
  {
    videoId: 'j2knrqAzYVY',
    title: 'Translating Claude’s thoughts into language',
    source: 'Anthropic',
    sourceId: 'anthropic',
    sourceType: 'official',
    language: 'en',
    categoryId: 'learn',
    publishedAt: '2026-05-29T00:00:00.000Z',
    rank: 20
  },
  {
    videoId: 'mM9TY91FECI',
    title: "AI's limited self-knowledge",
    source: 'Anthropic',
    sourceId: 'anthropic',
    sourceType: 'official',
    language: 'en',
    categoryId: 'learn',
    publishedAt: '2026-05-07T00:00:00.000Z',
    rank: 21
  },
  {
    videoId: 'nvbq39yVYRk',
    title: 'What is sycophancy in AI models?',
    source: 'Anthropic',
    sourceId: 'anthropic',
    sourceType: 'official',
    language: 'en',
    categoryId: 'learn',
    publishedAt: '2026-04-30T00:00:00.000Z',
    rank: 22
  },
  {
    videoId: 'bluAmTHoEow',
    title: 'Your tools are now interactive in Claude',
    source: 'Anthropic',
    sourceId: 'anthropic',
    sourceType: 'official',
    language: 'en',
    categoryId: 'use',
    publishedAt: '2026-05-15T00:00:00.000Z',
    rank: 23
  },
  {
    videoId: 'dPn3GBI8lII',
    title: 'Introducing Claude Opus 4.6',
    source: 'Anthropic',
    sourceId: 'anthropic',
    sourceType: 'official',
    language: 'en',
    categoryId: 'official',
    publishedAt: '2026-05-22T00:00:00.000Z',
    rank: 24
  },
  {
    videoId: 'rBJnWMD0Pho',
    title: 'Let Claude handle work in your browser',
    source: 'Anthropic',
    sourceId: 'anthropic',
    sourceType: 'official',
    language: 'en',
    categoryId: 'use',
    publishedAt: '2026-04-25T00:00:00.000Z',
    rank: 25
  },
  {
    videoId: 'apDSSh1ppLo',
    title: 'Microsoft 365 Copilot and Copilot Studio Demo: Microsoft Build 2025',
    source: 'Microsoft Developer',
    sourceId: 'microsoft-developer',
    sourceType: 'official',
    language: 'en',
    categoryId: 'use',
    publishedAt: '2025-05-20T00:00:00.000Z',
    rank: 30
  }
];

const playlistSources = [
  // Add playlist_id feeds here as official or educator-maintained AI playlists become stable enough to trust.
  // YouTube playlist RSS format: https://www.youtube.com/feeds/videos.xml?playlist_id=PLAYLIST_ID
];

function decodeEntities(value = '') {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)));
}

function stripHtml(value = '') {
  return decodeEntities(value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function getTag(block, tagName) {
  const match = block.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return match ? decodeEntities(match[1]).trim() : '';
}

function getAttribute(block, tagName, attrName) {
  const tag = block.match(new RegExp(`<${tagName}\\b[^>]*>`, 'i'))?.[0] ?? '';
  const match = tag.match(new RegExp(`\\s${attrName}=["']([^"']+)["']`, 'i'));
  return match ? decodeEntities(match[1]).trim() : '';
}

function getLink(block) {
  const href = getAttribute(block, 'link', 'href');
  if (href) return href;
  return stripHtml(getTag(block, 'link'));
}

function toIsoDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function includesAny(value, keywords) {
  const haystack = value.toLowerCase();
  return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
}

function thumbnailFor(videoId) {
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '';
}

function sourceTypeLabel(type) {
  if (type === 'official') return '公式';
  if (type === 'educator') return '定番講義';
  return '準公式';
}

function categoryFor(categoryId) {
  return categories.find((category) => category.id === categoryId) ?? categories[0];
}

function isAllowedVideo(item) {
  const haystack = `${item.title} ${item.description ?? ''}`;
  if (includesAny(haystack, excludeKeywords)) return false;
  if (item.popularitySignal === 'classic-educator-video' || item.popularitySignal === 'official-curated-video') return true;
  return includesAny(haystack, includeKeywords);
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: 'application/rss+xml, application/xml, text/xml, text/html;q=0.9, */*;q=0.8',
        'accept-language': 'ja,en-US;q=0.8,en;q=0.7',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36 ai-compass-video-updater/2.0'
      }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchOembed(videoId) {
  try {
    const url = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`;
    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
        'user-agent': 'ai-compass-video-updater/2.0'
      }
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function buildCuratedItem(entry) {
  const category = categoryFor(entry.categoryId);
  const oembed = await fetchOembed(entry.videoId);
  const title = stripHtml(oembed?.title ?? entry.title);
  const source = stripHtml(oembed?.author_name ?? entry.source);
  const description = stripHtml(entry.description ?? '');

  return {
    id: entry.videoId,
    title,
    url: `https://www.youtube.com/watch?v=${entry.videoId}`,
    videoId: entry.videoId,
    source,
    sourceId: entry.sourceId,
    sourceType: entry.sourceType,
    sourceTypeLabel: sourceTypeLabel(entry.sourceType),
    language: entry.language,
    publishedAt: entry.publishedAt,
    imageUrl: oembed?.thumbnail_url ?? thumbnailFor(entry.videoId),
    description,
    categoryId: category.id,
    category: category.label,
    rank: entry.rank ?? 999,
    popularitySignal: entry.sourceType === 'educator' ? 'classic-educator-video' : 'official-curated-video'
  };
}

function parsePlaylistFeed(xml, source) {
  const entries = [...xml.matchAll(/<entry[\s\S]*?<\/entry>/gi)].map((match) => match[0]);

  return entries
    .map((block) => {
      const title = stripHtml(getTag(block, 'title'));
      const videoId = stripHtml(getTag(block, 'yt:videoId'));
      const description = stripHtml(getTag(block, 'media:description') || getTag(block, 'summary'));
      const category = categoryFor(source.categoryId);

      if (!title || !videoId) return null;

      return {
        id: videoId,
        title,
        url: getLink(block) || `https://www.youtube.com/watch?v=${videoId}`,
        videoId,
        source: source.name,
        sourceId: source.id,
        sourceType: source.type,
        sourceTypeLabel: sourceTypeLabel(source.type),
        language: source.language,
        publishedAt: toIsoDate(getTag(block, 'published') || getTag(block, 'updated')),
        imageUrl: getAttribute(block, 'media:thumbnail', 'url') || thumbnailFor(videoId),
        description: description.length > 140 ? `${description.slice(0, 139)}...` : description,
        categoryId: category.id,
        category: category.label,
        rank: source.rankBase ?? 500,
        popularitySignal: 'allowlisted-playlist'
      };
    })
    .filter(Boolean)
    .filter(isAllowedVideo);
}

async function fetchPlaylistItems(source) {
  const feedUrl = source.feedUrl ?? `https://www.youtube.com/feeds/videos.xml?playlist_id=${source.playlistId}`;
  const xml = await fetchText(feedUrl);
  return {
    feedUrl,
    items: parsePlaylistFeed(xml, source).slice(0, source.maxItems ?? 8)
  };
}

function dedupeItems(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.videoId)) return false;
    seen.add(item.videoId);
    return true;
  });
}

function rankItems(items) {
  return dedupeItems(items)
    .sort((a, b) => {
      const rank = (a.rank ?? 999) - (b.rank ?? 999);
      if (rank !== 0) return rank;
      return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
    })
    .slice(0, MAX_ITEMS);
}

async function readExisting() {
  try {
    return JSON.parse(await readFile(DATA_PATH, 'utf8'));
  } catch {
    return { items: [] };
  }
}

async function main() {
  const existing = await readExisting();
  const allItems = [];
  const resolvedSources = [];

  for (const entry of curatedVideos) {
    const item = await buildCuratedItem(entry);
    if (isAllowedVideo(item)) allItems.push(item);
  }

  const sourceMap = new Map();
  for (const entry of curatedVideos) {
    sourceMap.set(entry.sourceId, {
      id: entry.sourceId,
      name: entry.source,
      type: entry.sourceType,
      language: entry.language,
      mode: 'curated-videos'
    });
  }
  resolvedSources.push(...sourceMap.values());

  for (const source of playlistSources) {
    try {
      const { feedUrl, items } = await fetchPlaylistItems(source);
      allItems.push(...items);
      resolvedSources.push({ ...source, feedUrl, mode: 'playlist' });
      console.log(`ok ${source.name}: ${items.length} playlist item(s)`);
    } catch (error) {
      resolvedSources.push({ ...source, feedUrl: source.feedUrl ?? '', mode: 'playlist', error: error.message });
      console.warn(`warn ${source.name}: ${error.message}`);
    }
  }

  const items = rankItems(allItems);
  const keepExisting = items.length < MIN_ITEMS_FOR_UPDATE && (existing.items?.length ?? 0) >= MIN_ITEMS_FOR_UPDATE;
  const outputItems = keepExisting ? existing.items : items;
  const output = {
    generatedAt: new Date().toISOString(),
    updateStatus: keepExisting ? 'fallback' : 'ok',
    updateMessage: keepExisting
      ? '取得件数が少なすぎたため、既存のAI動画データを保持しました。'
      : 'AI動画データを厳選ソースから更新しました。',
    policy: 'curated-official-and-educator-youtube-videos',
    popularityPolicy: '視聴回数APIは使わず、公式/準公式プレイリストと有名教育者の定番性を人気の代理信号にします。',
    categories: categories.map((category) => ({
      ...category,
      count: outputItems.filter((item) => item.categoryId === category.id).length
    })),
    sources: resolvedSources.map(({ id, name, type, language, mode, playlistId, feedUrl }) => ({
      id,
      name,
      type,
      language,
      mode,
      playlistId,
      feedUrl
    })),
    items: outputItems
  };

  if (output.items.length === 0) {
    console.error('No curated video items are available.');
    process.exitCode = 1;
  }

  await writeFile(DATA_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`updated ${output.items.length} video item(s)`);
}

await main();
