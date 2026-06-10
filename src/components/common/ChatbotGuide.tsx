import { Bot, Check, ClipboardCopy, CornerDownLeft, RotateCcw, Send, UserRound } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import aiNews from '@/data/ai-news.json';
import type { GlossarySection, GlossaryTerm } from '@/lib/glossary';
import { GLOSSARY_SECTIONS } from '@/lib/glossary';
import { PROMPT_PATTERNS, type PromptPattern } from '@/lib/prompt-patterns';

type FlowMode = 'root' | 'today-topic' | 'prompt-list' | 'prompt-detail' | 'glossary-sections' | 'glossary-terms' | 'glossary-detail';

type AiNewsItem = {
  title: string;
  url: string;
  category?: string;
  region?: string;
  source: string;
  sourceType: string;
  language: string;
  publishedAt?: string;
  excerpt?: string;
  imageUrl?: string;
};

const featuredPromptIds = ['requirements', 'design', 'review', 'bug-investigation', 'test-cases', 'docs'];
const newsItems = (aiNews.items as AiNewsItem[] | undefined) ?? [];
const todayTopic =
  newsItems.find((item) => item.language === 'ja' && item.imageUrl && !item.imageUrl.includes('news-fallback')) ??
  newsItems.find((item) => item.language === 'ja') ??
  newsItems[0];
const fallbackNewsImage = '/images/news-fallback.png';

function hasVisibleText(value?: string) {
  if (!value) return false;
  const text = value.trim();
  return text.length > 0;
}

function visibleWorkflow(workflow: string[]) {
  return workflow.filter((step) => hasVisibleText(step));
}

function visibleRelatedTerms(relatedTerms: string[]) {
  return relatedTerms.filter((term) => hasVisibleText(term));
}

function formatNewsDate(value?: string) {
  if (!value) return '日付未確認';

  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function sourceTypeLabel(value: string) {
  if (value === 'official') return '公式';
  if (value === 'domestic-media') return '国内メディア';
  return '準公式';
}

function ChatMessage({
  role,
  label,
  delayMs = 0,
  children
}: {
  role: 'bot' | 'user';
  label: string;
  delayMs?: number;
  children: React.ReactNode;
}) {
  const isUser = role === 'user';

  return (
    <article className={['flex items-end gap-2', isUser ? 'justify-end' : 'justify-start'].join(' ')}>
      {!isUser && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-primary shadow-sm">
          <Bot className="h-4 w-4" />
        </span>
      )}

      <div className={['flex max-w-[min(84%,48rem)] flex-col gap-1', isUser ? 'items-end' : 'items-start'].join(' ')}>
        <div className={['flex items-center gap-1.5 px-1 text-[10px] leading-none text-muted-foreground', isUser ? 'flex-row-reverse' : ''].join(' ')}>
          <span>{label}</span>
        </div>
        <div
          className={[
            'chat-bubble-enter rounded-2xl px-3.5 py-2.5 text-sm leading-6 shadow-sm sm:text-[15px]',
            isUser
              ? 'chat-bubble-enter-user rounded-br-md border border-primary/25 bg-secondary text-secondary-foreground'
              : 'chat-bubble-enter-bot rounded-bl-md border border-border/80 bg-background text-foreground'
          ].join(' ')}
          style={{ animationDelay: `${delayMs}ms` }}
        >
          {children}
        </div>
      </div>

      {isUser && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary/25 bg-primary/10 text-primary shadow-sm">
          <UserRound className="h-4 w-4" />
        </span>
      )}
    </article>
  );
}

function ChoiceButton({
  children,
  onClick
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-8 items-center rounded-md border border-border bg-secondary px-3 py-1.5 text-left text-xs font-semibold leading-5 text-secondary-foreground shadow-sm transition-colors hover:border-primary/35 hover:bg-primary/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </button>
  );
}

function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-background px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <RotateCcw className="h-3 w-3" />
      最初に戻る
    </button>
  );
}

function PromptResult({ pattern }: { pattern: PromptPattern }) {
  const [copied, setCopied] = useState(false);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(pattern.prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="grid gap-3">
      <div>
        <p className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground">用途別プロンプト</p>
        <h2 className="mt-1 text-base font-bold leading-6 text-foreground">{pattern.title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{pattern.scene}</p>
      </div>

      <figure className="console-block console-block-prompt mt-0">
        <figcaption className="console-header">
          <span className="console-title">プロンプト</span>
          <button type="button" className="console-copy ml-auto inline-flex items-center gap-1" onClick={() => void copyPrompt()}>
            {copied ? <Check className="h-3 w-3" /> : <ClipboardCopy className="h-3 w-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </figcaption>
        <pre className="m-0 max-h-[36dvh] overflow-auto rounded-b-md bg-card p-3 text-xs leading-5 text-foreground sm:text-sm sm:leading-6">
          <code className="whitespace-pre-wrap break-words">{pattern.prompt}</code>
        </pre>
      </figure>

      <details className="group rounded-md border border-border bg-card">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-sm font-semibold text-foreground">
          なぜこのプロンプトなのか
          <span className="text-xs text-muted-foreground group-open:rotate-180">⌄</span>
        </summary>
        <ul className="border-t border-border px-3 py-2 text-sm leading-6 text-muted-foreground">
          {pattern.rationale.map((item) => (
            <li key={item} className="flex gap-2 py-1">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </details>

      <div className="grid items-start gap-2 md:grid-cols-2">
        <details className="group rounded-md border border-border bg-card">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-sm font-semibold text-foreground">
            入力例
            <span className="text-xs text-muted-foreground group-open:rotate-180">⌄</span>
          </summary>
          <dl className="grid gap-2 border-t border-border p-3 text-sm">
            {pattern.placeholders.map((placeholder) => (
              <div key={placeholder.token} className="rounded-md border border-border bg-background p-2">
                <dt className="font-mono text-xs text-primary">{placeholder.token}</dt>
                <dd className="mt-1 leading-6 text-muted-foreground">{placeholder.example}</dd>
              </div>
            ))}
          </dl>
        </details>

        <details className="group rounded-md border border-border bg-card">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-sm font-semibold text-foreground">
            注意点
            <span className="text-xs text-muted-foreground group-open:rotate-180">⌄</span>
          </summary>
          <ul className="border-t border-border px-3 py-2 text-sm leading-6 text-muted-foreground">
            {pattern.cautions.map((caution) => (
              <li key={caution} className="flex gap-2 py-1">
                <span className="mt-1.5 shrink-0 text-primary">!</span>
                <span>{caution}</span>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  );
}

function GlossaryResult({ term }: { term: GlossaryTerm }) {
  const displayUsageInAi = hasVisibleText(term.usageInAi) ? term.usageInAi : null;
  const displayWorkflow = visibleWorkflow(term.workflow);
  const displayExample = hasVisibleText(term.example) ? term.example : null;
  const displayMisconception = hasVisibleText(term.misconception) ? term.misconception : null;
  const displayFullName = hasVisibleText(term.fullName) ? term.fullName : null;
  const displayRelatedTerms = visibleRelatedTerms(term.relatedTerms);

  return (
    <div className="grid gap-3">
      <div>
        <p className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground">{term.category}</p>
        <h2 className="mt-1 text-base font-bold leading-6 text-foreground">{term.term}</h2>
        {((term.reading && term.reading !== term.term) || displayFullName) && (
          <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">
            {[term.reading && term.reading !== term.term ? term.reading : null, displayFullName].filter(Boolean).join(' / ')}
          </p>
        )}
        <p className="mt-1 text-sm leading-6 text-foreground">{term.plainSummary}</p>
      </div>

      <section className="rounded-md border border-border bg-card p-3">
        <h3 className="text-sm font-semibold text-foreground">意味</h3>
        <p className="mt-1 text-sm leading-7 text-muted-foreground">{term.meaning}</p>
      </section>

      {(displayUsageInAi || displayWorkflow.length > 0) && (
        <section className="rounded-md border border-border bg-card p-3">
          <h3 className="text-sm font-semibold text-foreground">AIでどう使われるか</h3>
          {displayUsageInAi && <p className="mt-1 text-sm leading-7 text-muted-foreground">{displayUsageInAi}</p>}
          {displayWorkflow.length > 0 && (
            <div className="mt-2 grid gap-1.5">
              {displayWorkflow.map((step, index) => (
                <div key={step} className="flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-2 text-xs text-muted-foreground">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-secondary text-[10px] font-semibold text-secondary-foreground">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {(displayExample || displayMisconception) && (
        <div className="grid gap-2 md:grid-cols-2">
          {displayExample && (
            <section className="rounded-md border border-border bg-card p-3">
              <h3 className="text-sm font-semibold text-foreground">具体例</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{displayExample}</p>
            </section>
          )}
          {displayMisconception && (
            <section className="rounded-md border border-border bg-card p-3">
              <h3 className="text-sm font-semibold text-foreground">注意点</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{displayMisconception}</p>
            </section>
          )}
        </div>
      )}

      {displayRelatedTerms.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {displayRelatedTerms.map((related) => (
            <span key={related} className="rounded-md border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground">
              {related}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function TodayTopicResult({ item }: { item: AiNewsItem }) {
  const sourceInfo = [item.source, item.category, item.region, sourceTypeLabel(item.sourceType), item.language === 'ja' ? '日本語' : '英語']
    .filter(Boolean)
    .join(' / ');
  const imageUrl = item.imageUrl || fallbackNewsImage;

  return (
    <div className="grid gap-3">
      <div>
        <p className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground">今日のトピック</p>
        <h2 className="mt-1 text-base font-bold leading-6 text-foreground">{item.title}</h2>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{formatNewsDate(item.publishedAt)} / {sourceInfo}</p>
      </div>

      <img
        src={imageUrl}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        className="aspect-[16/9] w-full rounded-md border border-border bg-card object-cover"
        onError={(event) => {
          event.currentTarget.src = fallbackNewsImage;
        }}
      />

      <section className="rounded-md border border-border bg-card p-3">
        <h3 className="text-sm font-semibold text-foreground">概要</h3>
        <p className="mt-1 text-sm leading-7 text-muted-foreground">
          {item.excerpt || 'AI Compass のニュース一覧に登録されている最新トピックです。詳しい本文は元記事で確認できます。'}
        </p>
      </section>

      <section className="rounded-md border border-border bg-card p-3">
        <h3 className="text-sm font-semibold text-foreground">記事情報</h3>
        <dl className="mt-2 grid gap-1.5 text-sm leading-6 text-muted-foreground sm:grid-cols-[5rem_minmax(0,1fr)]">
          <dt className="font-medium text-foreground">出典</dt>
          <dd>{item.source}</dd>
          <dt className="font-medium text-foreground">分類</dt>
          <dd>{[item.category, item.region, sourceTypeLabel(item.sourceType)].filter(Boolean).join(' / ')}</dd>
          <dt className="font-medium text-foreground">公開日</dt>
          <dd>{formatNewsDate(item.publishedAt)}</dd>
        </dl>
      </section>

      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-fit items-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground no-underline transition-colors hover:bg-muted"
      >
        元記事を開く
      </a>
    </div>
  );
}

export default function ChatbotGuide() {
  const shellRef = useRef<HTMLDivElement>(null);
  const sendButtonRef = useRef<HTMLButtonElement>(null);
  const [mode, setMode] = useState<FlowMode>('root');
  const [showAllPrompts, setShowAllPrompts] = useState(false);
  const [selectedPromptId, setSelectedPromptId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedTermName, setSelectedTermName] = useState('');
  const [draftMessage, setDraftMessage] = useState('');
  const [sentMessages, setSentMessages] = useState<string[]>([]);
  const [sendOffset, setSendOffset] = useState({ x: 0, y: 0, rotate: -8 });
  const [footerHint, setFooterHint] = useState('候補から選ぶか、メッセージで相談できます');
  const [wideEscape, setWideEscape] = useState(false);

  const visiblePrompts = useMemo(() => {
    if (showAllPrompts) return PROMPT_PATTERNS;
    const featured = PROMPT_PATTERNS.filter((pattern) => featuredPromptIds.includes(pattern.id));
    return featured.length ? featured : PROMPT_PATTERNS.slice(0, 6);
  }, [showAllPrompts]);

  const selectedPrompt = PROMPT_PATTERNS.find((pattern) => pattern.id === selectedPromptId);
  const selectedSection = GLOSSARY_SECTIONS.find((section) => section.id === selectedSectionId);
  const selectedTerm = selectedSection?.terms.find((term) => term.term === selectedTermName);

  function reset() {
    setMode('root');
    setShowAllPrompts(false);
    setSelectedPromptId('');
    setSelectedSectionId('');
    setSelectedTermName('');
  }

  function sendMessage() {
    const message = draftMessage.trim();
    if (!message) return;
    setFooterHint('送信はまだ準備中です');
  }

  function isFinePointer() {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }

  function handleShellPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!isFinePointer() || !sendButtonRef.current) return;

    const shellRect = shellRef.current?.getBoundingClientRect();
    const buttonRect = sendButtonRef.current.getBoundingClientRect();
    if (!shellRect) return;

    const baseCenterX = buttonRect.left + buttonRect.width / 2 - sendOffset.x;
    const baseCenterY = buttonRect.top + buttonRect.height / 2 - sendOffset.y;
    const dx = baseCenterX - event.clientX;
    const dy = baseCenterY - event.clientY;
    const length = Math.max(Math.hypot(dx, dy), 1);
    const triggerDistance = 86;

    if (length >= triggerDistance) {
      if (sendOffset.x !== 0 || sendOffset.y !== 0 || sendOffset.rotate !== -8) {
        setSendOffset({ x: 0, y: 0, rotate: -8 });
        setFooterHint('候補から選ぶか、メッセージで相談できます');
      }
      return;
    }

    const shouldWideEscape = wideEscape || Math.random() < 0.12;
    const escapeDistance = shouldWideEscape ? 142 : 76;
    const desiredCenterX = baseCenterX + (dx / length) * escapeDistance;
    const desiredCenterY = baseCenterY + (dy / length) * escapeDistance;
    const padding = 26;
    const minX = shellRect.left + padding;
    const maxX = shellRect.right - padding;
    const minY = shellRect.top + padding;
    const maxY = shellRect.bottom - padding;
    const clampedCenterX = Math.min(maxX, Math.max(minX, desiredCenterX));
    const clampedCenterY = Math.min(maxY, Math.max(minY, desiredCenterY));
    const nextX = clampedCenterX - baseCenterX;
    const nextY = clampedCenterY - baseCenterY;
    const angle = Math.atan2(nextY, nextX) * (180 / Math.PI);

    setSendOffset({
      x: nextX,
      y: nextY,
      rotate: Number.isFinite(angle) ? angle : -8
    });
    setWideEscape(shouldWideEscape && length < triggerDistance * 0.72);
    setFooterHint(shouldWideEscape ? '送信ボタンが大きく距離を取りました' : '送信ボタンが少し距離を取っています');
  }

  function selectPromptRoot() {
    setMode('prompt-list');
    setShowAllPrompts(false);
    setSelectedPromptId('');
  }

  function selectTodayTopic() {
    setMode('today-topic');
  }

  function selectPrompt(pattern: PromptPattern) {
    setSelectedPromptId(pattern.id);
    setMode('prompt-detail');
  }

  function selectGlossaryRoot() {
    setMode('glossary-sections');
    setSelectedSectionId('');
    setSelectedTermName('');
  }

  function selectSection(section: GlossarySection) {
    setSelectedSectionId(section.id);
    setSelectedTermName('');
    setMode('glossary-terms');
  }

  function selectTerm(term: GlossaryTerm) {
    setSelectedTermName(term.term);
    setMode('glossary-detail');
  }

  return (
    <div
      ref={shellRef}
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[linear-gradient(180deg,hsl(var(--muted))_0%,hsl(var(--background))_100%)] dark:bg-[linear-gradient(180deg,hsl(var(--secondary))_0%,hsl(var(--background))_100%)]"
      onPointerMove={handleShellPointerMove}
      onPointerLeave={() => {
        setSendOffset({ x: 0, y: 0, rotate: -8 });
        setWideEscape(false);
        setFooterHint('候補から選ぶか、メッセージで相談できます');
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.16] dark:opacity-[0.1]" aria-hidden="true">
        <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,hsl(var(--primary))_1px,transparent_0)] bg-[length:18px_18px]" />
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-4 sm:px-5">
        <div className="mx-auto rounded-full border border-border/70 bg-background/75 px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm backdrop-blur">
          今日
        </div>

        <ChatMessage role="bot" label="AI Compass">
          <div className="grid gap-2">
            <p>こんにちは。気になることを選ぶか、そのまま相談してください。</p>
            <div className="flex flex-wrap gap-1.5">
              {todayTopic && <ChoiceButton onClick={selectTodayTopic}>今日のトピック</ChoiceButton>}
              <ChoiceButton onClick={selectPromptRoot}>用途別プロンプト</ChoiceButton>
              <ChoiceButton onClick={selectGlossaryRoot}>AI用語</ChoiceButton>
            </div>
          </div>
        </ChatMessage>

        {mode === 'today-topic' && todayTopic && (
          <>
            <ChatMessage role="user" label="You">今日のトピック</ChatMessage>
            <ChatMessage role="bot" label="AI Compass" delayMs={260}>
              <div className="grid gap-3">
                <TodayTopicResult item={todayTopic} />
                <ResetButton onClick={reset} />
              </div>
            </ChatMessage>
          </>
        )}

        {(mode === 'prompt-list' || mode === 'prompt-detail') && (
          <ChatMessage role="user" label="You">用途別プロンプト</ChatMessage>
        )}

        {mode === 'prompt-list' && (
          <ChatMessage role="bot" label="AI Compass" delayMs={240}>
            <div className="grid gap-3">
              <div>
                <p>使いたいプロンプトの種類を選んでください。</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">候補が多いため、まず主要な用途を表示しています。</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {visiblePrompts.map((pattern) => (
                  <ChoiceButton key={pattern.id} onClick={() => selectPrompt(pattern)}>
                    {pattern.title}
                  </ChoiceButton>
                ))}
                {!showAllPrompts && PROMPT_PATTERNS.length > visiblePrompts.length && (
                  <ChoiceButton onClick={() => setShowAllPrompts(true)}>もっと見る</ChoiceButton>
                )}
              </div>
              <ResetButton onClick={reset} />
            </div>
          </ChatMessage>
        )}

        {mode === 'prompt-detail' && selectedPrompt && (
          <>
            <ChatMessage role="user" label="You">{selectedPrompt.title}</ChatMessage>
            <ChatMessage role="bot" label="AI Compass" delayMs={260}>
              <div className="grid gap-3">
                <PromptResult pattern={selectedPrompt} />
                <ResetButton onClick={reset} />
              </div>
            </ChatMessage>
          </>
        )}

        {(mode === 'glossary-sections' || mode === 'glossary-terms' || mode === 'glossary-detail') && (
          <ChatMessage role="user" label="You">AI用語</ChatMessage>
        )}

        {mode === 'glossary-sections' && (
          <ChatMessage role="bot" label="AI Compass" delayMs={240}>
            <div className="grid gap-3">
              <p>知りたい用語のカテゴリを選んでください。</p>
              <div className="flex flex-wrap gap-1.5">
                {GLOSSARY_SECTIONS.map((section) => (
                  <ChoiceButton key={section.id} onClick={() => selectSection(section)}>
                    {section.title}
                  </ChoiceButton>
                ))}
              </div>
              <ResetButton onClick={reset} />
            </div>
          </ChatMessage>
        )}

        {(mode === 'glossary-terms' || mode === 'glossary-detail') && selectedSection && (
          <ChatMessage role="user" label="You">{selectedSection.title}</ChatMessage>
        )}

        {mode === 'glossary-terms' && selectedSection && (
          <ChatMessage role="bot" label="AI Compass" delayMs={240}>
            <div className="grid gap-3">
              <div>
                <p>{selectedSection.title}の用語候補です。</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{selectedSection.description}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedSection.terms.map((term) => (
                  <ChoiceButton key={term.term} onClick={() => selectTerm(term)}>
                    {term.term}
                  </ChoiceButton>
                ))}
              </div>
              <ResetButton onClick={reset} />
            </div>
          </ChatMessage>
        )}

        {mode === 'glossary-detail' && selectedTerm && (
          <>
            <ChatMessage role="user" label="You">{selectedTerm.term}</ChatMessage>
            <ChatMessage role="bot" label="AI Compass" delayMs={260}>
              <div className="grid gap-3">
                <GlossaryResult term={selectedTerm} />
                <ResetButton onClick={reset} />
              </div>
            </ChatMessage>
          </>
        )}

        {sentMessages.map((message, index) => (
          <ChatMessage key={`${message}-${index}`} role="user" label="You">{message}</ChatMessage>
        ))}

        {sentMessages.length > 0 && (
          <ChatMessage role="bot" label="AI Compass" delayMs={260}>
            <div className="grid gap-2">
              <p>いまは候補選択を中心に案内しています。下の候補から、プロンプト集か用語集を選んでください。</p>
              <div className="flex flex-wrap gap-1.5">
                {todayTopic && <ChoiceButton onClick={selectTodayTopic}>今日のトピック</ChoiceButton>}
                <ChoiceButton onClick={selectPromptRoot}>用途別プロンプト</ChoiceButton>
                <ChoiceButton onClick={selectGlossaryRoot}>AI用語</ChoiceButton>
              </div>
            </div>
          </ChatMessage>
        )}
      </div>

      <footer
        className="relative shrink-0 border-t border-border/80 bg-card/95 px-2.5 py-2.5 shadow-[0_-10px_26px_rgba(15,23,42,0.08)] backdrop-blur sm:px-4"
      >
        <form
          className="flex items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage();
          }}
        >
          <input
            type="text"
            value={draftMessage}
            onChange={(event) => setDraftMessage(event.target.value)}
            placeholder="メッセージを入力"
            aria-label="メッセージを入力"
            className="h-10 w-full min-w-0 rounded-full border border-border bg-background px-4 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            ref={sendButtonRef}
            type="button"
            className={[
              'send-trick-button inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary shadow-sm transition-colors hover:border-primary/35 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            ].filter(Boolean).join(' ')}
            style={{
              transform: `translate(${sendOffset.x}px, ${sendOffset.y}px) rotate(${sendOffset.rotate}deg)`
            }}
            aria-label="送信"
            onClick={(event) => {
              if (isFinePointer()) {
                event.preventDefault();
                event.stopPropagation();
                setFooterHint('送信ボタンはまだ準備中です');
                return;
              }

              sendMessage();
            }}
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <div className="mt-1.5 flex items-center gap-1.5 px-3 text-[10px] leading-4 text-muted-foreground">
          <CornerDownLeft className="h-3 w-3" />
          <span>{footerHint}</span>
        </div>
      </footer>
    </div>
  );
}
