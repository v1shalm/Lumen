"use client";

import React from "react";
import { Construction } from "lucide-react";

export default function PlaceholderPage({ title = "Page" }: { title?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
      <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center">
        <Construction className="w-6 h-6 text-muted-foreground" />
      </div>
      <div className="space-y-2 text-center">
        <h1 className="text-[18px] font-semibold text-foreground">{title} coming soon</h1>
        <p className="text-[13px] text-muted-foreground max-w-sm leading-relaxed">
          We&apos;re working hard to bring this feature to life. Stay tuned for updates.
        </p>
      </div>
    </div>
  );
}
