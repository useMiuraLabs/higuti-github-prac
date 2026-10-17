import type { ReactNode } from "react";
import { Badge as ShadcnBadge } from "@higuti/ui/shadcn/badge";

const VARIANTS = {
  default: "default",
  muted: "secondary",
  outline: "outline",
} as const;

type BadgeProps = {
  variant?: keyof typeof VARIANTS;
  children: ReactNode;
};

export function Badge({ variant = "default", children }: BadgeProps) {
  return <ShadcnBadge variant={VARIANTS[variant]}>{children}</ShadcnBadge>;
}
