"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CircleNotch,
  CheckCircle,
  Circle,
  Terminal,
  Database,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

const steps = [
  { id: 1, label: "Extracting knowledge from sources" },
  { id: 2, label: "Tagging entities and semantic roles" },
  { id: 3, label: "Mapping inter-source relationships" },
  { id: 4, label: "Detecting theoretical conflicts" },
];

const mockLogs = [
  "[12:44:01] Fetching https://nature.com/articles/s41586-024",
  "[12:44:03] Parsed HTML — extracted 4,200 words.",
  "[12:44:05] Running NER (Named Entity Recognition)...",
  "[12:44:08] Found 12 entities: 'Quantum Bit', 'Topological Insulator'...",
  "[12:44:10] Initializing semantic role labeling...",
  "[12:44:12] Agent #42 spawning for relationship mapping...",
];

export function ProcessingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentStep] = useState(1);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      let i = 0;
      const interval = setInterval(() => {
        if (i < mockLogs.length) {
          setLogs(prev => [...prev, mockLogs[i]]);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 800);
      return () => clearInterval(interval);
    } else {
      setLogs([]);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border border-border rounded-xl shadow-2xl bg-card gap-0 duration-200">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between px-5 py-4 border-b border-border space-y-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center shrink-0">
              <CircleNotch className="w-4 h-4 text-primary animate-spin" weight="bold" />
            </div>
            <div>
              <DialogTitle className="text-[14px] font-semibold">Analyzing Sources</DialogTitle>
              <p className="text-[11px] font-mono text-muted-foreground mt-0.5">Synthesis agent is processing…</p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-5">
          {/* Steps */}
          <div className="space-y-2.5">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center gap-3">
                {idx < currentStep ? (
                  <CheckCircle className="w-3.5 h-3.5 text-[oklch(0.40_0.16_145)] shrink-0" weight="fill" />
                ) : idx === currentStep ? (
                  <CircleNotch className="w-3.5 h-3.5 text-primary animate-spin shrink-0" weight="bold" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-border shrink-0" weight="regular" />
                )}
                <span className={cn(
                  "text-[13px]",
                  idx < currentStep  ? "text-foreground" : 
                  idx === currentStep ? "text-primary font-medium" : 
                  "text-muted-foreground"
                )}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <Progress value={45} className="h-1 bg-muted" />

          {/* Live logs */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              <Terminal className="w-3 h-3" weight="regular" />
              Live log
            </div>
            <div className="bg-background border border-border/60 rounded-lg p-3.5 h-36 overflow-y-auto space-y-1">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
                  <span className="text-primary text-[11px] font-mono shrink-0">›</span>
                  <span className="text-[11px] font-mono text-muted-foreground leading-relaxed">{log}</span>
                </div>
              ))}
              <span className="inline-block w-1.5 h-3 bg-primary animate-pulse align-middle" />
            </div>
          </div>

          {/* Source stream */}
          <div className="border border-border rounded-lg p-4 bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Source stream</span>
              <span className="text-[10px] font-mono text-[oklch(0.40_0.16_145)] bg-[oklch(0.93_0.04_145)] px-2 py-0.5 rounded-md border border-[oklch(0.40_0.16_145)]/20">3 active</span>
            </div>
            <div className="space-y-2">
              {[
                { icon: Database,        name: "nature.com/articles/…", status: "Synced",     ok: true },
                { icon: MagnifyingGlass, name: "arxiv.org/abs/2104…",   status: "Extracting", ok: false },
              ].map((src) => (
                <div key={src.name} className="flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <src.icon className="w-3 h-3 shrink-0" weight="regular" />
                    {src.name}
                  </div>
                  <span style={{ color: src.ok ? "oklch(0.40 0.16 145)" : "var(--primary)" }}>
                    {src.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-border bg-muted/20">
          <p className="text-[11px] font-mono text-muted-foreground">Do not close until complete.</p>
          <button 
            onClick={onClose}
            className="text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
