import {
  AlertTriangle,
  BookOpenCheck,
  Bot,
  ClipboardCheck,
  Copy,
  FileCheck2,
  FilePenLine,
  FileSearch,
  GitPullRequest,
  Lightbulb,
  MailCheck,
  MessageSquareText,
  Search,
  ShieldCheck,
  TestTube2,
  Workflow
} from 'lucide-react';
import { startTransition, useDeferredValue, useEffect, useState } from 'react';

type PromptPattern = {
  id: string;
  title: string;
  scene: string;
  prompt: string;
  placeholders: { token: string; example: string }[];
  rationale: string[];
  variations: string[];
  cautions: string[];
  tags: string[];
  icon: typeof ClipboardCheck;
};

const commonRules = `# 必ず守ること
- 不足情報は推測せず「確認事項」に分ける
- 事実と推測を分ける
- 根拠がない断定を避ける
- 出力形式に従う`;

const patterns: PromptPattern[] = [
  {
    id: 'requirements',
    title: '要件定義',
    scene: '相談や要望から、目的、利用者、業務ルール、制約、非機能、未決事項を整理したいとき。',
    icon: ClipboardCheck,
    tags: ['要求整理', '業務ヒアリング', '非機能', '受け入れ条件'],
    prompt: `あなたは経験豊富なSE兼要件定義ファシリテーターです。
以下の情報をもとに、要件定義のたたき台を作成してください。

# 入力
- プロジェクト名: <プロジェクト名>
- 背景・課題: <背景・課題>
- 利用者・関係者: <利用者・関係者>
- 現行業務・現行システム: <現行業務・現行システム>
- 実現したいこと: <実現したいこと>
- 制約: <制約>
- 期限・優先度: <期限・優先度>

${commonRules}
- セキュリティ、運用、権限、監査、性能、可用性の観点を含める

# 出力形式
1. 目的
2. スコープ内 / スコープ外
3. 利用者と主要シナリオ
4. 機能要件
5. 非機能要件
6. 業務ルール・制約
7. 受け入れ条件
8. リスク
9. 確認事項
10. 次回ヒアリングで聞くべき質問`,
    placeholders: [
      { token: '<プロジェクト名>', example: '会員管理システム刷新' },
      { token: '<背景・課題>', example: '手作業の転記が多く、入力漏れと確認工数が増えている' },
      { token: '<利用者・関係者>', example: '営業担当、運用担当、管理者、顧客サポート' },
      { token: '<制約>', example: '既存DBは当面維持、監査ログは1年保管' }
    ],
    rationale: [
      '要件定義では、要望をそのまま仕様化すると抜け漏れが出やすいため、目的、利用者、業務ルール、制約を先に分けます。',
      '非機能や運用を最初から入れることで、後工程で発覚しがちな権限、監査、性能、可用性の論点を早めに拾えます。',
      '確認事項を明示させることで、AIが不明点を勝手に補完して要件を作る事故を避けます。'
    ],
    variations: [
      '既存システム改修では「現行仕様との差分」と「互換性影響」を追加する。',
      '顧客ヒアリング前は「質問票」と「聞く順番」を中心に出力させる。',
      'アジャイル案件では「ユーザーストーリー」と「受け入れ条件」に変換する。',
      '見積もり前には「不確実性が高い要件」と「見積もり前提」を追加する。'
    ],
    cautions: [
      '利用者、権限、業務例外が空欄だと要件が薄くなりやすい。',
      '「できるだけ便利に」など曖昧な表現は、成功条件に言い換えさせる。',
      '法務、監査、個人情報、ログ保管はAIの出力だけで確定しない。'
    ]
  },
  {
    id: 'design',
    title: '設計（基本設計・詳細設計）',
    scene: '要件から、画面、API、DB、バッチ、エラー処理、運用、テスト観点を洗い出したいとき。',
    icon: Workflow,
    tags: ['基本設計', '詳細設計', 'API', 'DB', '運用'],
    prompt: `あなたはシステム設計レビューに強いシニアSEです。
以下の要件から、基本設計と詳細設計で検討すべき内容を整理してください。

# 入力
- 対象機能: <対象機能>
- 要件: <要件>
- 既存構成: <既存構成>
- 技術スタック: <技術スタック>
- 制約: <制約>

${commonRules}
- 既存仕様との整合、セキュリティ、性能、運用、テスト容易性を含める

# 出力形式
1. 設計方針
2. 全体構成
3. 画面・API・DB・バッチごとの設計観点
4. データ項目と状態遷移
5. エラー処理・リトライ・排他制御
6. セキュリティ・権限・監査ログ
7. 運用・監視・障害時対応
8. テスト観点
9. 代替案とトレードオフ
10. 確認事項`,
    placeholders: [
      { token: '<対象機能>', example: '請求書PDFの自動生成' },
      { token: '<既存構成>', example: 'Next.js + API Gateway + Lambda + PostgreSQL' },
      { token: '<技術スタック>', example: 'TypeScript、Prisma、S3、CloudWatch' },
      { token: '<制約>', example: '月末は処理件数が10倍、既存APIの互換性維持' }
    ],
    rationale: [
      '設計は実装前に論点を並べる作業なので、構成、データ、エラー、運用を同じ粒度で確認します。',
      '代替案とトレードオフを出させると、単なる思いつきではなく採用理由を残しやすくなります。',
      '既存構成を入力させることで、既存システムと矛盾した設計案を減らします。'
    ],
    variations: [
      'API設計では、リクエスト、レスポンス、ステータスコード、冪等性を追加する。',
      'DB設計では、主キー、外部キー、インデックス、履歴管理を指定する。',
      '画面設計では、入力チェック、空状態、エラー状態、権限制御を強調する。',
      'レビュー前には「設計レビュー観点チェックリスト」に変換する。'
    ],
    cautions: [
      'AIが既存設計を知らない場合、既存構成を必ず貼る。',
      '性能や可用性の数値目標は推測で決めさせない。',
      '設計案は採用理由と捨てた案をセットで残す。'
    ]
  },
  {
    id: 'review',
    title: 'コードレビュー',
    scene: 'PRや差分に対して、バグ、設計、保守性、セキュリティ、テスト不足を短時間で洗い出したいとき。',
    icon: ShieldCheck,
    tags: ['PR', '差分レビュー', '保守性', 'セキュリティ'],
    prompt: `あなたは厳密だが建設的なコードレビュアーです。
以下の差分をレビューし、実害のある指摘を優先して整理してください。

# 入力
- 背景: <背景>
- 期待する挙動: <期待する挙動>
- レビュー観点: <レビュー観点>
- 対象コードまたはdiff:
<対象コード>

${commonRules}
- バグ、仕様漏れ、例外処理、セキュリティ、性能、テスト不足を優先する
- 好みの指摘だけで終わらせない

# 出力形式
1. Critical
2. Major
3. Minor
4. テスト不足
5. 確認事項
6. 良い点
7. 修正例`,
    placeholders: [
      { token: '<背景>', example: 'CSVアップロード時の入力検証を追加したPR' },
      { token: '<期待する挙動>', example: '不正行だけをエラーにし、正常行は登録する' },
      { token: '<レビュー観点>', example: '例外処理、セキュリティ、既存仕様との互換性' },
      { token: '<対象コード>', example: 'PRのdiff、または対象ファイルの抜粋' }
    ],
    rationale: [
      'レビューでは指摘の重要度が混ざりやすいので、Critical、Major、Minorに分けます。',
      '背景と期待挙動を渡すことで、単なるスタイル指摘ではなく仕様に対するリスクを見つけやすくします。',
      '良い点も出すことで、レビューコメントとして使えるトーンに整えます。'
    ],
    variations: [
      'セキュリティレビューでは、入力検証、認可、ログ漏えい、SQL/コマンド注入を重点化する。',
      'フロントエンドでは、アクセシビリティ、レスポンシブ、状態管理を追加する。',
      'SQLレビューでは、インデックス、ロック、N+1、実行計画を確認する。',
      'レビューに慣れていない人へ渡す場合は、指摘理由と学習ポイントを丁寧に説明させる。'
    ],
    cautions: [
      '差分だけでは仕様が分からないため、背景と期待挙動を添える。',
      'AIの指摘は誤検知もあるので、再現性と根拠を確認する。',
      '機密情報、トークン、顧客データをそのまま貼らない。'
    ]
  },
  {
    id: 'bug-investigation',
    title: 'バグ調査',
    scene: 'ログ、エラー、再現手順、最近の変更から、原因候補と切り分け手順を整理したいとき。',
    icon: AlertTriangle,
    tags: ['障害調査', 'ログ解析', '切り分け', '原因候補'],
    prompt: `あなたは障害調査に強いSRE兼アプリケーションエンジニアです。
以下の情報をもとに、原因候補と切り分け手順を整理してください。

# 入力
- 事象: <事象>
- 発生日時・頻度: <発生日時・頻度>
- 影響範囲: <影響範囲>
- 再現手順: <再現手順>
- エラーメッセージ: <エラーメッセージ>
- ログ:
<ログ>
- 最近の変更: <最近の変更>
- 環境: <環境>

${commonRules}
- ログ中の機密情報は扱わない前提で、必要ならマスクを促す

# 出力形式
1. 事実として分かること
2. 原因候補（可能性が高い順）
3. 各候補の根拠
4. 切り分け手順
5. 追加で必要なログ・メトリクス
6. 暫定回避策
7. 恒久対応案
8. 再発防止策
9. 確認事項`,
    placeholders: [
      { token: '<事象>', example: 'ログイン時に一部ユーザーだけ500エラーになる' },
      { token: '<ログ>', example: '該当時刻のアプリログ、DBログ、相関IDつきログ' },
      { token: '<最近の変更>', example: '認証ライブラリ更新、DBマイグレーション' },
      { token: '<環境>', example: 'production、特定リージョン、Chrome最新版' }
    ],
    rationale: [
      '障害調査では断定が危険なので、事実、仮説、根拠、次の確認を分離します。',
      '切り分け手順を出させることで、調査の順番をチームで共有しやすくなります。',
      '暫定回避策と恒久対応を分けると、緊急対応と再発防止を混同しにくくなります。'
    ],
    variations: [
      '緊急障害では「まず10分で見ること」と「利用者影響の抑制」を先に出す。',
      '再現しないバグでは、環境差分、入力差分、時刻依存、並行実行を重点化する。',
      '性能問題では、DB、外部API、キャッシュ、キュー、フロント描画を追加する。',
      '問い合わせ対応では、顧客向け説明文も同時に作らせる。'
    ],
    cautions: [
      'ログの一部だけだと原因を断定しやすいので、期間と相関IDを添える。',
      '「最近の変更なし」は思い込みになりやすい。設定、データ、依存先も確認する。',
      '暫定回避策と恒久対応を混ぜない。'
    ]
  },
  {
    id: 'test-cases',
    title: 'テストケース生成',
    scene: '仕様、コード、画面項目から、正常系、異常系、境界値、回帰観点を網羅したいとき。',
    icon: TestTube2,
    tags: ['テスト設計', '境界値', '異常系', '回帰テスト'],
    prompt: `あなたはテスト設計に強いQAエンジニアです。
以下の仕様をもとに、実行可能なテストケースを作成してください。

# 入力
- 対象機能: <対象機能>
- 仕様: <仕様>
- 画面項目・API項目: <画面項目・API項目>
- 制約: <制約>
- 既存テスト: <既存テスト>

${commonRules}
- 正常系、異常系、境界値、権限、セキュリティ、性能、回帰観点を含める

# 出力形式
| No | 観点 | 前提条件 | 入力 | 手順 | 期待結果 | 優先度 |
|---|---|---|---|---|---|---|

最後に以下も出してください。
1. テストデータ案
2. 自動化しやすいケース
3. 手動確認が必要なケース
4. 仕様確認が必要な点`,
    placeholders: [
      { token: '<対象機能>', example: 'パスワード再設定' },
      { token: '<仕様>', example: 'メールリンクは30分有効、3回失敗でロック' },
      { token: '<画面項目・API項目>', example: 'メールアドレス、トークン、新パスワード' },
      { token: '<既存テスト>', example: '正常系のみUnit Testあり' }
    ],
    rationale: [
      'テストケースは表形式にすると、そのままチケットやスプレッドシートへ移しやすくなります。',
      '正常系だけでなく異常系、境界値、権限を固定で入れることで抜けを減らします。',
      '自動化向きと手動向きを分けると、テスト実装の優先順位を決めやすくなります。'
    ],
    variations: [
      'APIテストでは、HTTPステータス、レスポンススキーマ、認証、冪等性を追加する。',
      '画面テストでは、空状態、ローディング、二重送信、ブラウザ差を追加する。',
      'バッチテストでは、再実行、途中失敗、排他、処理件数、リトライを追加する。',
      'Jest、Playwright、pytestなど指定フレームワークの雛形へ変換する。'
    ],
    cautions: [
      '期待結果が曖昧な仕様は、そのままテストケースにしない。',
      '境界値は業務ルール上の境界とシステム制約の境界を分ける。',
      'AIが作ったケースは重複しやすいので、最後に統合観点で見直す。'
    ]
  },
  {
    id: 'docs',
    title: 'ドキュメント作成',
    scene: 'README、設計書、運用手順、変更説明、リリースノートを読み手に合わせて整えたいとき。',
    icon: BookOpenCheck,
    tags: ['README', '設計書', '手順書', 'リリースノート'],
    prompt: `あなたは開発者向けドキュメントの編集者です。
以下の素材をもとに、読み手が手順を確認しやすいドキュメントを作成してください。

# 入力
- ドキュメント種別: <ドキュメント種別>
- 読み手: <読み手>
- 目的: <目的>
- 素材:
<素材>
- 制約: <制約>
- 期待するトーン: <期待するトーン>

${commonRules}
- 前提条件、手順、注意点、トラブルシュートを分ける

# 出力形式
1. タイトル
2. 概要
3. 対象読者
4. 前提条件
5. 手順
6. 設定値・入力値の説明
7. 注意点
8. トラブルシュート
9. FAQ
10. 確認事項`,
    placeholders: [
      { token: '<ドキュメント種別>', example: 'README、運用手順書、リリースノート' },
      { token: '<読み手>', example: '新しく参加した開発者、運用担当者' },
      { token: '<素材>', example: '既存メモ、コマンド、環境変数、注意点' },
      { token: '<期待するトーン>', example: '簡潔、社内向け、前提知識が少なくても読める粒度' }
    ],
    rationale: [
      'ドキュメントは読み手で粒度が変わるため、読み手と目的を最初に指定します。',
      '前提条件、手順、注意点を分けることで、作業者が途中で迷いにくくなります。',
      '確認事項を残すことで、素材にない仕様をAIが自然に補完するリスクを下げます。'
    ],
    variations: [
      'READMEでは、セットアップ、起動、テスト、環境変数、よくある失敗を重視する。',
      '運用手順書では、実施条件、戻し手順、確認コマンド、連絡先を追加する。',
      '設計書では、背景、採用理由、代替案、非機能、未決事項を追加する。',
      'リリースノートでは、利用者影響、移行手順、既知の制約を追加する。'
    ],
    cautions: [
      '素材にない仕様を補完しがちなので、確認事項を必ず残す。',
      '社内固有名詞や機密URLは公開用ドキュメントに混ぜない。',
      '読み手を指定しないと、説明の粒度がぶれやすい。'
    ]
  },
  {
    id: 'document-editing',
    title: '文書添削',
    scene: '説明文、依頼文、報告文を、意味を変えずに読みやすく、誤解されにくい文章へ直したいとき。',
    icon: FilePenLine,
    tags: ['添削', '説明文', '社内文書', '言い換え'],
    prompt: `あなたはSE組織の文書レビュー担当です。
以下の文章を、意味を変えずに読みやすく添削してください。

# 入力
- 読み手: <読み手>
- 目的: <目的>
- トーン: <トーン>
- 元の文章:
<元の文章>

${commonRules}
- 事実を追加しない
- 曖昧な表現、長すぎる文、責任範囲が不明な文を直す

# 出力形式
1. 添削後の文章
2. 変更理由
3. 誤解されやすい表現
4. 送信前に確認すべき点`,
    placeholders: [
      { token: '<読み手>', example: '上司、顧客、開発チーム、運用担当' },
      { token: '<目的>', example: '状況共有、依頼、謝罪、合意形成' },
      { token: '<トーン>', example: '丁寧、簡潔、社外向け、やわらかめ' },
      { token: '<元の文章>', example: '添削したい文章をそのまま貼る' }
    ],
    rationale: [
      '文書添削では事実を増やすより、読み手に合わせて誤解を減らすことが重要です。',
      '変更理由を出させると、どこをなぜ直したか確認しやすくなります。',
      '送信前確認を入れることで、数値、期限、責任範囲の見落としを防ぎます。'
    ],
    variations: [
      '社外向けに、丁寧だが回りくどくない文章へ直す。',
      '上司向けに、結論、理由、依頼事項の順に並べる。',
      '障害報告向けに、事実、影響、対応、次アクションを分ける。',
      '文章を半分の長さに要約し、重要事項だけ残す。'
    ],
    cautions: [
      '相手の感情や意図を決めつける表現は避ける。',
      '謝罪や責任表現は社内ルールに合わせる。',
      '数値、期限、固有名詞は人が確認する。'
    ]
  },
  {
    id: 'meeting-minutes',
    title: '議事録整理',
    scene: '会議メモから、決定事項、未決事項、TODO、担当者、期限を整理したいとき。',
    icon: MessageSquareText,
    tags: ['議事録', 'TODO', '決定事項', '会議メモ'],
    prompt: `あなたはプロジェクト会議の議事録作成に慣れたPMOです。
以下の会議メモを、共有しやすい議事録に整理してください。

# 入力
- 会議名: <会議名>
- 日時: <日時>
- 参加者: <参加者>
- 会議メモ:
<会議メモ>

${commonRules}
- 決まっていないことを決定事項にしない
- 担当者や期限が不明なTODOは「未確認」と書く

# 出力形式
1. 要約
2. 決定事項
3. 未決事項
4. TODO（担当者 / 期限 / 内容）
5. リスク・懸念
6. 次回確認事項`,
    placeholders: [
      { token: '<会議名>', example: '決済機能リリース判定会' },
      { token: '<参加者>', example: 'PM、開発、QA、運用、顧客担当' },
      { token: '<会議メモ>', example: '箇条書き、発言メモ、文字起こしの抜粋' },
      { token: '<日時>', example: '2026-05-31 10:00-10:30' }
    ],
    rationale: [
      '議事録は決定事項と未決事項が混ざると混乱するため、最初から分離します。',
      'TODOに担当者と期限を含めると、会議後のアクションにつながりやすくなります。',
      'メモにない決定を作らない制約を入れることで、AIの補完を抑えます。'
    ],
    variations: [
      '顧客共有向けに、社内事情や未確定の内部メモを除外する。',
      'Slack投稿向けに、短い要約とTODOだけにする。',
      '定例会向けに、前回TODOの状況欄を追加する。',
      '意思決定ログとして、決定理由と代替案を追加する。'
    ],
    cautions: [
      '録音やメモにない決定を作らせない。',
      '担当者が曖昧な場合は、勝手に名前を割り当てない。',
      '社外共有前に、未公開情報や個人名の扱いを確認する。'
    ]
  },
  {
    id: 'email',
    title: 'メール・チャット文作成',
    scene: '依頼、催促、共有、謝罪、日程調整などの文章を、短く丁寧に作りたいとき。',
    icon: MailCheck,
    tags: ['メール', 'チャット', '依頼文', '調整'],
    prompt: `あなたはビジネスコミュニケーションに強いSEです。
以下の内容を、相手に伝わりやすいメールまたはチャット文にしてください。

# 入力
- 宛先: <宛先>
- 目的: <目的>
- 伝えたい内容: <伝えたい内容>
- 依頼事項: <依頼事項>
- 期限: <期限>
- トーン: <トーン>

${commonRules}
- 相手に求めるアクションを明確にする
- 必要以上に長くしない

# 出力形式
1. 件名
2. 本文
3. 相手に確認してほしいこと
4. さらに短い版`,
    placeholders: [
      { token: '<宛先>', example: '顧客担当者、社内レビュー担当、上司' },
      { token: '<目的>', example: '確認依頼、催促、日程調整、状況共有' },
      { token: '<依頼事項>', example: '仕様確認、レビュー、承認、資料送付' },
      { token: '<期限>', example: '6/3 15:00まで、今週金曜中' }
    ],
    rationale: [
      'メールやチャットは、目的と依頼事項が埋もれると返信が遅れます。',
      '件名と短い版を同時に作ることで、メールにもチャットにも転用しやすくなります。',
      '期限を明示すると、相手が判断しやすくなります。'
    ],
    variations: [
      '催促文では、責める表現を避けて期限と背景を明確にする。',
      '謝罪文では、事実、影響、対応、再発防止を簡潔に分ける。',
      '日程調整では、候補日と必要時間を表形式にする。',
      '上長報告では、結論、影響、相談事項を先に出す。'
    ],
    cautions: [
      '感情を決めつける表現を避ける。',
      '謝罪や責任範囲は組織の方針に合わせる。',
      '期限や依頼先をAI任せで補完しない。'
    ]
  },
  {
    id: 'status-report',
    title: '報告書・進捗共有',
    scene: '作業状況、障害対応、リリース準備、課題状況を、上司や関係者へ分かりやすく報告したいとき。',
    icon: FileCheck2,
    tags: ['報告書', '進捗', '課題管理', 'ステータス'],
    prompt: `あなたはプロジェクト状況を簡潔に伝えるシニアSEです。
以下の情報をもとに、関係者向けの報告文を作成してください。

# 入力
- 報告対象: <報告対象>
- 読み手: <読み手>
- 現在の状況: <現在の状況>
- 完了したこと: <完了したこと>
- 未完了・課題: <未完了・課題>
- リスク: <リスク>
- 次のアクション: <次のアクション>

${commonRules}
- 結論を先に書く
- リスクと相談事項を分ける

# 出力形式
1. 一言結論
2. 現在状況
3. 完了事項
4. 課題・リスク
5. 次アクション
6. 相談・判断してほしいこと`,
    placeholders: [
      { token: '<報告対象>', example: 'リリース準備状況、障害対応、テスト進捗' },
      { token: '<読み手>', example: '上司、PM、顧客、関係チーム' },
      { token: '<リスク>', example: 'QA環境の不安定、外部API仕様未確定' },
      { token: '<次のアクション>', example: '追加調査、レビュー依頼、リリース判定' }
    ],
    rationale: [
      '報告は読み手が判断するための情報なので、結論、リスク、相談事項を先にまとめます。',
      '完了事項と未完了を分けることで、進捗の見え方がぶれにくくなります。',
      '次アクションを入れると、報告で終わらず意思決定につながります。'
    ],
    variations: [
      '週次報告向けに、先週、今週、課題、支援依頼の形式にする。',
      '障害報告向けに、影響、原因、対応、再発防止を追加する。',
      'リリース判定向けに、残課題、リスク、Go/No-Go判断材料を追加する。',
      '経営層向けに、技術詳細を減らし、影響と判断事項を中心にする。'
    ],
    cautions: [
      '都合の悪い未完了事項を省略しない。',
      'リスクと発生済み問題を分ける。',
      '判断が必要な事項は曖昧にせず明記する。'
    ]
  },
  {
    id: 'improvement-proposal',
    title: '改善案づくり',
    scene: '開発プロセス、運用、問い合わせ対応、レビュー、テストの改善案を整理したいとき。',
    icon: Lightbulb,
    tags: ['改善案', '業務改善', '運用改善', '振り返り'],
    prompt: `あなたは開発組織の改善提案に強いシニアエンジニアです。
以下の課題について、実行しやすい改善案を作成してください。

# 入力
- 改善したい対象: <改善したい対象>
- 現状の課題: <現状の課題>
- 発生している影響: <発生している影響>
- 制約: <制約>
- 使えるリソース: <使えるリソース>

${commonRules}
- 大掛かりな理想論だけでなく、すぐ試せる案を含める
- 効果、コスト、リスクを分ける

# 出力形式
1. 課題の整理
2. 原因仮説
3. 改善案（短期 / 中期）
4. 期待効果
5. 実施コスト
6. リスク
7. 最初の一手
8. 効果測定方法`,
    placeholders: [
      { token: '<改善したい対象>', example: 'コードレビュー、問い合わせ対応、リリース作業' },
      { token: '<現状の課題>', example: 'レビュー待ちが長く、リリース直前に修正が集中する' },
      { token: '<使えるリソース>', example: '週1時間の改善枠、既存CI、チームWiki' },
      { token: '<制約>', example: '新規ツール導入は来期まで不可' }
    ],
    rationale: [
      '改善案は理想論になりやすいため、短期と中期に分けます。',
      '効果測定を入れることで、やりっぱなしの改善を避けられます。',
      '最初の一手を出すことで、会議後にすぐ動きやすくなります。'
    ],
    variations: [
      'レビュー改善では、観点表、テンプレート、レビュー時間の改善を含める。',
      '問い合わせ削減では、FAQ、ログ改善、自己解決導線を含める。',
      'テスト改善では、自動化候補、 flaky test、回帰範囲を含める。',
      '運用改善では、監視、アラート、手順書、権限管理を含める。'
    ],
    cautions: [
      '原因を一つに決めつけない。',
      '現場の制約や担当者の負荷を無視しない。',
      '効果が測れない案は優先度を下げる。'
    ]
  },
  {
    id: 'task-breakdown',
    title: 'タスク分解',
    scene: '要件や設計から、実装、レビュー、テスト、リリースまでの作業をチケット化したいとき。',
    icon: GitPullRequest,
    tags: ['タスク分解', 'チケット', '実装計画', '見積もり'],
    prompt: `あなたは実装計画に強いテックリードです。
以下の要件を、開発チームが実行しやすいタスクに分解してください。

# 入力
- 対象機能: <対象機能>
- 要件・設計メモ: <要件・設計メモ>
- 技術スタック: <技術スタック>
- チーム体制: <チーム体制>
- 制約: <制約>

${commonRules}
- 実装、テスト、レビュー、リリース準備を含める
- 依存関係と並行できる作業を分ける

# 出力形式
1. 作業全体の流れ
2. タスク一覧（タイトル / 内容 / 完了条件 / 依存関係）
3. 並行作業できるもの
4. リスクが高い作業
5. レビュー観点
6. テスト観点`,
    placeholders: [
      { token: '<対象機能>', example: '通知設定画面の追加' },
      { token: '<要件・設計メモ>', example: '通知種別ごとにON/OFF、初期値は既存設定から移行' },
      { token: '<チーム体制>', example: 'フロント1名、バックエンド1名、QA1名' },
      { token: '<制約>', example: '2週間以内、既存APIは破壊的変更なし' }
    ],
    rationale: [
      'タスク分解では完了条件が曖昧だと手戻りが増えるため、各タスクに完了条件を付けます。',
      '依存関係を出すことで、作業順と並行作業を決めやすくなります。',
      'レビューとテストをタスクに含めることで、実装だけで計画が終わるのを防ぎます。'
    ],
    variations: [
      'Jira向けに、チケットタイトル、説明、受け入れ条件へ整形する。',
      'GitHub Issues向けに、Markdownチェックリストへ変換する。',
      '見積もり向けに、S/M/Lまたは人日レンジを付ける。',
      '新人アサイン向けに、難易度と事前に読む資料を追加する。'
    ],
    cautions: [
      '見積もりは入力情報の粒度に強く依存する。',
      '調査タスクと実装タスクを混ぜない。',
      'レビュー、テスト、リリース作業を漏らさない。'
    ]
  },
  {
    id: 'chatops',
    title: 'ChatOps / 自動化',
    scene: 'SlackやTeams、CI、監視、チケット運用で使う定型応答や自動化フローを設計したいとき。',
    icon: Bot,
    tags: ['ChatOps', '自動化', 'CI', '監視', '運用'],
    prompt: `あなたはChatOpsと業務自動化に強いプラットフォームエンジニアです。
以下の業務を、チャットから安全に実行できる自動化フローとして設計してください。

# 入力
- 自動化したい業務: <自動化したい業務>
- 利用チャネル: <利用チャネル>
- 実行者: <実行者>
- 実行対象: <実行対象>
- 既存ツール・API: <既存ツール・API>
- 成功条件: <成功条件>
- 制約: <制約>

${commonRules}
- 認可、監査ログ、確認ステップ、ロールバック、誤操作防止を含める

# 出力形式
1. 自動化の目的
2. 対象範囲
3. コマンド例
4. 入力パラメータ
5. 実行フロー
6. 権限・承認
7. 監査ログ
8. エラー時の応答
9. ロールバック
10. 実装前の確認事項`,
    placeholders: [
      { token: '<自動化したい業務>', example: 'ステージング環境へのデプロイ' },
      { token: '<利用チャネル>', example: 'Slack #deploy チャンネル' },
      { token: '<既存ツール・API>', example: 'GitHub Actions、PagerDuty、Jira' },
      { token: '<成功条件>', example: 'デプロイ完了、ヘルスチェック成功、通知送信' }
    ],
    rationale: [
      'ChatOpsは便利な反面、誤操作の影響が大きいため、承認と監査ログを先に設計します。',
      'コマンド例と入力パラメータを出すと、実装者と利用者の認識を合わせやすくなります。',
      'エラー時の応答を決めておくことで、失敗時に利用者が次に何をすべきか分かります。'
    ],
    variations: [
      'デプロイ系では、承認、対象環境、変更ID、ロールバック確認を必須にする。',
      '障害対応では、影響範囲、エスカレーション、ステータス更新文を含める。',
      'チケット作成では、テンプレート、優先度、担当候補、重複確認を含める。',
      '定期実行では、スケジュール、失敗通知、再実行条件を追加する。'
    ],
    cautions: [
      '削除、停止、デプロイなど影響が大きい操作は確認ステップを入れる。',
      'チャット本文に秘密情報を出さない設計にする。',
      'AIに実行権限を渡す場合は、人の承認境界を明確にする。'
    ]
  },
  {
    id: 'learning-research',
    title: '学習・調査',
    scene: '新しい技術、ライブラリ、障害原因、設計パターンを公式情報ベースで短時間に理解したいとき。',
    icon: FileSearch,
    tags: ['技術調査', '学習', '公式情報', '比較'],
    prompt: `あなたは技術調査に強いシニアエンジニアです。
以下のテーマについて、公式情報と信頼できる情報を優先して調査結果を整理してください。

# 入力
- 調査テーマ: <調査テーマ>
- 知りたい理由: <知りたい理由>
- 前提知識: <前提知識>
- 比較対象: <比較対象>
- 制約: <制約>

${commonRules}
- 公式ドキュメント、GitHub、信頼できる記事を優先する
- 古い情報の可能性がある場合は更新日を確認する

# 出力形式
1. 結論
2. 重要ポイント
3. 公式情報から分かること
4. 実務での使いどころ
5. 採用時の注意点
6. 比較表
7. 試すべき最小サンプル
8. 参考リンク
9. 未確認事項`,
    placeholders: [
      { token: '<調査テーマ>', example: 'Playwrightのtrace viewer活用方法' },
      { token: '<知りたい理由>', example: 'E2Eテスト失敗時の原因調査を速くしたい' },
      { token: '<比較対象>', example: 'Cypress、Selenium、既存の手動確認' },
      { token: '<制約>', example: 'CIはGitHub Actions、社内ネットワーク制限あり' }
    ],
    rationale: [
      '技術調査は古い情報やブログ断片に引っ張られやすいため、公式情報を優先するよう明示します。',
      '採用時の注意点と最小サンプルを入れることで、読むだけでなく試すところまで進めやすくなります。',
      '未確認事項を残すことで、AIが最新仕様を知っている前提で断定するリスクを下げます。'
    ],
    variations: [
      'ライブラリ選定では、保守状況、ライセンス、更新頻度、移行コストを追加する。',
      '設計パターン調査では、向いているケース、避けるケース、代替案を比較する。',
      '障害調査では、既知issue、リリースノート、Breaking Changesを重点化する。',
      '学習用では、30分、半日、1週間の学習ロードマップに変換する。'
    ],
    cautions: [
      'AIの知識は古いことがあるため、最新仕様は公式で確認する。',
      'ブログ記事だけで採用判断しない。',
      '比較表は前提条件が違うと結論が変わる。'
    ]
  }
];

const principles = [
  {
    title: '役割を指定する',
    detail:
      '役割指定は、AIにどの観点で読み、どの粒度で答え、何を優先するかを伝える前提です。単独で使うより、目的、入力、制約、出力形式と組み合わせると安定します。'
  },
  {
    title: '目的・入力・制約・出力形式を分ける',
    detail:
      '情報を見出しで分けると、AIが何を材料にして、どの条件で、どんな形で返すべきかを見失いにくくなります。'
  },
  {
    title: '読み手と成功条件を具体化する',
    detail:
      '同じ内容でも、上司向け、顧客向け、開発者向けで粒度が変わります。誰が何を判断できれば成功かを指定します。'
  },
  {
    title: '根拠と推測を分ける',
    detail:
      '資料、ログ、コード、公式情報など根拠にしたいものを明示し、資料外の推測は推測として分けさせます。'
  },
  {
    title: '不足情報は質問させる',
    detail:
      '不明点をAIが自然に補完すると事故につながります。不足情報は確認事項として出させます。'
  },
  {
    title: '期待する形を先に指定する',
    detail:
      '表、JSON、箇条書き、メール文など、出力形式を先に決めると、そのまま業務に貼り付けやすくなります。'
  },
  {
    title: '例で粒度とトーンを固定する',
    detail:
      '良い出力例やNG例を入れると、抽象的な依頼よりも粒度、文体、判断基準が安定します。'
  },
  {
    title: '重要業務は評価とレビューを入れる',
    detail:
      'プロンプト変更やモデル変更の後は、代表ケースで結果を見比べ、人がレビューする前提にします。'
  }
];

const sources = [
  { label: 'OpenAI Prompt engineering', href: 'https://platform.openai.com/docs/guides/prompt-engineering' },
  { label: 'OpenAI Help: Prompt engineering best practices', href: 'https://help.openai.com/en/articles/10032626-prompt-engineering-best-practices' },
  { label: 'Google Gemini: プロンプト設計戦略', href: 'https://ai.google.dev/gemini-api/docs/prompting-strategies?hl=ja' },
  { label: 'Anthropic: Prompt engineering overview', href: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview' },
  { label: 'Microsoft 365 Copilot: Write a great prompt', href: 'https://support.microsoft.com/en-us/microsoft-365-copilot/write-a-great-prompt-in-microsoft-365-copilot' }
];

export default function PromptPatternSwitcher() {
  const [activeId, setActiveId] = useState(patterns[0].id);
  const [query, setQuery] = useState('');
  const [copyLabel, setCopyLabel] = useState('Copy');
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const filteredPatterns = patterns.filter((pattern) => {
    if (!deferredQuery) return true;
    const haystack = [pattern.title, pattern.scene, ...pattern.tags, ...pattern.variations, ...pattern.cautions].join(' ').toLowerCase();
    return haystack.includes(deferredQuery);
  });
  const active = patterns.find((pattern) => pattern.id === activeId) ?? filteredPatterns[0] ?? patterns[0];
  const Icon = active.icon;

  useEffect(() => {
    if (!filteredPatterns.length) return;
    if (!filteredPatterns.some((pattern) => pattern.id === activeId)) {
      startTransition(() => setActiveId(filteredPatterns[0].id));
    }
  }, [activeId, filteredPatterns]);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(active.prompt);
      setCopyLabel('Copied');
      window.setTimeout(() => setCopyLabel('Copy'), 1200);
    } catch {
      setCopyLabel('Copy failed');
      window.setTimeout(() => setCopyLabel('Copy'), 1200);
    }
  }

  return (
    <section className="min-h-[calc(100dvh-12rem)] space-y-3">
      <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-md border border-border bg-card p-2 shadow-sm">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="用途を検索"
              className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="mt-2 grid grid-cols-2 gap-1.5 lg:grid-cols-1">
            {filteredPatterns.map((pattern) => {
              const PatternIcon = pattern.icon;
              const selected = active.id === pattern.id;

              return (
                <button
                  key={pattern.id}
                  type="button"
                  onClick={() => {
                    startTransition(() => setActiveId(pattern.id));
                    setCopyLabel('Copy');
                  }}
                  className={[
                    'flex min-h-12 items-start gap-2 rounded-md border px-2.5 py-2 text-left transition-colors',
                    selected
                      ? 'border-primary/40 bg-secondary text-secondary-foreground'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                  ].join(' ')}
                >
                  <PatternIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold leading-4 text-foreground">{pattern.title}</span>
                    <span className="mt-0.5 block truncate text-[11px] leading-4 text-muted-foreground">{pattern.tags.slice(0, 2).join(' / ')}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {!filteredPatterns.length && (
            <p className="mt-3 rounded-md border border-border bg-muted p-3 text-sm leading-6 text-muted-foreground">
              該当する用途がありません。別のキーワードで検索してください。
            </p>
          )}
        </aside>

        <div className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
          <header className="border-b border-border p-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-secondary text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground">用途別プロンプト</p>
                <h2 className="text-xl font-semibold tracking-tight">{active.title}</h2>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{active.scene}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {active.tags.map((tag) => (
                <span key={tag} className="rounded-md border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <div className="grid gap-3 p-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
            <figure className="console-block console-block-prompt mt-0">
              <figcaption className="console-header">
                <span className="console-title">編集して使えるプロンプト</span>
                <button type="button" className="console-copy ml-auto inline-flex items-center gap-1" onClick={() => void copyPrompt()}>
                  <Copy className="h-3 w-3" />
                  {copyLabel}
                </button>
              </figcaption>
              <pre className="m-0 max-h-[760px] overflow-auto rounded-b-md bg-card p-4 text-sm leading-6 text-foreground">
                <code className="whitespace-pre-wrap">{active.prompt}</code>
              </pre>
            </figure>

            <div className="grid content-start gap-2">
              <details className="group rounded-md border border-border bg-card shadow-sm" open>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-sm font-semibold text-foreground">
                  なぜこのプロンプトなのか
                  <span className="text-xs text-muted-foreground group-open:rotate-180">⌄</span>
                </summary>
                <ul className="border-t border-border px-3 py-2 text-sm leading-6 text-muted-foreground">
                  {active.rationale.map((item) => (
                    <li key={item} className="flex gap-2 py-1">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </details>

              <details className="group rounded-md border border-border bg-card shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-sm font-semibold text-foreground">
                  角括弧の入力例
                  <span className="text-xs text-muted-foreground group-open:rotate-180">⌄</span>
                </summary>
                <dl className="grid gap-2 border-t border-border p-3 text-sm">
                  {active.placeholders.map((placeholder) => (
                    <div key={placeholder.token} className="rounded-md border border-border bg-background p-2">
                      <dt className="font-mono text-xs text-primary">{placeholder.token}</dt>
                      <dd className="mt-1 leading-6 text-muted-foreground">{placeholder.example}</dd>
                    </div>
                  ))}
                </dl>
              </details>

              <details className="group rounded-md border border-border bg-card shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-sm font-semibold text-foreground">
                  応用例
                  <span className="text-xs text-muted-foreground group-open:rotate-180">⌄</span>
                </summary>
                <ul className="border-t border-border px-3 py-2 text-sm leading-6 text-muted-foreground">
                  {active.variations.map((variation) => (
                    <li key={variation} className="flex gap-2 py-1">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{variation}</span>
                    </li>
                  ))}
                </ul>
              </details>

              <details className="group rounded-md border border-border bg-card shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-sm font-semibold text-foreground">
                  注意点
                  <span className="text-xs text-muted-foreground group-open:rotate-180">⌄</span>
                </summary>
                <ul className="border-t border-border px-3 py-2 text-sm leading-6 text-muted-foreground">
                  {active.cautions.map((caution) => (
                    <li key={caution} className="flex gap-2 py-1">
                      <span className="mt-1.5 shrink-0 text-primary">!</span>
                      <span>{caution}</span>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-md border border-border bg-card p-4 shadow-sm">
        <div className="max-w-3xl">
          <p className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground">公式情報をもとに整理</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">公式情報をもとにした考え方</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            公式ガイドで共通している考え方を、開発、調査、レビュー、文書作成で使う形にまとめています。
          </p>
        </div>

        <div className="mt-3 grid gap-2">
          {principles.map((principle, index) => (
            <details key={principle.title} className="group rounded-md border border-border bg-background text-sm shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-foreground">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <span className="font-medium">{principle.title}</span>
                </span>
                <span className="text-xs text-muted-foreground group-open:rotate-180">⌄</span>
              </summary>
              <p className="border-t border-border px-3 py-2.5 leading-6 text-muted-foreground">{principle.detail}</p>
            </details>
          ))}
        </div>

        <div className="mt-4 border-t border-border pt-3">
          <h3 className="text-sm font-semibold text-foreground">参考元</h3>
          <div className="mt-2 grid gap-2 text-sm md:grid-cols-2">
            {sources.map((source) => (
              <a
                key={source.href}
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-border bg-background px-3 py-2 text-foreground no-underline transition-colors hover:bg-muted"
              >
                {source.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
