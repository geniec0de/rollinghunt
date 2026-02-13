import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";

type ButtonVariant = "default" | "cta";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  variant?: ButtonVariant;
};

const baseClasses =
  "inline-flex items-center justify-center text-xs font-semibold tracking-[0.02em] transition-opacity disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  default: "rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900",
  cta: "rounded-none border-0 bg-black px-3 py-2 text-white shadow-hard",
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
