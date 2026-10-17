import { StarIcon } from "lucide-react";

type RatingProps = {
  value: number | null;
  max?: number;
};

// 評価の表示専用 (入力ではない)
export function Rating({ value, max = 5 }: RatingProps) {
  if (value == null) return <span className="text-sm text-muted-foreground">未評価</span>;
  return (
    <span className="inline-flex items-center gap-0.5">
      <span className="sr-only">{`${max} 段階中 ${value}`}</span>
      {Array.from({ length: max }, (_, index) => (
        <StarIcon
          key={index}
          aria-hidden
          className={
            index < value ? "size-5 fill-primary text-primary" : "size-5 text-muted-foreground/40"
          }
        />
      ))}
    </span>
  );
}
