import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ALL_SCOPES, getSettings, getSyncStorageUsage, saveSettings, type Settings } from "./storage";
import { ClearMarksButton, LocaleSelector, SyncUsageBadge, type SyncUsage } from "./popup/footer";
import { Hero } from "./popup/hero";
import { MESSAGES, MessagesContext, resolveLocale } from "./popup/messages";
import { NumberRow, Panel, SliderRow, ToggleRow } from "./popup/panels";

function App() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [syncUsage, setSyncUsage] = useState<SyncUsage | null>(null);

  useEffect(() => {
    void getSettings().then(setSettings);
  }, []);

  useEffect(() => {
    let active = true;
    let seq = 0;
    const refresh = () => {
      const mine = ++seq;
      void getSyncStorageUsage()
        .then((next) => { if (active && mine === seq) setSyncUsage(next); })
        .catch((error) => {
          console.warn("Failed to refresh sync storage usage", error);
          if (active && mine === seq) setSyncUsage(null);
        });
    };
    const onChanged = (_changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
      if (areaName === "sync") refresh();
    };

    refresh();
    chrome.storage.onChanged.addListener(onChanged);
    return () => {
      active = false;
      chrome.storage.onChanged.removeListener(onChanged);
    };
  }, []);

  if (!settings) {
    return <div className="py-16 text-center text-base text-muted">…</div>;
  }

  const locale = resolveLocale(settings.localeOverride);
  const t = MESSAGES[locale];

  const update = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    void saveSettings(next);
  };

  return (
    <MessagesContext.Provider value={t}>
      <div className="flex flex-col gap-3">
        <Hero settings={settings} onToggle={(enabled) => update({ enabled })} />

        <Panel title={t.sectionScopes}>
          {ALL_SCOPES.map((scope) => (
            <ToggleRow
              key={scope}
              label={t.scope[scope]}
              checked={settings.activeScopes[scope]}
              disabled={!settings.enabled}
              onChange={(checked) =>
                update({ activeScopes: { ...settings.activeScopes, [scope]: checked } })
              }
            />
          ))}
        </Panel>

        <Panel title={t.sectionExtras}>
          <ToggleRow
            label={t.removeShortsSection}
            hint={t.removeShortsSectionHint}
            checked={settings.removeShortsSection}
            disabled={!settings.enabled}
            onChange={(checked) => update({ removeShortsSection: checked })}
          />
          <ToggleRow
            label={t.hideHomeShelves}
            hint={t.hideHomeShelvesHint}
            checked={settings.hideHomeShelves}
            disabled={!settings.enabled}
            onChange={(checked) => update({ hideHomeShelves: checked })}
          />
          <ToggleRow
            label={t.skipTopRecommendations}
            hint={t.skipTopRecommendationsHint}
            checked={settings.skipTopRecommendations}
            disabled={!settings.enabled}
            onChange={(checked) => update({ skipTopRecommendations: checked })}
          />
          {settings.skipTopRecommendations && (
            <NumberRow
              label={t.topCountLabel}
              value={settings.topRecommendationsCount}
              min={1}
              max={60}
              onChange={(value) => update({ topRecommendationsCount: value })}
            />
          )}
          <SliderRow
            label={t.watchedThresholdLabel}
            hint={t.watchedThresholdHint}
            value={settings.watchedThreshold}
            onChange={(value) => update({ watchedThreshold: value })}
          />
        </Panel>

        <div className="flex items-center justify-end gap-2 px-0.5">
          <LocaleSelector
            value={settings.localeOverride}
            onChange={(localeOverride) => update({ localeOverride })}
          />
          <SyncUsageBadge value={syncUsage} />
          <ClearMarksButton count={syncUsage?.count ?? 0} />
        </div>
      </div>
    </MessagesContext.Provider>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
