import type { ComponentProps } from "react";
import { Button as ShadcnButton } from "@higuti/ui/shadcn/button";

const VARIANTS = {
  primary: "default",
  secondary: "outline",
  danger: "destructive",
  ghost: "ghost",
} as const;

const SIZES = { sm: "sm", md: "default", lg: "lg" } as const;

type ButtonProps = Omit<ComponentProps<"button">, "className" | "style"> & {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  // true のとき子要素 (例: TanStack Router の <Link>) に Button の見た目を付ける
  asChild?: boolean;
};

export function Button({ variant = "primary", size = "md", ...props }: ButtonProps) {
  return <ShadcnButton variant={VARIANTS[variant]} size={SIZES[size]} {...props} />;
}
