import React from "react";
import { cn } from "@/lib/utils";

type GlowCardProps = {
  /** OKLCH-formatted color string for the halo. e.g. "oklch(0.55 0.20 290)". */
  haloColor?: string;
  haloOpacity?: number;
  className?: string;
  children: React.ReactNode;
};

/**
 * White card on a soft colored halo.
 *
 * The halo is a single large blur sitting *behind* the card via a pseudo-element
 * — same layout footprint, no extra DOM, doesn't break flex/grid layouts.
 *
 * Use sparingly: best for one focal element on a page (a schedule widget,
 * a featured upgrade prompt, a hero CTA card).
 */
export function GlowCard({
  haloColor = "oklch(0.55 0.20 290)",
  haloOpacity = 0.18,
  className,
  children,
}: GlowCardProps) {
  return (
    <div className={cn("relative isolate", className)}>
      {/* Halo */}
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[28px] blur-2xl"
        style={{
          backgroundColor: haloColor,
          opacity: haloOpacity,
        }}
      />
      {/* Card surface */}
      <div className="bg-card rounded-2xl card-shadow-md">
        {children}
      </div>
    </div>
  );
}
