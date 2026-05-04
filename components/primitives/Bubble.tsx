import React from "react";
import { cn } from "@/lib/utils";

type Role = "bot" | "user";
type Tone = "default" | "lead";   // 'lead' = larger first-message treatment

type BubbleProps = {
  role: Role;
  tone?: Tone;
  /** Additional classes on the bubble surface (not the wrapper). */
  className?: string;
  /** Optional timestamp shown below the bubble. */
  timestamp?: string;
  children: React.ReactNode;
};

/**
 * Chat message bubble.
 *
 * Bot — white pill with multi-layer ambient shadow, dark text.
 * User — charcoal pill, white text, same shadow stack.
 *
 * The 'lead' tone slightly enlarges type for the first/intro message,
 * matching the editorial lead-paragraph treatment used in research UIs.
 */
export function Bubble({ role, tone = "default", timestamp, className, children }: BubbleProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex flex-col gap-1.5 max-w-[78ch]", isUser && "items-end ml-auto")}>
      <div
        className={cn(
          "rounded-2xl px-4 py-3 card-shadow",
          tone === "lead"
            ? "text-[16.5px] leading-[1.55]"
            : "text-[14.5px] leading-[1.55]",
          isUser
            ? "bg-[oklch(0.32_0.005_35)] text-white"
            : "bg-card text-foreground",
          className
        )}
      >
        {children}
      </div>
      {timestamp && (
        <span className="text-[10.5px] text-muted-foreground/60 tabular-nums px-1">
          {timestamp}
        </span>
      )}
    </div>
  );
}
