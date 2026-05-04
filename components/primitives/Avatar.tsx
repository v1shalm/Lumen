import React from "react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

const SIZE: Record<Size, string> = {
  sm: "w-7 h-7 text-[11px]",
  md: "w-9 h-9 text-[13px]",
  lg: "w-20 h-20 text-[24px]",
};

type AvatarProps = {
  /** Brand mark or content (icon component / element / single character). */
  children?: React.ReactNode;
  /** Optional initials shown if no children. */
  initials?: string;
  size?: Size;
  className?: string;
};

/** Circular white container with hairline border — matches reference brand-mark
 *  treatment used in tables and detail views. */
export function Avatar({ children, initials, size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "rounded-full bg-card border border-border flex items-center justify-center shrink-0 font-semibold text-foreground",
        SIZE[size],
        className
      )}
    >
      {children ?? initials}
    </div>
  );
}
