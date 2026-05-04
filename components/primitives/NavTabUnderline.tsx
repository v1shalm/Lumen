"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Icon as PhIcon } from "@phosphor-icons/react";

type NavTabUnderlineProps = {
  href: string;
  icon: PhIcon;
  label: string;
  active: boolean;
  /** Accent color for the active state. Defaults to primary; override for purple/blue/etc. */
  accent?: string;
  className?: string;
};

/**
 * Alternative nav row style — top hairline accent in the active color,
 * tinted icon + label. Lighter than a pill background.
 *
 * Used for sub-nav (tabs) inside a settings or workflow page.
 */
export function NavTabUnderline({
  href, icon: Icon, label, active, accent, className,
}: NavTabUnderlineProps) {
  const accentColor = accent ?? "var(--primary)";
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-2.5 h-10 px-3 text-[13.5px] transition-colors duration-150",
        active
          ? "font-semibold"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
      style={active ? { color: accentColor } : undefined}
    >
      {active && (
        <span
          aria-hidden
          className="absolute top-0 left-0 right-0 h-px"
          style={{ backgroundColor: accentColor }}
        />
      )}
      <Icon
        className="w-4 h-4 shrink-0"
        weight={active ? "fill" : "regular"}
        style={active ? { color: accentColor } : undefined}
      />
      <span>{label}</span>
    </Link>
  );
}
