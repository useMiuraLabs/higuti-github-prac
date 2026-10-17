import { RouterProvider, createMemoryHistory, createRouter } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { routeTree } from "./routeTree.gen";

const renderAt = (path: string) => {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  render(<RouterProvider router={router} />);
};

describe("ルート", () => {
  it.each([
    ["/", "お店一覧"],
    ["/shops/new", "お店を登録"],
    ["/shops/1", "お店の詳細"],
    ["/shops/1/edit", "お店を編集"],
  ])("%s で %s の画面を開ける", async (path, heading) => {
    renderAt(path);
    expect(await screen.findByRole("heading", { name: heading })).toBeTruthy();
  });
});
