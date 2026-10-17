import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderAt } from "./test/renderAt";
import { stubApi } from "./test/server";

describe("ルート", () => {
  it.each([
    ["/", "お店一覧"],
    ["/shops/new", "お店を登録"],
    ["/shops/1", "架空珈琲 清澄店"],
    ["/shops/1/edit", "「架空珈琲 清澄店」を編集"],
    ["/shops/999", "お店が見つかりません"],
    ["/shops/abc", "お店が見つかりません"],
  ])("%s で %s が出る", async (path, text) => {
    stubApi();
    renderAt(path);
    expect(await screen.findByText(text)).toBeTruthy();
  });
});
