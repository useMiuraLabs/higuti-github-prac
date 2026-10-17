# 環境構築 設計 (issue #15)

## why

テーマ未定の個人開発 / 学習用プロダクトの土台を作る。最終的には単純な CRUD アプリになる。
誰がどの AI エージェントを使っても同じ規約で開発でき、ローカル環境構築が `pnpm install && pnpm dev` だけで済む状態にする。

## what

- Turborepo + pnpm workspace の monorepo
- FE: React 19 / TanStack Router (SPA, file-based routing) / React Compiler / RHF + valibot / shadcn + Tailwind v4
- BE: Hono on Cloudflare Workers / D1 (ローカルは Miniflare) / Drizzle ORM / 認証なし
- ツール: Vite / tsc / oxlint / oxfmt / vitest
- CI: fmt, lint, typecheck, build, test。CD: main への push で Cloudflare Workers にデプロイ (設定するまではスキップ)
- 機能の実装はしない。疎通確認用に `GET /api/health` とそれを表示するページだけ置き、各パッケージにテストを 1 本ずつ置く (中身のないパッケージは `--passWithNoTests`)

## 決定事項

| 項目                    | 決定                                                                                                                                                       | 理由                                                                                                                                                                   |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ルーティング            | TanStack Router SPA                                                                                                                                        | TanStack Start は単純な CRUD にはオーバースペック                                                                                                                      |
| view / logic            | logic は `hooks/use*.ts`、Component は hook を呼んで描画するだけ (厳密な分離はしない)                                                                      | 「アイランドアーキテクチャ」の意図 = view と logic をほぼ分離                                                                                                          |
| UI 3 層                 | shadcn は `packages/ui/src/shadcn`、デザインシステムは `packages/ui/src/index.ts` から公開。`apps/` からの `@higuti/ui/*` サブパス import を oxlint で禁止 | shadcn の monorepo 構成は package の self-reference (exports) が前提で、exports で隠せない。代わりに lint で止める                                                     |
| validation              | valibot に統一                                                                                                                                             | FE/BE 共有、Hono (`@hono/valibot-validator`)・RHF (`@hookform/resolvers/valibot`) とも公式連携あり、FE バンドルが小さい。OpenAPI 要件はないので zod の優位点が効かない |
| DB スキーマ             | Drizzle のテーブル定義は `apps/api` に閉じる                                                                                                               | FE は DB 構造を知らない。共有するのは API 入出力の valibot スキーマだけ                                                                                                |
| API の型共有            | `apps/api/src/client.ts` の `hcWithType` を `tsc` で `.d.ts` にして FE が参照する                                                                          | Hono 公式の推奨。FE の tsc が api のソース (Workers の型 `Env` に依存) を型チェックしなくて済む                                                                        |
| データ取得              | TanStack Router の loader + `router.invalidate()`。TanStack Query は入れない                                                                               | 単純な CRUD では不要。困ったら導入                                                                                                                                     |
| デプロイ単位            | Worker 1 つ。`/api/*` は Hono、それ以外は Static Assets (SPA fallback)                                                                                     | 同一オリジンで CORS 不要                                                                                                                                               |
| dev / build             | `@cloudflare/vite-plugin` で apps/web の Vite が apps/api の Worker も一緒に動かす                                                                         | Cloudflare 公式の SPA + API 構成。`assets.directory` (ビルド成果物) に dev が依存しない。本番と同じルーティングで dev できる                                           |
| PR 運用                 | 1 機能 = BE PR → FE PR の stacked PR (`gh stack`)                                                                                                          | レビューを小さくする。FE が BE の型に依存するので依存方向と積む順が一致                                                                                                |
| テスト                  | vitest 5。api は `@cloudflare/vitest-plugin` で Workers ランタイム + D1 上で実行                                                                           | 本番と同じランタイムでテストする                                                                                                                                       |
| React Compiler          | Babel 版 (`reactCompilerPreset`)                                                                                                                           | Rust 版は experimental                                                                                                                                                 |
| エージェント規約        | `CLAUDE.md` が正本、`AGENTS.md -> CLAUDE.md` の symlink                                                                                                    | どのエージェントでも同じ規約を読む                                                                                                                                     |
| ローカル環境            | `.node-version` + `packageManager` (pnpm 12) で版を固定。`pnpm dev` がローカル D1 マイグレーションを適用してから起動                                       | Docker なし、手順 2 コマンド                                                                                                                                           |
| pnpm                    | 12 系。依存のビルドスクリプトは `permissions` で許可したものだけ。`minimumReleaseAge` は既定のまま                                                         | サプライチェーン対策の既定値を崩さない                                                                                                                                 |
| Cloudflare 上のリソース | 今は作らない。D1 は初回デプロイ時に wrangler の自動プロビジョニングで作成                                                                                  | 環境構築段階では不要                                                                                                                                                   |
