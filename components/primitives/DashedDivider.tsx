import React from "react";
import { cn } from "@/lib/utils";

type Props = {
  orientation?: "horizontal" | "vertical";
  className?: string;
};

/** Dashed section divider — sparse dashes for editorial layouts. */
export function DashedDivider({ orientation = "horizontal", className }: Props) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        orientation === "horizontal"
          ? "w-full h-0 border-t border-dashed border-border"
          : "h-full w-0 border-l border-dashed border-border",
        className
      )}
      style={{
        borderImage: "none",
        borderColor: "var(--border)",
      }}
    />
  );
}
