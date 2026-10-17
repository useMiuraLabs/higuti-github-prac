import { type ComponentProps, useId } from "react";
import { Field, fieldInputProps } from "./Field";

type SelectFieldProps = Omit<
  ComponentProps<"select">,
  "className" | "style" | "id" | "children"
> & {
  label: string;
  options: readonly { value: string; label: string }[];
  error?: string;
};

// react-hook-form の register をそのまま渡せるよう、ネイティブの select を使う
export function SelectField({ label, options, error, ...props }: SelectFieldProps) {
  const id = useId();
  return (
    <Field id={id} label={label} error={error}>
      <select
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive"
        {...fieldInputProps(id, error)}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
