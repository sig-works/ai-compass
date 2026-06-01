export interface GlossaryTerm {
  term: string;
  category: string;
  plainSummary: string;
  meaning: string;
  usageInAi: string;
  workflow: string[];
  example: string;
  misconception: string;
  relatedTerms: string[];
  sourceNames: string[];
  aliases?: string[];
}

export interface GlossarySection {
  id: string;
  title: string;
  description: string;
  terms: GlossaryTerm[];
}

export const GLOSSARY_SECTIONS: GlossarySection[] = [
  {
    id: 'core',
    title: '基本',
    description: 'AIの全体像をつかむ言葉。',
    terms: [
      {
        term: '生成AI',
        category: '基本',
        plainSummary: '文章、画像、音声などを新しく作るAI。',
        meaning: '人が書いたお願いに合わせて、文章、画像、音声、案、コードなどを作るAIです。答えを探すだけでなく、新しい形にして返すところが特徴です。',
        usageInAi: 'チャットの返答、文章の下書き、画像作成、要約、企画案づくりなどで使われます。人の作業を丸ごと置き換えるより、最初の案を出す、整える、比べる用途で力を発揮します。',
        workflow: ['お願いを受け取る', '過去に学んだ言葉や形を参考にする', '条件に合う出力を作る'],
        example: 'レポートの構成案を作る、商品説明文を短くする、会議メモから要点をまとめる。',
        misconception: '生成AIは何でも正しい答えを知っているわけではありません。知らないことを自然な文章で言ってしまうことがあります。',
        relatedTerms: ['AIモデル', 'プロンプト', '幻覚'],
        sourceNames: ['OpenAI', 'Google AI', 'Microsoft Learn'],
        aliases: ['Generative AI']
      },
      {
        term: 'AIモデル',
        category: '基本',
        plainSummary: 'AIの頭脳のようなもの。',
        meaning: '入力を受け取り、答えを作る中心部分です。文章が得意なもの、画像が得意なもの、音声も扱えるものなど、目的に合わせて種類があります。',
        usageInAi: 'アプリやチャットサービスは、裏側でAIモデルを呼び出して返答を作ります。どのモデルを使うかで、得意な作業、速さ、費用、扱える情報の種類が変わります。',
        workflow: ['質問や資料を受け取る', '中身を読み取る', '答えや判断を返す'],
        example: '文章レビューには言語が得意なモデル、画像確認には画像も読めるモデルを選ぶ。',
        misconception: '大きいモデルがいつも最適とは限りません。短い分類や単純な整形なら、小さく速いモデルで十分なことがあります。',
        relatedTerms: ['LLM', 'モデルのパラメータ数', 'マルチモーダル'],
        sourceNames: ['OpenAI', 'Google AI', 'Meta AI'],
        aliases: ['モデル', 'Model']
      },
      {
        term: 'LLM',
        category: '基本',
        plainSummary: '大量の文章から言葉の使い方を学んだAI。',
        meaning: '文章を読んだり書いたりするのが得意なAIです。質問への回答、要約、翻訳、文章作成、コードの下書きなどに使われます。',
        usageInAi: 'チャットAI、文章作成支援、社内検索、問い合わせ対応などの中心として使われます。言葉で説明できる作業と相性が良いです。',
        workflow: ['入力文を読む', '言葉の流れを予測する', '自然な返答を少しずつ作る'],
        example: '長い議事録を要約し、決定事項と宿題だけを抜き出す。',
        misconception: '人のように経験して理解しているわけではありません。言葉のつながりをもとに答えを作ります。',
        relatedTerms: ['AIモデル', 'トークン', 'コンテキスト'],
        sourceNames: ['OpenAI', 'Google AI', 'Meta AI', 'Stanford HAI'],
        aliases: ['大規模言語モデル', 'Large Language Model']
      },
      {
        term: 'トークン',
        category: '基本',
        plainSummary: 'AIが文章を細かく分けた文字のかたまり。',
        meaning: 'AIは文章をそのまま一文字ずつ読むのではなく、短いかたまりに分けて扱います。このかたまりがトークンです。日本語では一文字、言葉の一部、記号などが混ざります。',
        usageInAi: '入力できる長さ、返答の長さ、料金、処理時間の目安になります。長い資料を扱うときは、トークン数を意識すると設計しやすくなります。',
        workflow: ['入力文を分ける', '上限や料金の目安になる', '返答も小さな単位で作られる'],
        example: '長いPDFを一度に渡せない場合、文章を短い範囲に分けてAIに読ませる。',
        misconception: '必ず一文字や一単語ではありません。言語や文章によって分かれ方が変わります。',
        relatedTerms: ['LLM', 'コンテキスト', '推論'],
        sourceNames: ['OpenAI', 'Google AI', 'Microsoft Learn'],
        aliases: ['Token']
      },
      {
        term: 'コンテキスト',
        category: '基本',
        plainSummary: 'AIが今見ている会話や資料の範囲。',
        meaning: 'AIが返答を作るときに参考にできる情報のまとまりです。今の質問、前の会話、貼り付けた文章、検索で見つけた資料などが含まれます。',
        usageInAi: 'AIに何を見せて答えさせるかを決める設計で重要です。必要な情報が入っていないと答えが浅くなり、余計な情報が多いと大事な点が埋もれます。',
        workflow: ['質問を入れる', '必要な資料を足す', 'AIが見える範囲の中で答える'],
        example: '契約書レビューでは、質問だけでなく該当条文とレビュー観点も一緒に渡す。',
        misconception: '一度チャットに書いたことをAIが永久に覚えているとは限りません。見られる範囲には上限があります。',
        relatedTerms: ['トークン', 'RAG', 'プロンプト'],
        sourceNames: ['OpenAI', 'Google AI', 'Microsoft Learn'],
        aliases: ['Context', '文脈']
      },
      {
        term: 'マルチモーダル',
        category: '基本',
        plainSummary: '文章だけでなく、画像や音声なども扱えること。',
        meaning: '文字、画像、音声、動画など、複数の種類の情報をまとめて扱えるAIの性質です。画像を見て説明したり、音声を聞いて文章にしたりできます。',
        usageInAi: '写真から状況を説明する、画面キャプチャを見て操作を案内する、音声を文字にして要約する、といった使い方に向きます。',
        workflow: ['画像や音声を受け取る', '内容を読み取る', '文章で説明や判断を返す'],
        example: 'ホワイトボードの写真を読み取り、議論の内容を箇条書きにする。',
        misconception: '画像を扱えるAIでも、すべてを正確に見分けられるわけではありません。細部の確認は人の目が必要です。',
        relatedTerms: ['AIモデル', 'LLM', '推論'],
        sourceNames: ['OpenAI', 'Google AI', 'Microsoft Learn'],
        aliases: ['Multimodal']
      }
    ]
  },
  {
    id: 'model-workflow',
    title: 'モデル運用',
    description: 'AIが答えを出すまでと性能に関わる言葉。',
    terms: [
      {
        term: '学習',
        category: 'モデル運用',
        plainSummary: 'AIにたくさんの例を見せて、答え方の土台を作ること。',
        meaning: '文章、画像、音声などの例を大量に使い、AIがパターンをつかめるようにする作業です。これによって、質問に対して自然な返答を作る力が育ちます。',
        usageInAi: '新しいAIモデルを作るときの土台になります。学習に使う例の質や量は、あとで出る答えの傾向に大きく影響します。',
        workflow: ['多くの例を集める', 'くり返し練習する', '答え方の土台ができる'],
        example: '文章をたくさん読ませて、質問に自然な文章で答えられるようにする。',
        misconception: '単にデータを丸暗記する作業ではありません。似た状況に対応できる形を作ります。',
        relatedTerms: ['AIモデル', '微調整', 'モデルのパラメータ数'],
        sourceNames: ['Google Machine Learning Education', 'Microsoft Learn', 'NVIDIA Developer'],
        aliases: ['Training']
      },
      {
        term: '推論',
        category: 'モデル運用',
        plainSummary: '学習済みのAIが、入力に対して答えを出すこと。',
        meaning: '人が質問を送ったあと、AIがその場で答えを作る処理です。チャットで返事が返ってくる瞬間に行われている中心的な作業です。',
        usageInAi: 'チャット、検索回答、文章分類、画像説明など、ユーザーがAIを使うたびに発生します。速さと費用に直結します。',
        workflow: ['質問を受け取る', '学んだ内容を使う', '答えを返す'],
        example: '問い合わせ文を受け取り、カテゴリを判定して返信案を作る。',
        misconception: '「論理的に考える」という意味だけではありません。AIが出力を作る処理全体を指します。',
        relatedTerms: ['AIモデル', 'トークン', 'レイテンシ'],
        sourceNames: ['NVIDIA Developer', 'Microsoft Learn', 'OpenAI'],
        aliases: ['Inference']
      },
      {
        term: '微調整',
        category: 'モデル運用',
        plainSummary: 'AIを特定の目的に合わせて追加で練習させること。',
        meaning: 'すでに作られたAIに、会社の文章の書き方や特定の作業例を追加で学ばせ、目的に合う答えを出しやすくします。',
        usageInAi: '決まった文体、分類ルール、定型作業の出力を安定させたいときに使います。最新情報を入れる目的なら、微調整より検索やRAGが向くことがあります。',
        workflow: ['元のAIを用意する', '目的に合う例を追加する', '答え方を目的に近づける'],
        example: '自社のサポート返信例を学ばせ、同じトーンで返信案を作らせる。',
        misconception: '微調整をすれば、最新情報をいつでも知っているAIになるわけではありません。',
        relatedTerms: ['学習', 'RAG', 'AIモデル'],
        sourceNames: ['OpenAI', 'Microsoft Learn', 'Google AI'],
        aliases: ['Fine-tuning', 'ファインチューニング']
      },
      {
        term: 'モデルのパラメータ数',
        category: 'モデル運用',
        plainSummary: 'AIの頭脳の中にある調整つまみの数。',
        meaning: 'AIが答えを作るときに使う、細かな調整値の数です。数が多いほど表現力が上がることがありますが、動かすための費用や時間も増えやすくなります。',
        usageInAi: 'モデル選びで、性能、速度、費用のバランスを見る材料になります。大規模な分析や複雑な文章生成では大きなモデルが有利なことがあります。',
        workflow: ['入力を受け取る', '多くの調整値を通る', '出力の傾向が決まる'],
        example: '軽い分類は小さなモデル、複雑な設計レビューは大きなモデルを試す。',
        misconception: '数が多ければどんな用途でも最良、というわけではありません。',
        relatedTerms: ['AIモデル', 'LLM', 'GPU / TPU'],
        sourceNames: ['Meta AI', 'Google AI', 'Stanford HAI'],
        aliases: ['Parameters', 'パラメータ']
      },
      {
        term: 'GPU / TPU',
        category: 'モデル運用',
        plainSummary: 'AIの計算を速く進めるための強力な計算装置。',
        meaning: 'AIは同時に大量の計算をします。GPUやTPUは、その計算をまとめて速く進めるために使われます。学習にも推論にも関わります。',
        usageInAi: '大きなモデルを学習する、たくさんの質問に同時に答える、画像や音声を高速に処理する場面で使われます。',
        workflow: ['大量の計算が発生する', '並行して処理する', '短い時間で結果を出す'],
        example: '画像生成サービスが、多数の画像リクエストを高速に処理する。',
        misconception: 'GPUやTPUがあれば必ず良いAIになるわけではありません。良いデータ、設計、評価も必要です。',
        relatedTerms: ['学習', '推論', 'モデルのパラメータ数'],
        sourceNames: ['NVIDIA Developer', 'Google Cloud', 'Google Machine Learning Education'],
        aliases: ['GPU', 'TPU']
      },
      {
        term: 'レイテンシ',
        category: 'モデル運用',
        plainSummary: 'お願いしてから返事が返るまでの待ち時間。',
        meaning: 'AIに質問を送ってから、最初の返事や全部の返事が戻るまでの時間です。チャット、検索、音声アプリでは体感の使いやすさに大きく関わります。',
        usageInAi: 'ユーザーが待てる画面か、裏側でまとめて処理する作業かで、必要なレイテンシは変わります。短くしたい場合はモデルや入力量を見直します。',
        workflow: ['送信する', 'AIが処理する', '返答が届く'],
        example: '音声アシスタントでは、返事が遅いと会話しづらくなる。',
        misconception: '高性能なAIほど必ず速いとは限りません。大きなモデルや長い入力は時間がかかることがあります。',
        relatedTerms: ['推論', 'トークン', 'GPU / TPU'],
        sourceNames: ['NVIDIA Developer', 'Microsoft Learn'],
        aliases: ['Latency']
      }
    ]
  },
  {
    id: 'prompting',
    title: '頼み方',
    description: 'AIへの指示と安全な使い方に関わる言葉。',
    terms: [
      {
        term: 'プロンプト',
        category: '頼み方',
        plainSummary: 'AIに渡すお願い文や指示。',
        meaning: 'AIにしてほしいこと、守ってほしい条件、参考にしてほしい情報、出してほしい形を書いたものです。短い質問も、長い依頼文もプロンプトです。',
        usageInAi: 'AIの出力はプロンプトに大きく左右されます。目的、材料、条件、出力形式を入れると、確認しやすい答えになりやすいです。',
        workflow: ['目的を書く', '条件や材料を足す', '出力形式を指定する'],
        example: '「この記事を300字で要約し、最後に注意点を3つ出して」と頼む。',
        misconception: '長ければ良いわけではありません。目的と条件がはっきりしていることが大切です。',
        relatedTerms: ['プロンプトエンジニアリング', 'コンテキスト', '幻覚'],
        sourceNames: ['OpenAI', 'Microsoft Learn', 'Google AI'],
        aliases: ['Prompt']
      },
      {
        term: 'プロンプトエンジニアリング',
        category: '頼み方',
        plainSummary: 'AIに伝わりやすい頼み方を設計すること。',
        meaning: 'AIが作業内容を取り違えにくいように、目的、前提、条件、例、出力形式を整える工夫です。特別な呪文ではなく、依頼を整理する技術です。',
        usageInAi: '同じAIでも、頼み方を整えると回答の品質が上がります。レビュー、調査、文章作成、分類などで再利用できる型を作ると便利です。',
        workflow: ['あいまいな依頼を分解する', '判断基準を足す', '欲しい形で出力させる'],
        example: 'レビュー依頼で「観点、重要度、修正案」を指定して、毎回同じ形式で返してもらう。',
        misconception: '決まった言い回しを覚えれば万能、というものではありません。仕事の目的を整理することが中心です。',
        relatedTerms: ['プロンプト', 'コンテキスト', '評価'],
        sourceNames: ['OpenAI', 'Microsoft Learn', 'Google AI'],
        aliases: ['Prompt engineering']
      },
      {
        term: '幻覚',
        category: '頼み方',
        plainSummary: 'AIが事実ではないことを、それらしく答えてしまうこと。',
        meaning: 'AIは自然な文章を作るのが得意ですが、根拠がない内容や間違った内容も自信ありげに書くことがあります。重要な情報は必ず確認が必要です。',
        usageInAi: '調査、法務、医療、料金、仕様確認など、正確さが重要な場面で特に注意します。根拠を見せる、検索を使う、人が確認する仕組みが役立ちます。',
        workflow: ['根拠が少ない', 'AIが文章を作る', 'もっともらしい誤りが出る'],
        example: '存在しない論文名や、古い料金情報を正しそうに書いてしまう。',
        misconception: '単なる誤字ではありません。内容そのものが間違っている場合があります。',
        relatedTerms: ['RAG', '評価', 'ガードレール'],
        sourceNames: ['OpenAI', 'Microsoft Learn', 'Stanford HAI'],
        aliases: ['Hallucination', 'ハルシネーション']
      },
      {
        term: 'ガードレール',
        category: '頼み方',
        plainSummary: 'AIが危ない答えや不適切な動きをしにくくする決まり。',
        meaning: '出してよい内容、出してはいけない内容、人に確認する条件などを決める仕組みです。プロンプトだけでなく、アプリ側のチェックでも作ります。',
        usageInAi: '個人情報、社外秘、危険な操作、誤送信を防ぎたい場面で使います。AIが答える前後にチェックを入れる設計が多いです。',
        workflow: ['入力を確認する', '危ない条件を止める', '必要なら人に回す'],
        example: '顧客情報が含まれる文章をAIに送る前に、自動で伏せ字にする。',
        misconception: 'ガードレールがあれば絶対に安全、というわけではありません。定期的な確認と改善が必要です。',
        relatedTerms: ['プロンプト', '幻覚', '評価'],
        sourceNames: ['OpenAI', 'Microsoft Learn', 'Google AI'],
        aliases: ['Guardrails']
      }
    ]
  },
  {
    id: 'retrieval',
    title: '検索',
    description: '資料を探してAIの答えに使う言葉。',
    terms: [
      {
        term: 'RAG',
        category: '検索',
        plainSummary: '資料を探してから、その資料を見ながらAIが答える方法。',
        meaning: 'AIだけに任せるのではなく、先に関連する資料を探し、その内容をAIに渡して答えを作らせます。社内文書、マニュアル、FAQなどを使うときに役立ちます。',
        usageInAi: '社内文書検索、問い合わせ対応、規程確認などで使います。AIの記憶ではなく、手元の資料を根拠にしたいときに向いています。',
        workflow: ['質問を受け取る', '関連資料を探す', '資料を見ながら答える'],
        example: '社内マニュアルを探して回答するチャットボットを作る。',
        misconception: '使えば必ず正確になるわけではありません。探した資料がずれていると答えもずれます。',
        relatedTerms: ['検索', 'Embedding', 'ベクトルデータベース'],
        sourceNames: ['Microsoft Learn', 'OpenAI', 'Google AI'],
        aliases: ['検索拡張生成', 'Retrieval-Augmented Generation']
      },
      {
        term: '検索',
        category: '検索',
        plainSummary: '答えの材料になりそうな情報を探すこと。',
        meaning: 'キーワードや意味の近さを使って、必要な文書や文章の一部を見つけます。RAGでは、AIに渡す前の材料集めとして重要です。',
        usageInAi: 'AIに答えさせる前に、関連する資料を選ぶために使われます。検索の質が低いと、AIの答えも弱くなります。',
        workflow: ['質問を読む', '資料の中から近い内容を探す', 'AIに渡す材料を選ぶ'],
        example: 'FAQから、ユーザーの質問に近い過去の回答を探す。',
        misconception: '一番上に出たものが必ず一番正しいとは限りません。',
        relatedTerms: ['RAG', 'チャンク', 'Embedding'],
        sourceNames: ['Microsoft Learn', 'Google AI', 'Stanford HAI'],
        aliases: ['Retrieval']
      },
      {
        term: 'チャンク',
        category: '検索',
        plainSummary: '検索しやすいように分けた資料の小さなまとまり。',
        meaning: '長い資料をそのまま扱うのではなく、段落や見出しごとに小さく分けたものです。AIに必要な部分だけ渡しやすくなります。',
        usageInAi: 'RAGで資料を登録するときに使います。大きすぎると不要な情報が混ざり、小さすぎると前後の意味が抜けやすくなります。',
        workflow: ['長い資料を分ける', '検索しやすく保存する', '必要な部分だけ取り出す'],
        example: '社内規程を章や見出しごとに分けて、質問に近い部分だけAIへ渡す。',
        misconception: '細かく分ければ分けるほど良いわけではありません。',
        relatedTerms: ['RAG', '検索', 'コンテキスト'],
        sourceNames: ['Microsoft Learn', 'Google AI'],
        aliases: ['Chunk']
      },
      {
        term: 'Embedding',
        category: '検索',
        plainSummary: '文章や画像の意味を、数字の並びに置き換えたもの。',
        meaning: 'AIが「意味の近さ」を比べやすいように、文章や画像を数字の形にします。似た内容は、数字の並びも近くなります。',
        usageInAi: '意味が近い資料、似た問い合わせ、関連する商品を探すために使われます。キーワードが一致しなくても近い内容を見つけやすくなります。',
        workflow: ['文章を数字に変える', '近さを比べる', '似た内容を取り出す'],
        example: '「ログインできない」と「パスワードを忘れた」を近い問い合わせとして探す。',
        misconception: '人が読む説明文ではありません。AIや検索システムが比べるための数字です。',
        relatedTerms: ['ベクトルデータベース', 'RAG', '検索'],
        sourceNames: ['OpenAI', 'Google AI', 'Microsoft Learn'],
        aliases: ['埋め込み', 'エンベディング']
      },
      {
        term: 'ベクトルデータベース',
        category: '検索',
        plainSummary: '意味の近さで探せるように、数字化した情報を保存する場所。',
        meaning: 'Embeddingにした文章や資料を保存し、質問に近い内容をすばやく探せるようにする仕組みです。RAGの材料探しでよく使われます。',
        usageInAi: '社内文書、FAQ、商品説明、過去問い合わせなどを意味で探せるようにします。AIに渡す資料を選ぶ裏側の保管場所になります。',
        workflow: ['資料を数字化する', '保存する', '質問に近い資料を取り出す'],
        example: '社内FAQを保存し、似た質問が来たら近い回答候補を取り出す。',
        misconception: '普通のデータベースの代わりに何でも使うものではありません。意味の近さで探したい場面に向いています。',
        relatedTerms: ['Embedding', 'RAG', '検索'],
        sourceNames: ['Microsoft Learn', 'Google AI', 'Stanford HAI'],
        aliases: ['Vector database']
      }
    ]
  },
  {
    id: 'integration',
    title: '連携',
    description: 'AIをアプリや道具とつなぐ言葉。',
    terms: [
      {
        term: 'API',
        category: '連携',
        plainSummary: 'アプリ同士がやり取りするための窓口。',
        meaning: '別のサービスやAIにお願いを送り、結果を受け取るための決まった入り口です。AI機能を自分のアプリに組み込むときによく使います。',
        usageInAi: '自社アプリ、チャット画面、業務システムからAIを呼び出すときに使います。画面の裏側で、質問や設定をAIサービスへ送ります。',
        workflow: ['アプリが依頼を作る', 'APIに送る', 'AIの結果を受け取る'],
        example: '問い合わせ管理画面からAPIでAIに依頼し、返信案を自動生成する。',
        misconception: 'APIは画面そのものではありません。裏側でサービス同士が会話するための仕組みです。',
        relatedTerms: ['エージェント', 'プロンプト', '推論'],
        sourceNames: ['OpenAI', 'Microsoft Learn', 'Google AI'],
        aliases: ['Application Programming Interface']
      },
      {
        term: 'エージェント',
        category: '連携',
        plainSummary: '目的に向けて、手順を考えながら道具を使うAI。',
        meaning: 'ただ返事をするだけでなく、必要な作業を分け、検索、計算、ファイル操作、API呼び出しなどを使いながら進めるAIの使い方です。',
        usageInAi: '調査してまとめる、ファイルを読み取って更新する、複数のツールを順番に使う作業に向きます。実行を伴うため、確認や制限の設計が重要です。',
        workflow: ['目的を受け取る', '手順を考える', '道具を使う', '結果をまとめる'],
        example: '売上CSVを読み、異常値を見つけ、要約レポートを作る。',
        misconception: '完全に放っておける存在ではありません。重要な判断や実行には人の確認が必要です。',
        relatedTerms: ['API', 'ガードレール', 'コンテキスト'],
        sourceNames: ['OpenAI', 'Microsoft Learn', 'Google AI'],
        aliases: ['Agent', 'AIエージェント']
      }
    ]
  },
  {
    id: 'quality',
    title: '確認',
    description: 'AIの品質を見直す言葉。',
    terms: [
      {
        term: '評価',
        category: '確認',
        plainSummary: 'AIの答えが目的に合っているか確かめること。',
        meaning: '答えが正しいか、読みやすいか、危なくないか、必要な形式になっているかを確認します。AIを仕事で使うときは、作って終わりではなく評価が大切です。',
        usageInAi: 'プロンプト変更、モデル変更、RAGの資料変更をしたときに、前より良くなったかを見ます。失敗例を集めるほど改善しやすくなります。',
        workflow: ['AIの答えを集める', '基準で確認する', '改善点を見つける'],
        example: '50件の問い合わせで、回答の正確さ、根拠の有無、文章の読みやすさを採点する。',
        misconception: '一度うまく答えたから、いつも大丈夫とは限りません。質問や資料が変わると結果も変わります。',
        relatedTerms: ['幻覚', 'プロンプトエンジニアリング', 'RAG'],
        sourceNames: ['OpenAI', 'Microsoft Learn', 'Stanford HAI'],
        aliases: ['Evals', 'Evaluation']
      }
    ]
  }
];

export const GLOSSARY_TERMS = GLOSSARY_SECTIONS.flatMap((section) => section.terms);

const TERM_INDEX = new Map<string, GlossaryTerm>();

for (const term of GLOSSARY_TERMS) {
  TERM_INDEX.set(term.term.toLowerCase(), term);
  for (const alias of term.aliases ?? []) {
    TERM_INDEX.set(alias.toLowerCase(), term);
  }
}

export function findGlossaryTerm(term: string) {
  return TERM_INDEX.get(term.toLowerCase());
}
