import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "./ConfirmDialog";

const props = { title: "削除しますか？", description: "元に戻せません", confirmLabel: "削除する" };

describe("ConfirmDialog", () => {
  it("確定を押しても自分では閉じず、onConfirm だけを呼ぶ", async () => {
    const onConfirm = vi.fn<() => void>();
    const onOpenChange = vi.fn<(open: boolean) => void>();
    render(<ConfirmDialog open onOpenChange={onOpenChange} onConfirm={onConfirm} {...props} />);
    await userEvent.click(screen.getByRole("button", { name: "削除する" }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("処理中はどちらのボタンも押せない", () => {
    render(
      <ConfirmDialog
        open
        pending
        onOpenChange={vi.fn<(open: boolean) => void>()}
        onConfirm={vi.fn<() => void>()}
        {...props}
      />,
    );
    expect(screen.getByRole("button", { name: "削除する" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "キャンセル" }).hasAttribute("disabled")).toBe(true);
  });
});
