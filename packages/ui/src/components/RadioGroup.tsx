import { useId } from "react";
import { Label } from "@higuti/ui/shadcn/label";
import { RadioGroup as ShadcnRadioGroup, RadioGroupItem } from "@higuti/ui/shadcn/radio-group";

type RadioGroupProps<T extends string> = {
  label: string;
  value: T;
  onValueChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  disabled?: boolean;
};

export function RadioGroup<T extends string>({
  label,
  value,
  onValueChange,
  options,
  disabled,
}: RadioGroupProps<T>) {
  const id = useId();
  return (
    <div className="flex flex-col gap-3">
      <span id={id} className="text-sm leading-none font-medium">
        {label}
      </span>
      <ShadcnRadioGroup
        aria-labelledby={id}
        value={value}
        onValueChange={(next) => onValueChange(next as T)}
        disabled={disabled}
        className="flex flex-wrap gap-6"
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <RadioGroupItem id={`${id}-${option.value}`} value={option.value} />
            <Label htmlFor={`${id}-${option.value}`} className="font-normal">
              {option.label}
            </Label>
          </div>
        ))}
      </ShadcnRadioGroup>
    </div>
  );
}
