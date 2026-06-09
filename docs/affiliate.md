# Affiliate Operations

AI Compass で広告リンク・アフィリエイトリンクを扱うための運用メモ。

## 基本方針

- 全ページ共通の開示は `src/layouts/Layout.astro` に表示する。
- 公開方針は `src/pages/affiliate-policy.astro` に集約する。
- 個別のアフィリエイトURLは `src/lib/affiliate.ts` の `AFFILIATE_LINKS` に追加する。
- 価格、提供範囲、プラン名、キャンペーンは変わりやすいため、掲載前に公式情報を確認する。

## リンク追加例

```ts
export const AFFILIATE_LINKS = {
  exampleTool: {
    href: 'https://example.com/?ref=ai-compass',
    label: 'Example Tool',
    provider: 'Example'
  }
} satisfies Record<string, AffiliateLink>;
```

ページ側では、通常リンクを直接書き換える代わりに `affiliateUrl()` を使う。

```ts
affiliateUrl('exampleTool', 'https://example.com/')
```

## 愛用品紹介ページ

- 使用デバイスの本文は `src/data/gear.json` で管理する。
- Amazon の短縮URLやアフィリエイトURLは `src/lib/affiliate.ts` の `AFFILIATE_LINKS` に登録する。
- `/gear/` では `data-affiliate-link` 属性付きリンクをクリックしたときに GA4 へ `affiliate_click` を送る。
- 商品名、写真、価格、在庫は変わりやすいため、固定表示する前に Amazon アソシエイトの規約とリンク先を確認する。
- 紹介文は無理にAIと関連付けず、実際に使い続けている理由を中心に書く。

## 確認

```powershell
npm.cmd run build
npm.cmd run check:site
```
