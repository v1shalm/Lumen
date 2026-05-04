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
 * V2 — editorial dossier
 *   Reference: NYT op-ed, Stripe Press, hex.inc — research publication
 *   not SaaS dashboard.
 *
 *   • Single narrow reading column (max-w-[760px]), flush left
 *   • Each insight is a typeset article entry, not a card or row
 *   • Status carried by a single left edge rule (the only color)
 *   • Prose source attribution (no mono ticker, no chip stack)
 *   • Confidence demoted to a small byline annotation
 *   • Sentence case throughout. No uppercase status labels.
 *   • Vertical rhythm via gaps + thin border-t per entry
 * ═════════════════════════════════════════════════════════════════════ */

function InsightsV2() {
  const [selected, setSelected] = useState<Insight | null>(null);

  // Order: contradictions first, then by recency
  const ordered = [...INSIGHTS].sort((a, b) => {
    const aIsContradiction = a.status === "Contradiction" ? 0 : 1;
    const bIsContradiction = b.status === "Contradiction" ? 0 : 1;
    if (aIsContradiction !== bIsContradiction) return aIsContradiction - bIsContradiction;
    return a.ageHours - b.ageHours;
  });

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

  const counts = {
    verified:      INSIGHTS.filter((r) => r.status === "Verified").length,
    contradiction: INSIGHTS.filter((r) => r.status === "Contradiction").length,
    incomplete:    INSIGHTS.filter((r) => r.status === "Incomplete").length,
  };

  return (
    <article className="max-w-[760px] mx-auto -mt-2 pb-16">
      {/* Masthead — sentence case, no mono ticker */}
      <header className="pt-2 pb-10 animate-enter" style={{ ["--i" as string]: 0 }}>
        <h1 className="text-[clamp(2.5rem,4.5vw,3.25rem)] font-semibold tracking-[-0.025em] text-foreground leading-[1.05]">
          Insights
        </h1>
        <p className="mt-3 text-[14px] text-muted-foreground tracking-tight leading-relaxed max-w-[60ch]">
          A dossier of synthesised findings across your sources —
          {" "}
          <span className="text-foreground tabular-nums font-semibold">{counts.contradiction}</span>
          {" contradiction"}{counts.contradiction === 1 ? "" : "s"} flagged,
          {" "}
          <span className="text-foreground tabular-nums font-semibold">{counts.verified}</span>
          {" verified across sources, "}
          <span className="text-foreground tabular-nums font-semibold">{counts.incomplete}</span>
          {" awaiting corroboration."}
        </p>
      </header>

      {/* Articles */}
      <div>
        {ordered.map((insight, i) => (
          <V2Article
            key={insight.id}
            insight={insight}
            number={i + 1}
            isFirst={i === 0}
            isLast={i === ordered.length - 1}
            onOpen={() => setSelected(insight)}
            style={{ ["--i" as string]: i + 1 } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Detail drawer (shared) */}
      {selected && <DetailDrawer insight={selected} onClose={() => setSelected(null)} />}
    </article>
  );
}

/* ─────────── V2 atoms ─────────── */

/** Build a prose attribution line from sources.
 *  "Drawing on HELION's 2025 reactor study, ITER model files, and corroborating
 *   analyses from McKinsey, Nature, and the U.S. DOE." */
function sourceProse(sources: Source[]): string {
  const publishers = sources.map((s) => s.publisher ?? s.name);
  const lead = publishers[0];
  const rest = publishers.slice(1);
  if (rest.length === 0) return `Drawing on ${lead}.`;
  if (rest.length === 1) return `Drawing on ${lead} and ${rest[0]}.`;
  const head = rest.slice(0, -1).join(", ");
  const tail = rest[rest.length - 1];
  return `Drawing on ${lead}, ${head}, and ${tail}.`;
}

function V2Article({
  insight, number, isFirst, isLast, onOpen, style,
}: {
  insight: Insight;
  number: number;
  isFirst?: boolean;
  isLast?: boolean;
  onOpen: () => void;
  style?: React.CSSProperties;
}) {
  // Edge rule color — the only color carrier on the page
  const ruleColor =
    insight.status === "Contradiction" ? "bg-primary"      :
    insight.status === "Incomplete"    ? "bg-foreground/20" :
                                         "bg-emerald-600/70";

  // Single short status caption — sentence case, no caps
  const caption =
    insight.status === "Contradiction" ? "Contradiction"      :
    insight.status === "Incomplete"    ? "Awaiting corroboration" :
                                         "Verified";

  return (
    <section
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
      style={style}
      className={cn(
        "group relative cursor-pointer animate-enter pl-6 -ml-6",
        isFirst ? "pt-2 pb-12" : "py-12",
        !isLast && "border-b border-border",
        "focus:outline-none focus-visible:bg-muted/30 transition-colors duration-200",
        "hover:[&_.v2-arrow]:text-foreground hover:[&_.v2-arrow]:translate-x-0.5 hover:[&_.v2-arrow]:-translate-y-0.5"
      )}
    >
      {/* Left edge status rule — runs the height of the entry, only color on the page */}
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-12 bottom-12 w-[2px] rounded-full",
          isFirst && "top-4",
          ruleColor
        )}
      />

      {/* Byline row — article number, status word, date, confidence — all quiet, all sentence-case */}
      <p className="text-[12.5px] text-muted-foreground tracking-tight mb-4 leading-relaxed">
        <span className="font-mono tabular-nums text-muted-foreground/50 mr-2.5">
          № {number.toString().padStart(2, "0")}
        </span>
        <span className="text-foreground font-medium">{caption}</span>
        <span className="mx-1.5 text-muted-foreground/30">·</span>
        <span>{insight.date}</span>
        <span className="mx-1.5 text-muted-foreground/30">·</span>
        <span>
          <span className="text-foreground tabular-nums font-semibold">{insight.score}%</span>
          {" confidence"}
        </span>
      </p>

      {/* Title — sentence case, intentional weight, larger on the lead entry */}
      <h2
        className={cn(
          "text-foreground font-semibold tracking-[-0.018em] leading-[1.15]",
          isFirst ? "text-[28px]" : "text-[22px]"
        )}
        style={{ textWrap: "balance" } as React.CSSProperties}
      >
        {insight.title}
      </h2>

      {/* Lead paragraph — the finding, set as article prose */}
      <p
        className={cn(
          "mt-4 text-foreground/90 leading-[1.6] tracking-tight",
          isFirst ? "text-[18px]" : "text-[16px]"
        )}
        style={{ maxWidth: "62ch", textWrap: "pretty" } as React.CSSProperties}
      >
        {insight.finding}
      </p>

      {/* Source attribution as prose — no mono, no chips */}
      <p className="mt-5 text-[13px] text-muted-foreground/80 leading-[1.6] tracking-tight max-w-[58ch]">
        {sourceProse(insight.sources)}
        <span className="ml-1.5 text-muted-foreground/50 tabular-nums">
          ({insight.sources.length} sources)
        </span>
      </p>

      {/* Read more — quiet trailing affordance */}
      <p className="mt-5 text-[12.5px] text-muted-foreground/60 group-hover:text-foreground transition-colors tracking-tight inline-flex items-center gap-1">
        <span>Open dossier entry</span>
        <ArrowUpRight
          className="v2-arrow w-3.5 h-3.5 text-muted-foreground/40 transition-all duration-200 ease-out"
          weight="regular"
        />
      </p>
    </section>
  );
}

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
