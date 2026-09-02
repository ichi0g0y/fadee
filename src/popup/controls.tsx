import * as Switch from "@radix-ui/react-switch";
import { type ReactNode, useEffect, useRef, useState } from "react";

const TOOLTIP_ALIGN = {
  right: "right-0",
  left: "left-0",
  center: "left-1/2 -translate-x-1/2"
} as const;

const TOOLTIP_VIEWPORT_MARGIN = 8;

export function Tooltip({ children, text, align = "right", clamp = true }: { children: ReactNode; text: string; align?: keyof typeof TOOLTIP_ALIGN; clamp?: boolean }) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [clampLeft, setClampLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!clamp) {
      setClampLeft(null);
      return;
    }
    const wrapper = wrapperRef.current;
    const tooltip = tooltipRef.current;
    if (!wrapper || !tooltip) return;

    const wrapperRect = wrapper.getBoundingClientRect();
    const tooltipWidth = tooltip.offsetWidth;
    const viewportWidth = document.documentElement.clientWidth;

    const desiredLeft =
      align === "right"
        ? wrapperRect.right - tooltipWidth
        : align === "left"
          ? wrapperRect.left
          : wrapperRect.left + wrapperRect.width / 2 - tooltipWidth / 2;

    const minLeft = TOOLTIP_VIEWPORT_MARGIN;
    const maxLeft = viewportWidth - TOOLTIP_VIEWPORT_MARGIN - tooltipWidth;
    const clamped = Math.max(minLeft, Math.min(maxLeft, desiredLeft));
    setClampLeft(clamped - wrapperRect.left);
  }, [text, align, clamp]);

  const alignClass = clampLeft === null ? TOOLTIP_ALIGN[align] : "";
  const inlineStyle = clampLeft === null ? undefined : { left: `${clampLeft}px` };

  return (
    <span ref={wrapperRef} className="group relative inline-flex">
      {children}
      <span
        ref={tooltipRef}
        role="tooltip"
        style={inlineStyle}
        className={`pointer-events-none absolute bottom-full ${alignClass} z-10 mb-1.5 w-max max-w-[240px] rounded-md border border-outline bg-bg-2 px-2 py-1.5 text-[12px] leading-snug text-ink opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100`}
      >
        {text}
      </span>
    </span>
  );
}

const TOGGLE_SIZES = {
  sm: {
    root: "h-[22px] w-[36px]",
    thumb: "size-[18px]",
    on: "data-[state=checked]:translate-x-[15px]"
  },
  lg: {
    root: "h-7 w-12",
    thumb: "size-6",
    on: "data-[state=checked]:translate-x-[20px]"
  }
} as const;

export function ToggleSwitch({ checked, disabled, onChange, ariaLabel, size = "sm" }: { checked: boolean; disabled?: boolean | undefined; onChange: (v: boolean) => void; ariaLabel: string; size?: "sm" | "lg" }) {
  const variant = TOGGLE_SIZES[size];
  return (
    <Switch.Root
      checked={checked}
      disabled={disabled}
      onCheckedChange={onChange}
      aria-label={ariaLabel}
      className={`relative ${variant.root} shrink-0 cursor-pointer rounded-full border border-outline bg-[rgba(255,255,255,0.06)] transition-colors data-[state=checked]:border-accent data-[state=checked]:bg-accent disabled:cursor-not-allowed`}
    >
      <Switch.Thumb className={`block ${variant.thumb} translate-x-0.5 rounded-full bg-[#d4d5d8] shadow-[0_1px_2px_rgba(0,0,0,0.45)] transition-transform ${variant.on} data-[state=checked]:bg-white`} />
    </Switch.Root>
  );
}
