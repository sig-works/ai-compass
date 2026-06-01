export interface ArticleEntry {
  id: string;
  body: string;
  data: {
    title: string;
    description: string;
    category: string;
    tags: string[];
    date: Date;
  };
}

export interface ArticleCardData {
  title: string;
  description: string;
  category: string;
  categorySlug: string;
  categoryUrl: string;
  tags: string[];
  url: string;
  dateIso: string;
  dateLabel: string;
}

export interface SearchDocument extends ArticleCardData {
  content: string;
}

export interface CategorySummary {
  name: string;
  slug: string;
  href: string;
  count: number;
  description: string;
  tags: string[];
}

export const SITE_NAME = 'AI Compass';
export const SITE_DESCRIPTION =
  'AI入門、LLM、プロンプト、用語集、モデル選定を落ち着いたUIでまとめた公開サイト。';

const DATE_FORMATTER = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
});

const CATEGORY_COPY: Record<string, string> = {
  記事: '背景から理解したいときに読むページ',
  参照: '必要なときにすぐ使うためのページ'
};

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function formatDate(date: Date) {
  return DATE_FORMATTER.format(date);
}

export function withBase(path: string) {
  const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getArticlePath(article: ArticleEntry) {
  return article.id.replace(/\.md$/i, '');
}

export function sortArticles(entries: ArticleEntry[]) {
  return [...entries].sort((left, right) => right.data.date.getTime() - left.data.date.getTime());
}

export async function getAllArticles() {
  return [];
}

export function getArticleUrl(article: ArticleEntry) {
  return withBase(`/articles/${getArticlePath(article)}/`);
}

export function getCategoryUrl(category: string) {
  return withBase(`/categories/${slugify(category)}/`);
}

export function getCategoryDescription(category: string) {
  return CATEGORY_COPY[category] ?? 'AIの実務知識を整理したカテゴリ';
}

export function toArticleCardData(article: ArticleEntry): ArticleCardData {
  return {
    title: article.data.title,
    description: article.data.description,
    category: article.data.category,
    categorySlug: slugify(article.data.category),
    categoryUrl: getCategoryUrl(article.data.category),
    tags: article.data.tags,
    url: getArticleUrl(article),
    dateIso: article.data.date.toISOString(),
    dateLabel: formatDate(article.data.date)
  };
}

export function toSearchDocument(article: ArticleEntry): SearchDocument {
  return {
    ...toArticleCardData(article),
    content: article.body.replace(/[\[\]#>*_`()-]/g, ' ').replace(/\s+/g, ' ').trim()
  };
}

export function getCategorySummaries(entries: ArticleEntry[]): CategorySummary[] {
  const grouped = new Map<string, { count: number; tags: Set<string> }>();

  for (const article of entries) {
    const current = grouped.get(article.data.category) ?? { count: 0, tags: new Set<string>() };
    current.count += 1;

    for (const tag of article.data.tags) {
      current.tags.add(tag);
    }

    grouped.set(article.data.category, current);
  }

  return [...grouped.entries()]
    .map(([name, value]) => ({
      name,
      slug: slugify(name),
      href: getCategoryUrl(name),
      count: value.count,
      description: getCategoryDescription(name),
      tags: [...value.tags].sort().slice(0, 3)
    }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
}

export function getTagSummaries(entries: ArticleEntry[], limit = 8) {
  const counts = new Map<string, number>();

  for (const article of entries) {
    for (const tag of article.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
    .slice(0, limit);
}

export function getRelatedArticles(current: ArticleEntry, entries: ArticleEntry[]) {
  return entries
    .filter((entry) => getArticlePath(entry) !== getArticlePath(current))
    .map((entry) => {
      const sharedTags = entry.data.tags.filter((tag) => current.data.tags.includes(tag)).length;
      const sameCategory = entry.data.category === current.data.category ? 2 : 0;

      return {
        entry,
        score: sharedTags * 3 + sameCategory
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return right.entry.data.date.getTime() - left.entry.data.date.getTime();
    })
    .slice(0, 3)
    .map(({ entry }) => entry);
}
