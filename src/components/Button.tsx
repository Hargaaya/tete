import type { ButtonHTMLAttributes, ReactNode } from "react";

const VARIANTS = {
  primary: "bg-amber-200 hover:bg-amber-300 text-xl font-medium",
  secondary: "bg-slate-200 hover:bg-slate-300 text-lg font-medium",
  danger: "bg-red-600 hover:bg-red-700 text-white font-semibold",
  success: "bg-green-600 hover:bg-green-700 text-white font-semibold",
  text: "text-gray-500 hover:text-gray-700",
} as const;

const SIZES = {
  sm: "px-4 py-1.5 text-sm min-h-8 rounded-lg",
  md: "px-6 py-2 text-base min-h-10 rounded-lg",
  lg: "px-8 py-2 text-xl min-h-12 rounded-xl",
} as const;

type Variant = keyof typeof VARIANTS;
type Size = keyof typeof SIZES;

export type ButtonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ children, variant = "primary", size = "lg", className = "", type = "button", ...props }: ButtonProps) {
  const variantClasses = VARIANTS[variant];
  const sizeClasses = SIZES[size];
  const composed = `${sizeClasses} transition-colors cursor-pointer ${variantClasses} ${className}`.trim();

  return (
    <button type={type} className={composed} {...props}>
      {children}
    </button>
  );
}
