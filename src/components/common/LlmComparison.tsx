import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Bot,
  Bug,
  Building2,
  CheckCircle2,
  Code2,
  ExternalLink,
  FileText,
  GraduationCap,
  ImageIcon,
  Mail,
  PenLine,
  Search,
  ShieldCheck,
  Sparkles,
  TestTube2,
  Users,
  Wrench,
  Zap
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getLlmProfileByName } from '@/lib/llm-profiles';
import { withBase } from '@/lib/content';

type ProviderName = 'OpenAI' | 'Anthropic' | 'Google';

interface LlmModel {
  provider: ProviderName;
  family: string;
  model: string;
  status: 'released' | 'available' | 'preview' | 'stable' | 'live';
  releaseDate: string;
  bestFor: string;
  strengths: string;
  cautions: string;
  useCases: string[];
  surfaces: string[];
  plans: string[];
  notes: string[];
  officialUrl: string;
  lastCheckedAt: string;
}

interface LlmData {
  generatedAt: string;
  sourcePolicy: 'official-only';
  models: LlmModel[];
  updateStatus?: string;
  updateMessage?: string;
}

interface Props {
  data?: LlmData | null;
}

interface PlanPick {
  label: string;
  icon: typeof Sparkles;
  title: string;
  summary: string;
  recommendations: string[];
  caution: string;
}

interface ModelFamily {
  provider: ProviderName;
  icon: typeof Sparkles;
  title: string;
  simpleName: string;
  feature: string;
  strengths: string[];
  weaknesses: string[];
  pricing: string;
  suitedFor: string[];
  beginnerPick: string;
}

interface UseCase {
  id: string;
  title: string;
  icon: typeof Sparkles;
  scene: string;
  recommended: string[];
  reason: string;
  cautions: string[];
  alternatives: {
    free: string;
    paid: string;
    enterprise: string;
  };
}

const providerOrder: ProviderName[] = ['OpenAI', 'Anthropic', 'Google'];

const planPicks: PlanPick[] = [
  {
    label: '無料',
    icon: Sparkles,
    title: 'まず試すなら無料プラン',
    summary: '学校の課題、個人学習、軽い文章整理なら無料枠からで十分です。',
    recommendations: [
      'ChatGPT Free: 日常相談、文章整理、軽いコード確認',
      'Claude Free: 長めの文章確認、要約、言い換え',
      'Google AI Studio / Gemini: 調査、Google連携、画像を含む確認'
    ],
    caution: '利用回数、使えるモデル、ファイル分析、画像生成には制限があります。重要な判断は必ず人が確認します。'
  },
  {
    label: 'Pro / Team',
    icon: Users,
    title: '実務で毎日使うなら有料プラン',
    summary: '要件定義、設計、レビュー、資料作成を継続的に使うなら有料プランが安定します。',
    recommendations: [
      'OpenAI: 推論、コード、データ分析まで広く使いたい場合',
      'Claude: 長文読解、レビュー、文章化、設計相談を重視する場合',
      'Gemini: Google Workspaceや長い資料、コスト効率を重視する場合'
    ],
    caution: '上位モデルほど精度は上がりやすい一方、速度やコストは重くなります。軽い作業は小型モデルも使い分けます。'
  },
  {
    label: '企業利用',
    icon: Building2,
    title: '会社で使うなら管理機能を優先',
    summary: '個人契約よりも、権限、監査、データ保護、社内ルールとの整合を優先します。',
    recommendations: [
      'ChatGPT Business / Enterprise / Edu: 社内利用と管理をまとめたい場合',
      'Claude Team / Enterprise、またはBedrock / Vertex AI: 文書レビューや開発支援を安全に使いたい場合',
      'Vertex AI / Gemini API paid tier: Google Cloud上で運用、権限、請求を管理したい場合'
    ],
    caution: '機密情報、個人情報、ログ、顧客データは会社の利用ルールに従い、入力前にマスキングします。'
  }
];

const modelFamilies: ModelFamily[] = [
  {
    provider: 'OpenAI',
    icon: Bot,
    title: 'OpenAI / GPT',
    simpleName: '迷ったら選びやすい万能型',
    feature: '会話、推論、コード、データ分析、画像生成まで幅広く使えるAIです。ChatGPTとして使う入口と、APIやCodexとして開発に組み込む入口があります。',
    strengths: ['要件整理や設計のたたき台が作りやすい', 'コード生成、修正、レビュー、データ分析まで守備範囲が広い', 'ChatGPTの画面で試しやすい'],
    weaknesses: ['上位モデルや高度な機能は有料プラン前提になりやすい', '回答が自然なので、根拠のない断定に気づきにくいことがある', 'API利用では入力・出力量に応じたコスト管理が必要'],
    pricing: '無料枠で試せます。有料プランでは利用上限、ファイル分析、画像生成、上位モデル、チーム管理などが広がります。APIは基本的に従量課金です。',
    suitedFor: ['初めてAIを使う人', 'SE、開発者、PM', '文章、コード、分析を1つのAIで済ませたい人'],
    beginnerPick: 'まずはChatGPTで試し、重い設計・分析・コード作業だけ上位モデルへ切り替える。'
  },
  {
    provider: 'Anthropic',
    icon: PenLine,
    title: 'Anthropic / Claude',
    simpleName: '長文とレビューに強い読解型',
    feature: '長い文章を読み、論点を整理し、自然な文章にまとめるのが得意なAIです。Claude.ai、Claude API、Claude Codeなどから使えます。',
    strengths: ['長文資料、議事録、設計書、レビュー観点の整理が得意', '文章のトーン調整や要約が自然', '設計相談やコードレビューの説明が丁寧'],
    weaknesses: ['画像生成のようなクリエイティブ生成は主役ではない', '最上位モデルは重い作業向けで、日常作業には過剰な場合がある', '最新情報の調査は公式資料や検索結果との照合が必要'],
    pricing: '無料で試せる範囲があります。有料プランでは利用上限やチーム利用が広がります。API、Bedrock、Vertex AI経由では従量課金や企業向け管理を選べます。',
    suitedFor: ['文章を読み書きする時間が長い人', 'レビューや設計相談をしたいSE', '議事録、仕様書、ドキュメントを扱う人'],
    beginnerPick: '長い資料を渡して要約・論点整理・レビューをしたいときに選ぶ。'
  },
  {
    provider: 'Google',
    icon: Sparkles,
    title: 'Google / Gemini',
    simpleName: 'Google連携と大量処理に強い実用型',
    feature: 'GoogleのAIモデル群です。Google AI Studio、Gemini API、Vertex AIから使え、長い文脈、検索連携、画像を含む作業に向いています。',
    strengths: ['GoogleサービスやGoogle Cloudと組み合わせやすい', 'Flash系は速度とコストのバランスが良い', '画像生成・画像理解を含む作業を扱いやすい'],
    weaknesses: ['用途によってPro、Flash、Flash-Lite、画像向けモデルを選ぶ必要がある', '無料枠と有料枠で利用上限やデータ利用条件が変わる', '企業利用ではVertex AIなど運用設計が必要'],
    pricing: 'Google AI Studioは試しやすく、Gemini APIは無料枠と有料の従量課金があります。企業利用ではVertex AIで管理、権限、請求をまとめやすくなります。',
    suitedFor: ['Google WorkspaceやGoogle Cloudを使っている人', '検索・調査や長い資料を扱う人', '速度やコストを見ながら大量処理したい人'],
    beginnerPick: 'Google連携や画像を含む作業、コストを抑えたい大量処理で候補にする。'
  }
];

const useCases: UseCase[] = [
  {
    id: 'requirements',
    title: '要件定義',
    icon: BadgeCheck,
    scene: '顧客の要望、業務課題、現行仕様を整理し、要件定義のたたき台を作りたいとき。',
    recommended: ['OpenAI GPT上位モデル', 'Claude Opus / Sonnet', 'Gemini Pro'],
    reason: '要件定義は「要望」と「仕様」を分け、利用者、業務フロー、制約、非機能、リスクを整理する作業です。推論力と長文整理力のあるモデルが向いています。',
    cautions: ['不足情報は推測させず、確認事項として分ける', '法務、監査、権限、個人情報はAIの出力だけで確定しない', '現行仕様や議事録を渡す場合は機密情報をマスキングする'],
    alternatives: {
      free: 'ChatGPT Free、Claude Free、Geminiの無料枠でたたき台を作り、人がレビューします。',
      paid: 'ChatGPT Pro/Team、Claude Pro/Team、Gemini Pro相当で長い資料や複数案を扱います。',
      enterprise: '社内データを扱う場合はChatGPT Business/Enterprise、Claude Enterprise、Vertex AIなど管理機能つきで使います。'
    }
  },
  {
    id: 'design',
    title: '設計（基本/詳細）',
    icon: Wrench,
    scene: '画面、API、DB、バッチ、運用、エラー処理などを設計書に落とし込みたいとき。',
    recommended: ['OpenAI GPT上位モデル', 'Claude Opus / Sonnet', 'Gemini Pro'],
    reason: '設計は整合性と抜け漏れ確認が重要です。上位モデルは制約を保持しながら、代替案、トレードオフ、非機能の観点を出しやすいです。',
    cautions: ['既存アーキテクチャ、命名規則、運用制約を必ず入力する', '性能、可用性、セキュリティ、監査ログを別観点で確認する', '出力はそのまま設計確定にせず、レビュー工程を入れる'],
    alternatives: {
      free: '小さな機能の設計観点出しに限定し、最終設計は人が補完します。',
      paid: '上位モデルで設計案を作り、軽量モデルで表記ゆれやチェックリスト化を行います。',
      enterprise: '社内標準、過去設計、規約を参照できる管理環境で使います。'
    }
  },
  {
    id: 'code-generation',
    title: 'コード生成',
    icon: Code2,
    scene: '関数、API、画面部品、SQL、スクリプト、テスト補助コードを作りたいとき。',
    recommended: ['OpenAI GPT / Codex向けモデル', 'Claude Sonnet / Claude Code', 'Gemini Pro / Flash'],
    reason: 'コード生成は「仕様を理解する力」と「実装を素早く出す力」の両方が必要です。重い実装は上位モデル、定型処理は軽量モデルが向いています。',
    cautions: ['対象言語、フレームワーク、既存コード、禁止事項を明示する', '生成コードは必ずテストとレビューを通す', 'セキュリティ、例外処理、境界値を追加で確認する'],
    alternatives: {
      free: '短い関数やサンプル生成に使い、実装への反映は手元で確認します。',
      paid: 'IDE連携やコード支援機能を使い、差分単位で小さく依頼します。',
      enterprise: 'リポジトリ連携、権限、ログ、社内規約の扱いを確認して導入します。'
    }
  },
  {
    id: 'code-review',
    title: 'コードレビュー',
    icon: ShieldCheck,
    scene: 'PR差分を見て、バグ、保守性、設計、セキュリティ、テスト不足を確認したいとき。',
    recommended: ['Claude Opus / Sonnet', 'OpenAI GPT上位モデル', 'Gemini Pro'],
    reason: 'レビューは長い差分の読解と観点整理が重要です。Claudeは長文レビュー、OpenAIは実装修正案、Geminiは広い資料との照合に向きます。',
    cautions: ['重要度、根拠、再現条件、修正案を分けて出させる', 'AIの指摘は誤検知があるため、必ずコード上で確認する', '機密コードを外部サービスへ入れる場合は会社ルールを確認する'],
    alternatives: {
      free: '差分を小さく分けて、観点出しや説明改善に使います。',
      paid: '長いPRや複数ファイルの整合性確認に使います。',
      enterprise: 'リポジトリ連携や監査ログを含む環境でレビュー補助として使います。'
    }
  },
  {
    id: 'bug-investigation',
    title: 'バグ調査',
    icon: Bug,
    scene: 'ログ、エラー、再現手順、最近の変更から原因候補を絞りたいとき。',
    recommended: ['OpenAI GPT上位モデル', 'Claude Sonnet', 'Gemini Pro / Flash'],
    reason: 'バグ調査は事実と仮説を分ける作業です。推論力のあるモデルで原因候補を並べ、軽量モデルでログ整形や類似パターン抽出を行うと効率的です。',
    cautions: ['ログ、時刻、環境、変更差分をセットで渡す', '断定ではなく「可能性」「確認方法」「次に見るログ」に分ける', '個人情報、認証情報、顧客名は必ず伏せる'],
    alternatives: {
      free: '短いログの整理、原因候補の洗い出しに使います。',
      paid: '長いログ、複数ファイル、再現手順の整理まで任せます。',
      enterprise: '障害ログや顧客影響を扱う場合は、社内承認済み環境で使います。'
    }
  },
  {
    id: 'test-cases',
    title: 'テストケース生成',
    icon: TestTube2,
    scene: '仕様書やコードから、正常系、異常系、境界値、回帰観点を作りたいとき。',
    recommended: ['OpenAI GPT / mini系', 'Claude Sonnet / Haiku', 'Gemini Flash / Pro'],
    reason: 'テスト生成は観点の網羅と表形式の整理が重要です。大量に作る場合は速度とコストも効くため、軽量モデルが活躍します。',
    cautions: ['受け入れ条件、対象外、前提データを明示する', 'セキュリティ、権限、性能、運用の観点を別枠で指定する', '生成結果をそのまま網羅済みと見なさない'],
    alternatives: {
      free: '小さな機能の観点出しや境界値整理に使います。',
      paid: '仕様書全体からテスト観点表を作り、レビューで補正します。',
      enterprise: 'テスト管理ツール連携や社内テンプレートに合わせて使います。'
    }
  },
  {
    id: 'documentation',
    title: 'ドキュメント作成',
    icon: FileText,
    scene: 'README、設計書、手順書、FAQ、リリースノートを読みやすく整えたいとき。',
    recommended: ['Claude Sonnet', 'OpenAI GPT', 'Gemini Pro / Flash'],
    reason: 'ドキュメントは読み手、目的、粒度、用語統一が重要です。Claudeは文章整理、OpenAIは構成案、GeminiはGoogle資料との相性が良いです。',
    cautions: ['読者、前提知識、禁止表現、出力形式を指定する', '古い仕様や未確定事項を混ぜない', '手順書は実際に操作して検証する'],
    alternatives: {
      free: '文章のたたき台、要約、見出し整理に使います。',
      paid: '長い設計書や複数資料の統合に使います。',
      enterprise: '社内用語集、規約、過去ドキュメントを参照できる環境で使います。'
    }
  },
  {
    id: 'daily-work',
    title: '日常業務（議事録、メール、改善案）',
    icon: Mail,
    scene: '議事録、メール、チャット文、報告書、改善提案を素早く整えたいとき。',
    recommended: ['OpenAI GPT / mini系', 'Claude Sonnet / Haiku', 'Gemini Flash'],
    reason: '日常業務は速度、自然な文章、言い換えが大事です。軽量モデルでも十分なことが多く、上位モデルは重要な提案や説明資料に使います。',
    cautions: ['宛先、目的、トーン、必ず入れる事実を指定する', '社外向け文面は事実、日付、金額、責任範囲を確認する', '議事録は決定事項と未決事項を分ける'],
    alternatives: {
      free: 'メール文、議事録整理、簡単な改善案なら無料枠で始めます。',
      paid: '毎日使うなら有料プランで回数制限やファイル利用のストレスを減らします。',
      enterprise: '社内文書、会議録、顧客対応は企業向けプランで扱います。'
    }
  },
  {
    id: 'learning-research',
    title: '学習・調査',
    icon: GraduationCap,
    scene: '技術テーマ、公式ドキュメント、論点、比較表を前提から確認したいとき。',
    recommended: ['OpenAI GPT', 'Gemini Pro', 'Claude Sonnet'],
    reason: '学習・調査は説明力と出典確認が重要です。検索や公式資料を使い、要点、前提、注意点を分けて整理できるモデルが向いています。',
    cautions: ['公式URL、日付、前提条件を指定する', '古い情報や推測は分けて書かせる', '重要な仕様、価格、法務情報は公式ページで再確認する'],
    alternatives: {
      free: '概要理解、用語説明、学習計画の作成に使います。',
      paid: '長い資料や複数ソース比較、深い調査に使います。',
      enterprise: '社内資料や契約情報を含む調査は管理環境で使います。'
    }
  },
  {
    id: 'writing-summary',
    title: '文章生成・要約',
    icon: BookOpen,
    scene: '長文を短くする、読者別に言い換える、文章の構成を整えるとき。',
    recommended: ['Claude Sonnet / Opus', 'OpenAI GPT', 'Gemini Flash / Pro'],
    reason: '文章作業は読みやすさ、トーン、抜け漏れの少なさが大切です。Claudeは自然な文章、OpenAIは幅広い文体、Geminiは速度重視の要約に向きます。',
    cautions: ['削ってはいけない情報、文字数、読者、トーンを指定する', '要約では重要な条件や例外が落ちていないか確認する', '引用や出典が必要な文章では根拠を明示する'],
    alternatives: {
      free: '短文の添削、要約、言い換えに使います。',
      paid: '長文資料、複数文書、社外向け文章の調整に使います。',
      enterprise: '契約書、顧客文書、社内規定は企業向け環境で扱います。'
    }
  },
  {
    id: 'image-generation',
    title: '画像生成',
    icon: ImageIcon,
    scene: 'アイキャッチ、説明図、ラフ案、デザイン検討用の画像を作りたいとき。',
    recommended: ['画像生成対応のOpenAIモデル / ChatGPT機能', 'Gemini Flash Image', 'Gemini画像対応モデル'],
    reason: '画像生成は通常の文章モデルとは別に、画像生成に対応したモデルや機能を選ぶ必要があります。文章AIに頼む場合はプロンプト作成や構図整理に使います。',
    cautions: ['商用利用、著作権、人物、ロゴ、ブランド表現のルールを確認する', '社内資料では生成画像であることを明示する', '図解は意味の正確さを人が検証する'],
    alternatives: {
      free: 'ラフ案やプロンプト作成から始めます。生成回数には制限があります。',
      paid: '画像生成回数や編集機能を使い、候補を複数作ります。',
      enterprise: 'ブランド、権利、社内ポリシーを満たす環境で使います。'
    }
  },
  {
    id: 'data-analysis',
    title: 'データ分析',
    icon: BarChart3,
    scene: 'CSV、表、アンケート、ログを読み、傾向、異常値、示唆、次のアクションを出したいとき。',
    recommended: ['OpenAI GPT + データ分析機能', 'Gemini Pro / Flash', 'Claude Sonnet'],
    reason: 'データ分析は計算、可視化、説明の分離が重要です。OpenAIは分析機能、GeminiはGoogle連携や大量処理、Claudeは読みやすい解釈文に向きます。',
    cautions: ['列の意味、集計単位、除外条件、期待するグラフを明示する', '計算結果は元データや別ツールで検算する', '個人情報や顧客データは匿名化する'],
    alternatives: {
      free: '小さな表の見方、分析観点、関数例の相談に使います。',
      paid: 'ファイルアップロード、表計算、グラフ化、長いログ分析に使います。',
      enterprise: '社内データ基盤や権限管理と連携できる環境で使います。'
    }
  }
];

const principles = [
  'まず用途を決める。文章、コード、画像、分析で向くモデルは変わる。',
  '無料か有料かを先に見る。無料枠は試す場所、有料プランは毎日使う場所と考える。',
  '重い判断は上位モデル、定型作業や大量処理は軽量モデルを使う。',
  '速さ、コスト、精度は同時に最大化できない。どれを優先するか決める。',
  '最新情報、価格、法律、セキュリティは公式情報で確認する。',
  '機密情報や個人情報を入力する前に、会社や学校の利用ルールを確認する。',
  'AIの回答は完成品ではなく下書き。重要な成果物は人がレビューする。'
];

const sources = [
  { label: 'OpenAI Models', href: 'https://platform.openai.com/docs/models' },
  { label: 'ChatGPT Pricing', href: 'https://openai.com/chatgpt/pricing' },
  { label: 'Anthropic Claude Models', href: 'https://docs.anthropic.com/en/docs/about-claude/models' },
  { label: 'Google Gemini Models', href: 'https://ai.google.dev/gemini-api/docs/models?hl=ja' },
  { label: 'Gemini API Pricing', href: 'https://ai.google.dev/gemini-api/docs/pricing' },
  { label: 'Gemini API Billing', href: 'https://ai.google.dev/gemini-api/docs/billing' }
];

function formatDate(value?: string) {
  if (!value) return '未確認';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

function providerLabel(provider: ProviderName) {
  if (provider === 'Anthropic') return 'Claude';
  if (provider === 'Google') return 'Gemini';
  return 'OpenAI';
}

export default function LlmComparison({ data: initialData = null }: Props) {
  const [data, setData] = useState<LlmData | null>(initialData);
  const [selectedUseCase, setSelectedUseCase] = useState(useCases[0].id);

  useEffect(() => {
    const controller = new AbortController();
    const base = import.meta.env.BASE_URL ?? '/';
    const dataUrl = `${base.endsWith('/') ? base : `${base}/`}data/llm-latest.json`;

    async function load() {
      try {
        const response = await fetch(dataUrl, { signal: controller.signal, cache: 'no-store' });
        if (response.ok) {
          setData(await response.json());
        }
      } catch (caught) {
        if ((caught as Error).name !== 'AbortError') {
          setData(null);
        }
      }
    }

    void load();
    return () => controller.abort();
  }, []);

  const selected = useCases.find((item) => item.id === selectedUseCase) ?? useCases[0];
  const checkedAt = data ? formatDate(data.generatedAt) : '読み込み中';

  const modelsByProvider = useMemo(() => {
    const grouped = new Map<ProviderName, LlmModel[]>();
    for (const provider of providerOrder) grouped.set(provider, []);

    for (const model of data?.models ?? []) {
      grouped.get(model.provider)?.push(model);
    }

    return grouped;
  }, [data]);

  return (
    <section className="space-y-4">
      <section className="rounded-md border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Quick start</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">まずは契約プランから選ぶ</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              AIモデル選びで最初に見るのは、細かい性能表ではなく「無料で試すのか」「毎日使うのか」「会社で安全に使うのか」です。
              そのうえで、用途に合わせて精度、速度、コストのバランスを決めます。
            </p>
          </div>
          <div className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
            公式情報確認: {checkedAt}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:mt-4 lg:grid-cols-3">
          {planPicks.map((plan) => (
            <article key={plan.label} className="min-w-0 rounded-md border border-border bg-background p-3 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-card text-primary">
                  <plan.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{plan.label}</p>
                  <h3 className="mt-0.5 text-sm font-semibold text-foreground">{plan.title}</h3>
                  <p className="mt-1 line-clamp-3 text-sm leading-6 text-muted-foreground lg:line-clamp-none">{plan.summary}</p>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm leading-6 text-foreground">
                {plan.recommendations.map((recommendation) => (
                  <li key={recommendation} className="flex gap-2">
                    <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 line-clamp-3 rounded-md border border-border bg-card px-3 py-2 text-sm leading-6 text-muted-foreground lg:line-clamp-none">{plan.caution}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Model families</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">モデル別の特徴</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              ここでは細かい型番よりも、最初に迷いやすい「何が得意で、誰に向いているか」を先に見ます。
              具体的な型番は各社の公式情報で変わるため、実務では最新ページも確認します。
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-2 xl:mt-4 xl:grid-cols-3">
          {modelFamilies.map((family) => {
            const models = modelsByProvider.get(family.provider) ?? [];

            return (
              <article key={family.provider} className="min-w-0 rounded-md border border-border bg-background p-3 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-card text-primary">
                    <family.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{family.provider}</p>
                    <h3 className="text-base font-semibold tracking-tight text-foreground">{family.title}</h3>
                    <p className="mt-1 text-sm font-medium text-primary">{family.simpleName}</p>
                  </div>
                </div>

                <p className="mt-3 line-clamp-4 text-sm leading-6 text-muted-foreground xl:line-clamp-none">{family.feature}</p>

                <div className="mt-3 grid gap-2">
                  <details className="group rounded-md border border-border bg-card px-3 py-2" open>
                    <summary className="cursor-pointer text-sm font-semibold text-foreground">得意分野</summary>
                    <ul className="mt-2 space-y-1 text-sm leading-6 text-muted-foreground">
                      {family.strengths.map((item) => (
                        <li key={item}>・{item}</li>
                      ))}
                    </ul>
                  </details>
                  <details className="group rounded-md border border-border bg-card px-3 py-2">
                    <summary className="cursor-pointer text-sm font-semibold text-foreground">苦手分野</summary>
                    <ul className="mt-2 space-y-1 text-sm leading-6 text-muted-foreground">
                      {family.weaknesses.map((item) => (
                        <li key={item}>・{item}</li>
                      ))}
                    </ul>
                  </details>
                  <details className="group rounded-md border border-border bg-card px-3 py-2">
                    <summary className="cursor-pointer text-sm font-semibold text-foreground">料金プランの見方</summary>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{family.pricing}</p>
                  </details>
                  <details className="group rounded-md border border-border bg-card px-3 py-2">
                    <summary className="cursor-pointer text-sm font-semibold text-foreground">向いている人</summary>
                    <ul className="mt-2 space-y-1 text-sm leading-6 text-muted-foreground">
                      {family.suitedFor.map((item) => (
                        <li key={item}>・{item}</li>
                      ))}
                    </ul>
                  </details>
                </div>

                <div className="mt-3 rounded-md border border-border bg-card px-3 py-2 text-sm leading-6 text-muted-foreground">
                  <span className="font-semibold text-foreground">最初に見るポイント: </span>
                  {family.beginnerPick}
                </div>

                {models.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">このサイトで追跡中の主なモデル</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {models.slice(0, 5).map((model) => {
                        const profile = getLlmProfileByName(model.model);

                        return (
                          <a
                            key={`${model.provider}-${model.model}`}
                            href={profile ? withBase(`/llms/models/${profile.slug}/`) : model.officialUrl}
                            target={profile ? undefined : '_blank'}
                            rel={profile ? undefined : 'noreferrer'}
                            className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground no-underline hover:bg-muted"
                          >
                            {model.model}
                            {profile ? <ArrowRight className="h-3 w-3" /> : <ExternalLink className="h-3 w-3" />}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-md border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground">用途から見る</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">用途別の候補モデル</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              左の用途を選ぶと、想定シーン、候補モデル、理由、注意点、契約プラン別の代替案を確認します。
              「いちばん高性能なモデル」ではなく「その作業にちょうどよいモデル」を選ぶのがコツです。
            </p>
          </div>
          <span className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
            {useCases.length}件の用途
          </span>
        </div>

        <div className="mt-3 grid gap-3 lg:mt-4 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-md border border-border bg-background p-2">
            <label className="block lg:hidden">
              <span className="sr-only">用途を選択</span>
              <select
                value={selectedUseCase}
                onChange={(event) => setSelectedUseCase(event.target.value)}
                className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
              >
                {useCases.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>

            <div className="hidden gap-1.5 lg:grid lg:grid-cols-1">
              {useCases.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedUseCase(item.id)}
                  className={`flex w-40 shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors lg:w-full ${
                    selected.id === item.id
                      ? 'border-primary bg-primary/10 text-foreground shadow-sm'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0 text-primary" />
                  <span className="font-medium">{item.title}</span>
                </button>
              ))}
            </div>
          </aside>

          <article className="min-w-0 rounded-md border border-border bg-background shadow-sm">
            <header className="border-b border-border p-3 sm:p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-card text-primary">
                    <selected.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground">選択中の用途</p>
                    <h3 className="mt-0.5 text-lg font-semibold tracking-tight text-foreground sm:text-xl">{selected.title}</h3>
                    <p className="mt-1 line-clamp-3 break-words text-sm leading-6 text-muted-foreground sm:mt-2 sm:line-clamp-none">{selected.scene}</p>
                  </div>
                </div>
              </div>
            </header>

            <div className="grid min-w-0 gap-2 p-3 sm:gap-3 sm:p-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
              <div className="space-y-3">
                <section className="rounded-md border border-border bg-card px-3 py-2">
                  <h4 className="text-sm font-semibold text-foreground">候補モデル</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selected.recommended.map((model) => (
                      <span key={model} className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground">
                        {model}
                      </span>
                    ))}
                  </div>
                </section>

                <section className="rounded-md border border-border bg-card px-3 py-2">
                  <h4 className="text-sm font-semibold text-foreground">理由</h4>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{selected.reason}</p>
                </section>

                <section className="rounded-md border border-border bg-card px-3 py-2">
                  <h4 className="text-sm font-semibold text-foreground">注意点</h4>
                  <ul className="mt-2 space-y-1 text-sm leading-6 text-muted-foreground">
                    {selected.cautions.map((caution) => (
                      <li key={caution} className="flex gap-2">
                        <ShieldCheck className="mt-1 h-3.5 w-3.5 shrink-0 text-primary" />
                        <span>{caution}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <section className="rounded-md border border-border bg-card px-3 py-2">
                <h4 className="text-sm font-semibold text-foreground">契約プラン別の代替案</h4>
                <div className="mt-3 grid gap-2">
                  <div className="rounded-md border border-border bg-background px-3 py-2">
                    <p className="text-xs font-semibold text-foreground">無料プラン</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{selected.alternatives.free}</p>
                  </div>
                  <div className="rounded-md border border-border bg-background px-3 py-2">
                    <p className="text-xs font-semibold text-foreground">Pro / Team</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{selected.alternatives.paid}</p>
                  </div>
                  <div className="rounded-md border border-border bg-background px-3 py-2">
                    <p className="text-xs font-semibold text-foreground">企業利用</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{selected.alternatives.enterprise}</p>
                  </div>
                </div>
              </section>
            </div>
          </article>
        </div>
      </section>

      <section className="rounded-md border border-border bg-card p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-primary">
            <Zap className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground">選び方の基準</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">AIモデル選定の原則</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              モデル選びは難しく見えますが、最初はこの7つだけ押さえれば大きく外しにくくなります。
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-2">
          {principles.map((principle, index) => (
            <div key={principle} className="flex gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm leading-6 text-muted-foreground">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                {index + 1}
              </span>
              <span>{principle}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="official-sources" className="scroll-mt-24 rounded-md border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">公式参考リンク</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              モデル名、提供範囲、料金は変わりやすいため、実際に導入する前に公式ページで確認してください。
            </p>
          </div>
          <span className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
            {data?.sourcePolicy === 'official-only' ? 'official-only data' : 'official sources'}
          </span>
        </div>

        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {sources.map((source) => (
            <a
              key={source.href}
              href={source.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground no-underline transition-colors hover:bg-muted"
            >
              <span className="font-medium">{source.label}</span>
              <ExternalLink className="ml-1 inline h-3 w-3" />
            </a>
          ))}
        </div>

        <div className="mt-4 rounded-md border border-border bg-background p-3">
          <p className="text-sm font-semibold text-foreground">主なモデル一覧</p>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {providerOrder.map((provider) => {
              const models = modelsByProvider.get(provider) ?? [];

              return (
                <div key={provider} className="rounded-md border border-border bg-card px-3 py-2">
                  <p className="text-sm font-semibold text-foreground">{providerLabel(provider)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{models.length}件のモデル</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {models.slice(0, 6).map((model) => {
                      const profile = getLlmProfileByName(model.model);

                      if (!profile) {
                        return (
                          <span key={`${provider}-${model.model}-compact`} className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
                            {model.model}
                          </span>
                        );
                      }

                      return (
                        <a
                          key={`${provider}-${model.model}-compact`}
                          href={withBase(`/llms/models/${profile.slug}/`)}
                          className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground no-underline hover:bg-muted hover:text-foreground"
                        >
                          {model.model}
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </section>
  );
}
