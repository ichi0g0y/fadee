import { createContext, useContext } from "react";
import type { LocaleOverride } from "../storage";

export type Locale = "en" | "ja";

export function resolveLocale(override: LocaleOverride): Locale {
  if (override === "en" || override === "ja") return override;
  return (navigator.language || "en").toLowerCase().startsWith("ja") ? "ja" : "en";
}

export const MESSAGES = {
  en: {
    title: "fadee",
    sectionScopes: "Where to filter",
    sectionExtras: "Extras",
    scope: {
      "channel-videos": "Channel · Videos",
      "channel-shorts": "Channel · Shorts",
      "channel-live": "Channel · Streams",
      subscriptions: "Subscriptions",
      home: "Home",
      search: "Search results"
    },
    removeShortsSection: "Hide all Shorts",
    removeShortsSectionHint: "Removes Shorts shelves and any inline Shorts cards in feeds.",
    hideHomeShelves: "Hide themed shelves on Home",
    hideHomeShelvesHint: "Removes news / topic shelves on the Home feed.",
    skipTopRecommendations: "Keep top recommendations",
    skipTopRecommendationsHint: "Leaves the first items on Home untouched (they don't auto-refill).",
    topCountLabel: "Items to keep",
    watchedThresholdLabel: "Counts as watched after",
    watchedThresholdHint: "Slide right to require more progress before hiding.",
    clearAction: "Clear",
    clearTooltip: "Remove every manually-marked video.",
    clearConfirm: (n: number) => `Clear all ${n} manually-marked videos? This cannot be undone.`,
    syncUsageTooltip: "Free Chrome sync storage. Used by your settings and manually-marked video IDs (Chrome cap: 100 KB, syncs across devices).",
    localeTooltip: "Popup language. Auto follows your browser language."
  },
  ja: {
    title: "fadee",
    sectionScopes: "どこをフィルタするか",
    sectionExtras: "その他",
    scope: {
      "channel-videos": "チャンネル · 動画",
      "channel-shorts": "チャンネル · ショート",
      "channel-live": "チャンネル · ライブ",
      subscriptions: "登録チャンネル",
      home: "ホーム",
      search: "検索結果"
    },
    removeShortsSection: "Shorts を全部隠す",
    removeShortsSectionHint: "Shorts の棚も、フィード内の単独カードもまとめて消す。",
    hideHomeShelves: "ホームのテーマ別シェルフを隠す",
    hideHomeShelvesHint: "ニュース速報・トピック別おすすめなど横並びシェルフを消す。",
    skipTopRecommendations: "おすすめにフィルターを適用しない",
    skipTopRecommendationsHint: "ホーム先頭はフィルタしない（補填されないため）。",
    topCountLabel: "残す件数",
    watchedThresholdLabel: "視聴済みとみなす再生率",
    watchedThresholdHint: "右に動かすほど、ほぼ完視聴のみ非表示。",
    clearAction: "クリア",
    clearTooltip: "手動マーク済の動画を全てクリアする。",
    clearConfirm: (n: number) => `手動マーク済 ${n} 件をクリアしますか？取り消しはできません。`,
    syncUsageTooltip: "Chrome sync 領域の空き容量。手動マーク済み動画ID + 設定が使用中（Chrome 上限 100 KB、端末間で同期される）。",
    localeTooltip: "ポップアップの表示言語。Auto はブラウザの言語に追従。"
  }
} as const;

export const LOCALE_LABELS: Record<LocaleOverride, string> = { auto: "Auto", en: "EN", ja: "JA" };

export type Messages = (typeof MESSAGES)[Locale];

export const MessagesContext = createContext<Messages>(MESSAGES.en);
export const useT = (): Messages => useContext(MessagesContext);
