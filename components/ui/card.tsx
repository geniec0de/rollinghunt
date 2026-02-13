import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", ...props }: CardProps) {
  const mergedClassName = `card border border-border bg-paper ${className}`.trim();
  return <div className={mergedClassName} {...props} />;
}
