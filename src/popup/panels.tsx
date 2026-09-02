import type { ReactNode } from "react";
import { ToggleSwitch } from "./controls";

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-md border border-outline bg-card p-2.5">
      <h2 className="m-0 mb-1.5 px-1.5 text-[12px] font-semibold uppercase tracking-widest text-faded">
        {title}
      </h2>
      <div className="flex flex-col gap-0.5">{children}</div>
    </section>
  );
}

export function ToggleRow({ label, hint, checked, disabled, onChange }: { label: string; hint?: string; checked: boolean; disabled?: boolean | undefined; onChange: (v: boolean) => void }) {
  return (
    <label
      className={`flex items-center justify-between gap-3 rounded-md px-1.5 py-1.5 transition-colors ${
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:bg-[rgba(255,255,255,0.04)]"
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-medium text-ink">{label}</div>
        {hint && <div className="mt-0.5 text-[13px] leading-snug text-muted">{hint}</div>}
      </div>
      <ToggleSwitch checked={checked} disabled={disabled} onChange={onChange} ariaLabel={label} />
    </label>
  );
}

export function NumberRow({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md px-1.5 py-1.5">
      <div className="text-[15px] font-medium text-ink">{label}</div>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const v = Number.parseInt(e.target.value, 10);
          if (Number.isFinite(v)) onChange(Math.min(max, Math.max(min, v)));
        }}
        className="w-14 rounded-md border border-outline bg-bg-2 px-2 py-1 text-right text-[15px] tabular-nums text-ink focus:border-accent focus:outline-none"
      />
    </label>
  );
}

export function SliderRow({ label, hint, value, onChange }: { label: string; hint?: string; value: number; onChange: (v: number) => void }) {
  const percent = Math.round(value * 100);
  return (
    <div className="space-y-1 rounded-md px-1.5 py-1.5">
      <div className="flex items-center justify-between">
        <div className="text-[15px] font-medium text-ink">{label}</div>
        <div className="rounded bg-[rgba(94,106,210,0.16)] px-1.5 py-0.5 text-[13px] font-medium tabular-nums text-accent-bright">
          {percent}%
        </div>
      </div>
      {hint && <div className="text-[13px] leading-snug text-muted">{hint}</div>}
      <input
        type="range"
        min={0}
        max={100}
        value={percent}
        onChange={(e) => onChange(Number.parseInt(e.target.value, 10) / 100)}
        className="w-full cursor-pointer accent-accent"
      />
    </div>
  );
}
