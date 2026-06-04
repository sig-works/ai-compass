import { withBase } from '@/lib/content';
import { LLM_PROFILE_NAV } from '@/lib/llm-profiles';

export interface NavItem {
  href: string;
  label: string;
  description: string;
  children?: {
    label: string;
    href: string;
    children?: {
      label: string;
      href: string;
    }[];
  }[];
}

export const CORE_PAGES: NavItem[] = [
  { href: '/', label: 'ホーム', description: 'トップページ' },
  { href: '/topics/', label: 'AI News', description: '国内ニュースと海外公式を確認' },
  { href: '/chatbot/', label: 'チャットボット', description: 'AIに相談する画面' }
];

export const GUIDE_PAGES: NavItem[] = [
  { href: '/articles/ai/ai-glossary/', label: 'AI入門', description: 'AIでできること、苦手なこと、最初の試し方' },
  { href: '/articles/ai/llm-basics/', label: 'LLMとは？', description: '言葉で頼むAIの使い方と選び方' },
  { href: '/articles/ai/safety-guide/', label: '安全なAI活用', description: '入力・確認・共有で失敗を防ぐ' }
];

export const REFERENCE_PAGES: NavItem[] = [
  { href: '/articles/ai/prompt-patterns/', label: '用途別プロンプト集', description: 'すぐ使える依頼文の型' },
  { href: '/glossary/', label: 'AI用語集', description: '重要なAI用語を確認' },
  { href: '/llms/', label: 'AIモデル選定ガイド', description: '用途からAIを選ぶ' },
  { href: '/llms/catalog/', label: 'LLM紹介', description: 'モデル別の特徴を読む', children: LLM_PROFILE_NAV }
];

export const STATIC_PAGES = [...CORE_PAGES, ...GUIDE_PAGES, ...REFERENCE_PAGES].map(({ children, ...item }) => item);

export function navUrl(path: string) {
  return withBase(path);
}
