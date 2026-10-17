import type { ReactNode } from "react";
import { Label } from "@higuti/ui/shadcn/label";

// TextField / TextAreaField / SelectField で共通の、ラベルとエラー表示の枠
type FieldProps = {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
};

export const fieldErrorId = (id: string) => `${id}-error`;

export function Field({ id, label, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p id={fieldErrorId(id)} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

// 入力要素に渡す a11y 属性。エラーがあるときだけ invalid にし、エラー文と関連付ける
export const fieldInputProps = (id: string, error?: string) => ({
  id,
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error ? fieldErrorId(id) : undefined,
});
