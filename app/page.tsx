"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Globe, FileText, MagnifyingGlass, Database, ArrowRight,
  ArrowCounterClockwise, CheckCircle, WarningCircle, BookOpen,
  DotsThree, FilePdf, Trash, Sliders, CaretDown, Code,
  type Icon as PhIcon,
} from "@phosphor-icons/react";
import { ProcessingModal } from "@/components/ProcessingModal";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";

type Version = "v1" | "v2";
const VERSION_STORAGE_KEY = "lumen-ingestion-version";

const TABS = [
  { id: "url",    label: "URL",      icon: Globe },
  { id: "file",   label: "File",     icon: FileText },
  { id: "db",     label: "Database", icon: Database },
  { id: "search", label: "Search",   icon: MagnifyingGlass, badge: "New" },
];

const FORMATS = ["Markdown", "JSON", "HTML", "Screenshot"];

type SourceType = "Web" | "PDF" | "GitHub";
type Status = "Synced" | "Processing";

type Source = {
  id: number;
  name: string;
  type: SourceType;
  size: string;
  status: Status;
};

const INITIAL_SOURCES: Source[] = [
  { id: 1, name: "nature.com/articles/s41586-024",   type: "Web",    size: "4.2 KiB",  status: "Synced"     },
  { id: 2, name: "Market Intelligence Q1 - 2026.pdf", type: "PDF",    size: "1.2 MB",   status: "Synced"     },
  { id: 3, name: "Competitor Analysis Repo",          type: "GitHub", size: "24 files", status: "Processing" },
];

function typeIcon(type: SourceType): PhIcon {
  if (type === "Web") return Globe;
  if (type === "PDF") return FilePdf;
  return Database;
}

export default function Ingestion() {
  const [version, setVersion]           = useState<Version>("v2");
  const [activeTab, setActiveTab]       = useState<string>("url");
  const [urlInput, setUrlInput]         = useState("");
  const [format, setFormat]             = useState("Markdown");
  const [formatOpen, setFormatOpen]     = useState(false);
  const [moreOpen, setMoreOpen]         = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pending, setPending]           = useState<string | null>(null);
  const [sources, setSources]           = useState<Source[]>(INITIAL_SOURCES);
  const [toast, setToast]               = useState(false);
  const [lastSync, setLastSync]         = useState("2 min ago");

  const formatRef = useRef<HTMLDivElement>(null);
  const moreRef   = useRef<HTMLDivElement>(null);

  // Persist version choice
  useEffect(() => {
    const saved = localStorage.getItem(VERSION_STORAGE_KEY);
    if (saved === "v1" || saved === "v2") setVersion(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem(VERSION_STORAGE_KEY, version);
  }, [version]);

  // Close v2 overflow menu on outside click
  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [moreOpen]);

  useEffect(() => {
    if (!formatOpen) return;
    const onDown = (e: MouseEvent) => {
      if (formatRef.current && !formatRef.current.contains(e.target as Node)) {
        setFormatOpen(false);
      }
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [formatOpen]);

  useEffect(() => {
    localStorage.setItem("lumen-context-count", sources.length.toString());
  }, [sources.length]);

  const handleProcess = () => {
    if (!urlInput.trim()) return;
    const url = urlInput.replace(/^https?:\/\//, "");
    setPending(url);
    setIsProcessing(true);
    setUrlInput("");
    setTimeout(() => {
      setSources((prev) => [
        { id: Date.now(), name: url, type: "Web", size: `${(Math.random() * 10).toFixed(1)} KiB`, status: "Synced" },
        ...prev,
      ]);
      setPending(null);
      setIsProcessing(false);
      setLastSync("just now");
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    }, 2400);
  };

  const removeSource = (id: number) => setSources((prev) => prev.filter((s) => s.id !== id));

  return (
    <div className="max-w-[1240px] mx-auto -mt-2 pb-12">
      <ProcessingModal isOpen={isProcessing} onClose={() => setIsProcessing(false)} />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-card border border-border px-4 py-2.5 rounded-lg card-shadow-md animate-in slide-in-from-bottom-3 duration-300">
          <CheckCircle className="w-4 h-4 text-emerald-500" weight="fill" />
          <span className="text-[13px] font-medium">Source ingested</span>
        </div>
      )}

      {/* ───── Dev-time version toggle ───── */}
      <div className="pt-2 mb-3 flex justify-end">
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

      {/* ───── Page title ───── */}
      <header className="pb-10">
        <h1 className="text-[clamp(2.5rem,4.5vw,3.25rem)] font-semibold tracking-[-0.025em] text-foreground leading-[1.05]">
          Ingestion
        </h1>
        <p className="mt-3 text-[14px] text-muted-foreground tracking-tight max-w-xl">
          Add sources to your knowledge base. Lumen extracts text, citations, and entities.
        </p>
      </header>

      {/* ═════════════════════════════════════════ V1 ═════════════════════════════════════════ */}
      {version === "v1" && (
        <>

      {/* ───── Floating segmented tabs ───── */}
      <div className="flex justify-center mb-7">
        <div className="inline-flex items-center gap-0.5 p-1 bg-card rounded-lg card-shadow">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 h-9 px-3.5 rounded-md text-[13px] font-medium transition-colors duration-150",
                  isActive
                    ? "bg-muted/70 text-foreground"
                    : "text-foreground/65 hover:text-foreground hover:bg-muted/40"
                )}
              >
                <tab.icon
                  className={cn("w-4 h-4", isActive ? "text-foreground" : "text-foreground/55")}
                  weight={isActive ? "fill" : "regular"}
                />
                {tab.label}
                {tab.badge && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none bg-primary/15 text-primary ml-0.5">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ───── Form card ───── */}
      <section className="bg-card rounded-2xl card-shadow px-8 py-10 mb-10">
        {activeTab === "url" && (
          <>
            {/* URL input pill — centered, generous space around */}
            <div className="max-w-[680px] mx-auto">
              <div className="flex items-center h-12 bg-card border border-border rounded-xl overflow-hidden focus-within:border-foreground/30 transition-colors">
                <span className="px-3.5 text-[12.5px] font-mono font-semibold text-muted-foreground/55 tracking-tight h-full flex items-center select-none">
                  https://
                </span>
                <input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleProcess()}
                  placeholder="example.com/research-paper"
                  className="flex-1 h-full pr-4 bg-transparent outline-none text-[14px] placeholder:text-muted-foreground/40"
                />
              </div>

              {/* Action row — left cluster: options · format · sync meta. Right cluster: Get code · Start */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  className="w-9 h-9 flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                  aria-label="Options"
                >
                  <Sliders className="w-3.5 h-3.5" weight="regular" />
                </button>

                {/* Format dropdown */}
                <div className="relative" ref={formatRef}>
                  <button
                    type="button"
                    onClick={() => setFormatOpen((v) => !v)}
                    className="h-9 px-3 flex items-center gap-1.5 bg-card border border-border rounded-md text-[12.5px] font-medium text-foreground hover:bg-muted/40 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-muted-foreground/60" weight="regular" />
                    <span className="text-muted-foreground/70">Format</span>
                    <span className="text-foreground">{format}</span>
                    <CaretDown
                      className={cn("w-3 h-3 text-muted-foreground/50 transition-transform duration-150 ml-0.5", formatOpen && "rotate-180")}
                      weight="bold"
                    />
                  </button>
                  {formatOpen && (
                    <div className="absolute top-[calc(100%+4px)] left-0 z-20 min-w-[140px] bg-popover border border-border rounded-md card-shadow-md py-1">
                      {FORMATS.map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => { setFormat(f); setFormatOpen(false); }}
                          className={cn(
                            "w-full text-left px-3 py-1.5 text-[12.5px] hover:bg-muted/60 transition-colors",
                            format === f ? "text-foreground font-medium" : "text-muted-foreground"
                          )}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sync meta — left-aligned with the form group it describes, not centered orphan */}
                <span className="hidden md:flex items-center gap-1.5 ml-1 text-[11.5px] text-muted-foreground/70">
                  <ArrowCounterClockwise className="w-3 h-3" weight="bold" />
                  Synced {lastSync}
                </span>

                <div className="flex-1" />

                <button
                  type="button"
                  className="h-9 px-3 flex items-center gap-1.5 rounded-md border border-border text-[12.5px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                >
                  <Code className="w-3.5 h-3.5" weight="regular" />
                  Get code
                </button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleProcess}
                  disabled={!urlInput.trim()}
                  loading={isProcessing}
                  iconRight={!isProcessing ? <ArrowRight className="w-3.5 h-3.5" weight="bold" /> : undefined}
                >
                  {isProcessing ? "Processing" : "Start ingestion"}
                </Button>
              </div>
            </div>
          </>
        )}

        {activeTab === "file" && (
          <button
            type="button"
            onClick={() => setIsProcessing(true)}
            className="w-full max-w-[680px] mx-auto block border border-dashed border-border rounded-xl py-14 flex flex-col items-center gap-2.5 hover:border-foreground/30 hover:bg-muted/20 transition-colors"
          >
            <FileText className="w-5 h-5 text-muted-foreground/70" weight="regular" />
            <div className="text-center">
              <p className="text-[13px] font-medium text-foreground">Upload a document</p>
              <p className="text-[12px] text-muted-foreground mt-1">PDF · LaTeX · Markdown · EPUB</p>
            </div>
          </button>
        )}

        {activeTab === "db" && (
          <div className="max-w-[680px] mx-auto border border-dashed border-border rounded-xl py-14 flex flex-col items-center gap-2.5">
            <Database className="w-5 h-5 text-muted-foreground/70" weight="regular" />
            <div className="text-center">
              <p className="text-[13px] font-medium text-foreground">Connect a database</p>
              <p className="text-[12px] text-muted-foreground mt-1">PostgreSQL · MySQL · MongoDB · Supabase</p>
            </div>
          </div>
        )}

        {activeTab === "search" && (
          <div className="max-w-[680px] mx-auto">
            <div className="flex items-center h-12 bg-card border border-border rounded-xl overflow-hidden focus-within:border-foreground/30 transition-colors">
              <span className="pl-4 pr-2 flex items-center text-muted-foreground/70">
                <MagnifyingGlass className="w-4 h-4" weight="regular" />
              </span>
              <input
                placeholder="surface code threshold quantum error correction"
                className="flex-1 h-full px-2 bg-transparent outline-none text-[13.5px] placeholder:text-muted-foreground/40"
              />
            </div>
            <p className="mt-3 text-center text-[12px] text-muted-foreground">
              Search the open web and ingest matching results in one step.
            </p>
          </div>
        )}
      </section>

        </>
      )}
      {/* ═════════════════════════════════════════ /V1 ═════════════════════════════════════════ */}

      {/* ═════════════════════════════════════════ V2 ═════════════════════════════════════════ */}
      {version === "v2" && (
        <section className="bg-card rounded-2xl card-shadow overflow-hidden mb-10">
          {/* Tab strip — flush inside the card top, sub-nav style */}
          <div className="flex items-center px-2 pt-2 border-b border-border">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative flex items-center gap-1.5 h-10 px-3.5 text-[13px] font-medium transition-colors duration-150",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <tab.icon
                    className={cn("w-4 h-4", isActive ? "text-foreground" : "text-foreground/55")}
                    weight={isActive ? "fill" : "regular"}
                  />
                  {tab.label}
                  {tab.badge && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none bg-primary/15 text-primary ml-0.5">
                      {tab.badge}
                    </span>
                  )}
                  {isActive && (
                    <span aria-hidden className="absolute bottom-[-1px] left-0 right-0 h-px bg-foreground" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Form body */}
          <div className="px-7 py-7">
            {activeTab === "url" && (
              <div className="max-w-[760px] mx-auto">
                {/* Single continuous URL pill — https:// chip integrated, no internal divider */}
                <div className="flex items-center h-12 bg-muted/40 border border-border rounded-xl focus-within:bg-card focus-within:border-foreground/30 transition-colors px-1.5 gap-1.5">
                  <span className="px-2.5 h-9 flex items-center text-[12px] font-mono font-semibold text-muted-foreground/60 tracking-tight">
                    https://
                  </span>
                  <input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleProcess()}
                    placeholder="example.com/research-paper"
                    className="flex-1 h-9 bg-transparent outline-none text-[14px] placeholder:text-muted-foreground/40"
                  />
                </div>

                {/* Action row — Format inline as metadata, no Get-code button (lives in ⋯) */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    type="button"
                    aria-label="Options"
                    className="w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                  >
                    <Sliders className="w-4 h-4" weight="regular" />
                  </button>

                  {/* Format as inline metadata, not a button */}
                  <div className="relative" ref={formatRef}>
                    <button
                      type="button"
                      onClick={() => setFormatOpen((v) => !v)}
                      className="h-9 px-2.5 flex items-center gap-1.5 rounded-md text-[12.5px] text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                    >
                      <span>Format</span>
                      <span className="text-foreground font-medium">{format}</span>
                      <CaretDown
                        className={cn("w-3 h-3 transition-transform duration-150", formatOpen && "rotate-180")}
                        weight="bold"
                      />
                    </button>
                    {formatOpen && (
                      <div className="absolute top-[calc(100%+4px)] left-0 z-20 min-w-[140px] bg-popover border border-border rounded-md card-shadow-md py-1">
                        {FORMATS.map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => { setFormat(f); setFormatOpen(false); }}
                            className={cn(
                              "w-full text-left px-3 py-1.5 text-[12.5px] hover:bg-muted/60 transition-colors",
                              format === f ? "text-foreground font-medium" : "text-muted-foreground"
                            )}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sync meta inline, replaces the centered standalone line */}
                  <span className="hidden md:flex items-center gap-1.5 ml-2 text-[11.5px] text-muted-foreground/70">
                    <ArrowCounterClockwise className="w-3 h-3" weight="bold" />
                    Synced {lastSync}
                  </span>

                  <div className="flex-1" />

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleProcess}
                    disabled={!urlInput.trim()}
                    loading={isProcessing}
                    iconRight={!isProcessing ? <ArrowRight className="w-3.5 h-3.5" weight="bold" /> : undefined}
                  >
                    {isProcessing ? "Processing" : "Start ingestion"}
                  </Button>

                  {/* Overflow menu */}
                  <div className="relative" ref={moreRef}>
                    <button
                      type="button"
                      onClick={() => setMoreOpen((v) => !v)}
                      aria-label="More"
                      className="w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                    >
                      <DotsThree className="w-5 h-5" weight="bold" />
                    </button>
                    {moreOpen && (
                      <div className="absolute top-[calc(100%+4px)] right-0 z-20 min-w-[160px] bg-popover border border-border rounded-md card-shadow-md py-1">
                        <button
                          type="button"
                          onClick={() => setMoreOpen(false)}
                          className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-[12.5px] text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                        >
                          <Code className="w-3.5 h-3.5" weight="regular" />
                          Get code
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "file" && (
              <button
                type="button"
                onClick={() => setIsProcessing(true)}
                className="w-full max-w-[760px] mx-auto block border border-dashed border-border rounded-xl py-14 flex flex-col items-center gap-2.5 hover:border-foreground/30 hover:bg-muted/20 transition-colors"
              >
                <FileText className="w-5 h-5 text-muted-foreground/70" weight="regular" />
                <div className="text-center">
                  <p className="text-[13px] font-medium text-foreground">Upload a document</p>
                  <p className="text-[12px] text-muted-foreground mt-1">PDF · LaTeX · Markdown · EPUB</p>
                </div>
              </button>
            )}

            {activeTab === "db" && (
              <div className="max-w-[760px] mx-auto border border-dashed border-border rounded-xl py-14 flex flex-col items-center gap-2.5">
                <Database className="w-5 h-5 text-muted-foreground/70" weight="regular" />
                <div className="text-center">
                  <p className="text-[13px] font-medium text-foreground">Connect a database</p>
                  <p className="text-[12px] text-muted-foreground mt-1">PostgreSQL · MySQL · MongoDB · Supabase</p>
                </div>
              </div>
            )}

            {activeTab === "search" && (
              <div className="max-w-[760px] mx-auto">
                <div className="flex items-center h-12 bg-muted/40 border border-border rounded-xl focus-within:bg-card focus-within:border-foreground/30 transition-colors px-3 gap-2">
                  <MagnifyingGlass className="w-4 h-4 text-muted-foreground/70" weight="regular" />
                  <input
                    placeholder="surface code threshold quantum error correction"
                    className="flex-1 h-full bg-transparent outline-none text-[14px] placeholder:text-muted-foreground/40"
                  />
                </div>
                <p className="mt-3 text-[12px] text-muted-foreground">
                  Search the open web and ingest matching results in one step.
                </p>
              </div>
            )}
          </div>
        </section>
      )}
      {/* ═════════════════════════════════════════ /V2 ═════════════════════════════════════════ */}

      {/* ───── Knowledge base ───── */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-muted-foreground/70" weight="regular" />
            <span className="text-[10.5px] font-semibold text-muted-foreground/80 tracking-[0.06em]">
              KNOWLEDGE BASE ({sources.length})
            </span>
          </div>
          <button className="text-[13px] text-foreground hover:text-primary transition-colors font-semibold">
            Manage all
          </button>
        </div>

        <ul className="space-y-2.5">
          {pending && (
            <li className="bg-card rounded-xl card-shadow px-4 py-3.5 flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-muted/60 border border-border flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 text-muted-foreground/70" weight="regular" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="h-3 w-72 max-w-full bg-muted rounded animate-pulse mb-1.5" />
                <div className="h-2 w-24 bg-muted rounded animate-pulse" />
              </div>
              <Chip
                tone="accent"
                iconLeft={<WarningCircle className="w-3.5 h-3.5" weight="regular" />}
                className="shrink-0"
              >
                Processing
              </Chip>
            </li>
          )}

          {sources.map((src) => {
            const Icon = typeIcon(src.type);
            const isProc = src.status === "Processing";
            return (
              <li
                key={src.id}
                className="group bg-card rounded-xl card-shadow px-4 py-3.5 flex items-center gap-3.5 transition-shadow hover:card-shadow-md"
              >
                <div className="w-9 h-9 rounded-lg bg-muted/60 border border-border flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-muted-foreground/80" weight="regular" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-foreground truncate">
                    {src.name}
                  </p>
                  <p className="text-[11.5px] text-muted-foreground mt-0.5 tracking-tight">
                    <span className="uppercase tracking-[0.04em]">{src.type}</span>
                    <span className="mx-1.5 text-muted-foreground/40">·</span>
                    <span className="tabular-nums">{src.size}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {isProc ? (
                    <Chip
                      tone="accent"
                      iconLeft={<WarningCircle className="w-3.5 h-3.5" weight="regular" />}
                    >
                      Processing
                    </Chip>
                  ) : (
                    <Chip
                      tone="neutral"
                      iconLeft={<CheckCircle className="w-3.5 h-3.5 text-emerald-600" weight="fill" />}
                    >
                      Synced
                    </Chip>
                  )}

                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => removeSource(src.id)}
                      aria-label={`Remove ${src.name}`}
                      className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash className="w-3.5 h-3.5" weight="regular" />
                    </button>
                    <button
                      type="button"
                      aria-label="More options"
                      className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted/60 transition-colors"
                    >
                      <DotsThree className="w-4 h-4" weight="bold" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {sources.length === 0 && !pending && (
          <p className="py-12 text-center text-[13px] text-muted-foreground">
            No sources yet — start by adding a URL above.
          </p>
        )}
      </section>
    </div>
  );
}
