# AI Compass

AI Compass は、AI をこれから学ぶ人から実務で使いたい人までを対象にした、公開向けの AI 知識ハブです。

AI の基本、用語、プロンプト例、LLM の比較、AI 関連ニュースを、PC とスマートフォンのどちらでも読みやすいドキュメント形式で整理しています。

## 公開サイト

https://sig-works.github.io/ai-compass/

## 主なコンテンツ

- AI の基礎解説
- AI 用語集
- プロンプトパターンと実用例
- LLM の選び方とモデル別情報
- AI 関連ニュース
- チャットボット利用ガイド

## 特徴

- 初心者にも読みやすい日本語の AI 学習サイト
- ガイド記事と参照ページを分けた構成
- PC・スマートフォン対応
- Light / Dark テーマ対応
- GitHub Pages で公開できる静的サイト

## 技術スタック

- フレームワーク: Astro
- 言語: TypeScript / React
- UI: Tailwind CSS / shadcn ベースのコンポーネント
- デプロイ先: GitHub Pages
- CI/CD: GitHub Actions

## 開発環境

- Node.js 22.12 以上
- npm

## ローカル実行

```sh
npm install
npm run dev
```

開発サーバーは次の URL で起動します。

```txt
http://127.0.0.1:4322/
```

## ビルド

```sh
npm run build
```

ビルド結果は `dist/` に出力されます。ローカルでビルド結果を確認する場合は次を実行します。

```sh
npm run preview
```

公開前の確認には次を使用します。

```sh
npm run check:site
```

## 公開・デプロイ

このサイトは GitHub Pages で公開しています。

`.github/workflows/deploy-pages.yml` により、`main` ブランチへの push または手動実行で GitHub Actions がビルド、チェック、デプロイを行います。

GitHub Pages の公開元は、リポジトリ設定で GitHub Actions を使用する想定です。

## データ更新

ニュース、LLM データはスクリプトと GitHub Actions で更新します。

```sh
npm run update:ai-news
npm run update:llm-data
```

関連するワークフローは `.github/workflows/` にあります。

## AI 用語集データ

AI 用語集ページは `src/data/glossary.json` を元データとして管理しています。ページではカテゴリ、フリーワード検索、用語カード、詳細表示、関連用語リンク、URL ハッシュによる直接リンクをこの JSON から生成します。

用語を追加・更新するときは、既存項目を残したまま次の項目を設定します。

```json
{
  "id": "rag",
  "term": "RAG",
  "reading": "ラグ",
  "fullName": "Retrieval-Augmented Generation",
  "category": "検索・RAG",
  "plainSummary": "外部資料を検索し、その内容を参照して回答する仕組み。",
  "meaning": "用語の意味を初心者向けに説明します。",
  "usageInAi": "AIでどう使われるかを説明します。",
  "workflow": [
    "外部資料を探す",
    "関係する内容を取り出す",
    "根拠として回答に使う"
  ],
  "example": "社内規程を検索し、該当箇所を参照して回答する。",
  "misconception": "検索した内容が常に正しいとは限らないため、根拠確認が必要です。",
  "relatedTerms": [
    "embedding",
    "vector-database"
  ],
  "sourceNames": [
    "OpenAI",
    "Microsoft Learn"
  ],
  "aliases": [],
  "keywords": [
    "検索",
    "外部知識",
    "retrieval"
  ]
}
```

- `id`: URL ハッシュに使う安定 ID。例: `/glossary/#rag`
- `reading`: 読み方やカタカナ表記。略語は一般的な読み方を優先します。
- `fullName`: 英語名、正式名称、略語の展開形。
- `aliases`: 別名や旧表記。例: ハルシネーションの `幻覚`
- `keywords`: 検索補助語。読み方、補足表記、よくある言い換えを入れます。
- `category`: `AIの基本`、`モデルの仕組み`、`プロンプト`、`検索・RAG`、`アプリ連携`、`開発・運用`、`安全性` のいずれかを使います。
- `relatedTerms`: 関連先の `id`、用語名、別名のいずれかを指定できます。存在する用語を指定すると、詳細表示内でクリック可能なリンクになります。

検索対象は、用語名、読み方、正式名称、カテゴリ、概要、説明、使われ方、具体例、注意点、ワークフロー、出典名、関連用語、別名、キーワードです。

## プロジェクト構成

```txt
.
├── .github/workflows/  GitHub Actions のワークフロー
├── public/             静的ファイルと公開データ
├── scripts/            データ更新とサイト確認用スクリプト
├── src/
│   ├── components/     UI コンポーネント
│   ├── data/           ニュースなどのサイト内データ
│   ├── layouts/        ページレイアウト
│   ├── lib/            共通ロジック
│   ├── pages/          Astro のページ
│   └── styles/         グローバルスタイル
├── astro.config.mjs    Astro 設定
└── package.json        npm スクリプトと依存関係
```

## ライセンス

現時点ではライセンスは明示されていません。
