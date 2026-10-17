import { SHOP_MEMBERS, SHOP_RATING_MAX, SHOP_RATING_MIN, SHOP_STATUSES } from "@higuti/schema";
import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// 型は docs/2_基本設計.md 2.2。文字数の上限は SQLite では効かないので valibot で検証する
const inList = (values: readonly string[]) =>
  sql.raw(values.map((value) => `'${value}'`).join(", "));

export const shops = sqliteTable(
  "shops",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    area: text("area").notNull(),
    genre: text("genre").notNull(),
    status: text("status", { enum: SHOP_STATUSES }).notNull(),
    mapUrl: text("map_url"),
    rating: integer("rating"),
    memo: text("memo"),
    imageUrl: text("image_url"),
    visitedAt: text("visited_at"),
    createdBy: text("created_by", { enum: SHOP_MEMBERS }).notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    // SQLite には更新時に自動で値を入れる仕組みが無いので、Drizzle で更新するたびに設定する
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    check("shops_status_check", sql`${table.status} IN (${inList(SHOP_STATUSES)})`),
    check("shops_created_by_check", sql`${table.createdBy} IN (${inList(SHOP_MEMBERS)})`),
    check(
      "shops_rating_check",
      sql`${table.rating} BETWEEN ${sql.raw(String(SHOP_RATING_MIN))} AND ${sql.raw(String(SHOP_RATING_MAX))}`,
    ),
  ],
);
