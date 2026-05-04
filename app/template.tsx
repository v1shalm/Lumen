"use client";

import React from "react";

/**
 * Next.js Templates re-mount on every navigation.
 * We use this to apply a global page-level entrance animation
 * that feels stable and masks any hydration-related jumps.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-page-fade w-full h-full">
      {children}
    </div>
  );
}
