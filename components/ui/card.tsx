import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", ...props }: CardProps) {
  const mergedClassName = `rounded-xl border border-border bg-surface ${className}`.trim();
  return <div className={mergedClassName} {...props} />;
}
