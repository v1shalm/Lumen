import React from "react";
import { cn } from "@/lib/utils";

type MagnifierProps = {
  /** Diameter of the loupe in px. */
  size?: number;
  /** Position relative to the parent (which must be `position: relative`). */
  top?: number | string;
  left?: number | string;
  className?: string;
  children?: React.ReactNode;
};

/**
 * Glass loupe overlay — used to highlight a region of underlying text/image.
 *
 * Render inside a relatively-positioned container that contains the source
 * material. The loupe sits absolutely on top of it. Whatever's underneath
 * shows through the loupe as-is; the design idiom is typically paired with
 * a container-level radial fade that softens content *outside* the loupe.
 */
export function Magnifier({
  size = 88,
  top = "30%",
  left = "30%",
  className,
  children,
}: MagnifierProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute rounded-full bg-card/70 backdrop-blur-[1px] border border-border card-shadow",
        "flex items-center justify-center pointer-events-none",
        className
      )}
      style={{ width: size, height: size, top, left, transform: "translate(-50%, -50%)" }}
    >
      {children}
    </div>
  );
}
