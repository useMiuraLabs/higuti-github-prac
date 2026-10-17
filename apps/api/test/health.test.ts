import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import app from "../src";

describe("GET /api/health", () => {
  it("ok を返す", async () => {
    const res = await app.request("/api/health", {}, env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });
});
