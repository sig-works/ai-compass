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
