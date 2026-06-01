export const CONTENT_ITEMS = [
  {
    title: 'AI入門',
    description: 'AIでできること、苦手なこと、最初に試しやすい作業をまとめた記事。',
    category: '記事',
    tags: ['AI', 'LLM', '検証', '使い方'],
    href: '/articles/ai/ai-glossary/'
  },
  {
    title: 'LLMとは？',
    description: '言葉で頼むAIの仕組み、使う場所、モデルの選び方、頼み方の基本をまとめた記事。',
    category: '記事',
    tags: ['LLM', 'モデル', 'プロンプト', '選び方'],
    href: '/articles/ai/llm-basics/'
  },
  {
    title: '安全なAI活用',
    description: '入力してよい情報、答えの確認、共有前チェックを実務で使う形にまとめた記事。',
    category: '記事',
    tags: ['安全', '確認', '情報管理', 'レビュー'],
    href: '/articles/ai/safety-guide/'
  },
  {
    title: '用途別プロンプト集',
    description: '調査、実装、レビュー、要約、文書作成で使う依頼文の型を用途別に収録。',
    category: '参照',
    tags: ['プロンプト', 'テンプレート', '文章', '実装'],
    href: '/articles/ai/prompt-patterns/'
  },
  {
    title: 'AI用語集',
    description: 'AI、RAG、評価、セキュリティなどの重要用語を、意味、使われ方、具体例で確認できる用語集。',
    category: '参照',
    tags: ['用語集', 'AI', 'RAG', '安全'],
    href: '/glossary/'
  },
  {
    title: 'AIモデル選定ガイド',
    description: '主要モデルを用途に合わせて比較し、選び方の目安をまとめたガイド。',
    category: '参照',
    tags: ['LLM', 'OpenAI', 'Anthropic', 'Google'],
    href: '/llms/'
  }
] as const;
