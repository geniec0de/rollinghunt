import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";

type ButtonVariant = "default" | "cta";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  variant?: ButtonVariant;
};

const baseClasses =
  "inline-flex items-center justify-center text-xs tracking-[0.02em] transition-opacity disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  default: "rounded-none border border-border bg-paper px-3 py-2 font-semibold text-primary",
  cta: "rounded-none border-0 bg-neutral px-3 py-0 text-white min-h-7 font-medium shadow-hard",
};

export function Button({ className = "", href, variant = "default", type = "button", ...props }: ButtonProps) {
  const variantClass = variants[variant];
  const mergedClassName = `${baseClasses} ${variantClass} ${className}`.trim();

  if (href) {
    return (
      <Link className={mergedClassName} href={href}>
        {props.children}
      </Link>
    );
  }

  return <button className={mergedClassName} type={type} {...props} />;
}
