import { SHOP_RATING_MAX } from "@higuti/schema";
import { StarIcon } from "lucide-react";
import { useId } from "react";

type RatingInputProps = {
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
};

// 選んだ★をもう一度押すと未評価に戻す
export function RatingInput({ value, onChange, disabled }: RatingInputProps) {
  const name = useId();
  return (
    <fieldset className="flex flex-col gap-2" disabled={disabled}>
      <legend className="mb-2 text-sm leading-none font-medium">評価</legend>
      <div className="flex items-center gap-1">
        {Array.from({ length: SHOP_RATING_MAX }, (_, index) => {
          const star = index + 1;
          return (
            <label
              key={star}
              className="cursor-pointer rounded-md p-1 hover:bg-accent has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50"
            >
              <input
                type="radio"
                name={name}
                value={star}
                checked={value === star}
                onChange={() => onChange(star)}
                // 選択済みの★を押しても change は起きないので、click で未評価に戻す
                onClick={() => value === star && onChange(null)}
                className="sr-only"
              />
              <span className="sr-only">★{star}</span>
              <StarIcon
                aria-hidden
                className={
                  value != null && star <= value
                    ? "size-6 fill-primary text-primary"
                    : "size-6 text-muted-foreground/40"
                }
              />
            </label>
          );
        })}
        <span className="ml-2 text-sm text-muted-foreground">
          {value == null ? "未評価" : `${value} / ${SHOP_RATING_MAX}（もう一度押すと未評価）`}
        </span>
      </div>
    </fieldset>
  );
}
