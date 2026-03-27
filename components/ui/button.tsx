import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "border-[#86ad60] bg-[#5f7f42] text-[#f7fbef] hover:border-[#98c16f] hover:bg-[#6a8d4a]",
  secondary: "border-[#7a7f87] bg-[#14171b] text-[#f0e9da] hover:border-[#97a86f] hover:bg-[#1a1f24]",
  danger: "border-[#b14a4a] bg-[#5a1f1f] text-[#ffeaea] hover:bg-[#6b2525]",
  ghost: "border-[#5f646d] bg-transparent text-[#ddd5c4] hover:border-[#95a86e] hover:bg-[#171b20] hover:text-[#f4ecdc]"
};

export function buttonStyles({
  variant = "secondary",
  className
}: {
  variant?: ButtonVariant;
  className?: string;
}) {
  return cn(
    "inline-flex min-h-10 appearance-none items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-semibold no-underline transition-colors cursor-pointer",
    "tracking-[0.02em]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a6c279] focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    "disabled:cursor-not-allowed disabled:opacity-50",
    variantClasses[variant],
    className
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "secondary", type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonStyles({ variant, className })}
      {...props}
    />
  );
});
