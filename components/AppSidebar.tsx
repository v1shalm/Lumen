"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House, SquaresFour, CheckCircle, Graph, Gear,
  MagnifyingGlass, CaretUpDown,
  type Icon as PhIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type NavItem = {
  name: string;
  icon: PhIcon;
  href: string;
};

const PINNED_NAV: NavItem[] = [
  { name: "Overview",  icon: House,        href: "/overview" },
  { name: "Ingestion", icon: SquaresFour,  href: "/" },
  { name: "Insights",  icon: CheckCircle,  href: "/results" },
  { name: "Graph",     icon: Graph,        href: "/graph" },
  { name: "Settings",  icon: Gear,         href: "/settings" },
];

type Workspace = {
  name: string;
  swatch: string;
  shape: "square" | "diamond";
  href: string;
};

const WORKSPACES: Workspace[] = [
  { name: "All Research",      swatch: "bg-foreground",                shape: "square",  href: "/workspace/all" },
  { name: "Quantum Computing", swatch: "bg-primary",                   shape: "diamond", href: "/workspace/quantum" },
  { name: "Market Intel Q1",   swatch: "bg-[oklch(0.55_0.18_250)]",    shape: "diamond", href: "/workspace/market" },
];

const PINNED_SOURCES = [
  { name: "nature_paper_2024.pdf",     href: "/" },
  { name: "arxiv_whitepaper_2024.pdf", href: "/" },
];

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar";

export function AppSidebar() {
  const pathname = usePathname();
  const activeWorkspace = "/workspace/quantum";

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-60 bg-sidebar flex flex-col z-20 border-r border-sidebar-border">
      {/* Workspace + identity switcher */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <button
          type="button"
          className={cn(
            "w-full h-11 flex items-center gap-2.5 pl-1.5 pr-2 rounded-md bg-card card-shadow text-left",
            "transition-shadow duration-150 ease-out hover:card-shadow-md active:card-shadow",
            FOCUS_RING
          )}
        >
          <div className="w-8 h-8 rounded-md bg-foreground flex items-center justify-center text-[12px] font-semibold text-background shrink-0">
            V
          </div>
          <span className="flex-1 min-w-0">
            <span className="block text-[13px] font-semibold text-foreground truncate leading-tight">
              Vishal Maurya
            </span>
            <span className="block text-[11px] text-muted-foreground truncate leading-tight">
              Vishal&apos;s Workspace
            </span>
          </span>
          <CaretUpDown className="w-3 h-3 text-muted-foreground/60 shrink-0" weight="bold" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pb-3 shrink-0">
        <button
          type="button"
          className={cn(
            "w-full h-9 flex items-center gap-2 px-3 bg-muted hover:bg-muted/80 active:bg-muted rounded-md text-[13px] text-muted-foreground/80 transition-colors duration-150",
            FOCUS_RING
          )}
        >
          <MagnifyingGlass className="w-4 h-4 shrink-0" weight="regular" />
          <span className="flex-1 text-left">Search</span>
          <kbd className="text-[10px] font-mono text-muted-foreground/40 leading-none px-1 py-0.5 border border-border rounded-sm">/</kbd>
        </button>
      </div>

      {/* Pinned nav */}
      <nav className="px-2 pb-3">
        <ul className="space-y-px">
          {PINNED_NAV.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 h-9 px-3 rounded-md text-[13.5px]",
                    "transition-[background-color,box-shadow,color] duration-150 ease-out",
                    FOCUS_RING,
                    isActive
                      ? "bg-card text-foreground font-semibold card-shadow"
                      : "text-foreground/75 font-medium hover:text-foreground hover:bg-muted/50"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon
                    className={cn(
                      "w-[17px] h-[17px] shrink-0",
                      isActive ? "text-foreground" : "text-foreground/65"
                    )}
                    weight={isActive ? "fill" : "regular"}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Scroll region for pinned + workspaces */}
      <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-5">
        <Section label="Pinned sources">
          <ul className="space-y-px">
            {PINNED_SOURCES.map((f) => (
              <li key={f.name}>
                <Link
                  href={f.href}
                  className={cn(
                    "flex items-center gap-2.5 h-7 px-2.5 rounded-md text-[12.5px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-150",
                    FOCUS_RING
                  )}
                >
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/40 shrink-0" />
                  <span className="truncate">{f.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        <Section label="Workspaces">
          <ul className="space-y-px">
            {WORKSPACES.map((ws) => {
              const isActive = ws.href === activeWorkspace;
              return (
                <li key={ws.name}>
                  <Link
                    href={ws.href}
                    className={cn(
                      "flex items-center gap-2.5 h-8 px-2.5 rounded-md text-[13px]",
                      "transition-[background-color,box-shadow,color] duration-150 ease-out",
                      FOCUS_RING,
                      isActive
                        ? "bg-card text-foreground font-semibold card-shadow"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Swatch color={ws.swatch} shape={ws.shape} />
                    <span className="truncate">{ws.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Section>
      </div>
    </aside>
  );
}

/* ───── subcomponents ───── */

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="px-2.5 mb-1 text-[11.5px] font-semibold text-muted-foreground/70 tracking-tight">
        {label}
      </p>
      {children}
    </div>
  );
}

function Swatch({ color, shape }: { color: string; shape: "square" | "diamond" }) {
  if (shape === "diamond") {
    return (
      <span className="w-[14px] h-[14px] flex items-center justify-center shrink-0">
        <span className={cn("w-[10px] h-[10px] rotate-45 rounded-[2px]", color)} />
      </span>
    );
  }
  return <span className={cn("w-[12px] h-[12px] rounded-[3px] shrink-0", color)} />;
}
