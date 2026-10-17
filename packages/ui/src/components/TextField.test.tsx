import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TextField } from "./TextField";

describe("TextField", () => {
  it("エラーがあるときだけ invalid にし、エラー文を説明として関連付ける", () => {
    const { rerender } = render(<TextField label="店名" />);
    expect(screen.getByLabelText("店名").hasAttribute("aria-invalid")).toBe(false);

    rerender(<TextField label="店名" error="入力してください" />);
    const input = screen.getByLabelText("店名");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe(screen.getByText("入力してください").id);
  });
});
