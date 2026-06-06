# Project SHIFT 画像アセット仕様

Project SHIFTの画像は `public/project-shift/assets/` に配置します。既存ファイルを同じ名前で上書きすると、盤面、凡例、HOW TO PLAY、プレイヤー選択画面へ自動的に反映されます。

## 書き出し仕様

| 種類 | サイズ | 必須形式 | 背景 |
| --- | ---: | --- | --- |
| キャラクター、エンティティ、タイル | 512×512px | WebP + PNG | 透過 |
| UIアイコン | 96×96px | WebP + PNG | 透過 |
| 背景 | 1920×1080px | WebP + PNG | 不透明 |

- カラープロファイルはsRGBにします。
- WebPとPNGは同じ絵柄、同じ寸法、同じファイル名にします。
- 正方形画像は中央へ配置し、外周に約8%の安全余白を残します。
- ファイル名には小文字英数字とハイフンだけを使用します。
- Light/Dark共通画像のため、白い矩形背景、黒い矩形背景、文字、床面、カード枠を画像へ含めません。
- 状態や方向が異なる画像は、下表の専用ファイルへ分けます。CSSによる色変更は前提にしません。

## ファイル一覧

### キャラクター

| 名前 | 用途 |
| --- | --- |
| `characters/player-astronaut.webp` / `.png` | 小型宇宙服 |
| `characters/player-drone.webp` / `.png` | 浮遊探索ドローン |
| `characters/player-explorer.webp` / `.png` | フード型探索者 |
| `characters/player-geometric.webp` / `.png` | 幾何学ロボット |

### エンティティ

| 名前 | 用途 |
| --- | --- |
| `entities/cube.webp` / `.png` | 通常のエネルギーキューブ |
| `entities/cube-powered.webp` / `.png` | ターゲットへ配置済みのキューブ |

### タイル

| 名前 | 用途 |
| --- | --- |
| `tiles/floor.webp` / `.png` | 通常床 |
| `tiles/wall.webp` / `.png` | 壁 |
| `tiles/goal.webp` / `.png` | 空のターゲット |
| `tiles/goal-active.webp` / `.png` | キューブ配置済みターゲット |
| `tiles/exit-closed.webp` / `.png` | 閉じた出口 |
| `tiles/exit-open.webp` / `.png` | 起動した出口 |
| `tiles/switch-off.webp` / `.png` | 未作動スイッチ |
| `tiles/switch-on.webp` / `.png` | 作動中スイッチ |
| `tiles/door-closed.webp` / `.png` | 閉じたドア |
| `tiles/door-open.webp` / `.png` | 開いたドア |
| `tiles/warp.webp` / `.png` | ワープゲート |
| `tiles/ice.webp` / `.png` | 氷床 |
| `tiles/one-way-up.webp` / `.png` | 上向き一方通行 |
| `tiles/one-way-right.webp` / `.png` | 右向き一方通行 |
| `tiles/one-way-down.webp` / `.png` | 下向き一方通行 |
| `tiles/one-way-left.webp` / `.png` | 左向き一方通行 |

### UI

`ui/undo`、`redo`、`restart`、`help`、`stages`、`back`、`check`、`arrow`、`lock`、`direction-up`、`direction-right`、`direction-down`、`direction-left`を、それぞれ `.webp` と `.png` で配置します。

### 背景

`backgrounds/game-surface.webp` と `backgrounds/game-surface.png` を配置します。

## 差し替え手順

1. 上表の寸法と透過条件で画像を制作します。
2. WebPとPNGの両方を書き出します。
3. 対象ファイルを `public/project-shift/assets/` 内の同名ファイルへ上書きします。
4. `npm run check:site` を実行します。
5. Light/Dark、PC、スマートフォンで盤面、凡例、HOW TO PLAY、状態変化を確認します。

ファイル不足、破損、寸法違いは `npm run check:site` でエラーになります。

## 画像生成プロンプト

以下を共通テンプレートとして使用してください。角括弧内を制作対象に合わせて変更します。

```text
Project SHIFT用のゲームアセットを作成してください。

用途：
[アセットの用途]

対象：
[キャラクター・壁・出口などの具体的な対象]

状態：
[通常・起動中・開放・閉鎖など]

デザイン：
- 2026年の高品質インディーパズルゲーム
- 近未来、ミニマル、洗練されたSF
- 白、ライトグレー、濃紺を中心にする
- 紫は装置の発光部分だけに限定する
- 高品質な3Dレンダー調
- 小さく表示しても形を認識できる明確なシルエット
- Light/Dark両方の背景で識別可能
- 既存のProject SHIFT画像と材質、輪郭線、光源を統一する

構図：
- 正面または斜め前から見たアイソメトリック表現
- 対象を中央へ配置
- 正方形キャンバス
- 外周に8%の安全余白
- 対象を切らない

背景除去用設定：
- 背景は完全に均一な #00ff00
- 背景に影、グラデーション、模様、床、反射を入れない
- 対象物に #00ff00 を使用しない
- 接地影、発光のにじみ、半透明の煙を使用しない

禁止事項：
- 文字、数字、ロゴ、透かし
- カード枠、セル背景、床面
- レトロ、ピクセルアート、漫画的表現
- シアンや過剰なネオン
- 細すぎる装飾
- 背景と一体化した白縁・黒縁
```

キャラクターを既存デザインから作成する場合は、次の指示も追加します。

```text
元のキャラクターデザイン、体型、装備、色、素材、ポーズを維持する。
キャラクターだけを抽出し、背景、番号、カード枠、床、影を削除する。
```

生成後は背景を透過処理し、キャラクター・エンティティ・タイルは `512×512px`、UIアイコンは `96×96px`のWebPとPNGで書き出してください。
