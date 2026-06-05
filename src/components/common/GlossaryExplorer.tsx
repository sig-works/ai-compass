import { AlertTriangle, ArrowRight, BookOpenText, ChevronLeft, ChevronRight, CircleDot, Search, Workflow } from 'lucide-react';
import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';

import type { GlossarySection, GlossaryTerm } from '@/lib/glossary';

interface Props {
  sections: GlossarySection[];
}

const ALL_SECTIONS = 'all';

function flattenTerms(sections: GlossarySection[]) {
  return sections.flatMap((section) => section.terms);
}

function searchableText(term: GlossaryTerm) {
  return [
    term.term,
    term.category,
    term.plainSummary,
    term.meaning,
    term.usageInAi,
    term.example,
    term.misconception,
    ...term.workflow,
    ...term.sourceNames,
    ...term.relatedTerms,
    ...(term.aliases ?? [])
  ]
    .join(' ')
    .toLowerCase();
}

export default function GlossaryExplorer({ sections }: Props) {
  const allTerms = useMemo(() => flattenTerms(sections), [sections]);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchDeltaRef = useRef({ x: 0, y: 0 });
  const [activeSectionId, setActiveSectionId] = useState(ALL_SECTIONS);
  const [activeTermName, setActiveTermName] = useState(allTerms[0]?.term ?? '');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

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
    if (!filteredTerms.some((term) => term.term === activeTermName)) {
      setActiveTermName(filteredTerms[0].term);
    }
  }, [activeTermName, filteredTerms]);

  const activeTerm = allTerms.find((term) => term.term === activeTermName) ?? filteredTerms[0] ?? allTerms[0];
  const activeTermIndex = filteredTerms.findIndex((term) => term.term === activeTerm?.term);
  const canSelectPrevious = activeTermIndex > 0;
  const canSelectNext = activeTermIndex >= 0 && activeTermIndex < filteredTerms.length - 1;

  const selectTerm = (termName: string) => {
    startTransition(() => setActiveTermName(termName));
  };

  const selectTermByOffset = (offset: number) => {
    if (filteredTerms.length <= 1) return;
    const activeIndex = filteredTerms.findIndex((term) => term.term === activeTerm.term);
    const nextIndex = Math.min(Math.max(activeIndex + offset, 0), filteredTerms.length - 1);
    const nextTerm = filteredTerms[nextIndex];
    if (!nextTerm || nextTerm.term === activeTerm.term) return;
    selectTerm(nextTerm.term);
  };

  const selectRelatedTerm = (termName: string) => {
    const target = allTerms.find((term) => term.term === termName);
    if (!target) return;

    startTransition(() => {
      setActiveSectionId(ALL_SECTIONS);
      setQuery('');
      setActiveTermName(target.term);
    });
  };

  if (!activeTerm) return null;

  return (
    <section className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2 xl:gap-3">
      <div className="xl:rounded-md xl:border xl:border-border xl:bg-card xl:p-3 xl:shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="hidden min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-background px-3 py-2 xl:flex">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="用語・別名・説明を検索"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 xl:hidden">
            <label className="block min-w-0">
              <span className="sr-only">カテゴリを選択</span>
              <select
                value={activeSectionId}
                onChange={(event) => startTransition(() => setActiveSectionId(event.target.value))}
                className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm font-semibold text-foreground shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value={ALL_SECTIONS}>すべて {allTerms.length}</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.title} {section.terms.length}
                  </option>
                ))}
              </select>
            </label>

            {filteredTerms.length > 0 && (
              <label className="block min-w-0">
                <span className="sr-only">用語を選択</span>
                <select
                  value={activeTerm.term}
                  onChange={(event) => selectTerm(event.target.value)}
                  className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm font-semibold text-foreground shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {filteredTerms.map((term) => (
                    <option key={term.term} value={term.term}>
                      {term.term}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <div className="hidden gap-1.5 overflow-x-auto pb-0.5 xl:flex xl:max-w-[58%]">
            <button
              type="button"
              onClick={() => startTransition(() => setActiveSectionId(ALL_SECTIONS))}
              className={[
                'whitespace-nowrap rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors',
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
                className={[
                  'whitespace-nowrap rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors',
                  section.id === activeSectionId
                    ? 'border-primary/40 bg-secondary text-secondary-foreground'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                ].join(' ')}
              >
                {section.title} {section.terms.length}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid min-h-0 gap-2 xl:grid-cols-[300px_minmax(0,1fr)] xl:gap-3">
        <aside className="hidden overflow-hidden rounded-md border border-border bg-card shadow-sm xl:block xl:min-h-0">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Terms</p>
            <p className="text-xs text-muted-foreground">{filteredTerms.length}語</p>
          </div>
          <div className="overflow-auto p-2 xl:max-h-[calc(100dvh-16.5rem)]">
            {filteredTerms.length > 0 && (
              <label className="block xl:hidden">
                <span className="sr-only">用語を選択</span>
                <select
                  value={activeTerm.term}
                  onChange={(event) => selectTerm(event.target.value)}
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {filteredTerms.map((term) => (
                    <option key={term.term} value={term.term}>
                      {term.term}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="hidden gap-1.5 xl:grid">
              {filteredTerms.length > 0 ? (
                filteredTerms.map((term) => (
                  <button
                    key={term.term}
                    type="button"
                    onClick={() => selectTerm(term.term)}
                    className={[
                      'w-44 shrink-0 rounded-md border px-3 py-2 text-left transition-colors xl:w-auto',
                      term.term === activeTerm.term
                        ? 'border-primary/40 bg-secondary text-secondary-foreground'
                        : 'border-border bg-background hover:bg-muted'
                    ].join(' ')}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold">{term.term}</span>
                      <span className="shrink-0 rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {term.category}
                      </span>
                    </span>
                    <span className="mt-1 line-clamp-1 block text-xs leading-5 text-muted-foreground xl:line-clamp-2">{term.plainSummary}</span>
                  </button>
                ))
              ) : (
                <p className="rounded-md border border-border bg-background px-3 py-5 text-center text-sm text-muted-foreground">
                  該当する用語がありません。
                </p>
              )}
            </div>
          </div>
        </aside>

        <article
          className="grid min-h-0 min-w-0 touch-pan-y overflow-hidden rounded-md border border-border bg-card shadow-sm xl:grid-cols-[minmax(0,1fr)_320px]"
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
            selectTermByOffset(x < 0 ? 1 : -1);
          }}
        >
          <div className="min-h-0 overflow-auto">
            <header className="border-b border-border px-3 py-3 sm:px-4">
              <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-start sm:justify-between sm:gap-3">
                <div className="min-w-0 sm:flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{activeTerm.category}</p>
                  <h2 className="mt-1 break-keep text-xl font-semibold tracking-tight sm:text-2xl">{activeTerm.term}</h2>
                  {activeTerm.aliases && activeTerm.aliases.length > 0 && (
                    <p className="mt-1 break-keep text-sm text-muted-foreground">{activeTerm.aliases.join(' / ')}</p>
                  )}
                </div>
                <div className="flex min-w-0 items-start gap-2 sm:max-w-md">
                  <p className="line-clamp-3 min-w-0 flex-1 break-words text-sm leading-6 text-foreground sm:line-clamp-none">{activeTerm.plainSummary}</p>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => selectTermByOffset(-1)}
                      disabled={!canSelectPrevious}
                      aria-label="前の用語"
                      title="前の用語"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => selectTermByOffset(1)}
                      disabled={!canSelectNext}
                      aria-label="次の用語"
                      title="次の用語"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </header>

            <div className="grid gap-2 p-3 sm:gap-3 sm:p-4">
              <section className="rounded-md border border-border bg-background p-3 sm:p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <BookOpenText className="h-4 w-4 text-primary" />
                  意味
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{activeTerm.meaning}</p>
              </section>

              <section className="rounded-md border border-border bg-background p-3 sm:p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  注意点
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{activeTerm.misconception}</p>
              </section>
            </div>
          </div>

          <aside className="grid content-start gap-3 border-t border-border bg-muted/40 p-3 sm:p-4 xl:border-l xl:border-t-0">
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Workflow className="h-4 w-4 text-primary" />
                AIでどう使われるか
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{activeTerm.usageInAi}</p>
              <div className="mt-3 grid gap-1.5">
                {activeTerm.workflow.map((step, index) => (
                  <div key={`${activeTerm.term}-${step}`} className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-2 text-xs text-muted-foreground">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-secondary text-[10px] font-semibold text-secondary-foreground">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-md border border-border bg-card p-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <CircleDot className="h-4 w-4 text-primary" />
                具体例
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{activeTerm.example}</p>
            </section>

            <section>
              <h3 className="text-sm font-semibold">関連用語</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {activeTerm.relatedTerms.map((termName) => (
                  <button
                    key={termName}
                    type="button"
                    onClick={() => selectRelatedTerm(termName)}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-background"
                  >
                    {termName}
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </section>
          </aside>
        </article>
      </div>
    </section>
  );
}
