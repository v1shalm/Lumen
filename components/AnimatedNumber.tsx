"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
  format?: (n: number) => string;
}

export function AnimatedNumber({
  value,
  duration = 1.2,
  className,
  style,
  format = (n) => Math.round(n).toString(),
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const counter = useRef({ n: 0 });

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
          fullMotion: "(prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          if (!ref.current) return;
          const { reduceMotion } = ctx.conditions as { reduceMotion: boolean };
          if (reduceMotion) {
            ref.current.textContent = format(value);
            return;
          }
          gsap.to(counter.current, {
            n: value,
            duration,
            ease: "power3.out",
            onUpdate: () => {
              if (ref.current) ref.current.textContent = format(counter.current.n);
            },
          });
        }
      );
      return () => mm.revert();
    },
    { dependencies: [value, duration], scope: ref }
  );

  return <span ref={ref} className={className} style={style}>{format(0)}</span>;
}
