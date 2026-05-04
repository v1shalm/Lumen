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
 * V2 — Bento dashboard of stat tiles
 *
 *   Reference: Vercel "Threshold / Signal strength" detail card —
 *   corner crop marks, eyebrow path title, top-right value chip,
 *   dual metric cells, segmented gauge with axis labels, footer chips.
 *
 *   Layout: bento grid. Hero contradiction is 2x2 (full reference
 *   treatment). Remaining tiles are 1x1 (condensed reference).
 *
 *   Lumen overrides:
 *     • White card on gray canvas (reference is dark)
 *     • Warm orange primary as fill (reference is yellow-green)
 *     • Geist + Geist Mono kept; tabular-nums on numerals
 *     • Multi-layer card-shadow (existing brand chrome)
 * ═════════════════════════════════════════════════════════════════════ */

type StatusFilter = "all" | Status;

function InsightsV2() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [drawerInsight, setDrawerInsight] = useState<Insight | null>(null);
  const [focusIdx, setFocusIdx] = useState<number>(-1);
  const tileRefs = useRef<(HTMLElement | null)[]>([]);

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

  // Page-level keyboard nav: j/k or arrows to traverse, Enter/o to open drawer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (drawerInsight) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "j" || e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        setFocusIdx((i) => {
          const next = Math.min(filtered.length - 1, (i < 0 ? 0 : i + 1));
          tileRefs.current[next]?.focus();
          return next;
        });
      } else if (e.key === "k" || e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        setFocusIdx((i) => {
          const next = Math.max(0, (i < 0 ? 0 : i - 1));
          tileRefs.current[next]?.focus();
          return next;
        });
      } else if ((e.key === "Enter" || e.key === "o" || e.key === "O") && focusIdx >= 0) {
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

  // Bento sizing: hero (first item) is 2x2 on lg+; rest are 1x1
  const tileSize = (i: number) => (i === 0 ? "lg:col-span-2 lg:row-span-2" : "");

  return (
    <div className="max-w-[1500px] mx-auto -mt-2 pb-12">
      {/* Compact masthead */}
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

      {/* Filter bar */}
      <div
        className="flex items-center gap-2 py-2 mb-5 border-y border-border animate-enter"
        style={{ ["--i" as string]: 1 }}
      >
        <FilterPill active={filter === "all"}            onClick={() => setFilter("all")}            count={counts.all}>All</FilterPill>
        <FilterPill active={filter === "Contradiction"}  onClick={() => setFilter("Contradiction")}  count={counts.Contradiction} tone="primary">Contradictions</FilterPill>
        <FilterPill active={filter === "Verified"}       onClick={() => setFilter("Verified")}       count={counts.Verified}      tone="success">Verified</FilterPill>
        <FilterPill active={filter === "Incomplete"}     onClick={() => setFilter("Incomplete")}     count={counts.Incomplete}    tone="muted">Incomplete</FilterPill>
        <span className="ml-auto text-[11.5px] text-muted-foreground/60 tabular-nums tracking-tight hidden md:flex items-center gap-3">
          <KbdHint>j</KbdHint><KbdHint>k</KbdHint>
          <span>navigate</span>
          <KbdHint>↵</KbdHint>
          <span>open</span>
        </span>
      </div>

      {/* Bento grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-[13px] text-muted-foreground">
          No insights match this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[260px] gap-5">
          {filtered.map((insight, i) => (
            <InsightStatTile
              key={insight.id}
              insight={insight}
              tileId={`LMN-${insight.id.toString().padStart(3, "0")}`}
              hero={i === 0}
              ref={(el) => { tileRefs.current[i] = el; }}
              isFocused={focusIdx === i}
              onOpen={() => setDrawerInsight(insight)}
              className={tileSize(i)}
              style={{ ["--i" as string]: i + 2 } as React.CSSProperties}
            />
          ))}
        </div>
      )}

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

/* ─────────── Corner crop marks — reference's visual signature ─────────── */

function CornerMarks({ tone = "muted" }: { tone?: "muted" | "primary" }) {
  const stroke = tone === "primary" ? "border-primary/50" : "border-muted-foreground/25";
  return (
    <>
      <span aria-hidden className={cn("absolute top-2 left-2 w-2.5 h-2.5 border-t border-l", stroke)} />
      <span aria-hidden className={cn("absolute top-2 right-2 w-2.5 h-2.5 border-t border-r", stroke)} />
      <span aria-hidden className={cn("absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l", stroke)} />
      <span aria-hidden className={cn("absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r", stroke)} />
    </>
  );
}

/* ─────────── Segmented gauge — reference's wide tick-mark progress bar ─────────── */

function Gauge({
  value, // 0..100
  max = 100,
  showAxis = true,
  fillClass = "bg-primary",
}: {
  value: number;
  max?: number;
  showAxis?: boolean;
  fillClass?: string;
}) {
  const TICKS = 40;
  const filledTicks = Math.round((value / max) * TICKS);
  return (
    <div>
      {/* Filled bar (continuous) + remaining (tick-marks) */}
      <div className="flex items-center gap-[2px] h-2.5 w-full">
        <div
          className={cn("h-full rounded-[2px]", fillClass)}
          style={{ width: `${(value / max) * 100}%` }}
        />
        {/* Ticks for the unfilled portion */}
        <div className="flex-1 flex items-center gap-[2px] h-full">
          {Array.from({ length: TICKS - filledTicks }).map((_, i) => (
            <span
              key={i}
              className="h-full w-[2px] bg-muted-foreground/20 rounded-[1px]"
            />
          ))}
        </div>
      </div>
      {/* Axis */}
      {showAxis && (
        <div className="mt-2.5 grid grid-cols-5 font-mono text-[10.5px] tabular-nums text-muted-foreground/60">
          <span className="text-left">0%</span>
          <span className="text-center">25%</span>
          <span className="text-center">50%</span>
          <span className="text-center">75%</span>
          <span className="text-right">100%</span>
        </div>
      )}
    </div>
  );
}

/* ─────────── Source-type tile — small icon-style square ─────────── */

function SourceTile({ type }: { type: SourceType }) {
  return (
    <span
      className="w-7 h-7 rounded bg-muted/60 border border-border flex items-center justify-center font-mono text-[9.5px] font-bold tracking-wider text-muted-foreground"
      title={type}
    >
      {type}
    </span>
  );
}

/* ─────────── Stat tile — reference card translated to Lumen ─────────── */

const InsightStatTile = React.forwardRef<
  HTMLElement,
  {
    insight: Insight;
    tileId: string;
    hero: boolean;
    isFocused: boolean;
    onOpen: () => void;
    className?: string;
    style?: React.CSSProperties;
  }
>(function InsightStatTile({ insight, tileId, hero, isFocused, onOpen, className, style }, ref) {
  // Derive a corroboration metric: how many sources agree (mocked from score)
  const corroboration = Math.round((insight.score / 100) * insight.sources.length);
  const corroborationPct = Math.round((corroboration / insight.sources.length) * 100);

  // Mock delta vs prior synthesis run — gives the +Δ% green annotation slot
  const delta = insight.status === "Contradiction" ? -8 :
                insight.status === "Verified"      ? +5 :
                                                     -2;

  // Status-specific eyebrow word
  const eyebrow =
    insight.status === "Contradiction" ? "Contradiction" :
    insight.status === "Incomplete"    ? "Incomplete"     :
                                         "Verified";

  // Status-specific gauge color (orange for contradiction = brand call-to-attention)
  const fillClass =
    insight.status === "Contradiction" ? "bg-primary"           :
    insight.status === "Verified"      ? "bg-emerald-600"        :
                                         "bg-muted-foreground/40";

  // Top-right chip uses the same status tone (orange/emerald/muted)
  const chipBg =
    insight.status === "Contradiction" ? "bg-primary/10 text-primary" :
    insight.status === "Verified"      ? "bg-emerald-600/10 text-emerald-700" :
                                         "bg-muted text-muted-foreground";

  return (
    <article
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      style={style}
      aria-label={`Open insight: ${insight.title}`}
      className={cn(
        "group relative bg-card rounded-2xl card-shadow hover:card-shadow-md transition-all duration-300 ease-out cursor-pointer flex flex-col overflow-hidden animate-enter",
        "hover:-translate-y-[1px] focus:outline-none focus-visible:card-shadow-md focus-visible:-translate-y-[1px]",
        "focus-visible:ring-2 focus-visible:ring-foreground/15 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isFocused && "card-shadow-md -translate-y-[1px]",
        className
      )}
    >
      <CornerMarks tone={insight.status === "Contradiction" ? "primary" : "muted"} />

      {/* Header — eyebrow path + top-right chip */}
      <div className="px-5 pt-5 pb-4 flex items-baseline justify-between gap-3 border-b border-border/60">
        <h2 className="text-[13px] tracking-tight truncate min-w-0">
          <span className="text-muted-foreground/70">{eyebrow}</span>
          <span className="text-muted-foreground/30 mx-1.5">/</span>
          <span className="text-foreground font-semibold">{insight.title}</span>
        </h2>
        <span className={cn(
          "shrink-0 font-mono text-[11px] tabular-nums tracking-tight px-2 py-0.5 rounded font-semibold",
          chipBg
        )}>
          {insight.score}%
        </span>
      </div>

      {/* Body — dual metrics + gauge */}
      <div className={cn("flex-1 flex flex-col", hero ? "px-7 py-7" : "px-5 py-5")}>
        <div className={cn("grid grid-cols-2 gap-4", hero ? "mb-7" : "mb-5")}>
          {/* Left metric — Confidence (with delta) */}
          <div>
            <p className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-muted-foreground/70 leading-tight">
              Confidence
            </p>
            <p className={cn(
              "mt-1.5 font-semibold tracking-[-0.04em] text-foreground tabular-nums leading-none flex items-baseline gap-2",
              hero ? "text-[64px]" : "text-[40px]"
            )}>
              <span>{insight.score}<span className="text-muted-foreground/50">%</span></span>
              <span className={cn(
                "font-mono tabular-nums",
                hero ? "text-[14px]" : "text-[11px]",
                delta >= 0 ? "text-emerald-600" : "text-primary"
              )}>
                {delta >= 0 ? "+" : ""}{delta}%
              </span>
            </p>
          </div>
          {/* Right metric — Corroboration */}
          <div className={cn("text-right")}>
            <p className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-muted-foreground/70 leading-tight">
              Corroboration
            </p>
            <p className={cn(
              "mt-1.5 font-semibold tracking-[-0.04em] text-foreground tabular-nums leading-none",
              hero ? "text-[64px]" : "text-[40px]"
            )}>
              {corroborationPct}<span className="text-muted-foreground/50">%</span>
            </p>
          </div>
        </div>

        {/* Gauge */}
        <Gauge value={insight.score} fillClass={fillClass} showAxis={hero} />
      </div>

      {/* Footer — sources + count chip */}
      <div className="px-5 py-4 border-t border-border/60 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-muted-foreground/70 mb-2 leading-tight">
            Sources
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {insight.sources.slice(0, hero ? 6 : 4).map((src, i) => (
              <SourceTile key={`${src.name}-${i}`} type={src.type} />
            ))}
            {insight.sources.length > (hero ? 6 : 4) && (
              <span className="font-mono text-[10.5px] text-muted-foreground/60 tabular-nums">
                +{insight.sources.length - (hero ? 6 : 4)}
              </span>
            )}
          </div>
        </div>
        <span className={cn(
          "shrink-0 self-end font-mono text-[10.5px] tabular-nums uppercase tracking-[0.08em] px-2 py-1 rounded font-semibold",
          chipBg
        )}>
          {insight.sources.length} sources
        </span>
      </div>

      {/* Tile ID — quiet bottom-left annotation */}
      <span className="absolute top-2.5 left-1/2 -translate-x-1/2 font-mono text-[10px] tabular-nums tracking-[0.1em] text-muted-foreground/30 uppercase pointer-events-none">
        {tileId}
      </span>
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
