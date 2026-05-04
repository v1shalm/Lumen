import React from "react";
import { cn } from "@/lib/utils";

type StatTileProps = {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
};

/** Small rounded white tile: muted label on top, large value below.
 *  Matches the "Release date / Context window / Latency" pattern in the
 *  Model Overview drawer reference. */
export function StatTile({ label, value, hint, className }: StatTileProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl px-4 py-3.5",
        className
      )}
    >
      <p className="text-[11.5px] text-muted-foreground tracking-tight">{label}</p>
      <p className="mt-1 text-[16px] font-semibold text-foreground tracking-tight tabular-nums">
        {value}
      </p>
      {hint && (
        <p className="mt-0.5 text-[11px] text-muted-foreground/70 tracking-tight">
          {hint}
        </p>
      )}
    </div>
  );
}
