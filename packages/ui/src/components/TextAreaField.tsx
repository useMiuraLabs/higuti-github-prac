import { type ComponentProps, useId } from "react";
import { Textarea } from "@higuti/ui/shadcn/textarea";
import { Field, fieldInputProps } from "./Field";

type TextAreaFieldProps = Omit<ComponentProps<"textarea">, "className" | "style" | "id"> & {
  label: string;
  error?: string;
};

export function TextAreaField({ label, error, ...props }: TextAreaFieldProps) {
  const id = useId();
  return (
    <Field id={id} label={label} error={error}>
      <Textarea {...fieldInputProps(id, error)} {...props} />
    </Field>
  );
}
