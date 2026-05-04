"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, X } from "@phosphor-icons/react";
import { Button } from "@/components/primitives/Button";
import { toast } from "@/lib/toast";

type Status = "Verified" | "Contradiction" | "Incomplete";
type SourceType = "PDF" | "WEB" | "GIT" | "DOC";

type Source = {
  type: SourceType;
  name: string;
  publisher?: string;
};

type Insight = {
  id: number;
  title: string;
  finding: string;
  sources: Source[];
  status: Status;
  date: string;
  ageHours: number;
  score: number;
};

const INSIGHTS: Insight[] = [
  {
    id: 2,
    title: "Fusion energy commercial reactor timelines",
    finding:
      "Multiple sources disagree on tritium breeding ratios for HELION versus ITER, with HELION claiming 1.08× and ITER models suggesting 0.91× — a gap large enough to invalidate one of the projected timelines.",
    sources: [
      { type: "PDF", name: "helion_2025.pdf",          publisher: "HELION Energy" },
      { type: "PDF", name: "iter_model.pdf",           publisher: "ITER" },
      { type: "PDF", name: "mckinsey_fusion_2025.pdf", publisher: "McKinsey" },
      { type: "WEB", name: "nature.com/articles/s415", publisher: "Nature" },
      { type: "PDF", name: "doe_fusion_outlook.pdf",   publisher: "U.S. DOE" },
      { type: "DOC", name: "internal_review_q1.docx",  publisher: "Internal" },
    ],
    status: "Contradiction",
    date: "5 hours ago",
    ageHours: 5,
    score: 82,
  },
  {
    id: 1,
    title: "Post-quantum cryptography standards 2025",
    finding:
      "NIST has finalised three primary algorithms (Kyber, Dilithium, SPHINCS+); transition roadmap shifted from Q1 2027 to Q3 2026 across all FIPS-validated environments.",
    sources: [
      { type: "PDF", name: "nist_fips_203.pdf",           publisher: "NIST" },
      { type: "PDF", name: "nist_fips_204.pdf",           publisher: "NIST" },
      { type: "WEB", name: "csrc.nist.gov/projects/pqc",  publisher: "NIST" },
      { type: "PDF", name: "ietf_draft_pqc_tls.pdf",      publisher: "IETF" },
      { type: "GIT", name: "open-quantum-safe/liboqs",    publisher: "GitHub" },
      { type: "PDF", name: "nature_paper_2024.pdf",       publisher: "Nature" },
    ],
    status: "Verified",
    date: "2 hours ago",
    ageHours: 2,
    score: 98,
  },
  {
    id: 3,
    title: "Solid-state battery energy density benchmarks",
    finding:
      "QuantumScape's reported 380 Wh/kg lacks cathode thickness verification from any third-party laboratory; independent measurements are limited to internal data only.",
    sources: [
      { type: "PDF", name: "quantumscape_whitepaper.pdf", publisher: "QuantumScape" },
      { type: "PDF", name: "samsung_sdi_q3.pdf",          publisher: "Samsung SDI" },
      { type: "WEB", name: "ieee.org/spectrum/batteries", publisher: "IEEE Spectrum" },
    ],
    status: "Incomplete",
    date: "1 day ago",
    ageHours: 24,
    score: 91,
  },
  {
    id: 4,
    title: "LLM hallucination mitigation techniques",
    finding:
      "RAG with reflection loops shows 40% reduction in factual error rate over zero-shot chain-of-thought across 24 evaluated benchmarks.",
    sources: [
      { type: "PDF", name: "arxiv_2024_rag.pdf",          publisher: "Arxiv" },
      { type: "PDF", name: "anthropic_eval_2024.pdf",     publisher: "Anthropic" },
      { type: "PDF", name: "openai_truthfulqa_v2.pdf",    publisher: "OpenAI" },
      { type: "GIT", name: "stanford-crfm/helm",          publisher: "Stanford CRFM" },
    ],
    status: "Verified",
    date: "2 days ago",
    ageHours: 48,
    score: 95,
  },
];

/** Selection rule for hero — most pressing insight to show at top.
 *  Newest contradiction wins; falls back to newest verified. */
function pickHero(rows: Insight[]): Insight {
  const contradictions = rows.filter((r) => r.status === "Contradiction").sort((a, b) => a.ageHours - b.ageHours);
  if (contradictions.length) return contradictions[0];
  return [...rows].sort((a, b) => a.ageHours - b.ageHours)[0];
}

/* ═════════════════════════════════════════════════════════════════════
 * Router — toggles between v1 (current editorial) and v2 (taste-skill)
 * ═════════════════════════════════════════════════════════════════════ */

type InsightsVersion = "v1" | "v2";
const INSIGHTS_VERSION_KEY = "lumen-insights-version";

export default function Insights() {
  const [version, setVersion] = useState<InsightsVersion>("v1");

  useEffect(() => {
    const saved = localStorage.getItem(INSIGHTS_VERSION_KEY);
    if (saved === "v1" || saved === "v2") setVersion(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem(INSIGHTS_VERSION_KEY, version);
  }, [version]);

  return (
    <>
      {/* Dev-time version toggle — same pattern as Ingestion */}
      <div className="max-w-[1500px] mx-auto pt-2 mb-3 flex justify-end">
        <div className="inline-flex items-center gap-0.5 p-0.5 bg-card border border-border rounded-md text-[11.5px]">
          <span className="px-2 text-muted-foreground/70 font-medium tracking-tight">design</span>
          {(["v1", "v2"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVersion(v)}
              className={cn(
                "h-6 px-2.5 rounded-[5px] font-mono font-semibold transition-colors",
                version === v
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {version === "v1" ? <InsightsV1 /> : <InsightsV2 />}
    </>
  );
}

/* ═════════════════════════════════════════════════════════════════════
 * V1 — current editorial layout (cards + hero + grid)
 * ═════════════════════════════════════════════════════════════════════ */

function InsightsV1() {
  const [selected, setSelected] = useState<Insight | null>(null);
  const [focusIdx, setFocusIdx] = useState<number>(-1);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  // Drawer keyboard escape
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [selected]);

  const hero = pickHero(INSIGHTS);
  const rest = INSIGHTS.filter((i) => i.id !== hero.id);
  const ordered = [hero, ...rest]; // index 0 = hero, 1..n = grid

  const counts = {
    verified:      INSIGHTS.filter((r) => r.status === "Verified").length,
    contradiction: INSIGHTS.filter((r) => r.status === "Contradiction").length,
    incomplete:    INSIGHTS.filter((r) => r.status === "Incomplete").length,
  };

  // Card-grid keyboard nav: ↑/↓/←/→ to traverse, Enter/Space to open
  const moveFocus = useCallback((next: number) => {
    if (next < 0 || next >= ordered.length) return;
    setFocusIdx(next);
    cardRefs.current[next]?.focus();
  }, [ordered.length]);

  const handleGridKey = (e: React.KeyboardEvent, idx: number) => {
    // Hero is full-width (idx 0), grid cards are 2-col starting at idx 1
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveFocus(idx === 0 ? 1 : Math.min(ordered.length - 1, idx + 2));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveFocus(idx <= 2 ? 0 : idx - 2);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      moveFocus(Math.min(ordered.length - 1, idx + 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      moveFocus(Math.max(0, idx - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelected(ordered[idx]);
    }
  };

  return (
    <div className="max-w-[1500px] mx-auto -mt-2 pb-12">
      {/* Page header */}
      <header className="pt-2 pb-8 animate-enter" style={{ ["--i" as string]: 0 }}>
        <h1 className="text-[clamp(2.5rem,4.5vw,3.25rem)] font-semibold tracking-[-0.025em] text-foreground leading-[1.05]">
          Insights
        </h1>
        <p className="mt-3 text-[14px] text-muted-foreground tracking-tight">
          <span className="text-foreground tabular-nums font-semibold">{counts.verified}</span>
          <span className="text-muted-foreground/70"> verified</span>
          <span className="text-muted-foreground/30 mx-2">·</span>
          <span className="text-foreground tabular-nums font-semibold">{counts.contradiction}</span>
          <span className="text-muted-foreground/70"> contradictions</span>
          <span className="text-muted-foreground/30 mx-2">·</span>
          <span className="text-foreground tabular-nums font-semibold">{counts.incomplete}</span>
          <span className="text-muted-foreground/70"> incomplete</span>
          <span className="text-muted-foreground/30 mx-2">·</span>
          <span className="text-muted-foreground/50 text-[12.5px]">
            <kbd className="font-mono text-[10.5px] px-1 py-0.5 rounded-sm border border-border bg-muted/40 text-muted-foreground">↑↓←→</kbd>
            <span className="ml-1.5">to navigate</span>
          </span>
        </p>
      </header>

      {/* Hero insight — editorial 2-col, distinct from grid */}
      <section
        className="mb-6 animate-enter"
        style={{ ["--i" as string]: 1 }}
      >
        <HeroInsightCard
          insight={hero}
          ref={(el) => { cardRefs.current[0] = el; }}
          onOpen={() => setSelected(hero)}
          onKeyDown={(e) => handleGridKey(e, 0)}
          isFocused={focusIdx === 0}
        />
      </section>

      {/* Remaining insights — two columns on wide screens */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {rest.map((row, i) => {
          const idx = i + 1;
          return (
            <div
              key={row.id}
              className="animate-enter"
              style={{ ["--i" as string]: idx + 1 }}
            >
              <InsightCard
                insight={row}
                ref={(el) => { cardRefs.current[idx] = el; }}
                onOpen={() => setSelected(row)}
                onKeyDown={(e) => handleGridKey(e, idx)}
                isFocused={focusIdx === idx}
              />
            </div>
          );
        })}
      </section>

      {/* Detail drawer */}
      {selected && <DetailDrawer insight={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
 * V2 — Linear-style dense rows with inline expand
 *
 *   Reference: linear.app issue list. Bold within the editorial frame —
 *   confident type, hard left alignment, status as colored block, mono
 *   only for IDs/timestamps, density 12-15 rows per viewport.
 *
 *   Lumen overrides on Linear:
 *     • Warm orange primary (no Linear purple)
 *     • Light theme primary (Linear is dark by default)
 *     • Geist + Phosphor (no Inter, no Lucide)
 * ═════════════════════════════════════════════════════════════════════ */

type StatusFilter = "all" | Status;

function InsightsV2() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [drawerInsight, setDrawerInsight] = useState<Insight | null>(null);
  const [focusIdx, setFocusIdx] = useState<number>(-1);
  const rowRefs = useRef<(HTMLElement | null)[]>([]);

  // Order: contradictions first, then by recency
  const ordered = [...INSIGHTS].sort((a, b) => {
    const aC = a.status === "Contradiction" ? 0 : 1;
    const bC = b.status === "Contradiction" ? 0 : 1;
    if (aC !== bC) return aC - bC;
    return a.ageHours - b.ageHours;
  });

  const filtered = ordered.filter((i) => filter === "all" || i.status === filter);

  // Drawer escape
  useEffect(() => {
    if (!drawerInsight) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDrawerInsight(null); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [drawerInsight]);

  // Page-level keyboard nav: j/k, ArrowDown/Up to move; Enter to expand inline; o to open drawer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't intercept while drawer open or while typing in an input
      if (drawerInsight) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setFocusIdx((i) => {
          const next = Math.min(filtered.length - 1, (i < 0 ? 0 : i + 1));
          rowRefs.current[next]?.focus();
          return next;
        });
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setFocusIdx((i) => {
          const next = Math.max(0, (i < 0 ? 0 : i - 1));
          rowRefs.current[next]?.focus();
          return next;
        });
      } else if (e.key === "Enter" && focusIdx >= 0) {
        e.preventDefault();
        const row = filtered[focusIdx];
        if (row) setExpandedId((cur) => (cur === row.id ? null : row.id));
      } else if ((e.key === "o" || e.key === "O") && focusIdx >= 0) {
        e.preventDefault();
        const row = filtered[focusIdx];
        if (row) setDrawerInsight(row);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerInsight, filtered, focusIdx]);

  const counts = {
    all:           INSIGHTS.length,
    Verified:      INSIGHTS.filter((r) => r.status === "Verified").length,
    Contradiction: INSIGHTS.filter((r) => r.status === "Contradiction").length,
    Incomplete:    INSIGHTS.filter((r) => r.status === "Incomplete").length,
  };

  return (
    <div className="max-w-[1500px] mx-auto -mt-2 pb-12">
      {/* Compact masthead — Linear-style, big bold title, terse subtitle */}
      <header
        className="pt-2 pb-5 animate-enter"
        style={{ ["--i" as string]: 0 }}
      >
        <div className="flex items-baseline gap-3">
          <h1 className="text-[32px] font-semibold tracking-[-0.022em] text-foreground leading-none">
            Insights
          </h1>
          <span className="font-mono tabular-nums text-[12px] text-muted-foreground/60">
            {INSIGHTS.length}
          </span>
        </div>
      </header>

      {/* Filter bar — pills + sort, sits in a thin border-b strip not a card */}
      <div
        className="flex items-center gap-2 py-2 border-y border-border animate-enter"
        style={{ ["--i" as string]: 1 }}
      >
        <FilterPill active={filter === "all"}            onClick={() => setFilter("all")}            count={counts.all}>All</FilterPill>
        <FilterPill active={filter === "Contradiction"}  onClick={() => setFilter("Contradiction")}  count={counts.Contradiction} tone="primary">Contradictions</FilterPill>
        <FilterPill active={filter === "Verified"}       onClick={() => setFilter("Verified")}       count={counts.Verified}      tone="success">Verified</FilterPill>
        <FilterPill active={filter === "Incomplete"}     onClick={() => setFilter("Incomplete")}     count={counts.Incomplete}    tone="muted">Incomplete</FilterPill>
        <span className="ml-auto text-[11.5px] text-muted-foreground/60 tabular-nums tracking-tight hidden md:flex items-center gap-3">
          <span>Sort: <span className="text-foreground/80 font-medium">Recency</span></span>
          <span className="text-muted-foreground/30">·</span>
          <KbdHint>j</KbdHint><KbdHint>k</KbdHint>
          <span>navigate</span>
          <KbdHint>↵</KbdHint>
          <span>expand</span>
          <KbdHint>o</KbdHint>
          <span>open</span>
        </span>
      </div>

      {/* Row list — Linear-style dense rows */}
      <div role="list" className="divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-[13px] text-muted-foreground">
            No insights match this filter.
          </div>
        ) : (
          filtered.map((insight, i) => (
            <V2Row
              key={insight.id}
              insight={insight}
              ref={(el) => { rowRefs.current[i] = el; }}
              id={`LMN-${insight.id.toString().padStart(3, "0")}`}
              isFocused={focusIdx === i}
              isExpanded={expandedId === insight.id}
              onClick={() => setExpandedId((cur) => (cur === insight.id ? null : insight.id))}
              onOpenDrawer={() => setDrawerInsight(insight)}
              style={{ ["--i" as string]: i + 2 } as React.CSSProperties}
            />
          ))
        )}
      </div>

      {/* Detail drawer (shared) */}
      {drawerInsight && <DetailDrawer insight={drawerInsight} onClose={() => setDrawerInsight(null)} />}
    </div>
  );
}

/* ─────────── V2 atoms ─────────── */

function KbdHint({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="font-mono text-[10.5px] px-1 py-0.5 rounded-sm border border-border bg-muted/40 text-muted-foreground tabular-nums leading-none">
      {children}
    </kbd>
  );
}

function FilterPill({
  active, onClick, children, count, tone = "neutral",
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count: number;
  tone?: "neutral" | "primary" | "success" | "muted";
}) {
  const dotColor =
    tone === "primary" ? "bg-primary" :
    tone === "success" ? "bg-emerald-600" :
    tone === "muted"   ? "bg-foreground/20" :
                         null;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-7 inline-flex items-center gap-1.5 px-2.5 rounded-md text-[12.5px] font-medium tracking-tight transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      {dotColor && <span className={cn("w-1.5 h-1.5 rounded-full", dotColor, active && "ring-2 ring-background/30")} />}
      <span>{children}</span>
      <span className={cn(
        "tabular-nums font-mono text-[10.5px]",
        active ? "text-background/60" : "text-muted-foreground/50"
      )}>
        {count}
      </span>
    </button>
  );
}

function statusBlock(status: Status) {
  return status === "Contradiction" ? "bg-primary"        :
         status === "Incomplete"    ? "bg-foreground/25"   :
                                      "bg-emerald-600";
}

const V2Row = React.forwardRef<
  HTMLElement,
  {
    insight: Insight;
    id: string;
    isFocused: boolean;
    isExpanded: boolean;
    onClick: () => void;
    onOpenDrawer: () => void;
    style?: React.CSSProperties;
  }
>(function V2Row({ insight, id, isFocused, isExpanded, onClick, onOpenDrawer, style }, ref) {
  return (
    <article
      ref={ref}
      role="listitem"
      tabIndex={0}
      style={style}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "group relative animate-enter cursor-pointer",
        "focus:outline-none focus-visible:bg-muted/40",
        isFocused && "bg-muted/30",
        "transition-colors duration-150",
        "hover:bg-muted/30"
      )}
    >
      {/* Dense row — 56px, Linear scale */}
      <div className="grid grid-cols-[12px_72px_minmax(0,1fr)_auto_88px_88px_28px] items-center gap-3 h-14 pl-3 pr-3">
        {/* Status block — saturated brand color, bolder than a hairline rule */}
        <span aria-hidden className={cn("w-2 h-2 rounded-[2px]", statusBlock(insight.status))} />

        {/* ID — mono, confidently visible (not muted to 50%) */}
        <span className="font-mono text-[11.5px] tabular-nums tracking-tight text-foreground/70">
          {id}
        </span>

        {/* Title — semibold, ellipsis */}
        <span className="text-[13.5px] font-semibold text-foreground tracking-tight truncate">
          {insight.title}
        </span>

        {/* Source count chip — quiet inline */}
        <span className="text-[11px] tabular-nums text-muted-foreground tracking-tight whitespace-nowrap">
          {insight.sources.length} sources
        </span>

        {/* Confidence — small mono pill */}
        <span className="font-mono text-[11px] tabular-nums text-foreground/80 text-right">
          {insight.score}<span className="text-muted-foreground/50">%</span>
        </span>

        {/* Updated time — mono right-aligned */}
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground/70 text-right whitespace-nowrap">
          {insight.date}
        </span>

        {/* Hover affordance — open in drawer */}
        <button
          type="button"
          aria-label="Open in drawer"
          onClick={(e) => { e.stopPropagation(); onOpenDrawer(); }}
          className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 w-7 h-7 -mr-1 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted"
        >
          <ArrowUpRight className="w-3.5 h-3.5" weight="regular" />
        </button>
      </div>

      {/* Inline expand — Linear-style issue panel */}
      {isExpanded && (
        <div className="border-t border-border/60 bg-muted/15 px-3 py-5 pl-[100px] animate-overlay-in">
          <div className="max-w-[68ch] space-y-4">
            <p className="text-[14.5px] leading-[1.55] text-foreground tracking-tight">
              {insight.finding}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {insight.sources.map((src, i) => (
                <span
                  key={`${src.name}-${i}`}
                  className="inline-flex items-center gap-1.5 h-6 px-2 rounded bg-card border border-border text-[11px] tracking-tight"
                >
                  <span className="font-mono text-[9.5px] font-bold tracking-wider text-muted-foreground">
                    {src.type}
                  </span>
                  <span className="text-foreground/80">{src.publisher ?? src.name}</span>
                </span>
              ))}
            </div>
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onOpenDrawer(); }}
                className="text-[12px] font-semibold text-foreground hover:underline tracking-tight"
              >
                Open dossier
              </button>
              <span className="text-muted-foreground/30">·</span>
              <span className="text-[11.5px] text-muted-foreground/60 tracking-tight">
                Press <KbdHint>o</KbdHint> for full view
              </span>
            </div>
          </div>
        </div>
      )}
    </article>
  );
});

/* ─────────── Status copy + tone helpers ─────────── */

function statusLabel(status: Status) {
  return status === "Contradiction" ? "Contradiction surfaced"
       : status === "Incomplete"    ? "Evidence incomplete"
       :                              "Verified across sources";
}
function statusTone(status: Status) {
  return status === "Contradiction" ? "text-primary"
       : status === "Incomplete"    ? "text-muted-foreground"
       :                              "text-emerald-700";
}

/* ─────────── Hero card — editorial 2-col with signature numeral ─────────── */

type CardCommonProps = {
  insight: Insight;
  onOpen: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isFocused: boolean;
};

const HeroInsightCard = React.forwardRef<HTMLElement, CardCommonProps>(
  function HeroInsightCard({ insight, onOpen, onKeyDown, isFocused }, ref) {
    return (
      <article
        ref={ref}
        role="button"
        tabIndex={0}
        aria-label={`Open insight: ${insight.title}`}
        onClick={onOpen}
        onKeyDown={onKeyDown}
        className={cn(
          "group relative bg-card rounded-2xl cursor-pointer card-shadow hover:card-shadow-md transition-all duration-300 ease-out overflow-hidden",
          "hover:-translate-y-[1px] focus:outline-none focus:card-shadow-md focus:-translate-y-[1px]",
          "focus-visible:ring-2 focus-visible:ring-foreground/15 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          isFocused && "card-shadow-md -translate-y-[1px]"
        )}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[180px_minmax(0,1fr)] min-h-[280px]">
          {/* Left column — signature, status, score */}
          <div className="px-7 pt-7 pb-7 lg:pb-7 lg:border-r border-border/60 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <StatusDot status={insight.status} />
              <span className={cn("text-[11.5px] font-semibold tracking-tight", statusTone(insight.status))}>
                {statusLabel(insight.status)}
              </span>
            </div>

            {/* Big confidence numeral — editorial signature */}
            <div className="mt-auto">
              <p className="text-[64px] leading-none font-semibold tracking-[-0.04em] text-foreground tabular-nums">
                {insight.score}
                <span className="text-[28px] text-muted-foreground/60 font-medium align-top ml-0.5">%</span>
              </p>
              <p className="mt-1.5 text-[11.5px] text-muted-foreground tracking-tight">
                confidence
                <span className="mx-1.5 text-muted-foreground/30">·</span>
                <span className="tabular-nums">{insight.sources.length} sources</span>
              </p>
              <p className="mt-4 text-[11.5px] text-muted-foreground/60 tracking-tight">
                {insight.date}
              </p>
            </div>
          </div>

          {/* Right column — title, finding, sources */}
          <div className="px-8 pt-7 pb-7 flex flex-col">
            <h2 className="text-[15px] font-semibold text-foreground tracking-tight mb-3.5">
              {insight.title}
            </h2>
            <p className="text-[22px] leading-[1.4] font-medium text-foreground tracking-tight max-w-[58ch] flex-1">
              {insight.finding}
            </p>
            <div className="mt-6 flex items-end justify-between gap-4">
              <SourceDots sources={insight.sources} />
              <ArrowUpRight
                className="w-4 h-4 text-muted-foreground/30 group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 ease-out shrink-0"
                weight="regular"
              />
            </div>
          </div>
        </div>
      </article>
    );
  }
);

/* ─────────── Regular insight card — looser rhythm, no uppercase eyebrow ─────────── */

const InsightCard = React.forwardRef<HTMLElement, CardCommonProps>(
  function InsightCard({ insight, onOpen, onKeyDown, isFocused }, ref) {
    return (
      <article
        ref={ref}
        role="button"
        tabIndex={0}
        aria-label={`Open insight: ${insight.title}`}
        onClick={onOpen}
        onKeyDown={onKeyDown}
        className={cn(
          "group relative bg-card rounded-2xl cursor-pointer card-shadow hover:card-shadow-md transition-all duration-300 ease-out overflow-hidden flex flex-col min-h-[260px]",
          "hover:-translate-y-[1px] focus:outline-none focus:card-shadow-md focus:-translate-y-[1px]",
          "focus-visible:ring-2 focus-visible:ring-foreground/15 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          isFocused && "card-shadow-md -translate-y-[1px]"
        )}
      >
        <div className="flex-1 flex flex-col p-6">
          {/* Status sub-line */}
          <div className="flex items-center gap-2 mb-3">
            <StatusDot status={insight.status} />
            <span className={cn("text-[11.5px] font-semibold tracking-tight", statusTone(insight.status))}>
              {statusLabel(insight.status)}
            </span>
            <span className="text-muted-foreground/30">·</span>
            <span className="text-[11.5px] text-muted-foreground/70">{insight.date}</span>
          </div>

          {/* Title flows directly into finding — no uppercase eyebrow */}
          <h3 className="text-[14px] font-semibold text-foreground tracking-tight mb-2">
            {insight.title}
          </h3>
          <p className="text-[15.5px] leading-[1.5] font-medium text-foreground tracking-tight max-w-[50ch] flex-1">
            {insight.finding}
          </p>

          {/* Footer */}
          <div className="mt-5 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <SourceDots sources={insight.sources} />
              <p className="mt-2 text-[11.5px] text-muted-foreground/70 tracking-tight">
                <span className="text-foreground tabular-nums font-semibold">{insight.score}%</span>
                <span> confidence</span>
                <span className="mx-1.5 text-muted-foreground/30">·</span>
                <span className="tabular-nums">{insight.sources.length} sources</span>
              </p>
            </div>
            <ArrowUpRight
              className="w-4 h-4 text-muted-foreground/30 group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 ease-out shrink-0 mb-0.5"
              weight="regular"
            />
          </div>
        </div>
      </article>
    );
  }
);

/* ─────────── Source dots — small typed circles, visual density signal ─────────── */

function SourceDots({ sources }: { sources: Source[] }) {
  const visible = sources.slice(0, 6);
  const overflow = sources.length - visible.length;
  return (
    <div className="flex items-center -space-x-1 group-hover:[&>*]:-space-x-0">
      {visible.map((src, i) => (
        <span
          key={`${src.name}-${i}`}
          className="w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-[8.5px] font-mono font-bold text-foreground/70 ring-2 ring-card transition-all duration-300 ease-out group-hover:ml-0.5 first:group-hover:ml-0"
          style={{ transitionDelay: `${i * 25}ms` }}
          title={src.name}
        >
          {src.type[0]}
        </span>
      ))}
      {overflow > 0 && (
        <span
          className="w-6 h-6 rounded-full bg-muted/70 border border-border flex items-center justify-center text-[9px] font-semibold text-muted-foreground tabular-nums ring-2 ring-card transition-all duration-300 ease-out group-hover:ml-0.5"
          style={{ transitionDelay: `${visible.length * 25}ms` }}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}

/* ─────────── Status dot — small coloured circle, no chip, no glow ─────────── */

function StatusDot({ status }: { status: Status }) {
  const color =
    status === "Verified"      ? "bg-emerald-600" :
    status === "Contradiction" ? "bg-primary"     :
                                  "bg-muted-foreground/40";
  return <span aria-hidden className={cn("w-1.5 h-1.5 rounded-full shrink-0", color)} />;
}

/* ─────────── Detail drawer ─────────── */

function DetailDrawer({ insight, onClose }: { insight: Insight; onClose: () => void }) {
  const statusLabel =
    insight.status === "Contradiction" ? "Contradiction surfaced" :
    insight.status === "Incomplete"    ? "Evidence incomplete"    :
                                         "Verified across sources";
  const statusTone =
    insight.status === "Contradiction" ? "text-primary"           :
    insight.status === "Incomplete"    ? "text-muted-foreground"  :
                                         "text-emerald-700";

  const handleAdd = () => {
    toast.success({
      title: "Added to workspace",
      description: insight.title,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/15 backdrop-blur-[2px] cursor-default animate-overlay-in"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-xl bg-card h-full card-shadow-lg animate-drawer-in flex flex-col"
      >
        {/* Header — close + title only, no eyebrow */}
        <header className="flex items-start justify-between gap-4 px-7 pt-5 pb-4 shrink-0">
          <h2 className="text-[19px] font-semibold leading-tight tracking-tight text-foreground min-w-0">
            {insight.title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 -mr-1 -mt-1 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors shrink-0"
          >
            <X className="w-4 h-4" weight="regular" />
          </button>
        </header>

        {/* Inline meta — replaces the 3-tile grid */}
        <div className="px-7 pb-5 flex items-center gap-2 text-[12px] tracking-tight shrink-0">
          <StatusDot status={insight.status} />
          <span className={cn("font-semibold", statusTone)}>{statusLabel}</span>
          <span className="text-muted-foreground/30">·</span>
          <span className="text-foreground tabular-nums font-semibold">{insight.score}%</span>
          <span className="text-muted-foreground/70">confidence</span>
          <span className="text-muted-foreground/30">·</span>
          <span className="text-muted-foreground/70">{insight.date}</span>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Finding */}
          <section className="px-7 pb-8">
            <p className="text-[16px] leading-[1.55] text-foreground tracking-tight">
              {insight.finding}
            </p>
          </section>

          {/* Evidence — flat row list, no nested cards */}
          <section>
            <div className="px-7 pb-3 flex items-baseline justify-between border-b border-border">
              <p className="text-[11.5px] font-semibold text-muted-foreground tracking-tight">
                Evidence
              </p>
              <span className="text-[11.5px] text-muted-foreground/70 tabular-nums">
                {insight.sources.length} sources
              </span>
            </div>
            <ul>
              {insight.sources.map((src, i, arr) => (
                <li key={`${src.name}-${i}`}>
                  <button
                    type="button"
                    className={cn(
                      "w-full flex items-center gap-3.5 px-7 py-3.5 hover:bg-muted/40 transition-colors group text-left",
                      i < arr.length - 1 && "border-b border-border/50"
                    )}
                  >
                    <span className="h-6 px-1.5 rounded bg-muted/60 flex items-center justify-center text-[9.5px] font-mono font-bold tracking-wider text-muted-foreground shrink-0">
                      {src.type}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate">
                        {src.name}
                      </p>
                      {src.publisher && (
                        <p className="text-[11.5px] text-muted-foreground/70 truncate mt-0.5">
                          {src.publisher}
                        </p>
                      )}
                    </div>
                    <ArrowUpRight
                      className="w-4 h-4 text-muted-foreground/30 group-hover:text-foreground transition-colors shrink-0"
                      weight="regular"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-border shrink-0 flex items-center gap-3">
          <Button variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="dark"
            size="md"
            className="flex-1"
            onClick={handleAdd}
          >
            Add to workspace
          </Button>
        </div>
      </div>
    </div>
  );
}
