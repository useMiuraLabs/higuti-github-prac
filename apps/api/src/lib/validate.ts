import type { ApiError } from "@higuti/schema";
import { vValidator } from "@hono/valibot-validator";
import type { ValidationTargets } from "hono";
import * as v from "valibot";

// @hono/valibot-validator は失敗すると valibot の結果を入力値ごと返すので、ApiError の形に揃える
export const validate = <Target extends keyof ValidationTargets, Schema extends v.GenericSchema>(
  target: Target,
  schema: Schema,
) =>
  vValidator(target, schema, (result, c) => {
    if (result.success) return;
    const nested: Record<string, string[] | undefined> = v.flatten(result.issues).nested ?? {};
    const fieldErrors = Object.fromEntries(
      Object.entries(nested).flatMap(([key, messages]) =>
        messages?.[0] ? [[key, messages[0]]] : [],
      ),
    );
    return c.json({ message: "入力に誤りがあります", fieldErrors } satisfies ApiError, 400);
  });
