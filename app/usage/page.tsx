"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "@phosphor-icons/react";
import { StatTile } from "@/components/primitives/StatTile";

const PERIOD_LABEL = "May 1 – May 28, 2026";

const STATS = [
  { label: "Synthesis runs",  value: "1,284",  hint: "+18% from last month" },
  { label: "Tokens used",     value: "8.2M",   hint: "63% of your monthly limit" },
  { label: "Sources added",   value: "342",    hint: "Across 14 workspaces" },
  { label: "Average response", value: "1.4s",   hint: "95% of requests are this fast or faster" },
];

// Mock 14-day usage values (relative 0–1)
const SERIES = [0.32, 0.28, 0.45, 0.41, 0.62, 0.55, 0.58, 0.71, 0.66, 0.78, 0.82, 0.74, 0.91, 0.86];

const RECENT = [
  { date: "May 28", endpoint: "/synthesis", calls: 184, tokens: "412K", status: "200" },
  { date: "May 27", endpoint: "/ingest",    calls:  62, tokens:  "84K", status: "200" },
  { date: "May 26", endpoint: "/synthesis", calls: 151, tokens: "338K", status: "200" },
  { date: "May 25", endpoint: "/graph",     calls:  24, tokens:  "12K", status: "200" },
  { date: "May 24", endpoint: "/synthesis", calls: 142, tokens: "318K", status: "200" },
  { date: "May 23", endpoint: "/ingest",    calls:  88, tokens: "118K", status: "200" },
  { date: "May 22", endpoint: "/synthesis", calls: 117, tokens: "262K", status: "200" },
];

export default function UsagePage() {
  return (
    <div className="max-w-[1500px] mx-auto -mt-2 pb-12">
      {/* Page header */}
      <header className="pt-2 pb-8 flex items-end justify-between gap-6">
        <div>
          <h1 className="text-[clamp(2.5rem,4.5vw,3.25rem)] font-semibold tracking-[-0.025em] text-foreground leading-[1.05]">
            Usage
          </h1>
          <p className="mt-3 text-[14px] text-muted-foreground tracking-tight">
            Your usage this month · {PERIOD_LABEL}
          </p>
        </div>
      </header>

      {/* Stat grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {STATS.map((s) => (
          <StatTile key={s.label} label={s.label} value={s.value} hint={s.hint} className="card-shadow" />
        ))}
      </section>

      {/* Two-column body */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
        {/* Usage chart card */}
        <section className="bg-card rounded-2xl card-shadow overflow-hidden">
          <div className="px-7 pt-6 pb-2 flex items-baseline justify-between">
            <div>
              <h2 className="text-[16px] font-semibold text-foreground tracking-tight">
                Daily synthesis runs
              </h2>
              <p className="text-[12.5px] text-muted-foreground mt-1">
                Last 14 days
              </p>
            </div>
            <span className="text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              Export →
            </span>
          </div>
          <div className="px-7 pb-7 pt-4">
            <Chart series={SERIES} />
          </div>
        </section>

        {/* Quota card */}
        <aside className="bg-card rounded-2xl card-shadow overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <h2 className="text-[14px] font-semibold text-foreground tracking-tight">Monthly quota</h2>
            <p className="text-[11.5px] text-muted-foreground mt-0.5">Resets June 1, 2026.</p>
          </div>
          <div className="px-5 pb-5 space-y-4">
            <QuotaBar label="Tokens"    used={8.2}  cap={13.0} unit="M" />
            <QuotaBar label="Sources"   used={342}  cap={500}  unit="" />
            <QuotaBar label="API calls" used={1284} cap={2000} unit="" />
          </div>
          <div className="border-t border-border px-5 py-3">
            <button className="text-[12.5px] font-semibold text-primary hover:text-primary/80 transition-colors">
              Upgrade plan →
            </button>
          </div>
        </aside>
      </div>

      {/* Recent calls table */}
      <section className="bg-card rounded-2xl card-shadow overflow-hidden mt-6">
        <div className="px-6 py-3 border-b border-border flex items-baseline justify-between">
          <h2 className="text-[14px] font-semibold text-foreground tracking-tight">Recent calls</h2>
          <span className="text-[11.5px] text-muted-foreground/70 tabular-nums">{RECENT.length} entries</span>
        </div>

        <div className="grid grid-cols-[100px_minmax(0,1fr)_120px_120px_80px_44px] items-center gap-4 px-6 py-3 border-b border-border text-[11.5px] font-semibold text-muted-foreground tracking-tight">
          <span>Date</span>
          <span>Endpoint</span>
          <span className="text-right">Calls</span>
          <span className="text-right">Tokens</span>
          <span>Status</span>
          <span></span>
        </div>

        <ul>
          {RECENT.map((row, i, arr) => (
            <li
              key={`${row.date}-${row.endpoint}`}
              className={cn(
                "grid grid-cols-[100px_minmax(0,1fr)_120px_120px_80px_44px] items-center gap-4 px-6 py-3.5 group hover:bg-muted/40 transition-colors",
                i < arr.length - 1 && "border-b border-border/60"
              )}
            >
              <span className="text-[12.5px] text-muted-foreground tabular-nums">{row.date}</span>
              <span className="text-[13px] text-foreground font-medium">
                <code className="font-mono">{row.endpoint}</code>
              </span>
              <span className="text-right text-[13px] font-semibold text-foreground tabular-nums">{row.calls}</span>
              <span className="text-right text-[13px] text-muted-foreground tabular-nums">{row.tokens}</span>
              <span className="text-[12px] font-medium text-emerald-700 tabular-nums">{row.status}</span>
              <span className="flex justify-end">
                <ArrowUpRight
                  className="w-4 h-4 text-muted-foreground/30 group-hover:text-foreground transition-colors"
                  weight="regular"
                />
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ─────────── Subcomponents ─────────── */

function Chart({ series }: { series: number[] }) {
  // Simple SVG bar chart, viewBox 100 wide × 32 tall
  const max = Math.max(...series);
  const w = 100;
  const h = 32;
  const barW = w / series.length - 0.6;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-40">
        {series.map((v, i) => {
          const barH = (v / max) * (h - 2);
          return (
            <rect
              key={i}
              x={i * (w / series.length) + 0.3}
              y={h - barH}
              width={barW}
              height={barH}
              rx={0.6}
              fill="var(--primary)"
              opacity={0.85}
            />
          );
        })}
      </svg>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground/60 tabular-nums mt-2">
        <span>14d ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}

function QuotaBar({
  label, used, cap, unit,
}: {
  label: string;
  used: number;
  cap: number;
  unit: string;
}) {
  const pct = Math.min(100, (used / cap) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-[12.5px]">
        <span className="text-foreground font-medium">{label}</span>
        <span className="text-muted-foreground tabular-nums">
          <span className="text-foreground font-semibold">{used}{unit}</span>
          <span className="text-muted-foreground/60"> / {cap}{unit}</span>
        </span>
      </div>
      <div className="w-full h-1.5 bg-muted/60 rounded-full overflow-hidden">
        <div
          className="h-full bg-foreground rounded-full transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
