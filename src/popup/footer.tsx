import { DeleteIcon } from "lolicon/Delete";
import { ALL_LOCALE_OVERRIDES, clearMarked, type LocaleOverride } from "../storage";
import { Tooltip } from "./controls";
import { LOCALE_LABELS, useT } from "./messages";

export type SyncUsage = { count: number; bytesInUse: number; bytesQuota: number };

const SYNC_BYTES_WARNING_RATIO = 0.8;

export function SyncUsageBadge({ value }: { value: SyncUsage | null }) {
  const t = useT();
  if (!value) return null;
  const freeKb = ((value.bytesQuota - value.bytesInUse) / 1024).toFixed(1);
  const quotaKb = Math.round(value.bytesQuota / 1024);
  const overWarning = value.bytesInUse > value.bytesQuota * SYNC_BYTES_WARNING_RATIO;
  const className = overWarning ? "text-amber-400" : "text-muted";
  return (
    <Tooltip text={t.syncUsageTooltip}>
      <span className={`text-[12px] font-medium tabular-nums ${className}`}>
        {freeKb} KB / {quotaKb} KB
      </span>
    </Tooltip>
  );
}

export function LocaleSelector({ value, onChange }: { value: LocaleOverride; onChange: (v: LocaleOverride) => void }) {
  const t = useT();
  return (
    <Tooltip text={t.localeTooltip} align="center">
      <div role="radiogroup" aria-label="popup language" className="inline-flex overflow-hidden rounded-md border border-outline bg-bg-2">
        {ALL_LOCALE_OVERRIDES.map((option) => {
          const selected = option === value;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option)}
              className={`px-1.5 py-0.5 text-[11px] font-medium leading-none transition-colors ${
                selected ? "bg-accent text-white" : "cursor-pointer text-muted hover:text-ink"
              }`}
            >
              {LOCALE_LABELS[option]}
            </button>
          );
        })}
      </div>
    </Tooltip>
  );
}

export function ClearMarksButton({ count }: { count: number }) {
  const t = useT();
  const disabled = count <= 0;
  const handleClick = () => {
    if (disabled) return;
    if (!window.confirm(t.clearConfirm(count))) return;
    void clearMarked().catch((error) => {
      console.warn("Failed to clear marked videos", error);
    });
  };
  return (
    <Tooltip text={t.clearTooltip} align="center">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-label={t.clearTooltip}
        className="inline-flex cursor-pointer items-center text-muted transition-colors hover:text-danger disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-muted"
      >
        <DeleteIcon size={16} />
      </button>
    </Tooltip>
  );
}
