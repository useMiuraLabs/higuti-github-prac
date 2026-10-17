import type { ComponentProps } from "react";
import { Button as ShadcnButton } from "@higuti/ui/shadcn/button";

const VARIANTS = {
  primary: "default",
  secondary: "outline",
  danger: "destructive",
  ghost: "ghost",
} as const;

type ButtonProps = Omit<ComponentProps<"button">, "className" | "style"> & {
  variant?: keyof typeof VARIANTS;
  size?: "sm" | "md";
};

export function Button({ variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <ShadcnButton variant={VARIANTS[variant]} size={size === "md" ? "default" : "sm"} {...props} />
  );
}
