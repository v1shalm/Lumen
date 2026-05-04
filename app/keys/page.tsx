"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Key, Plus, Copy, Trash, Eye, EyeSlash, CheckCircle, X,
} from "@phosphor-icons/react";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";

type Status = "active" | "expired";

type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  created: string;
  lastUsed: string;
  status: Status;
  permissions: string[];
};

const INITIAL_KEYS: ApiKey[] = [
  { id: "k1", name: "Production workspace", prefix: "lmn_prod_••••••••", created: "Apr 10, 2026", lastUsed: "2 min ago",   status: "active",  permissions: ["read", "write", "synthesis"] },
  { id: "k2", name: "CI/CD pipeline",        prefix: "lmn_ci_••••••••",  created: "Mar 28, 2026", lastUsed: "1 day ago",  status: "active",  permissions: ["read"] },
  { id: "k3", name: "Local dev",             prefix: "lmn_dev_••••••••", created: "Feb 14, 2026", lastUsed: "12 days ago", status: "expired", permissions: ["read", "write"] },
];

function generateKey() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return "lmn_" + Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newPerms, setNewPerms] = useState<string[]>(["read"]);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const createKey = () => {
    if (!newKeyName.trim()) return;
    const key = generateKey();
    setKeys((prev) => [
      {
        id: `k${Date.now()}`,
        name: newKeyName.trim(),
        prefix: key.slice(0, 12) + "••••••••",
        created: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        lastUsed: "Never",
        status: "active",
        permissions: newPerms,
      },
      ...prev,
    ]);
    setGeneratedKey(key);
    setNewKeyName("");
    setNewPerms(["read"]);
  };

  const copyKey = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const revokeKey = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
    setRevokeId(null);
  };

  return (
    <div className="max-w-[1500px] mx-auto -mt-2 pb-12">
      {/* Page header */}
      <header className="pt-2 pb-8 flex items-end justify-between gap-6">
        <div>
          <h1 className="text-[clamp(2.5rem,4.5vw,3.25rem)] font-semibold tracking-[-0.025em] text-foreground leading-[1.05]">
            API keys
          </h1>
          <p className="mt-3 text-[14px] text-muted-foreground tracking-tight">
            <span className="text-foreground tabular-nums font-semibold">{keys.length}</span>
            <span className="text-muted-foreground/70"> keys · use these to connect Lumen to your code or other tools</span>
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => { setCreating(true); setGeneratedKey(null); }}
          iconLeft={<Plus className="w-3.5 h-3.5" weight="bold" />}
        >
          New key
        </Button>
      </header>

      {/* Creation card */}
      {creating && !generatedKey && (
        <section className="bg-card rounded-2xl card-shadow overflow-hidden mb-6">
          <div className="px-7 pt-6 pb-4 flex items-baseline justify-between">
            <h2 className="text-[15px] font-semibold text-foreground tracking-tight">New API key</h2>
            <button
              onClick={() => setCreating(false)}
              className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" weight="regular" />
            </button>
          </div>
          <div className="px-7 pb-6 space-y-5">
            <div className="space-y-2">
              <label className="block text-[12.5px] font-medium text-muted-foreground">Token name</label>
              <input
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. Production backend"
                className="w-full h-10 px-3 bg-card border border-border rounded-md text-[13.5px] outline-none focus:border-foreground/30 placeholder:text-muted-foreground/50 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[12.5px] font-medium text-muted-foreground">Permissions</label>
              <div className="flex gap-1.5">
                {["read", "write", "synthesis"].map((p) => {
                  const selected = newPerms.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() =>
                        setNewPerms((prev) =>
                          prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
                        )
                      }
                      className={cn(
                        "h-8 px-3 rounded-md text-[12.5px] font-medium transition-colors border",
                        selected
                          ? "bg-foreground text-background border-foreground"
                          : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      )}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                disabled={!newKeyName.trim()}
                onClick={createKey}
              >
                Generate key
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Reveal card */}
      {generatedKey && (
        <section className="bg-card rounded-2xl card-shadow overflow-hidden mb-6 border border-emerald-600/25">
          <div className="px-7 pt-6 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-600" weight="fill" />
              <h2 className="text-[15px] font-semibold text-foreground tracking-tight">
                Key generated — save it now
              </h2>
            </div>
            <p className="text-[12.5px] text-muted-foreground">
              This key won&apos;t be shown again after you dismiss this panel.
            </p>
          </div>
          <div className="px-7 pb-6 space-y-3">
            <div className="flex items-center gap-2 bg-muted/40 border border-border rounded-md p-1.5">
              <code className="flex-1 px-3 py-2 text-[13px] font-mono text-foreground select-all overflow-x-auto whitespace-nowrap">
                {revealed ? generatedKey : generatedKey.slice(0, 12) + "••••••••••••••••••••"}
              </code>
              <button
                onClick={() => setRevealed((v) => !v)}
                aria-label={revealed ? "Hide" : "Show"}
                className="w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                {revealed
                  ? <EyeSlash className="w-4 h-4" weight="regular" />
                  : <Eye className="w-4 h-4" weight="regular" />}
              </button>
              <button
                onClick={copyKey}
                className={cn(
                  "h-9 px-3 flex items-center gap-1.5 rounded-md text-[12.5px] font-semibold transition-colors",
                  copied
                    ? "bg-emerald-600 text-white"
                    : "bg-foreground text-background hover:bg-foreground/90"
                )}
              >
                {copied
                  ? <CheckCircle className="w-3.5 h-3.5" weight="fill" />
                  : <Copy className="w-3.5 h-3.5" weight="regular" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <button
              onClick={() => { setCreating(false); setGeneratedKey(null); }}
              className="text-[12.5px] font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              I&apos;ve saved the key →
            </button>
          </div>
        </section>
      )}

      {/* Keys list */}
      <section className="bg-card rounded-2xl card-shadow overflow-hidden">
        <div className="px-6 py-3 border-b border-border flex items-baseline justify-between">
          <h2 className="text-[14px] font-semibold text-foreground tracking-tight">Active tokens</h2>
          <span className="text-[11.5px] text-muted-foreground/70 tabular-nums">{keys.length}</span>
        </div>

        <ul>
          {keys.map((k, i, arr) => (
            <li
              key={k.id}
              className={cn(
                "group grid grid-cols-[40px_minmax(0,1fr)_auto_auto_140px_44px] items-center gap-4 px-6 py-4",
                i < arr.length - 1 && "border-b border-border/60"
              )}
            >
              <div className="w-9 h-9 rounded-md bg-muted/60 border border-border flex items-center justify-center shrink-0">
                <Key className="w-4 h-4 text-muted-foreground/80" weight="regular" />
              </div>

              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-foreground truncate">{k.name}</p>
                <p className="text-[11.5px] text-muted-foreground mt-0.5 truncate">
                  <code className="font-mono">{k.prefix}</code>
                  <span className="mx-1.5 text-muted-foreground/40">·</span>
                  Created {k.created}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                {k.permissions.map((p) => (
                  <Chip key={p} tone="neutral">{p}</Chip>
                ))}
              </div>

              <div className="text-right hidden lg:block">
                <p className="text-[11.5px] text-muted-foreground/70">Last used</p>
                <p className="text-[12.5px] font-medium text-foreground tabular-nums mt-0.5">{k.lastUsed}</p>
              </div>

              <div>
                {k.status === "active" ? (
                  <Chip tone="neutral" iconLeft={<span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}>
                    Active
                  </Chip>
                ) : (
                  <Chip tone="neutral">Expired</Chip>
                )}
              </div>

              <div className="flex justify-end">
                {revokeId === k.id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => revokeKey(k.id)}
                      className="text-[11.5px] font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      Revoke
                    </button>
                    <button
                      onClick={() => setRevokeId(null)}
                      className="text-[11.5px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setRevokeId(k.id)}
                    aria-label={`Revoke ${k.name}`}
                    className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash className="w-3.5 h-3.5" weight="regular" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Footer hint */}
      <p className="mt-6 text-[12.5px] text-muted-foreground">
        Auth header:&nbsp;
        <code className="font-mono text-foreground bg-muted/60 border border-border px-2 py-0.5 rounded-md">
          Bearer lmn_token_v4
        </code>
      </p>
    </div>
  );
}
