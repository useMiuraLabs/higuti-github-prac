import { type ComponentProps, useId } from "react";
import { Input } from "@higuti/ui/shadcn/input";
import { Field, fieldInputProps } from "./Field";

type TextFieldProps = Omit<ComponentProps<"input">, "className" | "style" | "id"> & {
  label: string;
  error?: string;
};

export function TextField({ label, error, ...props }: TextFieldProps) {
  const id = useId();
  return (
    <Field id={id} label={label} error={error}>
      <Input {...fieldInputProps(id, error)} {...props} />
    </Field>
  );
}
