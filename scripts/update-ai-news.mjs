import { readFile, writeFile } from 'node:fs/promises';

const DATA_PATH = new URL('../src/data/ai-news.json', import.meta.url);
const MAX_ITEMS = 140;
const MAX_PER_CATEGORY_REGION = 24;
const MAX_PER_SOURCE = 10;
const OG_IMAGE_LIMIT = 48;
const FALLBACK_IMAGE_URL = '/images/news-fallback.png';

const regions = [
  {
    id: 'domestic',
    label: '国内',
    description: '日本語公式情報と国内AIメディアを中心に確認します。'
  },
  {
    id: 'global',
    label: '海外',
    description: '海外の一次ソース・公式系ニュースを中心に確認します。'
  }
];

const categories = [
  {
    id: 'ai-news',
    label: '国内ニュース',
    description: '国内向けの日本語AIニュースと日本語公式情報。'
  },
  {
    id: 'tech-articles',
    label: '技術記事',
    description: '実装者向けの日本語AI技術記事。'
  },
  {
    id: 'official',
    label: '公式',
    description: 'OpenAI、Anthropic、Google、Copilot 関連の公式・準公式ニュース。'
  }
];

const aiKeywords = [
  'AI',
  '人工知能',
  '生成AI',
  'LLM',
  '大規模言語モデル',
  'ChatGPT',
  'OpenAI',
  'Claude',
  'Anthropic',
  'Gemini',
  'Google AI',
  'DeepMind',
  'Copilot',
  'AIエージェント',
  '機械学習',
  '基盤モデル'
];

const copilotKeywords = ['Copilot', 'コパイロット', 'Microsoft 365 Copilot', 'Copilot Studio', 'Copilot+'];
const googleKeywords = ['AI', '人工知能', '生成AI', 'Gemini', 'ジェミニ', 'Google AI', 'DeepMind', 'AI Studio', 'Vertex AI'];

const sources = [
  {
    id: 'openai-news',
    categoryId: 'official',
    regionId: 'global',
    name: 'OpenAI News',
    type: 'official',
    language: 'en',
    priority: 1,
    url: 'https://openai.com/news/rss.xml'
  },
  {
    id: 'openai-japan-ai-news',
    categoryId: 'ai-news',
    regionId: 'domestic',
    name: 'OpenAI News 日本語',
    type: 'official',
    language: 'ja',
    priority: 2,
    maxItems: 5,
    url: 'https://openai.com/news/rss.xml',
    acceptLanguage: 'ja-JP,ja;q=0.9,en;q=0.5'
  },
  {
    id: 'anthropic-news-mirror',
    categoryId: 'official',
    regionId: 'global',
    name: 'Anthropic News mirror',
    type: 'semi-official',
    language: 'en',
    priority: 1,
    url: 'https://raw.githubusercontent.com/Olshansk/rss-feeds/main/feeds/feed_anthropic_news.xml',
    sourceUrl: 'https://www.anthropic.com/news'
  },
  {
    id: 'google-japan-blog-ai-news',
    categoryId: 'ai-news',
    regionId: 'domestic',
    name: 'Google Japan Blog',
    type: 'official',
    language: 'ja',
    priority: 2,
    maxItems: 5,
    url: 'https://blog.google/intl/ja-jp/rss/',
    keywords: googleKeywords
  },
  {
    id: 'microsoft-japan-news-ai-news',
    categoryId: 'ai-news',
    regionId: 'domestic',
    name: 'Microsoft Japan News Center',
    type: 'official',
    language: 'ja',
    priority: 2,
    maxItems: 4,
    url: 'https://news.microsoft.com/ja-jp/feed/',
    keywords: copilotKeywords
  },
  {
    id: 'itmedia-ai-plus',
    categoryId: 'ai-news',
    regionId: 'domestic',
    name: 'ITmedia AI+',
    type: 'domestic-media',
    language: 'ja',
    priority: 3,
    maxItems: 6,
    url: 'https://rss.itmedia.co.jp/rss/2.0/aiplus.xml'
  },
  {
    id: 'ledge-ai',
    categoryId: 'ai-news',
    regionId: 'domestic',
    name: 'Ledge.ai',
    type: 'domestic-media',
    language: 'ja',
    priority: 3,
    maxItems: 6,
    parser: 'ledge-html',
    url: 'https://ledge.ai/'
  },
  {
    id: 'ai-scholar',
    categoryId: 'ai-news',
    regionId: 'domestic',
    name: 'AI-SCHOLAR',
    type: 'domestic-media',
    language: 'ja',
    priority: 3,
    maxItems: 6,
    parser: 'ai-scholar-html',
    url: 'https://ai-scholar.tech/'
  },
  {
    id: 'qiita-ai',
    categoryId: 'tech-articles',
    regionId: 'domestic',
    name: 'Qiita AI',
    type: 'domestic-media',
    language: 'ja',
    priority: 3,
    maxItems: 5,
    url: 'https://qiita.com/tags/AI/feed.atom'
  },
  {
    id: 'qiita-llm',
    categoryId: 'tech-articles',
    regionId: 'domestic',
    name: 'Qiita LLM',
    type: 'domestic-media',
    language: 'ja',
    priority: 3,
    maxItems: 5,
    url: 'https://qiita.com/tags/LLM/feed.atom'
  },
  {
    id: 'qiita-generative-ai',
    categoryId: 'tech-articles',
    regionId: 'domestic',
    name: 'Qiita 生成AI',
    type: 'domestic-media',
    language: 'ja',
    priority: 3,
    maxItems: 5,
    url: 'https://qiita.com/tags/%E7%94%9F%E6%88%90AI/feed.atom'
  },
  {
    id: 'google-gemini-blog',
    categoryId: 'official',
    regionId: 'global',
    name: 'Google Blog: Gemini',
    type: 'official',
    language: 'en',
    priority: 1,
    url: 'https://blog.google/products/gemini/rss/'
  },
  {
    id: 'google-ai-blog',
    categoryId: 'official',
    regionId: 'global',
    name: 'Google AI Blog',
    type: 'official',
    language: 'en',
    priority: 1,
    url: 'https://blog.google/technology/ai/rss/',
    keywords: ['Gemini', 'Google AI', 'AI Studio', 'Vertex AI']
  },
  {
    id: 'google-deepmind',
    categoryId: 'official',
    regionId: 'global',
    name: 'Google DeepMind',
    type: 'official',
    language: 'en',
    priority: 1,
    url: 'https://deepmind.google/blog/rss.xml',
    keywords: ['Gemini']
  },
  {
    id: 'github-blog-copilot',
    categoryId: 'official',
    regionId: 'global',
    name: 'GitHub Blog Copilot',
    type: 'official',
    language: 'en',
    priority: 1,
    url: 'https://github.blog/tag/github-copilot/feed/'
  },
  {
    id: 'github-changelog-copilot',
    categoryId: 'official',
    regionId: 'global',
    name: 'GitHub Changelog Copilot',
    type: 'official',
    language: 'en',
    priority: 1,
    url: 'https://github.blog/changelog/label/copilot/feed/'
  },
  {
    id: 'microsoft-official-blog',
    categoryId: 'official',
    regionId: 'global',
    name: 'Official Microsoft Blog',
    type: 'official',
    language: 'en',
    priority: 1,
    url: 'https://blogs.microsoft.com/feed/',
    keywords: copilotKeywords
  },
  {
    id: 'microsoft-365-blog',
    categoryId: 'official',
    regionId: 'global',
    name: 'Microsoft 365 Blog',
    type: 'official',
    language: 'en',
    priority: 1,
    url: 'https://www.microsoft.com/en-us/microsoft-365/blog/feed/',
    keywords: ['Copilot', 'Microsoft 365 Copilot', 'Copilot Studio']
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

function getHtmlAttribute(block, attrName) {
  const match = block.match(new RegExp(`\\s${attrName}=["']([^"']+)["']`, 'i'));
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

  const description = getTag(block, 'description') || getTag(block, 'content:encoded') || getTag(block, 'summary');
  const imageMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i);
  return imageMatch ? decodeEntities(imageMatch[1]).trim() : '';
}

function getMetaImage(html) {
  const match =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i) ||
    html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i);
  return match ? decodeEntities(match[1]).trim() : '';
}

function toIsoDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function parseDateParts(year, month, day) {
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))).toISOString();
}

function parseJapaneseDate(value = '') {
  const match = value.match(/(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/);
  if (!match) return '';
  return parseDateParts(match[1], match[2], match[3]);
}

function getExcerpt(block) {
  const raw = getTag(block, 'description') || getTag(block, 'summary') || getTag(block, 'content:encoded') || '';
  const text = stripHtml(raw);
  return text.length > 150 ? `${text.slice(0, 149)}...` : text;
}

function matchesKeywords(item, keywords = []) {
  if (keywords.length === 0) return true;
  const haystack = `${item.title} ${item.excerpt}`.toLowerCase();
  return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
}

function hasJapaneseText(value = '') {
  return /[ぁ-んァ-ヶ一-龠々]/.test(value);
}

function isAllowedByRegion(item) {
  if (item.regionId !== 'domestic') return true;
  return item.language === 'ja' && hasJapaneseText(`${item.title} ${item.excerpt}`);
}

function normalizeUrl(value = '') {
  try {
    const url = new URL(value);
    url.hash = '';
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|fbclid|gclid)/i.test(key)) url.searchParams.delete(key);
    }
    return url.toString().replace(/\/$/, '');
  } catch {
    return value.trim();
  }
}

function normalizeTitle(value = '') {
  return value
    .toLowerCase()
    .replace(/[「」『』"'“”‘’（）()[\]【】]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function categoryFor(source) {
  return categories.find((item) => item.id === source.categoryId);
}

function regionFor(source) {
  return regions.find((item) => item.id === source.regionId);
}

function buildItem(source, values) {
  const category = categoryFor(source);
  const region = regionFor(source);
  return {
    title: values.title,
    url: values.url,
    categoryId: source.categoryId,
    category: category?.label ?? source.categoryId,
    regionId: source.regionId,
    region: region?.label ?? source.regionId,
    source: source.name,
    sourceId: source.id,
    sourceType: source.type,
    sourceMaxItems: source.maxItems,
    language: source.language,
    publishedAt: values.publishedAt ?? '',
    imageUrl: values.imageUrl ?? '',
    excerpt: values.excerpt ?? values.title
  };
}

function parseLedgeHtml(html, source) {
  const seen = new Set();
  const blocks = [
    ...html.matchAll(
      /<a\b(?=[^>]*href=["']([^"']*\/articles\/[^"']+)["'])(?=[^>]*class=["'][^"']*(?:rounded|flex)[^"']*["'])[^>]*>[\s\S]*?<\/a>/gi
    )
  ];

  return blocks
    .map((match) => {
      const block = match[0];
      const url = new URL(decodeEntities(match[1]).trim(), source.url).toString();
      if (seen.has(url)) return null;
      seen.add(url);

      const title =
        stripHtml(getTag(block, 'h3')).replace(/のサムネイル画像$/, '') ||
        stripHtml(getHtmlAttribute(block.match(/<img\b[^>]*>/i)?.[0] ?? '', 'alt')).replace(/のサムネイル画像$/, '');
      const dateMatch =
        block.match(/(\d{4})\s*<span>\s*\/\s*<\/span>\s*(\d{1,2})\s*<span>\s*\/\s*<\/span>\s*(\d{1,2})/) ||
        stripHtml(block).match(/(\d{4})\s*\/\s*(\d{1,2})\s*\/\s*(\d{1,2})/);
      const imgBlock = block.match(/<img\b[^>]*>/i)?.[0] ?? '';
      const imageUrl = getHtmlAttribute(imgBlock, 'data-src') || getHtmlAttribute(imgBlock, 'src');
      if (!title || !dateMatch) return null;

      return buildItem(source, {
        title,
        url,
        publishedAt: parseDateParts(dateMatch[1], dateMatch[2], dateMatch[3]),
        imageUrl: imageUrl ? new URL(imageUrl, source.url).toString() : '',
        excerpt: title
      });
    })
    .filter(Boolean)
    .filter((item) => matchesKeywords(item, source.keywords ?? aiKeywords));
}

function parseAiScholarHtml(html, source) {
  const seen = new Set();
  const blocks = [...html.matchAll(/<article\b[\s\S]*?<\/article>/gi)].map((match) => match[0]);

  return blocks
    .map((block) => {
      const href = getHtmlAttribute(block.match(/<a\b[^>]*>/i)?.[0] ?? '', 'href');
      if (!href) return null;
      const url = new URL(href, source.url).toString();
      if (seen.has(url)) return null;
      seen.add(url);

      const title = stripHtml(getTag(block, 'h3'));
      const datetime = getHtmlAttribute(block.match(/<time\b[^>]*>/i)?.[0] ?? '', 'datetime');
      const imgBlock = block.match(/<img\b[^>]*>/i)?.[0] ?? '';
      const imageUrl = getHtmlAttribute(imgBlock, 'data-src') || getHtmlAttribute(imgBlock, 'src');
      if (!title) return null;

      return buildItem(source, {
        title,
        url,
        publishedAt: toIsoDate(datetime) || parseJapaneseDate(block),
        imageUrl: imageUrl && !imageUrl.startsWith('data:') ? new URL(imageUrl, source.url).toString() : '',
        excerpt: title
      });
    })
    .filter(Boolean)
    .filter((item) => matchesKeywords(item, source.keywords ?? aiKeywords));
}

function parseFeed(xml, source) {
  if (source.parser === 'ledge-html') return parseLedgeHtml(xml, source);
  if (source.parser === 'ai-scholar-html') return parseAiScholarHtml(xml, source);

  const itemBlocks = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].map((match) => match[0]);
  const entryBlocks = [...xml.matchAll(/<entry[\s\S]*?<\/entry>/gi)].map((match) => match[0]);
  const entries = itemBlocks.length > 0 ? itemBlocks : entryBlocks;

  return entries
    .map((block) => {
      const title = stripHtml(getTag(block, 'title'));
      const url = getLink(block);
      const rawDate =
        getTag(block, 'pubDate') || getTag(block, 'dc:date') || getTag(block, 'updated') || getTag(block, 'published');
      const excerpt = getExcerpt(block);

      return buildItem(source, {
        title,
        url,
        publishedAt: toIsoDate(rawDate),
        imageUrl: getImageFromFeed(block),
        excerpt
      });
    })
    .filter((item) => item.title && item.url)
    .filter((item) => matchesKeywords(item, source.keywords));
}

async function fetchText(url, source = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: 'application/rss+xml, application/xml, text/xml, text/html;q=0.9, */*;q=0.8',
        'accept-language': source.acceptLanguage ?? 'ja,en-US;q=0.8,en;q=0.7',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36 ai-compass-news-updater/4.0'
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

async function resolveOgImage(item) {
  if (item.imageUrl) return item;

  try {
    const html = await fetchText(item.url);
    const imageUrl = getMetaImage(html);
    if (!imageUrl) return item;

    return {
      ...item,
      imageUrl: new URL(imageUrl, item.url).toString()
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

  return enriched.map((item) => ({
    ...item,
    imageUrl: item.imageUrl || FALLBACK_IMAGE_URL
  }));
}

function rankItems(items) {
  const ordered = [...items].sort((a, b) => {
    const priorityDiff = (a.priority ?? 99) - (b.priority ?? 99);
    const dateDiff = new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
    return priorityDiff || dateDiff;
  });
  const seenUrls = new Set();
  const seenTitles = new Set();
  const deduped = [];

  for (const item of ordered) {
    const scope = `${item.regionId}:${item.categoryId}`;
    const urlKey = `${scope}:url:${normalizeUrl(item.url)}`;
    const titleKey = `${scope}:title:${normalizeTitle(item.title)}`;
    if (seenUrls.has(urlKey) || seenTitles.has(titleKey)) continue;
    seenUrls.add(urlKey);
    seenTitles.add(titleKey);
    deduped.push(item);
  }

  const sourceCounts = new Map();
  const categoryRegionCounts = new Map();

  return deduped
    .sort((a, b) => {
      const dateDiff = new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
      return dateDiff || (a.priority ?? 99) - (b.priority ?? 99);
    })
    .filter((item) => {
      const sourceCount = sourceCounts.get(item.sourceId) ?? 0;
      const categoryRegionKey = `${item.categoryId}:${item.regionId}`;
      const categoryRegionCount = categoryRegionCounts.get(categoryRegionKey) ?? 0;
      if (sourceCount >= (item.sourceMaxItems ?? MAX_PER_SOURCE) || categoryRegionCount >= MAX_PER_CATEGORY_REGION) return false;
      sourceCounts.set(item.sourceId, sourceCount + 1);
      categoryRegionCounts.set(categoryRegionKey, categoryRegionCount + 1);
      return true;
    })
    .slice(0, MAX_ITEMS)
    .map(({ priority, sourceMaxItems, ...item }) => item);
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
      const text = await fetchText(source.url, source);
      const items = parseFeed(text, source)
        .filter(isAllowedByRegion)
        .map((item) => ({ ...item, priority: source.priority ?? 99 }));
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
      failures.length > 0 ? `一部のニュース取得に失敗しました: ${failures.join(' / ')}` : 'AIニュースを更新しました。',
    policy: 'link-summary-only-with-official-and-trusted-japanese-sources',
    regions: regions.map((region) => ({
      ...region,
      count: items.filter((item) => item.regionId === region.id).length
    })),
    categories: categories.map((category) => ({
      ...category,
      count: items.filter((item) => item.categoryId === category.id).length,
      domesticCount: items.filter((item) => item.categoryId === category.id && item.regionId === 'domestic').length,
      globalCount: items.filter((item) => item.categoryId === category.id && item.regionId === 'global').length
    })),
    sources: sources.map(({ id, categoryId, regionId, name, type, language, url, sourceUrl, keywords, parser }) => ({
      id,
      categoryId,
      regionId,
      name,
      type,
      language,
      url: sourceUrl ?? url,
      feedUrl: url,
      parser: parser ?? 'rss',
      keywords: keywords ?? []
    })),
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
