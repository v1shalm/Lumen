"use client";

import React from "react";
import { Microphone, PaperPlaneRight, Square, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type ComposerProps = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onStartRecord?: () => void;
  onStopRecord?: () => void;
  onCancelRecord?: () => void;
  isStreaming?: boolean;
  onAbortStream?: () => void;
  isRecording?: boolean;
  recordingSeconds?: number;
  placeholder?: string;
  /** Optional element rendered above the action row (e.g. transcribed text during recording). */
  transcript?: React.ReactNode;
  /** Strips the outer white card/shadow — use when the composer sits inside another card. */
  bare?: boolean;
  className?: string;
};

/**
 * Two-zone chat composer.
 *
 * Idle / typing — top textarea, bottom action row (mic ▏ send).
 * Streaming — Send button switches to a square stop control.
 * Recording — top zone shows live transcript, bottom zone shows waveform + timer + cancel(X) + stop.
 */
export function Composer({
  value, onChange, onSubmit,
  onStartRecord, onStopRecord, onCancelRecord,
  isStreaming, onAbortStream,
  isRecording, recordingSeconds = 0,
  placeholder = "Start typing…",
  transcript,
  bare,
  className,
}: ComposerProps) {
  const ref = React.useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const canSend = value.trim().length > 0 && !isStreaming;

  return (
    <div
      className={cn(
        bare
          ? "bg-transparent"
          : "bg-card rounded-2xl card-shadow-md overflow-hidden",
        className
      )}
    >
      {/* Top zone — text input or transcript */}
      <div className={cn(bare ? "pb-2 min-h-[40px]" : "px-5 pt-4 pb-3 min-h-[64px]")}>
        {isRecording && transcript ? (
          <div className="text-[15px] leading-[1.5] text-foreground">{transcript}</div>
        ) : (
          <textarea
            ref={ref}
            rows={1}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isStreaming || isRecording}
            className="w-full bg-transparent resize-none text-[15px] leading-[1.5] outline-none placeholder:text-muted-foreground/50 disabled:opacity-50 max-h-40"
          />
        )}
      </div>

      {/* Hairline divider — hidden in bare mode (the host card supplies the rule) */}
      {!bare && <div className="h-px bg-border mx-3" />}

      {/* Bottom action row */}
      <div className={cn("flex items-center gap-3", bare ? "py-1" : "px-3 py-2.5")}>
        {isRecording ? (
          <>
            <button
              type="button"
              onClick={onCancelRecord}
              aria-label="Cancel recording"
              className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground/70 hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <X className="w-4 h-4" weight="regular" />
            </button>

            <Waveform className="flex-1 h-7" />

            <span className="text-[12px] text-muted-foreground tabular-nums">
              {formatDuration(recordingSeconds)}
            </span>

            <span className="w-px h-5 bg-border mx-1" />

            <button
              type="button"
              onClick={onStopRecord}
              aria-label="Stop recording"
              className="w-9 h-9 flex items-center justify-center rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              <Square className="w-3 h-3" weight="fill" />
            </button>

            <button
              type="button"
              onClick={onSubmit}
              className="h-9 px-4 rounded-md bg-[oklch(0.32_0.005_35)] text-white text-[13px] font-semibold hover:bg-[oklch(0.28_0.005_35)] transition-colors"
            >
              Send
            </button>
          </>
        ) : (
          <>
            {onStartRecord && (
              <button
                type="button"
                onClick={onStartRecord}
                aria-label="Record voice"
                className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground/70 hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                <Microphone className="w-4 h-4" weight="regular" />
              </button>
            )}

            <div className="flex-1" />

            <span className="w-px h-5 bg-border mx-1" />

            <button
              type="button"
              onClick={() => (isStreaming ? onAbortStream?.() : onSubmit())}
              disabled={!canSend && !isStreaming}
              aria-label={isStreaming ? "Stop response" : "Send"}
              className={cn(
                "h-9 px-4 rounded-md text-[13px] font-semibold transition-colors flex items-center gap-1.5",
                isStreaming
                  ? "bg-[oklch(0.32_0.005_35)] text-white hover:bg-[oklch(0.28_0.005_35)]"
                  : canSend
                  ? "bg-[oklch(0.32_0.005_35)] text-white hover:bg-[oklch(0.28_0.005_35)]"
                  : "bg-muted text-muted-foreground/50 cursor-not-allowed"
              )}
            >
              {isStreaming ? (
                <>
                  <Square className="w-3 h-3" weight="fill" />
                  Stop
                </>
              ) : (
                <>
                  Send
                  <PaperPlaneRight className="w-3.5 h-3.5" weight="fill" />
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────── Waveform — static bars (mock visual) ─────────── */

function Waveform({ className }: { className?: string }) {
  // 32 bars, varied heights, evenly distributed
  const bars = React.useMemo(
    () => Array.from({ length: 32 }, (_, i) => 0.4 + 0.55 * Math.abs(Math.sin(i * 1.7))),
    []
  );
  return (
    <div className={cn("flex items-center gap-[2px]", className)} aria-hidden>
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-[2px] rounded-full bg-muted-foreground/40"
          style={{ height: `${Math.round(h * 100)}%` }}
        />
      ))}
    </div>
  );
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
