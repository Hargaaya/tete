import type { ButtonHTMLAttributes, ReactNode } from "react";

const VARIANTS = {
  primary: "bg-amber-200 hover:bg-amber-300 text-xl font-medium",
  secondary: "bg-slate-200 hover:bg-slate-300 text-lg font-medium",
  text: "text-gray-500 hover:text-gray-700",
} as const;

type Variant = keyof typeof VARIANTS;

export type ButtonProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ children, variant = "primary", className = "", type = "button", ...props }: ButtonProps) {
  const variantClasses = VARIANTS[variant] ?? VARIANTS.primary;
  const composed = `px-8 py-2 rounded-xl min-h-12 transition-colors cursor-pointer ${variantClasses} ${className}`.trim();

  return (
    <button type={type} className={composed} {...props}>
      {children}
    </button>
  );
}
