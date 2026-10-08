# e-Laws

架空国家の法令検索・法令情報提供システム。

## 構成

- `index.html` — UI・検索・表示
- `build.js` — `laws/*.xml` から `laws/index.json` を自動生成
- `laws/*.xml` — 法令の原本データ
- `laws/index.json` — ビルド時に自動生成される一覧データ

## 法律を追加する

`laws/` にXMLを追加してpushするだけです。HTMLの変更は不要です。

XMLには最低限 `<Title>` を入れてください。

## Cloudflare Pages

Build command: `npm run build`

Build output directory: `.`
