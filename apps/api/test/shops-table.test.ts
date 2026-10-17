import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";

const insert = (status: string, createdBy: string, rating: number | null) =>
  env.DB.prepare(
    "INSERT INTO shops (name, area, genre, status, created_by, rating) VALUES ('店', '新宿', 'カフェ', ?, ?, ?)",
  )
    .bind(status, createdBy, rating)
    .run();

describe("shops テーブル", () => {
  it("決めた選択肢と評価の範囲だけを受け付ける", async () => {
    await expect(insert("visited", "miura", 5)).resolves.toBeTruthy();
    await expect(insert("closed", "miura", null)).rejects.toThrow(/CHECK/);
    await expect(insert("visited", "UserA", null)).rejects.toThrow(/CHECK/);
    await expect(insert("visited", "yuma", 6)).rejects.toThrow(/CHECK/);
  });
});
