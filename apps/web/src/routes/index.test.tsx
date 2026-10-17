import { RouterProvider, createMemoryHistory, createRouter } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { routeTree } from "../routeTree.gen";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("/", () => {
  it("API の health を表示する", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ status: "ok" })),
    );
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    render(<RouterProvider router={router} />);
    expect(await screen.findByText("API: ok")).toBeTruthy();
  });
});
