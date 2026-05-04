"use client";

import React from "react";
import { Bell, CaretDown, FileText, Question } from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopNavbar() {
  return (
    <header className="fixed top-0 right-0 left-60 h-14 border-b border-border bg-background z-10 flex items-center justify-between px-4">
      {/* Team selector */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 h-8 pl-2 pr-2.5 rounded-md hover:bg-muted/60 transition-colors outline-none group">
          <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center text-[10px] font-bold font-mono text-primary">
            P
          </div>
          <span className="text-[12.5px] font-medium text-foreground">Personal Team</span>
          <CaretDown className="w-3 h-3 text-muted-foreground/60" weight="bold" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52 rounded-lg p-1 bg-popover border border-border shadow-md">
          <DropdownMenuItem className="text-[13px] rounded-md cursor-pointer">Scientific_Workgroup_01</DropdownMenuItem>
          <DropdownMenuItem className="text-[13px] rounded-md cursor-pointer">Nexus_Project</DropdownMenuItem>
          <div className="h-px bg-border my-1" />
          <DropdownMenuItem className="text-[13px] rounded-md text-primary font-medium cursor-pointer">
            + Create team
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Notifications"
          className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          <Bell className="w-4 h-4" weight="regular" />
        </button>
        <button
          type="button"
          className="h-8 px-2.5 flex items-center gap-1.5 rounded-md text-[12.5px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          <Question className="w-3.5 h-3.5" weight="regular" />
          Help
        </button>
        <button
          type="button"
          className="h-8 px-2.5 flex items-center gap-1.5 rounded-md text-[12.5px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          <FileText className="w-3.5 h-3.5" weight="regular" />
          Docs
        </button>
        <button
          type="button"
          className="ml-1 h-8 px-3.5 bg-primary text-primary-foreground text-[12.5px] font-semibold rounded-md hover:bg-primary/90 transition-colors"
        >
          Upgrade
        </button>
      </div>
    </header>
  );
}
