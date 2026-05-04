"use client";

import React from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  containerClassName?: string;
};

export function SearchInput({
  className, containerClassName, placeholder = "Search", ...rest
}: Props) {
  return (
    <div
      className={cn(
        "flex items-center h-11 px-3.5 gap-2.5 bg-card border border-border rounded-lg",
        "focus-within:border-foreground/30 transition-colors",
        containerClassName
      )}
    >
      <MagnifyingGlass
        className="w-4 h-4 text-muted-foreground/60 shrink-0"
        weight="regular"
      />
      <input
        type="text"
        placeholder={placeholder}
        className={cn(
          "flex-1 bg-transparent outline-none text-[13.5px] placeholder:text-muted-foreground/50",
          className
        )}
        {...rest}
      />
    </div>
  );
}
