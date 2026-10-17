# higuti

このファイルはプロジェクトの規約であり、人と AI エージェントの両方が従う。
`AGENTS.md` はこのファイルへの symlink なので、どのエージェントを使っても同じ規約を読む。編集するのはこのファイルだけ。

## セットアップ

1. `.node-version` のバージョンの Node.js を入れる (mise / fnm / volta / nodenv などはこのファイルを読む)
2. pnpm 11 以上を入れる (例: `npm i -g pnpm@latest`)。`package.json` の `packageManager` で指定したバージョンに自動で切り替わる
   - pnpm 10 以前からは切り替えに失敗する (pnpm 12 はネイティブバイナリで配布されているため)
3. `pnpm install`
4. `pnpm dev` → http://localhost:5173

Docker は使わない。D1 はローカルでは Miniflare が SQLite として `apps/api/.wrangler/state` に作る。Cloudflare のアカウントはローカル開発に不要。

### 依存の追加

pnpm は公開から 24 時間経っていないバージョンを入れない (`minimumReleaseAge` の既定値)。サプライチェーン攻撃への対策なので緩めない。
弾かれたときに pnpm が `pnpm-workspace.yaml` へ `minimumReleaseAgeExclude` を自動で追記することがあるが、コミットせず、24 時間以上前のバージョンを指定し直す。

## コマンド

| コマンド                                    | 内容                                                                                           |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `pnpm dev`                                  | ローカル D1 にマイグレーションを適用してから、SPA と API を 1 つの Vite dev サーバーで起動する |
| `pnpm build`                                | ビルド (`apps/web/dist` に client と Worker を出力)                                            |
| `pnpm test`                                 | 全パッケージのテスト                                                                           |
| `pnpm typecheck`                            | 全パッケージの型チェック                                                                       |
| `pnpm lint` / `pnpm fmt` / `pnpm fmt:check` | oxlint / oxfmt                                                                                 |
| `pnpm --filter @higuti/api db:generate`     | Drizzle のテーブル定義からマイグレーションを生成する                                           |

## 構成

```
apps/
  web/   SPA (React 19 / TanStack Router / React Compiler)。@cloudflare/vite-plugin で apps/api の Worker も一緒に dev・build する
  api/   Hono on Cloudflare Workers + D1 + Drizzle。wrangler.jsonc はここにある
packages/
  schema/    valibot スキーマ (API の入出力)。FE と BE の両方から使う
  ui/        shadcn + デザインシステムのコンポーネント
  tsconfig/  共通の tsconfig
```

デプロイ単位は Worker 1 つ。`/api/*` は Hono が処理し、それ以外は SPA の静的ファイルを返す (存在しないパスは `index.html`)。FE と API は同一オリジンなので CORS 設定は不要。

## 規約

### FE のディレクトリ

```
apps/web/src/
  routes/               ルート定義。loader でデータを取り、feature のコンポーネントを置くだけにする
  features/<feature>/
    components/         Component.tsx (PascalCase)
    hooks/              useXxx.ts
  lib/api.ts            API クライアント
```

feature をまたぐ import はしない。複数の feature で使うものは `packages/ui` か `packages/schema` に置く。

### view と logic を分ける

- 状態・副作用・API 呼び出しは `hooks/use*.ts` に書く
- Component は hook を呼び、その戻り値と props から JSX を返すことに専念する。`useState` / `useEffect` / API 呼び出しを Component に直接書かない
- 厳密な分離は求めない。表示のためだけの小さな状態 (開閉など) まで hook に切り出す必要はない

### UI は 3 層

```
shadcn (packages/ui/src/shadcn)
  → デザインシステムのコンポーネント (packages/ui/src/components、packages/ui/src/index.ts から公開)
    → feature のコンポーネント (apps/web/src/features/*/components)
```

- feature から shadcn を直接使わない。`apps/` から `@higuti/ui/*` のサブパスや `packages/ui/src` への相対パスを import すると oxlint がエラーにする (`@higuti/ui/styles.css` だけは許可)
- shadcn の部品を足すときは `packages/ui` で `pnpm dlx shadcn@latest add <name>` を実行し、デザインシステムのコンポーネントで包んでから `src/index.ts` で公開する
  - shadcn のレジストリは依存を書き漏らすことがある (例: button の `class-variance-authority`)。`pnpm typecheck` で import エラーが出たら足す
  - 生成されたファイルは oxfmt の形式ではないので `pnpm fmt` を実行する

### validation

- valibot に統一する (zod は使わない)
- API の入出力スキーマは `packages/schema` に置き、FE と BE で同じものを使う
- BE は `@hono/valibot-validator`、FE のフォームは react-hook-form + `@hookform/resolvers/valibot` で使う

### API

- ルートは `new Hono().get(...).post(...)` のようにメソッドチェーンで書く。チェーンしないと Hono RPC の型が FE に伝わらない
- FE は `apps/web/src/lib/api.ts` のクライアント経由で呼ぶ。`fetch` を直接書かない
- FE は `apps/api/dist/types` に出力した型を参照する (Hono 公式の推奨: https://hono.dev/docs/guides/rpc#compile-your-code-before-using-it-recommended)。API を変えたのに FE の型が古いときは `pnpm --filter @higuti/api build:types` を実行する

### DB

- テーブル定義は `apps/api/src/db/schema.ts` に置く。FE には DB の構造を見せない (FE と共有するのは `packages/schema` だけ)
- 定義を変えたら `pnpm --filter @higuti/api db:generate` でマイグレーションを生成してコミットする。ローカルへの適用は `pnpm dev` が行う

### データ取得

- 読み取りは TanStack Router の `loader`、更新後の再取得は `router.invalidate()` で行う
- TanStack Query は入れていない。キャッシュの扱いで困ったら導入を検討する

### テスト

- vitest を使う。`apps/api` のテストは `@cloudflare/vitest-plugin` で Workers ランタイムとローカル D1 の上で動く
- 同じテストファイル内のテスト間では D1 のデータが共有される (ファイルが違えば分離される)。他のテストが作ったデータに左右される assertion (件数が 0 件、など) を書かない

### 生成ファイル

- `apps/web/src/routeTree.gen.ts` (TanStack Router): コミットする。手で編集しない (https://tanstack.com/router/latest/docs/framework/react/faq)
- `apps/api/worker-configuration.d.ts` (`wrangler types`): コミットしない。`pnpm install` 時に生成される。`wrangler.jsonc` を変えたら `pnpm --filter @higuti/api exec wrangler types` で作り直す

## PR の出し方

1 つの機能は BE の PR と FE の PR に分け、BE を下にした stacked PR にする。レビューする差分を小さくするため。FE は BE の型に依存するので、依存の向きと積む順が一致する。

stacked PR には GitHub 公式の `gh stack` を使う (https://docs.github.com/en/pull-requests/how-tos/stacked-pull-requests)。

```sh
gh extension install github/gh-stack  # 初回のみ

gh stack init <feature>-api   # BE のブランチ (main の上)
# BE を実装してコミット
gh stack add <feature>-web    # FE のブランチ (BE のブランチの上)
# FE を実装してコミット
gh stack submit               # 全ブランチを push し、正しい base で PR を作る
```

## CI/CD

`.github/workflows/ci.yml`

- PR と main への push で `fmt:check` / `lint` / `typecheck` / `build` / `test` を実行する
- main への push で Cloudflare Workers にデプロイする (`higuti.miura-188cm.dev`)。次の設定をするまではデプロイ job はスキップされる
  - secret: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
  - リポジトリ変数: `CLOUDFLARE_DEPLOY_ENABLED=true`
- D1 の `database_id` は `wrangler.jsonc` に書いていない。D1 が無ければ deploy job が `wrangler d1 create` で作り、`wrangler deploy` は同名の D1 に接続する
