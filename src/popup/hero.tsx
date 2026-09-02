import type { Settings } from "../storage";
import { ToggleSwitch } from "./controls";
import { useT } from "./messages";

export function Hero({ settings, onToggle }: { settings: Settings; onToggle: (v: boolean) => void }) {
  const t = useT();
  return (
    <header className="flex items-start justify-between gap-3 px-0.5 pb-0.5">
      <TitleLogo />
      {/* Logo is 36px tall, ToggleSwitch(lg) is 28px; my-1 (4px top/bottom) vertically centers it. */}
      <div className="my-1">
        <ToggleSwitch checked={settings.enabled} onChange={onToggle} ariaLabel={t.title} size="lg" />
      </div>
    </header>
  );
}

function TitleLogo() {
  const t = useT();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="3 0 50 12"
      width={150}
      height={36}
      shapeRendering="crispEdges"
      role="img"
      aria-label={t.title}
      className="text-ink"
    >
      <rect x={5} y={2} width={7} height={2} fill="currentColor" />
      <rect x={15} y={2} width={5} height={2} fill="currentColor" />
      <rect x={23} y={2} width={6} height={2} fill="currentColor" />
      <rect x={32} y={2} width={7} height={2} fill="currentColor" />
      <rect x={41} y={2} width={7} height={2} fill="currentColor" />
      <rect x={14} y={3} width={1} height={7} fill="currentColor" />
      <rect x={20} y={3} width={1} height={7} fill="currentColor" />
      <rect x={29} y={3} width={1} height={6} fill="currentColor" />
      <rect x={5} y={4} width={2} height={6} fill="currentColor" />
      <rect x={15} y={4} width={1} height={6} fill="currentColor" />
      <rect x={19} y={4} width={1} height={6} fill="currentColor" />
      <rect x={23} y={4} width={2} height={6} fill="currentColor" />
      <rect x={28} y={4} width={1} height={6} fill="currentColor" />
      <rect x={32} y={4} width={2} height={6} fill="currentColor" />
      <rect x={41} y={4} width={2} height={6} fill="currentColor" />
      <rect x={7} y={5} width={4} height={1} fill="currentColor" />
      <rect x={34} y={5} width={4} height={1} fill="currentColor" />
      <rect x={43} y={5} width={4} height={1} fill="currentColor" />
      <rect x={7} y={6} width={3} height={1} fill="currentColor" />
      <rect x={16} y={6} width={3} height={2} fill="currentColor" />
      <rect x={34} y={6} width={3} height={1} fill="currentColor" />
      <rect x={43} y={6} width={3} height={1} fill="currentColor" />
      <rect x={25} y={8} width={3} height={2} fill="currentColor" />
      <rect x={34} y={8} width={5} height={2} fill="currentColor" />
      <rect x={43} y={8} width={5} height={2} fill="currentColor" />
    </svg>
  );
}
