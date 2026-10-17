import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { DatePickerField } from "./DatePickerField";

function Harness({ initial = "", max }: { initial?: string; max?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <DatePickerField label="訪問日" value={value} onChange={setValue} max={max} />
      <output>{value || "(空)"}</output>
    </>
  );
}

describe("DatePickerField", () => {
  it("選んだ日を YYYY-MM-DD で返し、日本語で表示する", async () => {
    render(<Harness initial="2026-10-01" max="2026-10-17" />);
    await userEvent.click(screen.getByLabelText("訪問日"));
    await userEvent.click(screen.getByRole("button", { name: /2026年10月15日/ }));
    expect(screen.getByText("2026-10-15")).toBeTruthy();
    expect(screen.getByLabelText("訪問日").textContent).toBe("2026年10月15日");
  });

  it("max より後の日は選べない", async () => {
    render(<Harness initial="2026-10-01" max="2026-10-17" />);
    await userEvent.click(screen.getByLabelText("訪問日"));
    expect(screen.getByRole("button", { name: /2026年10月18日/ }).hasAttribute("disabled")).toBe(
      true,
    );
  });

  it("日付をクリアすると未入力に戻る", async () => {
    render(<Harness initial="2026-10-01" />);
    await userEvent.click(screen.getByLabelText("訪問日"));
    await userEvent.click(screen.getByRole("button", { name: "日付をクリア" }));
    expect(screen.getByText("(空)")).toBeTruthy();
  });
});
