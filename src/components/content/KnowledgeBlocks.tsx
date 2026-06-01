import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  Code2,
  FileSearch,
  Lightbulb,
  ListChecks,
  LockKeyhole,
  MessageSquareText,
  PenTool,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow
} from 'lucide-react';
import type { ReactNode } from 'react';

const iconMap = {
  alert: AlertTriangle,
  book: BookOpen,
  boxes: Boxes,
  brain: BrainCircuit,
  check: CheckCircle2,
  code: Code2,
  file: FileSearch,
  light: Lightbulb,
  list: ListChecks,
  lock: LockKeyhole,
  message: MessageSquareText,
  pen: PenTool,
  search: Search,
  shield: ShieldCheck,
  sparkles: Sparkles,
  workflow: Workflow
};

type IconName = keyof typeof iconMap;

interface CardItem {
  title: string;
  text: string;
  icon?: IconName;
  href?: string;
}

interface FlowItem {
  title: string;
  text: string;
}

interface PromptItem {
  id: string;
  title: string;
  summary: string;
  icon?: IconName;
}

function Icon({ name = 'sparkles' }: { name?: IconName }) {
  const Component = iconMap[name] ?? Sparkles;

  return <Component className="h-4 w-4" aria-hidden="true" />;
}

export function VisualGrid({ items }: { items: CardItem[] }) {
  return (
    <div className="not-prose mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-3 lg:grid-cols-3">
      {items.map((item) => {
        const body = (
          <div className="h-full rounded-md border border-border bg-card p-3 shadow-sm transition-colors hover:bg-muted sm:p-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-secondary text-primary sm:h-8 sm:w-8">
              <Icon name={item.icon} />
            </div>
            <h3 className="mt-2 text-sm font-semibold leading-5 tracking-tight text-foreground sm:mt-3">{item.title}</h3>
            <p className="mt-1.5 line-clamp-3 text-xs leading-5 text-muted-foreground sm:mt-2 sm:text-sm sm:leading-6">{item.text}</p>
          </div>
        );

        return item.href ? (
          <a key={item.title} href={item.href} className="block no-underline">
            {body}
          </a>
        ) : (
          <div key={item.title}>{body}</div>
        );
      })}
    </div>
  );
}

export function FlowLine({ items }: { items: FlowItem[] }) {
  return (
    <div className="not-prose mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[repeat(5,minmax(0,1fr))]">
      {items.map((item, index) => (
        <div key={item.title} className="relative min-w-0 rounded-md border border-border bg-card p-3 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-xs font-semibold text-primary">
              {index + 1}
            </span>
            {index < items.length - 1 && <ArrowRight className="hidden h-4 w-4 text-muted-foreground lg:block" />}
          </div>
          <h3 className="mt-3 text-sm font-semibold text-foreground">{item.title}</h3>
          <p className="mt-1 line-clamp-3 text-xs leading-5 text-muted-foreground lg:line-clamp-none">{item.text}</p>
        </div>
      ))}
    </div>
  );
}

export function Callout({
  title,
  children,
  icon = 'light'
}: {
  title: string;
  children: ReactNode;
  icon?: IconName;
}) {
  return (
    <div className="not-prose mt-4 rounded-md border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-card text-primary">
          <Icon name={icon} />
        </span>
        {title}
      </div>
      <div className="mt-2 text-sm leading-7 text-muted-foreground">{children}</div>
    </div>
  );
}

export function PromptIndex({ items }: { items: PromptItem[] }) {
  return (
    <div className="not-prose mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="rounded-md border border-border bg-card p-3 text-left no-underline shadow-sm transition-colors hover:bg-muted"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-card text-primary">
              <Icon name={item.icon} />
            </span>
            <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
          </div>
          <p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground sm:line-clamp-none">{item.summary}</p>
        </a>
      ))}
    </div>
  );
}

export function PromptCard({
  id,
  title,
  use,
  variables,
  caution,
  source,
  children,
  icon = 'message'
}: {
  id: string;
  title: string;
  use: string;
  variables: string;
  caution: string;
  source: string;
  children: ReactNode;
  icon?: IconName;
}) {
  return (
    <section id={id} className="not-prose mt-4 scroll-mt-24 rounded-md border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-primary">
            <Icon name={icon} />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Prompt pattern</p>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
          </div>
        </div>
        <a href="#prompt-list" className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground no-underline shadow-sm hover:bg-muted hover:text-foreground">
          一覧へ
        </a>
      </div>
      <div className="mt-3 grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.75fr)]">
        <div className="min-w-0">{children}</div>
        <dl className="grid content-start gap-2 text-sm">
          <div className="rounded-md border border-border bg-card p-3">
            <dt className="font-semibold text-foreground">用途</dt>
            <dd className="mt-1 leading-6 text-muted-foreground">{use}</dd>
          </div>
          <div className="rounded-md border border-border bg-card p-3">
            <dt className="font-semibold text-foreground">変数</dt>
            <dd className="mt-1 leading-6 text-muted-foreground">{variables}</dd>
          </div>
          <div className="rounded-md border border-border bg-card p-3">
            <dt className="font-semibold text-foreground">注意</dt>
            <dd className="mt-1 leading-6 text-muted-foreground">{caution}</dd>
          </div>
          <div className="rounded-md border border-border bg-card p-3">
            <dt className="font-semibold text-foreground">出典・参考</dt>
            <dd className="mt-1 leading-6 text-muted-foreground">{source}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
