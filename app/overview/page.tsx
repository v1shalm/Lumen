"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "@phosphor-icons/react";
import { Bubble } from "@/components/primitives/Bubble";
import { Composer } from "@/components/primitives/Composer";

type Message = {
  role: "user" | "bot";
  content: string;
  timestamp: string;
  streaming?: boolean;
};

const formatTime = (d: Date) =>
  d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

const INITIAL_MESSAGES: Message[] = [
  {
    role: "bot",
    content:
      "I've indexed your latest sources on quantum computing. The Nature paper and the Arxiv whitepaper disagree on error-correction thresholds — want me to walk through the contradiction?",
    timestamp: formatTime(new Date()),
  },
];

const SUGGESTED_PROMPTS = [
  "Compare my last two sources on the surface-code threshold.",
  "List every contradiction across the workspace.",
  "Summarise what changed since yesterday.",
];

const TODAY_RIBBON = [
  { time: "12:44", subject: "arxiv_whitepaper", meaning: "3 claims contradict the Nature paper" },
  { time: "11:08", subject: "Knowledge Graph",  meaning: "84 new connections from this morning's sources" },
  { time: "09:21", subject: "q1_market_intel",  meaning: "Indexed 4 pages, found 52 named entities" },
];

const ACTIVE_CONTEXT = [
  { name: "nature_paper_2024.pdf",     meta: "Nature · 14 pages" },
  { name: "arxiv_whitepaper_2024.pdf", meta: "Arxiv · 22 pages" },
  { name: "q1_market_intel.pdf",       meta: "Internal · 4 pages" },
];

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

function renderContent(text: string) {
  const lines = text.split("\n");
  return lines.map((line, li) => {
    if (line.trim() === "") return <div key={li} className="h-2" />;
    if (line.startsWith("• ") || line.startsWith("- ")) {
      return (
        <div key={li} className="flex gap-2 items-start">
          <span className="text-muted-foreground/50 mt-1.5 shrink-0">·</span>
          <span>{renderInline(line.slice(2))}</span>
        </div>
      );
    }
    return <p key={li}>{renderInline(line)}</p>;
  });
}

export default function Overview() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sourceCount, setSourceCount] = useState(14);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Voice recording state — wired into Composer; mock timer for now
  const [isRecording, setIsRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const recTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRecording) return;
    setRecSeconds(0);
    recTimerRef.current = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    return () => { if (recTimerRef.current) clearInterval(recTimerRef.current); };
  }, [isRecording]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const update = () => {
      const c = localStorage.getItem("lumen-context-count");
      if (c) setSourceCount(parseInt(c));
    };
    update();
    window.addEventListener("storage", update);
    return () => window.removeEventListener("storage", update);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    const userMsg: Message = { role: "user", content: text.trim(), timestamp: formatTime(new Date()) };
    const botMsg:  Message = { role: "bot",  content: "",          timestamp: formatTime(new Date()), streaming: true };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
    setIsStreaming(true);

    abortRef.current = new AbortController();
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() }),
        signal: abortRef.current.signal,
      });
      if (!res.ok || !res.body) throw new Error("Stream failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last.role === "bot") next[next.length - 1] = { ...last, content: last.content + chunk };
          return next;
        });
      }
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last.role === "bot" && last.streaming)
            next[next.length - 1] = { ...last, content: "Something went wrong. Try again.", streaming: false };
          return next;
        });
      }
    } finally {
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last.role === "bot") next[next.length - 1] = { ...last, streaming: false };
        return next;
      });
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [isStreaming]);

  const nodeCount = sourceCount * 22;
  const isFresh = messages.length <= 1;

  return (
    <div className="max-w-[1500px] mx-auto -mt-2 pb-12">
      {/* ───── Page title — sits above both columns ───── */}
      <header className="pt-2 pb-8 flex items-end justify-between gap-8">
        <div>
          <h1 className="text-[clamp(2.5rem,4.5vw,3.25rem)] font-semibold tracking-[-0.025em] text-foreground leading-[1.05]">
            Overview
          </h1>
          <p className="mt-3 text-[14px] text-muted-foreground tracking-tight">
            <span className="text-foreground tabular-nums font-semibold">{sourceCount}</span>
            <span className="text-muted-foreground/70"> sources</span>
            <span className="text-muted-foreground/30 mx-2">·</span>
            <span className="text-foreground tabular-nums font-semibold">{nodeCount}</span>
            <span className="text-muted-foreground/70"> nodes</span>
            <span className="text-muted-foreground/30 mx-2">·</span>
            <span className="text-muted-foreground/70">updated 12 minutes ago</span>
          </p>
        </div>
      </header>

      {/* ───── Two-column body: chat (left, tall) + supporting cards (right, stacked) ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
        {/* Chat card — fixed height; older messages scroll up and fade out at top */}
        <section className="bg-card rounded-2xl card-shadow flex flex-col h-[760px]">
          <div className="px-7 pt-6 pb-4 shrink-0">
            <h2 className="text-[16px] font-semibold text-foreground tracking-tight">
              Ask your workspace
            </h2>
            <p className="text-[12.5px] text-muted-foreground mt-1">
              Lumen reads across all {sourceCount} of your sources.
            </p>
          </div>

          <div
            className="flex-1 min-h-0 overflow-y-auto px-7 pb-5 pt-2 space-y-4"
            style={{
              maskImage:
                "linear-gradient(to bottom, transparent 0, black 56px, black calc(100% - 8px), black 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0, black 56px, black calc(100% - 8px), black 100%)",
            }}
          >
            {messages.map((msg, i) => {
              const isLead = msg.role === "bot" && i === 0;
              return (
                <Bubble
                  key={i}
                  role={msg.role}
                  tone={isLead ? "lead" : "default"}
                  timestamp={msg.timestamp}
                >
                  {msg.role === "bot" ? (
                    <div className="space-y-2.5">
                      {renderContent(msg.content)}
                      {msg.streaming && (
                        <span className="inline-block w-[2px] h-4 bg-foreground/70 align-middle ml-0.5 animate-pulse" />
                      )}
                    </div>
                  ) : (
                    msg.content
                  )}
                </Bubble>
              );
            })}

            {isStreaming && messages[messages.length - 1]?.content === "" && (
              <Bubble role="bot">
                <div className="flex items-center gap-1.5 py-0.5">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce"
                      style={{ animationDelay: `${d * 140}ms` }}
                    />
                  ))}
                </div>
              </Bubble>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer — inside the card, hairline above. Suggested prompts above
              show only on a fresh conversation. */}
          <div className="border-t border-border px-4 pt-3 pb-4 shrink-0 bg-card rounded-b-2xl space-y-3">
            {isFresh && (
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => sendMessage(p)}
                    className="text-[12px] text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-md border border-border hover:border-foreground/30 hover:bg-muted/40 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
            <Composer
              bare
              value={input}
              onChange={setInput}
              onSubmit={() => sendMessage(input)}
              isStreaming={isStreaming}
              onAbortStream={() => abortRef.current?.abort()}
              isRecording={isRecording}
              recordingSeconds={recSeconds}
              onStartRecord={() => setIsRecording(true)}
              onStopRecord={() => setIsRecording(false)}
              onCancelRecord={() => setIsRecording(false)}
              transcript={isRecording ? "Listening… speak now." : undefined}
              placeholder="Ask about your workspace…"
            />
          </div>
        </section>

        {/* Right rail — three stacked cards */}
        <aside className="space-y-5">

        {/* Today — compact list inside its own card */}
        <section className="bg-card rounded-2xl card-shadow overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-baseline justify-between">
            <h2 className="text-[14px] font-semibold text-foreground tracking-tight">Today</h2>
            <Link
              href="/logs"
              className="text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              All activity →
            </Link>
          </div>
          <ul className="px-3 pb-3">
            {TODAY_RIBBON.map((row, i, arr) => (
              <li
                key={row.time}
                className={cn(
                  "px-2 py-2.5 rounded-md group hover:bg-muted/40 transition-colors cursor-pointer",
                  i < arr.length - 1 && "border-b border-border/60"
                )}
              >
                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                  <span className="text-[13px] text-foreground font-semibold truncate">
                    {row.subject}
                  </span>
                  <span className="text-[11px] text-muted-foreground/60 tabular-nums shrink-0">
                    {row.time}
                  </span>
                </div>
                <p className="text-[12.5px] text-muted-foreground leading-snug">
                  {row.meaning}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Active context */}
        <section className="bg-card rounded-2xl card-shadow overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-border">
            <h2 className="text-[14px] font-semibold text-foreground tracking-tight">
              Active context
            </h2>
            <p className="text-[11.5px] text-muted-foreground mt-0.5">
              {ACTIVE_CONTEXT.length} sources in this conversation
            </p>
          </div>
          <ul className="px-3 py-3">
            {ACTIVE_CONTEXT.map((src, i) => (
              <li key={src.name}>
                <button
                  type="button"
                  className="w-full flex items-baseline gap-3 px-2 py-2 rounded-md hover:bg-muted/50 transition-colors text-left group"
                >
                  <span className="text-[10.5px] text-muted-foreground/40 tabular-nums w-4 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] text-foreground truncate group-hover:text-primary transition-colors">
                      {src.name}
                    </span>
                    <span className="block text-[11.5px] text-muted-foreground/70 truncate mt-0.5">
                      {src.meta}
                    </span>
                  </span>
                  <ArrowUpRight
                    className="w-3 h-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    weight="regular"
                  />
                </button>
              </li>
            ))}
          </ul>

          <div className="border-t border-border px-5 py-3.5">
            <Link
              href="/"
              className="text-[12.5px] text-primary hover:text-primary/80 transition-colors font-semibold"
            >
              Manage sources →
            </Link>
          </div>
        </section>

        {/* Workspace shortcuts */}
        <section className="bg-card rounded-2xl card-shadow overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <h2 className="text-[14px] font-semibold text-foreground tracking-tight">Workspace</h2>
          </div>
          <ul className="px-3 pb-3">
            {[
              { label: "Knowledge graph",   count: "84 connections", href: "/graph" },
              { label: "Verified insights", count: "12 ready",        href: "/results" },
              { label: "Activity",          count: "Today",            href: "/logs" },
            ].map((row, i, arr) => (
              <li key={row.label} className={cn(i < arr.length - 1 && "border-b border-border/60")}>
                <Link
                  href={row.href}
                  className="flex items-baseline justify-between px-2 py-2.5 rounded-md hover:bg-muted/50 transition-colors group"
                >
                  <span className="text-[13px] text-foreground group-hover:text-primary transition-colors">
                    {row.label}
                  </span>
                  <span className="text-[11.5px] text-muted-foreground/70 tabular-nums">
                    {row.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        </aside>
      </div>
    </div>
  );
}
