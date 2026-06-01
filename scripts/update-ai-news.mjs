import { readFile, writeFile } from 'node:fs/promises';

const DATA_PATH = new URL('../src/data/ai-news.json', import.meta.url);
const MAX_ITEMS = 32;
const MAX_PER_SOURCE = 12;
const OG_IMAGE_LIMIT = 16;

const sources = [
  {
    id: 'itmedia-aiplus',
    name: 'ITmedia AI+',
    type: 'media',
    url: 'https://rss.itmedia.co.jp/rss/2.0/aiplus.xml'
  },
  {
    id: 'aws-japan-ai',
    name: 'AWS Japan Blog',
    type: 'official',
    url: 'https://aws.amazon.com/jp/blogs/news/category/artificial-intelligence/amazon-machine-learning/feed/'
  },
  {
    id: 'microsoft-japan',
    name: 'Microsoft Japan',
    type: 'official',
    url: 'https://news.microsoft.com/ja-jp/feed/',
    keywords: ['AI', '生成AI', 'Copilot', 'Azure AI', '人工知能', 'エージェント']
  },
  {
    id: 'impress-watch',
    name: 'Impress Watch',
    type: 'media',
    url: 'https://www.watch.impress.co.jp/data/rss/1.0/ipw/feed.rdf',
    keywords: ['AI', '生成AI', 'LLM', 'ChatGPT', 'Gemini', 'Copilot', '人工知能']
  }
];

function decodeEntities(value = '') {
  return value
    .replaceAll('<![CDATA[', '')
    .replaceAll(']]>', '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function stripHtml(value = '') {
  return decodeEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getTag(block, tagName) {
  const match = block.match(new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return match ? decodeEntities(match[1]).trim() : '';
}

function getLink(block) {
  const atomLink = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i);
  if (atomLink) return decodeEntities(atomLink[1]).trim();

  return stripHtml(getTag(block, 'link'));
}

function getAttribute(block, tagName, attrName) {
  const match = block.match(new RegExp(`<${tagName}[^>]*\\s${attrName}=["']([^"']+)["'][^>]*>`, 'i'));
  return match ? decodeEntities(match[1]).trim() : '';
}

function getImageFromFeed(block) {
  const enclosureUrl = getAttribute(block, 'enclosure', 'url');
  const enclosureType = getAttribute(block, 'enclosure', 'type');
  if (enclosureUrl && enclosureType.startsWith('image/')) return enclosureUrl;

  const mediaContentUrl = getAttribute(block, 'media:content', 'url');
  const mediaContentType = getAttribute(block, 'media:content', 'type');
  if (mediaContentUrl && (!mediaContentType || mediaContentType.startsWith('image/'))) return mediaContentUrl;

  const mediaThumbnailUrl = getAttribute(block, 'media:thumbnail', 'url');
  if (mediaThumbnailUrl) return mediaThumbnailUrl;

  const description = getTag(block, 'description') || getTag(block, 'content:encoded');
  const imageMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i);
  return imageMatch ? decodeEntities(imageMatch[1]).trim() : '';
}

function parseFeed(xml, source) {
  const blocks = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].map((match) => match[0]);
  const atomBlocks = [...xml.matchAll(/<entry[\s\S]*?<\/entry>/gi)].map((match) => match[0]);
  const entries = blocks.length > 0 ? blocks : atomBlocks;

  return entries
    .map((block) => {
      const title = stripHtml(getTag(block, 'title'));
      const link = getLink(block);
      const rawDate =
        getTag(block, 'pubDate') || getTag(block, 'dc:date') || getTag(block, 'updated') || getTag(block, 'published');
      const excerpt = stripHtml(
        getTag(block, 'description') || getTag(block, 'summary') || getTag(block, 'content:encoded') || ''
      );
      const publishedAt = rawDate ? new Date(rawDate).toISOString() : '';

      return {
        title,
        url: link,
        source: source.name,
        sourceId: source.id,
        sourceType: source.type,
        publishedAt,
        imageUrl: getImageFromFeed(block),
        excerpt: excerpt.length > 110 ? `${excerpt.slice(0, 109)}…` : excerpt
      };
    })
    .filter((item) => item.title && item.url)
    .filter((item) => {
      if (!source.keywords) return true;
      const haystack = `${item.title} ${item.excerpt}`;
      return source.keywords.some((keyword) => haystack.includes(keyword));
    });
}

async function resolveOgImage(item) {
  if (item.imageUrl) return item;

  try {
    const html = await fetchText(item.url);
    const match =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i) ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i);

    if (!match) return item;

    return {
      ...item,
      imageUrl: new URL(decodeEntities(match[1]).trim(), item.url).toString()
    };
  } catch {
    return item;
  }
}

async function enrichImages(items) {
  const enriched = [];

  for (const item of items) {
    if (enriched.length < OG_IMAGE_LIMIT) {
      enriched.push(await resolveOgImage(item));
    } else {
      enriched.push(item);
    }
  }

  return enriched;
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'ai-compass-news-updater/1.0'
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

function rankItems(items) {
  const seen = new Set();
  const sourceCounts = new Map();

  return items
    .filter((item) => {
      const key = item.url || item.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime())
    .filter((item) => {
      const count = sourceCounts.get(item.sourceId) ?? 0;
      if (count >= MAX_PER_SOURCE) return false;
      sourceCounts.set(item.sourceId, count + 1);
      return true;
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
  const failures = [];
  const allItems = [];

  for (const source of sources) {
    try {
      const xml = await fetchText(source.url);
      const items = parseFeed(xml, source);
      allItems.push(...items);
      console.log(`ok ${source.name}: ${items.length} item(s)`);
    } catch (error) {
      failures.push(`${source.name}: ${error.message}`);
      console.warn(`warn ${source.name}: ${error.message}`);
    }
  }

  const items = await enrichImages(rankItems(allItems));
  const generatedAt = new Date().toISOString();
  const next = {
    generatedAt,
    updateStatus: failures.length > 0 ? 'partial-failure' : 'ok',
    updateMessage:
      failures.length > 0 ? `一部のRSS取得に失敗しました: ${failures.join(' / ')}` : '日本語AI関連記事を更新しました。',
    policy: 'japanese-sources-only',
    sources: sources.map(({ id, name, type, url, keywords }) => ({ id, name, type, url, keywords: keywords ?? [] })),
    items: items.length > 0 ? items : existing.items ?? []
  };

  if (items.length === 0 && (existing.items?.length ?? 0) === 0) {
    console.error('No news items were fetched and no existing items are available.');
    process.exitCode = 1;
    return;
  }

  await writeFile(DATA_PATH, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
