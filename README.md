# e-Laws

XMLを原本とする架空国家の法令検索システム。

## GitHub上だけで使う場合

1. このフォルダの内容をGitHubリポジトリに配置
2. Actionsを有効化
3. `laws/*.xml` を追加・変更してcommit
4. GitHub Actionsが `laws/index.json` と各XMLのPDFを自動生成してcommit
5. Cloudflare PagesのBuild commandを `npm run build`、出力先を `.` に設定

法律追加時にHTMLを変更する必要はありません。
