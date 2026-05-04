"use client";

import React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "destructive" | "dark";
type Size = "sm" | "md" | "lg" | "xl";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95",
  secondary:
    "bg-card text-foreground border border-border hover:bg-muted/40 active:bg-muted/60",
  ghost:
    "text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted/70",
  destructive:
    "bg-card text-primary border border-border hover:bg-primary/5 hover:border-primary/30 active:bg-primary/10",
  dark:
    "bg-[oklch(0.32_0.005_35)] text-white hover:bg-[oklch(0.28_0.005_35)] active:bg-[oklch(0.24_0.005_35)]",
};

const SIZE: Record<Size, string> = {
  sm: "h-8  px-3   text-[12.5px] gap-1.5 rounded-md",
  md: "h-10 px-4   text-[13px]   gap-2   rounded-lg",
  lg: "h-11 px-5   text-[13.5px] gap-2   rounded-lg",
  xl: "h-12 px-6   text-[14px]   gap-2   rounded-xl",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  loading,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-semibold whitespace-nowrap transition-colors duration-150 select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        VARIANT[variant],
        SIZE[size],
        className
      )}
      {...rest}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        iconLeft
      )}
      {children}
      {!loading && iconRight}
    </button>
  );
}
