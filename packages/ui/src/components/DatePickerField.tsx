import { CalendarIcon } from "lucide-react";
import { useId, useState } from "react";
import { ja } from "react-day-picker/locale";
import { Button } from "@higuti/ui/shadcn/button";
import { Calendar } from "@higuti/ui/shadcn/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@higuti/ui/shadcn/popover";
import { Field, fieldInputProps } from "./Field";

type DatePickerFieldProps = {
  label: string;
  // YYYY-MM-DD。未入力は ""
  value: string;
  onChange: (value: string) => void;
  // YYYY-MM-DD。これより後の日は選べない
  max?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
};

// YYYY-MM-DD とカレンダーの Date は、どちらもその土地の日付として扱う (時差で日付がずれないように)
const toDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day) : undefined;
};
const toValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const formatJa = (date: Date) =>
  `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;

export function DatePickerField({
  label,
  value,
  onChange,
  max,
  error,
  placeholder = "日付を選ぶ",
  disabled,
}: DatePickerFieldProps) {
  const id = useId();
  // 表示のためだけの状態なので hook に切り出さない
  const [open, setOpen] = useState(false);
  const selected = toDate(value);
  const maxDate = max ? toDate(max) : undefined;

  return (
    <Field id={id} label={label} error={error}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            {...fieldInputProps(id, error)}
            className="w-full justify-start font-normal data-[empty=true]:text-muted-foreground"
            data-empty={!selected}
          >
            <CalendarIcon />
            {selected ? formatJa(selected) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            locale={ja}
            selected={selected}
            defaultMonth={selected ?? maxDate}
            disabled={maxDate ? { after: maxDate } : undefined}
            onSelect={(date) => {
              onChange(date ? toValue(date) : "");
              setOpen(false);
            }}
          />
          {selected && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                日付をクリア
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </Field>
  );
}
