import type { ReactNode } from "react";
import {
  Card as ShadcnCard,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@higuti/ui/shadcn/card";

type CardProps = {
  title: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
};

export function Card({ title, children, footer }: CardProps) {
  return (
    <ShadcnCard>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
      {footer && <CardFooter>{footer}</CardFooter>}
    </ShadcnCard>
  );
}
