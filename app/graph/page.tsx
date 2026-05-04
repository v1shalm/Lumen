"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight, MagnifyingGlassPlus, MagnifyingGlassMinus,
  Graph as GraphIcon, X,
} from "@phosphor-icons/react";
import { Button } from "@/components/primitives/Button";

type NodeStatus = "synced" | "contradiction" | "pending";

type GraphNode = {
  id: string;
  label: string;
  type: "pdf" | "web" | "repo";
  x: number;
  y: number;
  r: number;
  score: number;
  date: string;
  status: NodeStatus;
};

type Edge = {
  from: string;
  to: string;
  label: "Cites" | "Supports" | "Contradicts";
};

const NODES: GraphNode[] = [
  { id: "n1", label: "nature_paper_2024.pdf",       type: "pdf", x: 310, y: 155, r: 26, score: 98, date: "2h ago",  status: "synced" },
  { id: "n2", label: "arxiv_whitepaper_2024.pdf",   type: "pdf", x: 155, y: 270, r: 22, score: 82, date: "5h ago",  status: "contradiction" },
  { id: "n3", label: "nature.com/articles/s415…",   type: "web", x: 460, y: 270, r: 20, score: 91, date: "1d ago",  status: "synced" },
  { id: "n4", label: "market_intel_q1_2026.pdf",    type: "pdf", x: 240, y: 390, r: 24, score: 95, date: "2d ago",  status: "synced" },
  { id: "n5", label: "quantumscape_whitepaper.pdf", type: "pdf", x: 420, y: 390, r: 18, score: 76, date: "3d ago",  status: "pending" },
  { id: "n6", label: "intel_blueprint_2025.pdf",    type: "pdf", x: 310, y: 490, r: 16, score: 71, date: "4d ago",  status: "pending" },
  { id: "n7", label: "mckinsey_fusion_2025.pdf",    type: "pdf", x: 100, y: 410, r: 19, score: 88, date: "5d ago",  status: "synced" },
];

const EDGES: Edge[] = [
  { from: "n1", to: "n2", label: "Contradicts" },
  { from: "n1", to: "n3", label: "Supports"    },
  { from: "n1", to: "n4", label: "Cites"       },
  { from: "n2", to: "n4", label: "Cites"       },
  { from: "n2", to: "n7", label: "Supports"    },
  { from: "n3", to: "n5", label: "Cites"       },
  { from: "n4", to: "n6", label: "Supports"    },
  { from: "n5", to: "n6", label: "Contradicts" },
];

const STATUS_COLOR: Record<NodeStatus, string> = {
  synced:        "oklch(0.55 0.16 145)",
  contradiction: "oklch(0.62 0.22 25)",
  pending:       "oklch(0.62 0.16 75)",
};

const getNodeById = (id: string) => NODES.find((n) => n.id === id)!;

export default function ResearchGraph() {
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState(1);

  const counts = {
    synced:        NODES.filter((n) => n.status === "synced").length,
    contradiction: NODES.filter((n) => n.status === "contradiction").length,
    pending:       NODES.filter((n) => n.status === "pending").length,
  };

  return (
    <div className="max-w-[1500px] mx-auto -mt-2 pb-12 flex flex-col h-[calc(100vh-7rem)]">
      {/* Page header */}
      <header className="pt-2 pb-8 shrink-0">
        <h1 className="text-[clamp(2.5rem,4.5vw,3.25rem)] font-semibold tracking-[-0.025em] text-foreground leading-[1.05]">
          Knowledge graph
        </h1>
        <p className="mt-3 text-[14px] text-muted-foreground tracking-tight">
          <span className="text-foreground tabular-nums font-semibold">{NODES.length}</span>
          <span className="text-muted-foreground/70"> sources</span>
          <span className="text-muted-foreground/30 mx-2">·</span>
          <span className="text-foreground tabular-nums font-semibold">{EDGES.length}</span>
          <span className="text-muted-foreground/70"> connections</span>
          <span className="text-muted-foreground/30 mx-2">·</span>
          <span className="text-muted-foreground/70">how your research fits together</span>
        </p>
      </header>

      {/* Two-column body */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 flex-1 min-h-0 items-stretch">
        {/* Graph canvas card */}
        <section className="bg-card rounded-2xl card-shadow flex flex-col min-h-0 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-5">
              {([
                { key: "synced",        label: "Synced",         count: counts.synced },
                { key: "contradiction", label: "Contradiction",  count: counts.contradiction },
                { key: "pending",       label: "Pending",        count: counts.pending },
              ] as const).map((legend) => (
                <div key={legend.key} className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: STATUS_COLOR[legend.key] }}
                  />
                  <span className="text-[12.5px] text-muted-foreground">{legend.label}</span>
                  <span className="text-[12.5px] font-semibold tabular-nums text-foreground">{legend.count}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setZoom((z) => Math.min(z + 0.2, 2))}
                aria-label="Zoom in"
                className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                <MagnifyingGlassPlus className="w-4 h-4" weight="regular" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}
                aria-label="Zoom out"
                className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                <MagnifyingGlassMinus className="w-4 h-4" weight="regular" />
              </button>
              <span className="text-[11.5px] text-muted-foreground/60 ml-1.5 tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
            </div>
          </div>

          {/* SVG */}
          <div className="flex-1 min-h-0 relative overflow-hidden cursor-grab active:cursor-grabbing">
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: "radial-gradient(var(--foreground) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 600 600"
              className="transition-transform duration-300 ease-out relative"
              style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
            >
              {EDGES.map((e, i) => {
                const from = getNodeById(e.from);
                const to   = getNodeById(e.to);
                const isContra = e.label === "Contradicts";
                const highlighted = selected?.id === e.from || selected?.id === e.to;
                return (
                  <g key={i}>
                    <line
                      x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                      stroke={isContra ? STATUS_COLOR.contradiction : "var(--border)"}
                      strokeWidth={highlighted ? 1.75 : 1}
                      strokeOpacity={highlighted ? 0.7 : 0.35}
                      strokeDasharray={isContra ? "5 5" : undefined}
                      className="transition-all duration-300"
                    />
                  </g>
                );
              })}

              {NODES.map((node) => {
                const active = selected?.id === node.id;
                const typeLabel = node.type === "pdf" ? "P" : node.type === "web" ? "W" : "R";
                return (
                  <g
                    key={node.id}
                    onClick={() => setSelected(active ? null : node)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={node.x} cy={node.y} r={node.r}
                      fill={active ? STATUS_COLOR[node.status] : "var(--card)"}
                      stroke={active ? STATUS_COLOR[node.status] : "var(--border)"}
                      strokeWidth={active ? 2 : 1.5}
                      className="transition-all duration-200"
                    />
                    <text
                      x={node.x} y={node.y + 4} textAnchor="middle"
                      className="select-none text-[10px] font-semibold transition-colors"
                      fill={active ? "var(--background)" : "var(--muted-foreground)"}
                    >
                      {typeLabel}
                    </text>
                    <text
                      x={node.x} y={node.y + node.r + 16} textAnchor="middle"
                      className="select-none text-[10.5px]"
                      fill={active ? STATUS_COLOR[node.status] : "var(--muted-foreground)"}
                      opacity={active ? 1 : 0.65}
                    >
                      {node.label.length > 22 ? node.label.slice(0, 22) + "…" : node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </section>

        {/* Right rail — node details */}
        <aside className="bg-card rounded-2xl card-shadow flex flex-col min-h-0 overflow-hidden">
          {selected ? (
            <>
              {/* Header */}
              <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3 shrink-0">
                <div className="min-w-0">
                  <p className="text-[11.5px] font-semibold text-muted-foreground tracking-tight mb-1">
                    Node
                  </p>
                  <h2 className="text-[15px] font-semibold leading-tight tracking-tight text-foreground truncate">
                    {selected.label}
                  </h2>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  aria-label="Close"
                  className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" weight="regular" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                <section>
                  <h3 className="text-[12px] font-semibold text-muted-foreground tracking-tight mb-3">
                    Metadata
                  </h3>
                  <dl className="space-y-2">
                    {[
                      { k: "Status",     v: selected.status, color: STATUS_COLOR[selected.status] },
                      { k: "Confidence", v: `${selected.score}%`,  color: undefined },
                      { k: "Type",       v: selected.type.toUpperCase(),     color: undefined },
                      { k: "Updated",    v: selected.date,         color: undefined },
                    ].map(({ k, v, color }) => (
                      <div key={k} className="flex items-center justify-between text-[13px] py-1.5 border-b border-border/60 last:border-0">
                        <dt className="text-muted-foreground">{k}</dt>
                        <dd
                          className="font-semibold tabular-nums"
                          style={color ? { color } : undefined}
                        >
                          {v}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>

                <section>
                  <h3 className="text-[12px] font-semibold text-muted-foreground tracking-tight mb-3">
                    Connections
                  </h3>
                  <ul className="space-y-1.5">
                    {EDGES
                      .filter((e) => e.from === selected.id || e.to === selected.id)
                      .map((e, i) => {
                        const other = getNodeById(e.from === selected.id ? e.to : e.from);
                        const isContra = e.label === "Contradicts";
                        return (
                          <li key={i}>
                            <button
                              type="button"
                              onClick={() => setSelected(other)}
                              className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md hover:bg-muted/40 transition-colors text-left group"
                            >
                              <span className="text-[12.5px] text-foreground truncate group-hover:text-primary transition-colors">
                                {other.label}
                              </span>
                              <span
                                className={cn(
                                  "text-[10.5px] font-semibold shrink-0 tracking-tight",
                                  isContra ? "text-primary" : "text-muted-foreground"
                                )}
                              >
                                {e.label}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                  </ul>
                </section>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-border shrink-0">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  iconRight={<ArrowUpRight className="w-3.5 h-3.5" weight="bold" />}
                >
                  Trace evidence
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center px-10 text-center gap-3">
              <div className="w-10 h-10 rounded-md bg-muted/60 border border-border flex items-center justify-center">
                <GraphIcon className="w-5 h-5 text-muted-foreground/60" weight="regular" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-foreground">Select a node</p>
                <p className="text-[12.5px] text-muted-foreground mt-1 leading-relaxed max-w-[200px]">
                  Click any node on the graph to view its details and connections.
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
