import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderAt } from "../../../test/renderAt";
import { stubApi, visitedShop } from "../../../test/server";

describe("ShopForm", () => {
  it("「行った」→「行きたい」に切り替えると、消えることを知らせ、レビュー項目を null にして保存する", async () => {
    const requests = stubApi();
    renderAt("/shops/1/edit");
    await userEvent.click(await screen.findByRole("radio", { name: "行きたい" }));

    expect(screen.getByText(/評価・訪問日・写真 URL が消えます/)).toBeTruthy();
    expect(screen.queryByText("レビュー（任意）")).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: "保存する" }));
    await waitFor(() => expect(requests.some((r) => r.method === "PATCH")).toBe(true));
    const patch = requests.find((r) => r.method === "PATCH");
    expect(patch?.body).toMatchObject({
      status: "want_to_go",
      rating: null,
      visitedAt: null,
      imageUrl: null,
      memo: visitedShop.memo,
    });
    expect(patch?.body).not.toHaveProperty("createdBy");
  });

  it("隠れたレビュー欄の不正な値では保存を止めない", async () => {
    const requests = stubApi();
    renderAt("/shops/1/edit");
    const imageUrl = await screen.findByLabelText("写真 URL");
    await userEvent.clear(imageUrl);
    await userEvent.type(imageUrl, "not a url");
    await userEvent.click(screen.getByRole("radio", { name: "行きたい" }));
    await userEvent.click(screen.getByRole("button", { name: "保存する" }));
    await waitFor(() => expect(requests.some((r) => r.method === "PATCH")).toBe(true));
  });

  it("「行った！に変更」から来たら、「行った」でレビュー欄を開いた状態で始まる", async () => {
    stubApi({
      ...visitedShop,
      status: "want_to_go",
      rating: null,
      visitedAt: null,
      imageUrl: null,
    });
    renderAt("/shops/1/edit?status=visited");
    expect(await screen.findByText("レビュー（任意）")).toBeTruthy();
    expect(screen.getByRole("radio", { name: "行った" }).getAttribute("aria-checked")).toBe("true");
  });

  it("必須項目が空なら送信せず、項目の下にエラーを出す", async () => {
    const requests = stubApi();
    renderAt("/shops/new");
    await userEvent.click(await screen.findByRole("button", { name: "登録する" }));
    expect(await screen.findByText("店名を入力してください")).toBeTruthy();
    expect(requests.some((r) => r.method === "POST")).toBe(false);
  });
});

describe("RatingInput", () => {
  it("選んだ★をもう一度押すと未評価に戻る", async () => {
    stubApi();
    renderAt("/shops/1/edit");
    const fifth = await screen.findByRole("radio", { name: "★5" });
    expect((fifth as HTMLInputElement).checked).toBe(true);
    await userEvent.click(fifth);
    expect(screen.getByText("未評価")).toBeTruthy();
  });
});
