"use client";

import { Toaster } from "sileo";

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      theme="light"
      offset={{ bottom: 24, right: 24 }}
      options={{
        roundness: 14,
        fill: "var(--card)",
        duration: 4200,
        styles: {
          title:       "text-[13.5px] font-semibold tracking-tight text-[var(--foreground)]",
          description: "text-[12.5px] text-[var(--muted-foreground)] tracking-tight leading-snug",
          badge:       "bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)]",
          button:      "h-8 px-3 rounded-md text-[12.5px] font-semibold bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity",
        },
      }}
    />
  );
}
