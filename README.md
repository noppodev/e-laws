# e-Laws

架空国家向けの法令検索・法令情報提供システム。

## データの追加

`laws/` に XML を追加するだけです。

例:

```text
laws/
├── constitution.xml
├── some-law.xml
└── another-law.xml
```

XML の `<Title>` を法令名として自動取得します。`<LawName>` もフォールバックとして利用します。

## ローカル

```bash
npm run build
```

これで `laws/index.json` が自動生成されます。

その後、任意の静的サーバーで公開できます。

## Cloudflare Pages

GitHub とPagesを接続し、

- Build command: `npm run build`
- Build output directory: `.`

で公開します。

`laws/` にXMLを追加してpushすると、Pagesの自動デプロイにより一覧が更新されます。

## PDF

法令詳細画面の「PDF / 印刷」はブラウザの印刷機能を開きます。
印刷画面で「PDFとして保存」を選べます。

将来的に、e-Govのような正式な法令組版PDFを自動生成するビルド工程に置き換え可能です。
