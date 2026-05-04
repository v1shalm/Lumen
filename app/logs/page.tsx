"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Lightning, CheckCircle, WarningCircle, ChatCircle,
  type Icon as PhIcon,
} from "@phosphor-icons/react";

type LogType = "ingestion" | "synthesis" | "conflict" | "query";
type LogDate = "today" | "yesterday" | "earlier";

type LogEntry = {
  id: number;
  type: LogType;
  title: string;
  detail: string;
  source?: string;
  time: string;
  date: LogDate;
};

const LOGS: LogEntry[] = [
  { id: 1,  type: "synthesis", title: "Synthesis complete",     detail: "Post-quantum cryptography knowledge base synthesised. 12 sources reconciled.", source: "nature_paper_2024.pdf + 11 others", time: "12:47", date: "today" },
  { id: 2,  type: "conflict",  title: "Contradiction detected", detail: "Tritium breeding ratio claim in source #4 conflicts with source #8.", source: "helion_2025.pdf vs iter_model.pdf", time: "12:31", date: "today" },
  { id: 3,  type: "query",     title: "Query executed",         detail: "“Summarise contradictions in fusion energy sources”", source: "Workspace chat", time: "12:29", date: "today" },
  { id: 4,  type: "ingestion", title: "Source ingested",        detail: "Extracted 4,200 words, 14 entities, 3 tables.", source: "nature.com/articles/s41586-024", time: "11:55", date: "today" },
  { id: 5,  type: "query",     title: "Query executed",         detail: "“Compare error rates across qubit architectures”", source: "Workspace chat", time: "11:42", date: "today" },
  { id: 6,  type: "ingestion", title: "Source ingested",        detail: "Parsed 1.2 MB PDF. 6,800 words extracted.", source: "market_intel_q1_2026.pdf", time: "10:14", date: "today" },
  { id: 7,  type: "synthesis", title: "Synthesis complete",     detail: "LLM hallucination mitigation knowledge base updated. 24 sources.", source: "RAG corpus", time: "09:33", date: "today" },
  { id: 8,  type: "ingestion", title: "Source ingested",        detail: "Cloned 24 files from GitHub repository.", source: "Competitor analysis repo", time: "21:04", date: "yesterday" },
  { id: 9,  type: "conflict",  title: "Contradiction detected", detail: "QuantumScape energy density claim lacks third-party verification.", source: "quantumscape_whitepaper.pdf", time: "18:22", date: "yesterday" },
  { id: 10, type: "query",     title: "Query executed",         detail: "“Generate synthesis report for solid-state battery research”", source: "Workspace chat", time: "17:58", date: "yesterday" },
  { id: 11, type: "ingestion", title: "Source ingested",        detail: "Scraped 3 pages. 2,400 words extracted.", source: "arxiv.org/abs/2104.xxxxx", time: "14:11", date: "yesterday" },
  { id: 12, type: "synthesis", title: "Initial workspace sync", detail: "14 sources indexed. Knowledge graph built with 84 relationships.", source: "Full workspace", time: "09:00", date: "earlier" },
];

const TYPE_META: Record<LogType, { icon: PhIcon; label: string; tint: string }> = {
  ingestion: { icon: Lightning,    label: "Ingestion", tint: "text-emerald-700"  },
  synthesis: { icon: CheckCircle,  label: "Synthesis", tint: "text-foreground"    },
  conflict:  { icon: WarningCircle, label: "Conflict",  tint: "text-primary"       },
  query:     { icon: ChatCircle,   label: "Query",     tint: "text-muted-foreground" },
};

const FILTERS: { id: LogType | "all"; label: string }[] = [
  { id: "all",       label: "All" },
  { id: "ingestion", label: "Ingestion" },
  { id: "synthesis", label: "Synthesis" },
  { id: "conflict",  label: "Conflicts" },
  { id: "query",     label: "Queries" },
];

const GROUPS: { key: LogDate; label: string }[] = [
  { key: "today",     label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "earlier",   label: "Earlier" },
];

export default function ActivityLogs() {
  const [filter, setFilter] = useState<LogType | "all">("all");
  const filtered = LOGS.filter((l) => filter === "all" || l.type === filter);

  return (
    <div className="max-w-[1500px] mx-auto -mt-2 pb-12">
      {/* Page header */}
      <header className="pt-2 pb-8">
        <h1 className="text-[clamp(2.5rem,4.5vw,3.25rem)] font-semibold tracking-[-0.025em] text-foreground leading-[1.05]">
          Activity
        </h1>
        <p className="mt-3 text-[14px] text-muted-foreground tracking-tight">
          Everything Lumen has done in your workspace, newest first.
        </p>
      </header>

      {/* Filter pill group */}
      <div className="inline-flex items-center gap-0.5 p-1 bg-card rounded-lg card-shadow mb-6">
        {FILTERS.map((f) => {
          const isActive = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "h-8 px-3 rounded-md text-[12.5px] font-medium transition-colors duration-150",
                isActive
                  ? "bg-muted/70 text-foreground"
                  : "text-foreground/65 hover:text-foreground hover:bg-muted/40"
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Grouped event timeline */}
      {filtered.length > 0 ? (
        <div className="space-y-8">
          {GROUPS.map((group) => {
            const groupLogs = filtered.filter((l) => l.date === group.key);
            if (groupLogs.length === 0) return null;
            return (
              <section key={group.key} className="bg-card rounded-2xl card-shadow overflow-hidden">
                <div className="px-6 py-3 border-b border-border flex items-center justify-between">
                  <h2 className="text-[14px] font-semibold text-foreground tracking-tight">
                    {group.label}
                  </h2>
                  <span className="text-[11.5px] text-muted-foreground/70 tabular-nums">
                    {groupLogs.length} events
                  </span>
                </div>
                <ul>
                  {groupLogs.map((log, i, arr) => {
                    const meta = TYPE_META[log.type];
                    const Icon = meta.icon;
                    return (
                      <li
                        key={log.id}
                        className={cn(
                          "grid grid-cols-[64px_36px_1fr_auto] items-center gap-4 px-6 py-3.5 group hover:bg-muted/40 transition-colors",
                          i < arr.length - 1 && "border-b border-border/60"
                        )}
                      >
                        <span className="text-[12.5px] text-muted-foreground/70 tabular-nums">
                          {log.time}
                        </span>
                        <span className={cn("flex items-center justify-center", meta.tint)}>
                          <Icon className="w-4 h-4" weight={log.type === "conflict" ? "fill" : "regular"} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[13.5px] font-semibold text-foreground truncate">
                            {log.title}
                          </p>
                          <p className="text-[12.5px] text-muted-foreground truncate">
                            {log.detail}
                          </p>
                        </div>
                        {log.source && (
                          <span className="hidden md:inline-block text-[11.5px] text-muted-foreground/70 truncate max-w-[260px]">
                            {log.source}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="bg-card rounded-2xl card-shadow py-16 text-center">
          <p className="text-[13.5px] text-muted-foreground">No events match this filter.</p>
        </div>
      )}
    </div>
  );
}
