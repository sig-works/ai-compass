import {
  AlertTriangle,
  BookOpenCheck,
  Bot,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Copy,
  FileCheck2,
  FilePenLine,
  FileSearch,
  GitPullRequest,
  Lightbulb,
  MailCheck,
  MessageSquareText,
  Search,
  ShieldCheck,
  TestTube2,
  Workflow
} from 'lucide-react';
import { startTransition, useDeferredValue, useEffect, useRef, useState } from 'react';

import promptPatternData from '@/data/prompt-patterns.json';

export type PromptPattern = {
  id: string;
  title: string;
  scene: string;
  prompt: string;
  placeholders: { token: string; example: string }[];
  rationale: string[];
  variations: string[];
  cautions: string[];
  tags: string[];
  icon: typeof ClipboardCheck;
};

const iconMap = {
  AlertTriangle,
  BookOpenCheck,
  Bot,
  ClipboardCheck,
  FileCheck2,
  FilePenLine,
  FileSearch,
  GitPullRequest,
  Lightbulb,
  MailCheck,
  MessageSquareText,
  Search,
  ShieldCheck,
  TestTube2,
  Workflow
} as const;

type PromptPatternData = Omit<PromptPattern, 'icon'> & {
  icon: keyof typeof iconMap;
};

export const patterns: PromptPattern[] = (promptPatternData as PromptPatternData[]).map((pattern) => ({
  ...pattern,
  icon: iconMap[pattern.icon]
}));

const principles = [
  {
    title: '役割を指定する',
    detail:
      '役割指定は、AIにどの観点で読み、どの粒度で答え、何を優先するかを伝える前提です。単独で使うより、目的、入力、制約、出力形式と組み合わせると安定します。'
  },
  {
    title: '目的・入力・制約・出力形式を分ける',
    detail:
      '情報を見出しで分けると、AIが何を材料にして、どの条件で、どんな形で返すべきかを見失いにくくなります。'
  },
  {
    title: '読み手と成功条件を具体化する',
    detail:
      '同じ内容でも、上司向け、顧客向け、開発者向けで粒度が変わります。誰が何を判断できれば成功かを指定します。'
  },
  {
    title: '根拠と推測を分ける',
    detail:
      '資料、ログ、コード、公式情報など根拠にしたいものを明示し、資料外の推測は推測として分けさせます。'
  },
  {
    title: '不足情報は質問させる',
    detail:
      '不明点をAIが自然に補完すると事故につながります。不足情報は確認事項として出させます。'
  },
  {
    title: '期待する形を先に指定する',
    detail:
      '表、JSON、箇条書き、メール文など、出力形式を先に決めると、そのまま業務に貼り付けやすくなります。'
  },
  {
    title: '例で粒度とトーンを固定する',
    detail:
      '良い出力例やNG例を入れると、抽象的な依頼よりも粒度、文体、判断基準が安定します。'
  },
  {
    title: '重要業務は評価とレビューを入れる',
    detail:
      'プロンプト変更やモデル変更の後は、代表ケースで結果を見比べ、人がレビューする前提にします。'
  }
];

const sources = [
  { label: 'OpenAI Prompt engineering', href: 'https://platform.openai.com/docs/guides/prompt-engineering' },
  { label: 'OpenAI Help: Prompt engineering best practices', href: 'https://help.openai.com/en/articles/10032626-prompt-engineering-best-practices' },
  { label: 'Google Gemini: プロンプト設計戦略', href: 'https://ai.google.dev/gemini-api/docs/prompting-strategies?hl=ja' },
  { label: 'Anthropic: Prompt engineering overview', href: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview' },
  { label: 'Microsoft 365 Copilot: Write a great prompt', href: 'https://support.microsoft.com/en-us/microsoft-365-copilot/write-a-great-prompt-in-microsoft-365-copilot' }
];

export default function PromptPatternSwitcher() {
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchDeltaRef = useRef({ x: 0, y: 0 });
  const [activeId, setActiveId] = useState(patterns[0].id);
  const [query, setQuery] = useState('');
  const [copyLabel, setCopyLabel] = useState('Copy');
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const filteredPatterns = patterns.filter((pattern) => {
    if (!deferredQuery) return true;
    const haystack = [pattern.title, pattern.scene, ...pattern.tags, ...pattern.variations, ...pattern.cautions].join(' ').toLowerCase();
    return haystack.includes(deferredQuery);
  });
  const active = patterns.find((pattern) => pattern.id === activeId) ?? filteredPatterns[0] ?? patterns[0];
  const Icon = active.icon;
  const activePatternIndex = filteredPatterns.findIndex((pattern) => pattern.id === active.id);
  const canSelectPrevious = activePatternIndex > 0;
  const canSelectNext = activePatternIndex >= 0 && activePatternIndex < filteredPatterns.length - 1;

  useEffect(() => {
    if (!filteredPatterns.length) return;
    if (!filteredPatterns.some((pattern) => pattern.id === activeId)) {
      startTransition(() => setActiveId(filteredPatterns[0].id));
    }
  }, [activeId, filteredPatterns]);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(active.prompt);
      setCopyLabel('Copied');
      window.setTimeout(() => setCopyLabel('Copy'), 1200);
    } catch {
      setCopyLabel('Copy failed');
      window.setTimeout(() => setCopyLabel('Copy'), 1200);
    }
  }

  function selectPatternByOffset(offset: number) {
    if (filteredPatterns.length <= 1) return;
    const activeIndex = filteredPatterns.findIndex((pattern) => pattern.id === active.id);
    const nextIndex = Math.min(Math.max(activeIndex + offset, 0), filteredPatterns.length - 1);
    const nextPattern = filteredPatterns[nextIndex];
    if (!nextPattern || nextPattern.id === active.id) return;

    startTransition(() => setActiveId(nextPattern.id));
    setCopyLabel('Copy');
  }

  return (
    <section className="min-h-[calc(100dvh-12rem)] space-y-2 lg:space-y-3">
      <div className="grid gap-2 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-3">
        <aside className="lg:rounded-md lg:border lg:border-border lg:bg-card lg:p-2 lg:shadow-sm">
          <div className="relative hidden lg:block">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="用途を検索"
              className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <label className="block lg:hidden">
            <span className="sr-only">用途を選択</span>
            <select
              value={active.id}
              onChange={(event) => {
                startTransition(() => setActiveId(event.target.value));
                setCopyLabel('Copy');
              }}
              className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm font-semibold text-foreground shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            >
              {filteredPatterns.map((pattern) => (
                <option key={pattern.id} value={pattern.id}>
                  {pattern.title}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-2 hidden gap-1.5 lg:grid lg:grid-cols-1">
            {filteredPatterns.map((pattern) => {
              const PatternIcon = pattern.icon;
              const selected = active.id === pattern.id;

              return (
                <button
                  key={pattern.id}
                  type="button"
                  onClick={() => {
                    startTransition(() => setActiveId(pattern.id));
                    setCopyLabel('Copy');
                  }}
                  className={[
                    'flex min-h-10 w-40 shrink-0 items-start gap-2 rounded-md border px-2.5 py-2 text-left transition-colors lg:w-auto',
                    selected
                      ? 'border-primary/40 bg-secondary text-secondary-foreground'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                  ].join(' ')}
                >
                  <PatternIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold leading-4 text-foreground">{pattern.title}</span>
                    <span className="mt-0.5 block truncate text-[11px] leading-4 text-muted-foreground">{pattern.tags.slice(0, 2).join(' / ')}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {!filteredPatterns.length && (
            <p className="mt-3 rounded-md border border-border bg-muted p-3 text-sm leading-6 text-muted-foreground">
              該当する用途がありません。別のキーワードで検索してください。
            </p>
          )}
        </aside>

        <div
          className="min-w-0 touch-pan-y overflow-hidden rounded-md border border-border bg-card shadow-sm"
          onTouchStart={(event) => {
            const touch = event.touches[0];
            if (!touch) return;
            touchStartRef.current = { x: touch.clientX, y: touch.clientY };
            touchDeltaRef.current = { x: 0, y: 0 };
          }}
          onTouchMove={(event) => {
            const touch = event.touches[0];
            if (!touch) return;
            touchDeltaRef.current = {
              x: touch.clientX - touchStartRef.current.x,
              y: touch.clientY - touchStartRef.current.y
            };
          }}
          onTouchEnd={() => {
            const { x, y } = touchDeltaRef.current;
            const isHorizontalSwipe = Math.abs(x) >= 56 && Math.abs(x) > Math.abs(y) * 1.25;
            if (!isHorizontalSwipe) return;
            selectPatternByOffset(x < 0 ? 1 : -1);
          }}
        >
          <header className="border-b border-border p-3 sm:p-4">
            <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-secondary text-primary sm:h-10 sm:w-10">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground">用途別プロンプト</p>
                <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{active.title}</h2>
                <p className="mt-1 line-clamp-3 max-w-3xl break-words text-sm leading-6 text-muted-foreground sm:line-clamp-none">{active.scene}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => selectPatternByOffset(-1)}
                  disabled={!canSelectPrevious}
                  aria-label="前のプロンプト"
                  title="前のプロンプト"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => selectPatternByOffset(1)}
                  disabled={!canSelectNext}
                  aria-label="次のプロンプト"
                  title="次のプロンプト"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 sm:mt-3 sm:flex-wrap sm:overflow-visible sm:pb-0">
              {active.tags.map((tag) => (
                <span key={tag} className="shrink-0 rounded-md border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <div className="grid gap-2 p-2 sm:gap-3 sm:p-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
            <figure className="console-block console-block-prompt mt-0 min-w-0">
              <figcaption className="console-header">
                <span className="console-title">編集して使えるプロンプト</span>
                <button type="button" className="console-copy ml-auto inline-flex items-center gap-1" onClick={() => void copyPrompt()}>
                  <Copy className="h-3 w-3" />
                  {copyLabel}
                </button>
              </figcaption>
              <pre className="m-0 max-h-[52dvh] overflow-auto rounded-b-md bg-card p-3 text-sm leading-6 text-foreground sm:max-h-[760px] sm:p-4">
                <code className="whitespace-pre-wrap break-words">{active.prompt}</code>
              </pre>
            </figure>

            <div className="grid content-start gap-2">
              <details className="group rounded-md border border-border bg-card shadow-sm" open>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-sm font-semibold text-foreground">
                  なぜこのプロンプトなのか
                  <span className="text-xs text-muted-foreground group-open:rotate-180">⌄</span>
                </summary>
                <ul className="border-t border-border px-3 py-2 text-sm leading-6 text-muted-foreground">
                  {active.rationale.map((item) => (
                    <li key={item} className="flex gap-2 py-1">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </details>

              {active.placeholders.length > 0 && (
                <details className="group rounded-md border border-border bg-card shadow-sm">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-sm font-semibold text-foreground">
                    角括弧の入力例
                    <span className="text-xs text-muted-foreground group-open:rotate-180">⌄</span>
                  </summary>
                  <dl className="grid gap-2 border-t border-border p-3 text-sm">
                    {active.placeholders.map((placeholder) => (
                      <div key={placeholder.token} className="rounded-md border border-border bg-background p-2">
                        <dt className="font-mono text-xs text-primary">{placeholder.token}</dt>
                        <dd className="mt-1 leading-6 text-muted-foreground">{placeholder.example}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              )}

              <details className="group rounded-md border border-border bg-card shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-sm font-semibold text-foreground">
                  応用例
                  <span className="text-xs text-muted-foreground group-open:rotate-180">⌄</span>
                </summary>
                <ul className="border-t border-border px-3 py-2 text-sm leading-6 text-muted-foreground">
                  {active.variations.map((variation) => (
                    <li key={variation} className="flex gap-2 py-1">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{variation}</span>
                    </li>
                  ))}
                </ul>
              </details>

              <details className="group rounded-md border border-border bg-card shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-sm font-semibold text-foreground">
                  注意点
                  <span className="text-xs text-muted-foreground group-open:rotate-180">⌄</span>
                </summary>
                <ul className="border-t border-border px-3 py-2 text-sm leading-6 text-muted-foreground">
                  {active.cautions.map((caution) => (
                    <li key={caution} className="flex gap-2 py-1">
                      <span className="mt-1.5 shrink-0 text-primary">!</span>
                      <span>{caution}</span>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-md border border-border bg-card p-4 shadow-sm">
        <div className="max-w-3xl">
          <p className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground">公式情報をもとに整理</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">公式情報をもとにした考え方</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            公式ガイドで共通している考え方を、開発、調査、レビュー、文書作成で使う形にまとめています。
          </p>
        </div>

        <div className="mt-3 grid gap-2">
          {principles.map((principle, index) => (
            <details key={principle.title} className="group rounded-md border border-border bg-background text-sm shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-foreground">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <span className="font-medium">{principle.title}</span>
                </span>
                <span className="text-xs text-muted-foreground group-open:rotate-180">⌄</span>
              </summary>
              <p className="border-t border-border px-3 py-2.5 leading-6 text-muted-foreground">{principle.detail}</p>
            </details>
          ))}
        </div>

        <div className="mt-4 border-t border-border pt-3">
          <h3 className="text-sm font-semibold text-foreground">参考元</h3>
          <div className="mt-2 grid gap-2 text-sm md:grid-cols-2">
            {sources.map((source) => (
              <a
                key={source.href}
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-border bg-background px-3 py-2 text-foreground no-underline transition-colors hover:bg-muted"
              >
                {source.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
