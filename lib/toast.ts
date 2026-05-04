"use client";

import { sileo, type SileoOptions } from "sileo";

const BASE_STYLES: SileoOptions["styles"] = {
  title:
    "text-[13.5px] font-semibold tracking-tight text-[var(--foreground)]",
  description:
    "text-[12.5px] text-[var(--muted-foreground)] tracking-tight leading-snug",
  badge:
    "bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)]",
  button:
    "h-8 px-3 rounded-md text-[12.5px] font-semibold bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity",
};

const BASE: Partial<SileoOptions> = {
  position: "bottom-right",
  duration: 4200,
  roundness: 14,
  fill: "var(--card)",
  styles: BASE_STYLES,
};

type ToastInput = Omit<SileoOptions, "type">;

export const toast = {
  success: (opts: ToastInput) => sileo.success({ ...BASE, ...opts }),
  error:   (opts: ToastInput) => sileo.error({   ...BASE, ...opts }),
  info:    (opts: ToastInput) => sileo.info({    ...BASE, ...opts }),
  warning: (opts: ToastInput) => sileo.warning({ ...BASE, ...opts }),
  action:  (opts: ToastInput) => sileo.action({  ...BASE, ...opts }),
  dismiss: sileo.dismiss,
  clear:   sileo.clear,
};
