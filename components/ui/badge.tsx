import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "destructive";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default:
      "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900",
    secondary:
      "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
    outline:
      "border border-zinc-200 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    success:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    warning:
      "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    destructive:
      "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
