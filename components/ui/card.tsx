import type { HTMLAttributes } from "react";

type CardVariant = "default" | "small";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
};

const variants: Record<CardVariant, string> = {
  default: "card border border-border bg-paper",
  small: "card card-small border border-border bg-paper",
};

export function Card({ className = "", variant = "default", ...props }: CardProps) {
  const mergedClassName = `${variants[variant]} ${className}`.trim();
  return <div className={mergedClassName} {...props} />;
}
