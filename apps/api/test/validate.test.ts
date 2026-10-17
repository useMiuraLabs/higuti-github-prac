import { Hono } from "hono";
import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { validate } from "../src/lib/validate";

const app = new Hono().post(
  "/",
  validate("json", v.object({ name: v.pipe(v.string(), v.nonEmpty("名前を入力してください")) })),
  (c) => c.json(c.req.valid("json")),
);

describe("validate", () => {
  it("入力エラーを項目ごとのエラー文にして 400 で返す (入力値は返さない)", async () => {
    const res = await app.request("/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "" }),
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      message: "入力に誤りがあります",
      fieldErrors: { name: "名前を入力してください" },
    });
  });
});
