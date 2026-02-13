import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";

type ButtonVariant = "default" | "cta" | "cta-secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  variant?: ButtonVariant;
};

const baseClasses =
  "inline-flex items-center justify-center text-xs tracking-[0.02em] transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  default:
    "rounded-none border border-border bg-paper px-3 py-2 font-semibold text-primary hover:border-slate-400 hover:shadow-[4px_4px_0_#000] hover:-translate-y-0.5 active:translate-y-0",
  cta:
    "rounded-none border-0 bg-cta-red text-white min-h-7 px-3 py-0 font-medium shadow-[8px_8px_0_#420000] hover:bg-red-800 hover:shadow-[10px_10px_0_#420000] hover:-translate-y-0.5 active:translate-y-0",
  "cta-secondary":
    "rounded-none border-2 border-accent bg-paper px-3 py-2 min-h-7 font-semibold text-accent shadow-hard hover:bg-red-50 hover:text-red-900 hover:shadow-[10px_10px_0_#000] hover:-translate-y-0.5 active:translate-y-0",
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
