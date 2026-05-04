import React from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex items-start justify-between gap-6 pt-2 pb-8 mb-8 border-b border-border",
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="text-[28px] font-semibold tracking-tight text-foreground leading-[1.15]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed max-w-xl">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
    </header>
  );
}
