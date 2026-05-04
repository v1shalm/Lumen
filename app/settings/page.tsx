"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  User, GearSix, Bell, ShieldWarning, Cpu, Trash, WarningOctagon,
  type Icon as PhIcon,
} from "@phosphor-icons/react";
import { Toggle } from "@/components/primitives/Toggle";
import { Button } from "@/components/primitives/Button";

type SectionId = "profile" | "workspace" | "ai" | "notifications" | "danger";

type NavEntry = { id: SectionId; label: string; icon: PhIcon };

const NAV: NavEntry[] = [
  { id: "profile",       label: "Profile",       icon: User          },
  { id: "workspace",     label: "Workspace",     icon: GearSix       },
  { id: "ai",            label: "AI model",      icon: Cpu           },
  { id: "notifications", label: "Notifications", icon: Bell          },
  { id: "danger",        label: "Danger zone",   icon: ShieldWarning },
];

const MODELS = [
  { id: "lumen-synthesis-v4", label: "Lumen Synthesis v4", desc: "Default · Best for research synthesis" },
  { id: "lumen-synthesis-v3", label: "Lumen Synthesis v3", desc: "Stable · Lower latency" },
  { id: "custom",             label: "Custom endpoint",     desc: "Bring your own model" },
];

export default function SettingsPage() {
  const [active, setActive] = useState<SectionId>("profile");
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState("Vishal Maurya");
  const [email] = useState("vishal@mauryan.tech");
  const [model, setModel] = useState("lumen-synthesis-v4");
  const [synthDepth, setSynthDepth] = useState(85);

  const [conflictDetection, setConflictDetection] = useState(true);
  const [autoSynth, setAutoSynth] = useState(true);
  const [streamingMode, setStreamingMode] = useState(true);
  const [notifSynthesis, setNotifSynthesis] = useState(true);
  const [notifConflict, setNotifConflict] = useState(true);
  const [notifIngestion, setNotifIngestion] = useState(false);
  const [notifWeekly, setNotifWeekly] = useState(true);

  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 1800); };

  return (
    <div className="max-w-[1500px] mx-auto -mt-2 pb-12">
      {/* Page header */}
      <header className="pt-2 pb-8">
        <h1 className="text-[clamp(2.5rem,4.5vw,3.25rem)] font-semibold tracking-[-0.025em] text-foreground leading-[1.05]">
          Settings
        </h1>
        <p className="mt-3 text-[14px] text-muted-foreground tracking-tight">
          Manage your account, AI behaviour, and notifications.
        </p>
      </header>

      {/* Two-column layout: nav left, panel right */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-8 items-start">
        {/* Left nav */}
        <nav className="lg:sticky lg:top-20">
          <ul className="space-y-px">
            {NAV.map((item) => {
              const isActive = active === item.id;
              const isDanger = item.id === "danger";
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setActive(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 h-9 px-3 rounded-md text-[13.5px]",
                      "transition-[background-color,box-shadow,color] duration-150 ease-out",
                      isActive
                        ? isDanger
                          ? "bg-card text-primary font-semibold card-shadow"
                          : "bg-card text-foreground font-semibold card-shadow"
                        : "text-foreground/75 font-medium hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-[17px] h-[17px] shrink-0",
                        isActive
                          ? isDanger ? "text-primary" : "text-foreground"
                          : "text-foreground/65"
                      )}
                      weight={isActive ? "fill" : "regular"}
                    />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right panel — sections */}
        <div className="space-y-6">
          {active === "profile" && (
            <SectionCard title="Profile" description="Your name and email.">
              <div className="flex items-center gap-5 pb-6 border-b border-border">
                <div className="w-16 h-16 rounded-full bg-foreground flex items-center justify-center text-[22px] font-semibold text-background shrink-0">
                  {name[0]}
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-foreground leading-tight">{name}</p>
                  <p className="text-[12.5px] text-muted-foreground mt-0.5">{email}</p>
                </div>
              </div>

              <FieldRow label="Display name">
                <TextInput value={name} onChange={setName} />
              </FieldRow>
              <FieldRow label="Registered email">
                <TextInput value={email} disabled />
              </FieldRow>

              <SaveButton saved={saved} onClick={handleSave} />
            </SectionCard>
          )}

          {active === "workspace" && (
            <SectionCard title="Workspace" description="How your workspace is named and what language Lumen uses.">
              <FieldRow label="Handle">
                <TextInput defaultValue="LUMEN_MAURYA_WORKSPACE" />
              </FieldRow>
              <FieldRow label="Language">
                <select className="h-10 w-full px-3 bg-card border border-border rounded-md text-[13.5px] outline-none focus:border-foreground/30 transition-colors cursor-pointer">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </FieldRow>

              <SaveButton saved={saved} onClick={handleSave} />
            </SectionCard>
          )}

          {active === "ai" && (
            <>
              <SectionCard title="Synthesis model" description="The model Lumen uses to read and synthesise your sources.">
                <ul className="space-y-2">
                  {MODELS.map((m) => {
                    const selected = model === m.id;
                    return (
                      <li key={m.id}>
                        <button
                          type="button"
                          onClick={() => setModel(m.id)}
                          className={cn(
                            "w-full flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl border transition-colors text-left",
                            selected
                              ? "border-foreground/30 bg-muted/40"
                              : "border-border hover:bg-muted/30"
                          )}
                        >
                          <div>
                            <p className="text-[14px] font-semibold text-foreground">{m.label}</p>
                            <p className="text-[12.5px] text-muted-foreground mt-0.5">{m.desc}</p>
                          </div>
                          <span
                            className={cn(
                              "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                              selected ? "bg-foreground border-foreground" : "border-border"
                            )}
                          >
                            {selected && <span className="w-1.5 h-1.5 rounded-full bg-background" />}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </SectionCard>

              <SectionCard title="Synthesis depth" description={`How deeply Lumen connects findings across your sources (${synthDepth}%).`}>
                <input
                  type="range"
                  min={20} max={100} step={5}
                  value={synthDepth}
                  onChange={(e) => setSynthDepth(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-muted rounded-full appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground/60 tracking-tight mt-1">
                  <span>Low</span><span>High</span>
                </div>
              </SectionCard>

              <SectionCard title="Behaviour" description="How Lumen reacts to new sources and contradictions.">
                <ToggleRow
                  label="Conflict tracking"
                  description="Notify me when sources disagree."
                  value={conflictDetection}
                  onChange={setConflictDetection}
                />
                <ToggleRow
                  label="Auto-synthesis"
                  description="Synthesise findings automatically when new sources are added."
                  value={autoSynth}
                  onChange={setAutoSynth}
                />
                <ToggleRow
                  label="Response streaming"
                  description="Show responses as Lumen writes them."
                  value={streamingMode}
                  onChange={setStreamingMode}
                  last
                />
                <SaveButton saved={saved} onClick={handleSave} />
              </SectionCard>
            </>
          )}

          {active === "notifications" && (
            <SectionCard title="Notifications" description="Pick what Lumen tells you about.">
              <ToggleRow
                label="Synthesis complete"
                description="Notify when Lumen finishes a synthesis."
                value={notifSynthesis}
                onChange={setNotifSynthesis}
              />
              <ToggleRow
                label="Conflict found"
                description="Notify when sources contradict each other."
                value={notifConflict}
                onChange={setNotifConflict}
              />
              <ToggleRow
                label="Source added"
                description="Notify when a new source is ready to use."
                value={notifIngestion}
                onChange={setNotifIngestion}
              />
              <ToggleRow
                label="Weekly summary"
                description="Email recap of what changed in your workspace each week."
                value={notifWeekly}
                onChange={setNotifWeekly}
                last
              />
              <SaveButton saved={saved} onClick={handleSave} />
            </SectionCard>
          )}

          {active === "danger" && (
            <section className="bg-card rounded-2xl card-shadow-alert overflow-hidden border border-primary/30">
              <div className="px-7 pt-6 pb-4">
                <h2 className="text-[16px] font-semibold text-primary tracking-tight">
                  Danger zone
                </h2>
                <p className="text-[12.5px] text-muted-foreground mt-1">
                  Destructive actions that cannot be reversed.
                </p>
              </div>
              <div className="px-7 py-5 border-t border-border space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[oklch(0.93_0.05_25)] flex items-center justify-center shrink-0">
                    <WarningOctagon className="w-5 h-5 text-primary" weight="fill" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[14.5px] font-semibold text-foreground">Delete all workspace data</p>
                    <p className="text-[12.5px] text-muted-foreground leading-relaxed max-w-md">
                      Removes every source, finding, and activity record from this workspace.
                      This cannot be undone.
                    </p>
                  </div>
                </div>
                {deleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="md" onClick={() => setDeleteConfirm(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => setDeleteConfirm(false)}
                      iconLeft={<Trash className="w-3.5 h-3.5" weight="regular" />}
                    >
                      Yes, delete everything
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setDeleteConfirm(true)}
                    iconLeft={<Trash className="w-3.5 h-3.5" weight="regular" />}
                  >
                    Delete workspace data
                  </Button>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────── Subcomponents ─────────── */

function SectionCard({
  title, description, children,
}: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="bg-card rounded-2xl card-shadow overflow-hidden">
      <div className="px-7 pt-6 pb-4">
        <h2 className="text-[16px] font-semibold text-foreground tracking-tight">{title}</h2>
        {description && (
          <p className="text-[12.5px] text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="px-7 pb-6 pt-1 space-y-5">{children}</div>
    </section>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-3 py-3 border-b border-border last:border-0">
      <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function TextInput({
  value, defaultValue, onChange, disabled,
}: {
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <input
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.value)}
      className={cn(
        "h-10 px-3 bg-card border rounded-md text-[13.5px] outline-none transition-colors",
        disabled
          ? "border-border text-muted-foreground/70 cursor-not-allowed"
          : "border-border focus:border-foreground/30"
      )}
    />
  );
}

function ToggleRow({
  label, description, value, onChange, last,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-4 py-3.5", !last && "border-b border-border")}>
      <div className="space-y-0.5">
        <p className="text-[13.5px] font-semibold text-foreground">{label}</p>
        <p className="text-[12.5px] text-muted-foreground">{description}</p>
      </div>
      <Toggle checked={value} onChange={onChange} />
    </div>
  );
}

function SaveButton({ saved, onClick }: { saved: boolean; onClick: () => void }) {
  return (
    <div className="pt-2">
      <Button variant={saved ? "secondary" : "primary"} size="md" onClick={onClick}>
        {saved ? "Saved" : "Save changes"}
      </Button>
    </div>
  );
}
