import React from "react";
import { cn } from "@/lib/utils";

type ChipTone = "neutral" | "accent" | "success" | "purple";

const TONE: Record<ChipTone, string> = {
  neutral: "bg-card text-muted-foreground border-border",
  accent:  "bg-primary/10 text-primary border-primary/20",
  success: "bg-card text-emerald-700 border-border",
  purple:  "bg-[oklch(0.55_0.20_290)]/12 text-[oklch(0.45_0.18_290)] border-[oklch(0.55_0.20_290)]/22",
};

type ChipProps = {
  children: React.ReactNode;
  tone?: ChipTone;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  className?: string;
};

export function Chip({
  children, tone = "neutral", iconLeft, iconRight, className,
}: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border text-[12px] font-medium tracking-tight",
        TONE[tone],
        className
      )}
    >
      {iconLeft}
      {children}
      {iconRight}
    </span>
  );
}
