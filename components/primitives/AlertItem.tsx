import React from "react";
import { Check, WarningCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type State = "completed" | "alert";

type AlertItemProps = {
  label: React.ReactNode;
  state: State;
  /** When true, renders as a card with red-tinted shadow (active alert state). */
  active?: boolean;
  className?: string;
};

/**
 * Vertical timeline / status row.
 *
 * - completed → light-blue circle with white check, muted text
 * - alert → red triangle on a coral plate
 *
 * When `active`, the alert row wraps in a white card with a thin red border
 * and a red-tinted ambient shadow (uses .card-shadow-alert).
 */
export function AlertItem({ label, state, active, className }: AlertItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3.5 py-2.5 rounded-xl",
        active && state === "alert" && "bg-card border border-primary/40 card-shadow-alert",
        className
      )}
    >
      {state === "completed" ? (
        <span className="w-7 h-7 rounded-full bg-[oklch(0.92_0.04_240)] flex items-center justify-center shrink-0">
          <Check className="w-3.5 h-3.5 text-[oklch(0.55_0.16_240)]" weight="bold" />
        </span>
      ) : (
        <span className="w-7 h-7 rounded-md bg-[oklch(0.93_0.05_25)] flex items-center justify-center shrink-0">
          <WarningCircle className="w-4 h-4 text-primary" weight="fill" />
        </span>
      )}

      <span
        className={cn(
          "flex-1 text-[14px] truncate",
          state === "completed"
            ? "text-muted-foreground/70"
            : active
            ? "text-primary font-semibold"
            : "text-foreground"
        )}
      >
        {label}
      </span>
    </div>
  );
}
