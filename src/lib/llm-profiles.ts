export type LlmProvider = 'OpenAI' | 'Anthropic' | 'Google';

export interface LlmProfile {
  name: string;
  slug: string;
  provider: LlmProvider;
  series: string;
  summary: string;
  features: string[];
  bestFor: string[];
  weaknesses: string[];
  plans: {
    free: string;
    paid: string;
    enterprise: string;
    api: string;
  };
  suitedFor: string[];
  whyChosen: string[];
  useCases: string[];
  workflow: string[];
  sourceNames: string[];
  officialUrl: string;
  relatedSlugs: string[];
}

const sharedOpenAiSources = ['OpenAI Models', 'OpenAI Docs', 'ChatGPT Pricing'];
const sharedClaudeSources = ['Anthropic Claude Models', 'Anthropic Docs'];
const sharedGeminiSources = ['Google Gemini Models', 'Google AI for Developers'];

export const LLM_PROFILES: LlmProfile[] = [
  {
    name: 'GPT-5.5',
    slug: 'gpt-5-5',
    provider: 'OpenAI',
    series: 'OpenAI GPTシリーズ',
    summary: '会話、文章、コード、調査を広く任せやすいGPT系の中心モデル。',
    features: [
      '文章で頼むだけで、調査の整理、下書き、表の作成、コードの相談まで幅広く扱えます。',
      '複数の条件を同時に渡しても、目的に沿って順番に考えやすいモデルです。',
      'ChatGPTやAPIなど、使う場所によって見え方や制限が変わります。'
    ],
    bestFor: ['文章生成', '要約', '調査の整理', '会話', 'データ分析', '軽いコーディング'],
    weaknesses: [
      '最新情報や社内資料は、必要な資料を渡さないと推測で答えることがあります。',
      '大量の単純処理では、軽量モデルのほうが費用を抑えやすい場合があります。',
      '重要な判断では、出力をそのまま確定情報にせず人が確認する必要があります。'
    ],
    plans: {
      free: '無料プランでは試せる範囲や回数に制限がある場合があります。まず会話や短い文章整理で感触を見ます。',
      paid: '有料プランでは、利用回数、ファイルの扱い、上位モデルの利用範囲が広がることがあります。',
      enterprise: '企業向けでは、管理機能、権限、監査、データの扱いを組織単位で整えやすくなります。',
      api: 'APIでは、アプリや社内ツールから呼び出して使います。料金は使った量に応じて変わるため公式情報で確認します。'
    },
    suitedFor: ['まず1つのAIで広く試したい人', '文章とコードの両方を扱う人', '調査、要約、整理を日常的に行うチーム'],
    whyChosen: ['用途の幅が広い', '説明が自然で読みやすい', 'ChatGPTから試しやすい', 'API連携に展開しやすい'],
    useCases: ['コーディング', '要約', '文章生成', '調査', '会話', 'データ分析'],
    workflow: ['目的を文章で渡す', '材料や条件を追加する', 'AIが考えて答えを作る', '人が確認して使う'],
    sourceNames: sharedOpenAiSources,
    officialUrl: 'https://developers.openai.com/api/docs/models',
    relatedSlugs: ['gpt-5-5-pro', 'gpt-5-4', 'gpt-5-4-mini']
  },
  {
    name: 'GPT-5.5 Pro',
    slug: 'gpt-5-5-pro',
    provider: 'OpenAI',
    series: 'OpenAI GPTシリーズ',
    summary: '難しい判断や長い作業を、より丁寧に進めたいときの上位モデル。',
    features: [
      '条件が多い依頼や、答えを出すまでに段取りが必要な作業に向いています。',
      '長い文章、複数資料、設計相談などで、全体のつながりを保ちやすいモデルです。',
      '速さや費用よりも、答えの質を優先したい場面で候補になります。'
    ],
    bestFor: ['複雑な調査', '設計相談', '長文レビュー', '重要な文章作成', 'データ分析'],
    weaknesses: [
      '短い定型作業には大きすぎる場合があります。',
      '軽量モデルより応答が遅く、費用も高くなりやすい傾向があります。',
      '重要な事実確認や法務判断は、公式資料や専門家確認が必要です。'
    ],
    plans: {
      free: '無料プランでは上位モデルの利用範囲が限られることがあります。',
      paid: '有料プランでは、難しい作業や長い依頼で使える範囲が広がることがあります。',
      enterprise: '企業向けでは、チーム管理やデータ保護の条件と合わせて検討します。',
      api: 'APIでは、高品質な回答が必要な処理だけに使い、軽い処理とは分けると費用を管理しやすくなります。'
    },
    suitedFor: ['企画や設計を詰めたい人', 'レビュー品質を上げたいチーム', '重要な文書を丁寧に整えたい人'],
    whyChosen: ['難しい依頼を崩さず扱いやすい', '長い文脈を保ちやすい', '説明の筋道を作りやすい'],
    useCases: ['調査', '文章生成', '要約', 'データ分析', 'コーディング'],
    workflow: ['複雑な相談を渡す', '条件を整理する', '候補案を比較する', '確認点を出して仕上げる'],
    sourceNames: sharedOpenAiSources,
    officialUrl: 'https://developers.openai.com/api/docs/models',
    relatedSlugs: ['gpt-5-5', 'gpt-5-4-pro', 'claude-opus-4-8']
  },
  {
    name: 'GPT-5.4',
    slug: 'gpt-5-4',
    provider: 'OpenAI',
    series: 'OpenAI GPTシリーズ',
    summary: '日常的な文章作成、調査、相談に使いやすい標準的なGPTモデル。',
    features: [
      '会話しながら考えを整理する用途に向いています。',
      '文章のたたき台、要約、分類、表形式の整理などを安定して頼めます。',
      '上位モデルほど重くなく、軽量モデルより複雑な依頼に対応しやすい位置づけです。'
    ],
    bestFor: ['会話', '要約', '文章生成', '調査', '軽いコード相談'],
    weaknesses: [
      '非常に長い資料や難しい設計判断では、上位モデルのほうが向く場合があります。',
      '大量処理ではminiやnanoのほうが扱いやすい場合があります。',
      '事実確認が必要な内容は、根拠資料とあわせて確認します。'
    ],
    plans: {
      free: '無料プランでは基本的な会話や短い作業から試します。',
      paid: '有料プランでは、より長い作業や高い利用上限が必要なときに検討します。',
      enterprise: '企業向けでは、利用者管理と社内ルールを整えたうえで使います。',
      api: 'APIでは、標準的な問い合わせや文書処理に組み込みやすい候補です。'
    },
    suitedFor: ['毎日の文章作業に使いたい人', 'AIを仕事の補助に入れたいチーム', 'まず標準モデルを試したい人'],
    whyChosen: ['幅広く使える', '重すぎない', '会話と作業補助のバランスがよい'],
    useCases: ['要約', '文章生成', '会話', '調査', 'コーディング'],
    workflow: ['依頼を書く', '不足情報を追加する', 'AIが回答を作る', '必要なら言い換えや表に直す'],
    sourceNames: sharedOpenAiSources,
    officialUrl: 'https://developers.openai.com/api/docs/models',
    relatedSlugs: ['gpt-5-5', 'gpt-5-4-mini', 'gpt-5-4-pro']
  },
  {
    name: 'GPT-5.4 Pro',
    slug: 'gpt-5-4-pro',
    provider: 'OpenAI',
    series: 'OpenAI GPTシリーズ',
    summary: 'GPT-5.4より重い相談やレビューを任せたいときの上位候補。',
    features: [
      '設計、比較、レビューなど、考える手順が多い依頼に向いています。',
      '文章の自然さだけでなく、理由や判断材料も一緒に整理しやすいモデルです。',
      '重要な作業だけ上位モデルに回す使い方と相性がよいです。'
    ],
    bestFor: ['設計相談', 'コードレビュー', '長文整理', '調査', '文章生成'],
    weaknesses: [
      '短い分類や変換だけなら、軽量モデルのほうが効率的です。',
      '出力が丁寧なぶん、確認せずに長文を受け入れてしまう危険があります。',
      '料金や利用上限は契約により変わります。'
    ],
    plans: {
      free: '無料プランでは使える範囲が限られる可能性があります。',
      paid: '有料プランでは、品質を優先する作業に使いやすくなります。',
      enterprise: '企業向けでは、重要資料を扱う前に管理設定と社内ルールを確認します。',
      api: 'APIでは、レビューや判断を含む処理に限定すると使い分けしやすくなります。'
    },
    suitedFor: ['レビューを丁寧に行いたい人', '企画や設計を相談したい人', '重要な文書を扱うチーム'],
    whyChosen: ['複雑な話を整理しやすい', '理由を添えた回答を作りやすい', '標準モデルから上げる理由が明確'],
    useCases: ['コーディング', '文章生成', '調査', '要約', 'データ分析'],
    workflow: ['資料を渡す', '判断軸を指定する', 'AIが比較して答える', '人が根拠を確認する'],
    sourceNames: sharedOpenAiSources,
    officialUrl: 'https://developers.openai.com/api/docs/models',
    relatedSlugs: ['gpt-5-4', 'gpt-5-5-pro', 'claude-sonnet-4-6']
  },
  {
    name: 'GPT-5.4 mini',
    slug: 'gpt-5-4-mini',
    provider: 'OpenAI',
    series: 'OpenAI GPTシリーズ',
    summary: '速さと費用を抑えながら、日常作業を大量に処理したいときの小型モデル。',
    features: [
      '短い要約、分類、下書き、入力文の整形などをすばやく処理しやすいモデルです。',
      '上位モデルほど深く考える作業より、決まった型の作業に向いています。',
      'アプリに組み込むとき、費用と応答速度のバランスを取りやすい候補です。'
    ],
    bestFor: ['要約', '分類', '文章の整形', '軽い会話', '大量処理'],
    weaknesses: [
      '複雑な判断や長い設計相談には向きにくい場合があります。',
      '説明の深さや慎重さは上位モデルに劣ることがあります。',
      '曖昧な依頼では、期待とずれる答えになりやすいことがあります。'
    ],
    plans: {
      free: '無料プランで試せる場合は、短い文章処理から感触を見ます。',
      paid: '有料プランでは、日常的に回数を使う作業で検討します。',
      enterprise: '企業向けでは、定型作業を社内ツールに組み込む候補になります。',
      api: 'APIでは、大量の短い処理や低コスト運用に向いています。'
    },
    suitedFor: ['大量の文章を軽く整理したい人', 'アプリにAI機能を入れたい開発者', '費用を抑えたいチーム'],
    whyChosen: ['速い', '費用を抑えやすい', '定型作業に使いやすい'],
    useCases: ['要約', '会話', '文章生成', 'データ整理'],
    workflow: ['短い入力を渡す', '決まった形式を指定する', 'すばやく回答を返す', '必要なものだけ人が確認する'],
    sourceNames: sharedOpenAiSources,
    officialUrl: 'https://developers.openai.com/api/docs/models',
    relatedSlugs: ['gpt-5-4', 'gpt-5-4-nano', 'gemini-3-5-flash']
  },
  {
    name: 'GPT-5.4 nano',
    slug: 'gpt-5-4-nano',
    provider: 'OpenAI',
    series: 'OpenAI GPTシリーズ',
    summary: 'とても軽い処理を大量に回すための小型モデル。',
    features: [
      '短い分類、タグ付け、定型文の変換など、決まった処理を速く行う用途に向いています。',
      '深い相談より、入力と出力の形がはっきりした作業で力を出します。',
      'サービスに組み込んで、多数のリクエストを処理する場面で検討します。'
    ],
    bestFor: ['分類', 'タグ付け', '短文変換', '大量処理', '簡単なチェック'],
    weaknesses: [
      '複雑な理由づけや長い会話には向きません。',
      '依頼が曖昧だと、細かな意図を拾いきれないことがあります。',
      '大事な文章の最終判断には上位モデルか人の確認を組み合わせます。'
    ],
    plans: {
      free: '無料プランで見える場合でも、用途は軽い作業に絞ると確認しやすいです。',
      paid: '有料プランでは、日常的な繰り返し作業の候補になります。',
      enterprise: '企業向けでは、問い合わせの振り分けや社内分類の補助に向きます。',
      api: 'APIでは、短い処理を大量に行うときの費用調整役になります。'
    },
    suitedFor: ['大量処理を扱う開発者', '費用を細かく管理したいチーム', '定型作業を自動化したい人'],
    whyChosen: ['軽い', '大量処理に向く', '役割を絞ると扱いやすい'],
    useCases: ['分類', '要約', '簡単な文章生成', 'データ整理'],
    workflow: ['短い文章を入れる', '分類や変換のルールを渡す', 'AIがすぐ返す', 'まとめて確認する'],
    sourceNames: sharedOpenAiSources,
    officialUrl: 'https://developers.openai.com/api/docs/models',
    relatedSlugs: ['gpt-5-4-mini', 'gpt-5-4', 'claude-haiku-4-5']
  },
  {
    name: 'GPT-5.3-Codex',
    slug: 'gpt-5-3-codex',
    provider: 'OpenAI',
    series: 'OpenAI GPTシリーズ',
    summary: '開発作業を調べ、直し、実装する流れに強いCodex向けモデル。',
    features: [
      'コードを書く前に、既存のファイル構成や変更の影響を調べる作業に向いています。',
      'バグ調査、修正案、テスト追加、レビュー対応など、開発の一連の流れを進めやすいモデルです。',
      'ただ答えるだけでなく、必要な手順を考えながら作業する用途で力を出します。'
    ],
    bestFor: ['コーディング', 'コードレビュー', 'バグ調査', '実装計画', '技術文書'],
    weaknesses: [
      '一般的な雑談や軽い文章作成だけなら、標準モデルや軽量モデルで十分な場合があります。',
      'リポジトリの制約や社内ルールを渡さないと、実情に合わない提案をすることがあります。',
      '生成されたコードは、テストとレビューで確認してから使います。'
    ],
    plans: {
      free: '提供範囲は利用する製品や時期で変わるため、無料枠で使えるかは公式情報を確認します。',
      paid: '開発支援ツールや有料プランで、長い作業や複雑な依頼に使える範囲が広がることがあります。',
      enterprise: '企業向けでは、リポジトリ、権限、ログ、機密情報の扱いを確認して導入します。',
      api: 'APIや開発環境から使う場合は、実行権限、編集範囲、レビュー工程を決めてから組み込みます。'
    },
    suitedFor: ['コードを書いている人', 'レビューや調査に時間を取られているチーム', '開発作業をAIと分担したい人'],
    whyChosen: ['開発の文脈を扱いやすい', '調査から実装までつなげやすい', 'Codex作業と相性がよい', 'レビュー前提で進めやすい'],
    useCases: ['コーディング', '調査', 'データ分析', '要約', '技術文書'],
    workflow: ['目的とリポジトリを確認する', '関連ファイルを探す', '修正方針を立てる', '実装とテストを行う', '差分を説明する'],
    sourceNames: ['OpenAI GPT-5.3-Codex', 'OpenAI Models', 'OpenAI Docs'],
    officialUrl: 'https://developers.openai.com/api/docs/models/gpt-5.3-codex',
    relatedSlugs: ['gpt-5-5', 'gpt-5-4-pro', 'claude-sonnet-4-6']
  },
  {
    name: 'Claude Opus 4.8',
    slug: 'claude-opus-4-8',
    provider: 'Anthropic',
    series: 'Claudeシリーズ',
    summary: '長い文章や複雑な相談を、じっくり読ませたいときのClaude上位モデル。',
    features: [
      '長い資料、議事録、仕様書などを読み、論点を整理する作業に向いています。',
      '文章の自然さ、レビュー観点の整理、複数案の比較で使いやすいモデルです。',
      '速さよりも丁寧さを優先したい場面で候補になります。'
    ],
    bestFor: ['長文レビュー', '要約', '調査', '文章生成', '設計相談'],
    weaknesses: [
      '軽い定型作業には大きすぎることがあります。',
      '画像生成などの制作そのものが主役の用途には向きません。',
      '最新情報は公式資料や検索結果と合わせて確認します。'
    ],
    plans: {
      free: '無料プランでは試せる範囲や回数が限られる場合があります。',
      paid: '有料プランでは、長い資料や高い利用上限が必要な作業で検討します。',
      enterprise: '企業向けでは、組織管理、権限、データ保護の設定を確認します。',
      api: 'APIでは、長文読解やレビューを含む処理に組み込みやすい候補です。'
    },
    suitedFor: ['長い文書を読む人', 'レビューや編集を行う人', '複雑な議論を整理したいチーム'],
    whyChosen: ['長文を扱いやすい', '文章の整理が自然', '慎重なレビューに向く'],
    useCases: ['要約', '文章生成', '調査', '会話', 'コーディング'],
    workflow: ['長い資料を渡す', '見てほしい観点を指定する', '要点と論点を整理する', '人が判断する'],
    sourceNames: sharedClaudeSources,
    officialUrl: 'https://platform.claude.com/docs/en/about-claude/models/overview',
    relatedSlugs: ['claude-sonnet-4-6', 'gpt-5-5-pro', 'gemini-3-1-pro']
  },
  {
    name: 'Claude Sonnet 4.6',
    slug: 'claude-sonnet-4-6',
    provider: 'Anthropic',
    series: 'Claudeシリーズ',
    summary: '文章、コード、レビューをバランスよく扱えるClaudeの実務向けモデル。',
    features: [
      '文章の整理とコード相談のどちらにも使いやすいバランス型です。',
      '長めの依頼でも、要点、注意点、次の作業に分けて整理しやすいモデルです。',
      'Claude Codeなど開発作業との組み合わせでも候補になります。'
    ],
    bestFor: ['コーディング', 'コードレビュー', '文章生成', '要約', '調査'],
    weaknesses: [
      '最上位モデルほど深い検討が必要な作業では、Opusを検討することがあります。',
      '大量の短い処理では、Haikuのほうが効率的な場合があります。',
      '出力の自然さに頼りすぎず、根拠は確認します。'
    ],
    plans: {
      free: '無料プランでは、日常的な相談や短い文書確認から試します。',
      paid: '有料プランでは、長めの資料や作業量が増える場合に検討します。',
      enterprise: '企業向けでは、社内資料を扱うための管理設定を確認します。',
      api: 'APIでは、レビュー、要約、開発補助のバランス型として使いやすい候補です。'
    },
    suitedFor: ['文章とコードを両方扱う人', 'レビューを日常的に行う人', 'Claudeを実務に入れたいチーム'],
    whyChosen: ['用途の幅が広い', '長文とコードのバランスがよい', '説明が落ち着いている'],
    useCases: ['コーディング', '要約', '文章生成', '調査', '会話'],
    workflow: ['依頼を渡す', '資料やコードを追加する', '観点ごとに整理する', '修正案を確認する'],
    sourceNames: sharedClaudeSources,
    officialUrl: 'https://platform.claude.com/docs/en/about-claude/models/overview',
    relatedSlugs: ['claude-opus-4-8', 'claude-haiku-4-5', 'gpt-5-3-codex']
  },
  {
    name: 'Claude Haiku 4.5',
    slug: 'claude-haiku-4-5',
    provider: 'Anthropic',
    series: 'Claudeシリーズ',
    summary: '短い処理をすばやく返したいときのClaude軽量モデル。',
    features: [
      '短文の要約、分類、返信案、簡単な確認を速く行う用途に向いています。',
      '深い検討よりも、軽い作業を数多く処理する使い方に合います。',
      'Claudeらしい読みやすい文章を保ちながら、速度と費用を抑えたいときの候補です。'
    ],
    bestFor: ['短文要約', '分類', '軽い文章生成', '会話', '大量処理'],
    weaknesses: [
      '複雑な設計や長文レビューでは、SonnetやOpusのほうが向く場合があります。',
      '曖昧な依頼では意図を取り違えることがあります。',
      '重要な判断には人の確認を組み合わせます。'
    ],
    plans: {
      free: '無料プランで使える場合は、短い会話や軽い文章整理から試します。',
      paid: '有料プランでは、日常的な回数や速度が必要な作業で検討します。',
      enterprise: '企業向けでは、問い合わせ整理や定型作業の補助に使いやすい候補です。',
      api: 'APIでは、短いリクエストを大量に処理する場面で検討します。'
    },
    suitedFor: ['速さを重視する人', '大量の軽い作業を扱うチーム', '費用を抑えたい開発者'],
    whyChosen: ['速い', '軽い作業に使いやすい', '文章が読みやすい'],
    useCases: ['要約', '分類', '会話', '文章生成'],
    workflow: ['短い文章を渡す', '出力形式を指定する', 'すばやく返す', '必要な分だけ確認する'],
    sourceNames: sharedClaudeSources,
    officialUrl: 'https://platform.claude.com/docs/en/about-claude/models/overview',
    relatedSlugs: ['claude-sonnet-4-6', 'gpt-5-4-nano', 'gemini-3-5-flash']
  },
  {
    name: 'Gemini 3.1 Pro',
    slug: 'gemini-3-1-pro',
    provider: 'Google',
    series: 'Geminiシリーズ',
    summary: 'Googleのサービスや大量の情報と組み合わせやすい、Geminiの上位モデル。',
    features: [
      '文章、画像、資料など複数の材料を合わせて考える用途に向いています。',
      'Google AI Studio、Gemini API、Vertex AIなど、試す場所と業務利用の場所を分けて考えやすいモデルです。',
      '長い資料や複雑な調査を扱うときの候補になります。'
    ],
    bestFor: ['調査', '要約', 'データ分析', '画像を含む確認', '文章生成'],
    weaknesses: [
      '軽い大量処理ではFlash系のほうが効率的な場合があります。',
      'Google CloudやAPIの設定に慣れていないと、業務導入時に確認項目が増えます。',
      '回答の根拠は、渡した資料や公式情報で確認します。'
    ],
    plans: {
      free: '無料で試せる環境では、短い調査や画像を含む確認から感触を見ます。',
      paid: '有料プランでは、利用量や上位機能が必要な場面で検討します。',
      enterprise: '企業向けでは、Vertex AIなどで権限、請求、監査をまとめて扱いやすくなります。',
      api: 'APIでは、Google AI StudioやGemini APIから呼び出し、使用量に応じた料金を確認します。'
    },
    suitedFor: ['Google環境を使っている人', '資料や画像を含めて調べたい人', '業務システムに組み込みたいチーム'],
    whyChosen: ['Google連携を考えやすい', '多様な入力を扱いやすい', '業務基盤に展開しやすい'],
    useCases: ['調査', '要約', '画像理解', 'データ分析', '文章生成'],
    workflow: ['文章や画像を渡す', '確認したい観点を指定する', 'AIが情報をまとめる', '根拠を確認して使う'],
    sourceNames: sharedGeminiSources,
    officialUrl: 'https://ai.google.dev/gemini-api/docs/models?hl=ja',
    relatedSlugs: ['gemini-3-5-flash', 'claude-opus-4-8', 'gpt-5-5-pro']
  },
  {
    name: 'Gemini 3.5 Flash',
    slug: 'gemini-3-5-flash',
    provider: 'Google',
    series: 'Geminiシリーズ',
    summary: '速さと費用のバランスを取りながら、実務処理に使いやすいGeminiモデル。',
    features: [
      '要約、分類、短い調査、文章整形などをすばやく処理しやすいモデルです。',
      'GoogleのAPIやクラウド環境で、アプリに組み込みやすい候補になります。',
      'Proほど重くなく、軽量モデルより幅広い作業に対応しやすい位置づけです。'
    ],
    bestFor: ['要約', '分類', '調査', '会話', 'データ整理'],
    weaknesses: [
      '非常に難しい判断や長い設計相談ではProを検討します。',
      '画像生成そのものが主目的なら、画像向けモデルと分けて考えます。',
      '大量処理では、入力内容と料金の管理が必要です。'
    ],
    plans: {
      free: '無料枠では、短い処理や試作から使い始めます。',
      paid: '有料では、処理量が増えるアプリや継続利用で検討します。',
      enterprise: '企業向けでは、Google Cloud上の管理や請求と合わせて使います。',
      api: 'APIでは、応答速度と費用を見ながら大量処理に組み込みます。'
    },
    suitedFor: ['速さを重視する人', 'Google APIで試作したい開発者', '日常処理を自動化したいチーム'],
    whyChosen: ['速い', '費用を抑えやすい', 'Google環境とつなげやすい'],
    useCases: ['要約', '文章生成', '調査', '会話', 'データ分析'],
    workflow: ['入力を短く整える', '出力形式を決める', 'AIがすばやく返す', '結果をアプリで使う'],
    sourceNames: sharedGeminiSources,
    officialUrl: 'https://ai.google.dev/gemini-api/docs/models?hl=ja',
    relatedSlugs: ['gemini-3-flash', 'gemini-3-1-pro', 'gpt-5-4-mini']
  },
  {
    name: 'Gemini 3 Flash',
    slug: 'gemini-3-flash',
    provider: 'Google',
    series: 'Geminiシリーズ',
    summary: '軽い処理を速く返したいときのGemini Flash系モデル。',
    features: [
      '短い質問、要約、分類、会話などをテンポよく処理する用途に向いています。',
      '上位モデルより軽く、試作や日常処理で使いやすい候補です。',
      '入力と出力の形を決めると、安定して使いやすくなります。'
    ],
    bestFor: ['会話', '要約', '分類', '文章整形', '大量処理'],
    weaknesses: [
      '難しい分析や長い資料の読み込みではPro系を検討します。',
      '深い理由づけが必要な場面では回答を確認します。',
      '用途を広げすぎると、期待より浅い回答になることがあります。'
    ],
    plans: {
      free: '無料枠では、軽い会話や短い文章整理から試します。',
      paid: '有料では、処理量が増えたときに検討します。',
      enterprise: '企業向けでは、社内の定型処理や補助機能に組み込みやすい候補です。',
      api: 'APIでは、速度が必要な処理や多数の短い依頼に向いています。'
    },
    suitedFor: ['軽い処理を速く回したい人', '試作を進めたい開発者', '費用と速度を見たいチーム'],
    whyChosen: ['テンポよく使える', '定型作業に向く', '試作に入れやすい'],
    useCases: ['会話', '要約', '文章生成', 'データ整理'],
    workflow: ['短い依頼を書く', '形式を指定する', 'AIがすぐ返す', '必要なら上位モデルに回す'],
    sourceNames: sharedGeminiSources,
    officialUrl: 'https://ai.google.dev/gemini-api/docs/models?hl=ja',
    relatedSlugs: ['gemini-3-5-flash', 'gemini-3-1-flash-lite', 'claude-haiku-4-5']
  },
  {
    name: 'Gemini 3.1 Flash-Lite',
    slug: 'gemini-3-1-flash-lite',
    provider: 'Google',
    series: 'Geminiシリーズ',
    summary: '費用を抑えて、短い処理を大量に扱うためのGemini軽量モデル。',
    features: [
      '分類、短文変換、タグ付けなど、決まった作業を低コストで回す用途に向いています。',
      '深く考える作業より、同じ形の依頼をたくさん処理する場面で使いやすいモデルです。',
      'アプリや業務フローの裏側で動かす補助役として検討します。'
    ],
    bestFor: ['分類', 'タグ付け', '短文要約', '大量処理', '簡単な会話'],
    weaknesses: [
      '複雑な調査、設計、長文レビューには向きにくい場合があります。',
      '曖昧な依頼では出力がぶれやすくなります。',
      '重要な判断では上位モデルや人の確認を組み合わせます。'
    ],
    plans: {
      free: '無料枠では、短い分類や変換で試します。',
      paid: '有料では、処理量が多いサービスや社内ツールで検討します。',
      enterprise: '企業向けでは、ルール化された補助処理として使いやすい候補です。',
      api: 'APIでは、費用を抑えたい大量処理に向いています。'
    },
    suitedFor: ['大量処理を設計する人', '費用を重視するチーム', 'アプリに軽いAI機能を入れたい開発者'],
    whyChosen: ['費用を抑えやすい', '大量処理向き', '役割を絞ると安定しやすい'],
    useCases: ['分類', '要約', 'データ整理', '簡単な文章生成'],
    workflow: ['短い入力を渡す', '分類ルールを指定する', 'AIが一括処理する', '結果を一覧で確認する'],
    sourceNames: sharedGeminiSources,
    officialUrl: 'https://ai.google.dev/gemini-api/docs/models?hl=ja',
    relatedSlugs: ['gemini-3-flash', 'gpt-5-4-nano', 'claude-haiku-4-5']
  }
];

export const LLM_PROFILE_GROUPS = [
  {
    label: 'OpenAI GPTシリーズ',
    provider: 'OpenAI' as const,
    description: '会話、文章、コード、調査を広く扱うモデル群。',
    slugs: ['gpt-5-5', 'gpt-5-5-pro', 'gpt-5-4', 'gpt-5-4-pro', 'gpt-5-4-mini', 'gpt-5-4-nano']
  },
  {
    label: 'GPT-5.3-Codex',
    provider: 'OpenAI' as const,
    description: '開発・調査・実装作業に寄せたCodex向けモデル。',
    slugs: ['gpt-5-3-codex']
  },
  {
    label: 'Claudeシリーズ',
    provider: 'Anthropic' as const,
    description: '長文読解、レビュー、文章整理に強いモデル群。',
    slugs: ['claude-opus-4-8', 'claude-sonnet-4-6', 'claude-haiku-4-5']
  },
  {
    label: 'Geminiシリーズ',
    provider: 'Google' as const,
    description: 'Google環境や画像を含む作業と組み合わせやすいモデル群。',
    slugs: ['gemini-3-1-pro', 'gemini-3-5-flash', 'gemini-3-flash', 'gemini-3-1-flash-lite']
  }
] as const;

export const LLM_PROFILE_NAV = LLM_PROFILE_GROUPS.map((group) => ({
  label: group.label,
  href: group.slugs.length === 1 ? `/llms/models/${group.slugs[0]}/` : `/llms/catalog/#${group.provider.toLowerCase()}-${group.label.includes('Codex') ? 'codex' : 'series'}`,
  children:
    group.slugs.length > 1
      ? group.slugs.map((slug) => {
          const profile = LLM_PROFILES.find((item) => item.slug === slug);
          return {
            href: `/llms/models/${slug}/`,
            label: profile?.name ?? slug
          };
        })
      : undefined
}));

export function getLlmProfile(slug: string) {
  return LLM_PROFILES.find((profile) => profile.slug === slug);
}

export function getLlmProfileByName(name: string) {
  const normalized = normalizeModelName(name);
  return LLM_PROFILES.find((profile) => normalizeModelName(profile.name) === normalized);
}

export function profilesForGroup(slugs: readonly string[]) {
  return slugs.map((slug) => getLlmProfile(slug)).filter((profile): profile is LlmProfile => Boolean(profile));
}

function normalizeModelName(name: string) {
  return name.toLowerCase().replace(/[\s._]+/g, '-').replace(/-+/g, '-').trim();
}
