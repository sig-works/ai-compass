import { AlertTriangle, ArrowRight, BookOpenText, Check, ChevronLeft, ChevronRight, CircleDot, Search, Workflow } from 'lucide-react';
import { startTransition, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';

import type { GlossarySection, GlossaryTerm } from '@/lib/glossary';

interface Props {
  sections: GlossarySection[];
}

const ALL_SECTIONS = 'all';
const PHONE_MEDIA_QUERY = '(max-width: 639px)';

function flattenTerms(sections: GlossarySection[]) {
  return sections.flatMap((section) => section.terms);
}

function termKey(term: GlossaryTerm) {
  return term.id ?? term.term;
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function decodeHash(hash: string) {
  if (!hash) return '';
  try {
    return decodeURIComponent(hash.replace(/^#/, ''));
  } catch {
    return hash.replace(/^#/, '');
  }
}

function isPhoneViewport() {
  return typeof window !== 'undefined' && window.matchMedia(PHONE_MEDIA_QUERY).matches;
}

function searchableText(term: GlossaryTerm) {
  return [
    term.id,
    term.term,
    term.category,
    term.reading,
    term.fullName,
    term.plainSummary,
    term.meaning,
    term.usageInAi,
    term.example,
    term.misconception,
    ...term.workflow,
    ...term.sourceNames,
    ...term.relatedTerms,
    ...(term.aliases ?? []),
    ...(term.keywords ?? [])
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function termMatches(term: GlossaryTerm, value: string) {
  const needle = normalize(value);
  if (!needle) return false;
  return [
    term.id,
    term.term,
    term.reading,
    term.fullName,
    ...(term.aliases ?? []),
    ...(term.keywords ?? [])
  ]
    .filter(Boolean)
    .some((candidate) => normalize(String(candidate)) === needle);
}

function TermSupplement({ term }: { term: GlossaryTerm }) {
  const aliases = (term.aliases ?? []).filter((alias) => alias !== term.fullName);
  if (!term.fullName && aliases.length === 0) return null;

  return (
    <p className="mt-2 text-xs leading-5 text-muted-foreground">
      {term.fullName && (
        <span>
          <span className="font-medium text-foreground/70">正式名称:</span> {term.fullName}
        </span>
      )}
      {aliases.length > 0 && (
        <span>
          {term.fullName && <span className="px-1.5 text-border">|</span>}
          <span className="font-medium text-foreground/70">別名:</span> {aliases.join(' / ')}
        </span>
      )}
    </p>
  );
}

export default function GlossaryExplorer({ sections }: Props) {
  const allTerms = useMemo(() => flattenTerms(sections), [sections]);
  const termIndex = useMemo(() => {
    const index = new Map<string, GlossaryTerm>();
    for (const term of allTerms) {
      for (const value of [term.id, term.term, term.reading, term.fullName, ...(term.aliases ?? []), ...(term.keywords ?? [])]) {
        if (value) index.set(normalize(String(value)), term);
      }
    }
    return index;
  }, [allTerms]);

  const detailRef = useRef<HTMLElement>(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchDeltaRef = useRef({ x: 0, y: 0 });
  const [activeSectionId, setActiveSectionId] = useState(ALL_SECTIONS);
  const [activeTermKey, setActiveTermKey] = useState(termKey(allTerms[0]));
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const findTerm = useCallback(
    (value: string) => {
      const exact = termIndex.get(normalize(value));
      if (exact) return exact;
      return allTerms.find((term) => termMatches(term, value));
    },
    [allTerms, termIndex]
  );

  const updateHash = useCallback((term: GlossaryTerm, replace = false) => {
    if (typeof window === 'undefined') return;
    const nextHash = `#${encodeURIComponent(termKey(term))}`;
    if (window.location.hash === nextHash) return;
    const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`;
    if (replace) {
      window.history.replaceState(null, '', nextUrl);
    } else {
      window.history.pushState(null, '', nextUrl);
    }
  }, []);

  const selectTerm = useCallback(
    (term: GlossaryTerm, options: { scroll?: boolean; updateHash?: boolean; replaceHash?: boolean } = {}) => {
      startTransition(() => setActiveTermKey(termKey(term)));
      if (options.updateHash) updateHash(term, options.replaceHash);
      if (options.scroll) {
        window.requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      }
    },
    [updateHash]
  );

  const filteredTerms = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    const sectionTerms =
      activeSectionId === ALL_SECTIONS
        ? allTerms
        : sections.find((section) => section.id === activeSectionId)?.terms ?? [];

    if (!needle) return sectionTerms;
    return sectionTerms.filter((term) => searchableText(term).includes(needle));
  }, [activeSectionId, allTerms, deferredQuery, sections]);

  useEffect(() => {
    if (filteredTerms.length === 0) return;
    if (!filteredTerms.some((term) => termKey(term) === activeTermKey)) {
      setActiveTermKey(termKey(filteredTerms[0]));
    }
  }, [activeTermKey, filteredTerms]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const applyHash = (replace = false) => {
      const hashValue = decodeHash(window.location.hash);
      if (!hashValue) return;
      const target = findTerm(hashValue);
      if (!target) return;
      setActiveSectionId(ALL_SECTIONS);
      setQuery('');
      selectTerm(target, { replaceHash: replace, updateHash: replace });
    };

    applyHash(true);
    const onPopState = () => applyHash(false);
    window.addEventListener('popstate', onPopState);
    window.addEventListener('hashchange', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('hashchange', onPopState);
    };
  }, [findTerm, selectTerm]);

  const activeTerm = allTerms.find((term) => termKey(term) === activeTermKey) ?? filteredTerms[0] ?? allTerms[0];
  const activeTermIndex = filteredTerms.findIndex((term) => termKey(term) === termKey(activeTerm));
  const canSelectPrevious = activeTermIndex > 0;
  const canSelectNext = activeTermIndex >= 0 && activeTermIndex < filteredTerms.length - 1;
  const hasResults = filteredTerms.length > 0;

  const selectTermByOffset = (offset: number) => {
    if (filteredTerms.length <= 1) return;
    const nextIndex = Math.min(Math.max(activeTermIndex + offset, 0), filteredTerms.length - 1);
    const nextTerm = filteredTerms[nextIndex];
    if (!nextTerm || termKey(nextTerm) === termKey(activeTerm)) return;
    selectTerm(nextTerm, { updateHash: true });
  };

  const selectRelatedTerm = (termName: string) => {
    const target = findTerm(termName);
    if (!target) return;

    startTransition(() => {
      setActiveSectionId(ALL_SECTIONS);
      setQuery('');
      setActiveTermKey(termKey(target));
    });
    updateHash(target);
  };

  if (!activeTerm) return null;

  return (
    <section className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2 xl:gap-3">
      <div className="rounded-md border border-border bg-card p-2 shadow-sm sm:p-3">
        <div className="grid gap-2 sm:gap-3">
          <label className="flex min-w-0 items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-ring sm:px-3 sm:py-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="sr-only">AI用語を検索</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="AI用語を検索"
              placeholder="用語・読み方・別名・説明を検索"
              className="min-h-7 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="grid grid-cols-2 gap-2 sm:hidden">
              <label className="block min-w-0">
                <span className="sr-only">カテゴリを選択</span>
                <select
                  value={activeSectionId}
                  onChange={(event) => startTransition(() => setActiveSectionId(event.target.value))}
                  className="h-10 w-full cursor-pointer rounded-md border border-border bg-background px-2.5 text-sm font-semibold text-foreground shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value={ALL_SECTIONS}>すべて {allTerms.length}</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.title} {section.terms.length}
                    </option>
                  ))}
                </select>
              </label>

              {hasResults && (
                <label className="block min-w-0">
                  <span className="sr-only">用語を選択</span>
                  <select
                    value={termKey(activeTerm)}
                    onChange={(event) => {
                      const target = findTerm(event.target.value);
                      if (target) selectTerm(target, { updateHash: true });
                    }}
                    className="h-10 w-full cursor-pointer rounded-md border border-border bg-background px-2.5 text-sm font-semibold text-foreground shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {filteredTerms.map((term) => (
                      <option key={termKey(term)} value={termKey(term)}>
                        {term.term}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            <div className="hidden flex-wrap gap-1.5 sm:flex">
              <button
                type="button"
                onClick={() => startTransition(() => setActiveSectionId(ALL_SECTIONS))}
                aria-pressed={activeSectionId === ALL_SECTIONS}
                className={[
                  'cursor-pointer whitespace-nowrap rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  activeSectionId === ALL_SECTIONS
                    ? 'border-primary/40 bg-secondary text-secondary-foreground'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                ].join(' ')}
              >
                すべて {allTerms.length}
              </button>
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => startTransition(() => setActiveSectionId(section.id))}
                  aria-pressed={section.id === activeSectionId}
                  className={[
                    'cursor-pointer whitespace-nowrap rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    section.id === activeSectionId
                      ? 'border-primary/40 bg-secondary text-secondary-foreground'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                  ].join(' ')}
                >
                  {section.title} {section.terms.length}
                </button>
              ))}
            </div>

            <p className="hidden text-xs text-muted-foreground sm:block sm:justify-self-end" aria-live="polite">
              {filteredTerms.length} / {allTerms.length} 語
            </p>
          </div>
        </div>
      </div>

      <div className="grid min-h-0 gap-2 overflow-hidden xl:grid-cols-[320px_minmax(0,1fr)] xl:gap-3">
        <aside className="hidden min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-md border border-border bg-card shadow-sm xl:grid">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Terms</p>
            <p className="text-xs text-muted-foreground">{filteredTerms.length}語</p>
          </div>
          <div className="min-h-0 overflow-auto overflow-x-hidden p-2">
            <div className="grid gap-1.5">
              {hasResults ? (
                filteredTerms.map((term) => {
                  const selected = termKey(term) === termKey(activeTerm);

                  return (
                    <button
                      key={termKey(term)}
                      type="button"
                      onClick={() => selectTerm(term, { scroll: true, updateHash: true })}
                      aria-current={selected ? 'true' : undefined}
                      className={[
                        'w-full cursor-pointer rounded-md border px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        selected
                          ? 'border-primary/50 bg-secondary text-secondary-foreground ring-1 ring-primary/20'
                          : 'border-border bg-background hover:bg-muted'
                      ].join(' ')}
                    >
                      <span className="flex min-w-0 items-center justify-between gap-2">
                        <span className="min-w-0 grid gap-0.5">
                          {term.reading && term.reading !== term.term && (
                            <span className="block min-w-0 truncate text-[9px] font-medium leading-3 text-muted-foreground">{term.reading}</span>
                          )}
                          <span className="block min-w-0 truncate text-sm font-semibold leading-5">{term.term}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-1">
                          {selected && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-background/70 px-1.5 py-0.5 text-[10px] font-medium" aria-label="選択中">
                              <Check className="h-3 w-3" />
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className="rounded-md border border-border bg-background px-3 py-5 text-center text-sm text-muted-foreground">
                  該当する用語がありません。
                </p>
              )}
            </div>
          </div>
        </aside>

        <article
          ref={detailRef}
          className="min-h-0 min-w-0 scroll-mt-3 touch-pan-y overflow-hidden rounded-md border border-border bg-card shadow-sm"
          onTouchStart={(event) => {
            const touch = event.touches[0];
            if (!touch) return;
            touchStartRef.current = { x: touch.clientX, y: touch.clientY };
            touchDeltaRef.current = { x: 0, y: 0 };
          }}
          onTouchMove={(event) => {
            const touch = event.touches[0];
            if (!touch) return;
            const nextDelta = {
              x: touch.clientX - touchStartRef.current.x,
              y: touch.clientY - touchStartRef.current.y
            };
            touchDeltaRef.current = nextDelta;

            const isHorizontalIntent = Math.abs(nextDelta.x) > 16 && Math.abs(nextDelta.x) > Math.abs(nextDelta.y) * 1.25;
            if (isPhoneViewport() && isHorizontalIntent) {
              event.preventDefault();
            }
          }}
          onTouchEnd={(event) => {
            if (!isPhoneViewport()) return;
            const { x, y } = touchDeltaRef.current;
            const isHorizontalSwipe = Math.abs(x) >= 56 && Math.abs(x) > Math.abs(y) * 1.25;
            if (!isHorizontalSwipe) return;
            event.preventDefault();
            selectTermByOffset(x < 0 ? 1 : -1);
          }}
        >
          {!hasResults ? (
            <div className="p-4">
              <section className="rounded-md border border-border bg-background p-6 text-center">
                <h2 className="text-base font-semibold">検索結果がありません</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">読み方、英語名、別名でも検索できます。条件を変えて試してください。</p>
              </section>
            </div>
          ) : (
            <>
              <div className="h-full min-h-0 overflow-auto">
                <header className="border-b border-border px-3 py-3 sm:px-4">
                  <div className="grid gap-3">
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0">
                        {activeTerm.reading && activeTerm.reading !== activeTerm.term && (
                          <p className="text-[10px] font-medium leading-3 text-muted-foreground">{activeTerm.reading}</p>
                        )}
                        <h2 className="mt-1 break-words text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{activeTerm.term}</h2>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => selectTermByOffset(-1)}
                          disabled={!canSelectPrevious}
                          aria-label="前の用語"
                          title="前の用語"
                          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => selectTermByOffset(1)}
                          disabled={!canSelectNext}
                          aria-label="次の用語"
                          title="次の用語"
                          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="break-words text-sm leading-6 text-foreground">{activeTerm.plainSummary}</p>
                  </div>
                </header>

                <div className="grid gap-2 p-3 sm:gap-3 sm:p-4">
                  <section className="rounded-md border border-border bg-background p-3 sm:p-4">
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                      <BookOpenText className="h-4 w-4 text-primary" />
                      意味
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{activeTerm.meaning}</p>
                    <TermSupplement term={activeTerm} />
                  </section>

                  <section className="rounded-md border border-border bg-background p-3 sm:p-4">
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                      <AlertTriangle className="h-4 w-4 text-primary" />
                      注意点
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{activeTerm.misconception}</p>
                  </section>

                  <section className="rounded-md border border-border bg-background p-3 sm:p-4">
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                      <Workflow className="h-4 w-4 text-primary" />
                      AIでどう使われるか
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{activeTerm.usageInAi}</p>
                    <div className="mt-3 grid gap-1.5 sm:grid-cols-3">
                      {activeTerm.workflow.map((step, index) => (
                        <div key={`${termKey(activeTerm)}-${step}`} className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-2 text-xs text-muted-foreground">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-secondary text-[10px] font-semibold text-secondary-foreground">
                            {index + 1}
                          </span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-md border border-border bg-background p-3 sm:p-4">
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                      <CircleDot className="h-4 w-4 text-primary" />
                      具体例
                    </h3>
                    <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">{activeTerm.example}</p>
                  </section>

                  <section className="rounded-md border border-border bg-muted/40 p-3 sm:p-4">
                    <h3 className="text-sm font-semibold">関連用語</h3>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {activeTerm.relatedTerms.map((termName) => {
                        const target = findTerm(termName);

                        return (
                          <button
                            key={termName}
                            type="button"
                            onClick={() => selectRelatedTerm(termName)}
                            disabled={!target}
                            className="inline-flex min-h-8 cursor-pointer items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                          >
                            {target?.term ?? termName}
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </div>
              </div>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
