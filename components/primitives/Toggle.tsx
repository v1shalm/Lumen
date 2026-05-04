"use client";

import React from "react";
import { cn } from "@/lib/utils";

type ToggleProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  className?: string;
};

/** Filled-rail switch. Off: charcoal rail. On: primary rail. White knob. */
export function Toggle({ checked, onChange, label, disabled, className }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex items-center gap-2 group select-none",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span
        className={cn(
          "relative inline-block w-7 h-4 rounded-full transition-colors duration-200",
          checked ? "bg-primary" : "bg-[oklch(0.32_0.005_35)]"
        )}
      >
        <span
          className={cn(
            "absolute top-[2px] left-[2px] w-3 h-3 rounded-full bg-white transition-transform duration-200",
            checked && "translate-x-3"
          )}
        />
      </span>
      {label && <span className="text-[13px] text-foreground">{label}</span>}
    </button>
  );
}
