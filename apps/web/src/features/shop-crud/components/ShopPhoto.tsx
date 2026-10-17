import { ImageIcon } from "lucide-react";
import { useState } from "react";

type ShopPhotoProps = {
  src: string;
  alt: string;
};

export function ShopPhoto({ src, alt }: ShopPhotoProps) {
  // 表示のためだけの状態なので hook に切り出さない
  const [broken, setBroken] = useState(false);
  if (broken) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-md bg-muted text-sm text-muted-foreground">
        <ImageIcon className="size-8" aria-hidden />
        画像を読み込めませんでした
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setBroken(true)}
      className="aspect-video w-full rounded-md object-cover"
    />
  );
}
