import type { Scope, Settings } from "../storage";

const HIDDEN_ATTR = "data-fadee-hidden";
const WATCHED_LABELS = ["Watched", "視聴済み"];

const CHANNEL_TAB_PATTERN =
  /^\/(?:@[^/]+|channel\/[^/]+|c\/[^/]+|user\/[^/]+)\/(videos|shorts|streams|live)(?:\/|$)/;

// YouTube ships three generations of the watched overlay at the same time.
// `ytd-` is the old one, `ytw-` is the one used on the search page, and the
// `yt-thumbnail-overlay-progress-bar-view-model` host is the one used on the
// feeds. Each generation needs its own selector.
const PROGRESS_SELECTORS = [
  "ytd-thumbnail-overlay-resume-playback-renderer",
  "#progress.ytd-thumbnail-overlay-resume-playback-renderer",
  "ytw-thumbnail-overlay-resume-playback-renderer",
  ".ytwThumbnailOverlayResumePlaybackRendererThumbnailOverlayResumePlaybackProgress",
  "yt-thumbnail-overlay-progress-bar-view-model",
  ".ytThumbnailOverlayProgressBarHostWatchedProgressBar",
  ".ytThumbnailOverlayProgressBarHostWatchedProgressBarSegment",
  ".ytThumbnailOverlayProgressBarHostWatchedProgressBarSegmentModern"
];

const PROGRESS_HOST_SELECTOR =
  ".ytThumbnailOverlayProgressBarHost,ytw-thumbnail-overlay-resume-playback-renderer,ytd-thumbnail-overlay-resume-playback-renderer";

export function detectScope(): Scope | null {
  const path = location.pathname;
  if (path === "/feed/subscriptions") return "subscriptions";
  if (path === "/" || path === "") return "home";
  if (path === "/results") return "search";

  const match = CHANNEL_TAB_PATTERN.exec(path);
  if (!match) return null;
  if (match[1] === "shorts") return "channel-shorts";
  if (match[1] === "streams" || match[1] === "live") return "channel-live";
  return "channel-videos";
}

function getCards(scope: Scope, settings: Settings): HTMLElement[] {
  if (scope === "home") {
    const items = [
      ...document.querySelectorAll<HTMLElement>(
        "ytd-rich-grid-renderer > #contents > ytd-rich-item-renderer"
      )
    ];
    if (settings.skipTopRecommendations) {
      return items.slice(settings.topRecommendationsCount);
    }
    return items;
  }

  if (scope === "search") {
    // The search page also shows home-style shelves, so it needs the rich grid
    // item too.
    return [
      ...document.querySelectorAll<HTMLElement>(
        "ytd-item-section-renderer ytd-video-renderer, ytd-item-section-renderer yt-lockup-view-model, ytd-rich-grid-renderer ytd-rich-item-renderer"
      )
    ]
      .map(getCardRoot)
      .filter(unique);
  }

  const selectors = [
    "ytd-rich-item-renderer",
    "yt-lockup-view-model",
    "ytd-rich-grid-media",
    "ytd-grid-video-renderer",
    "ytd-video-renderer",
    "ytd-rich-grid-slim-media",
    "ytd-reel-item-renderer"
  ];

  return [...document.querySelectorAll<HTMLElement>(selectors.join(","))].map(getCardRoot).filter(unique);
}

export function getCardRoot(node: HTMLElement): HTMLElement {
  return (
    node.closest<HTMLElement>(
      "ytd-rich-item-renderer,ytd-grid-video-renderer,ytd-video-renderer,ytd-reel-item-renderer,ytd-rich-grid-slim-media"
    ) ?? node
  );
}

function isWatched(
  card: HTMLElement,
  threshold: number,
  manuallyWatchedIds: ReadonlySet<string>
): boolean {
  if (isManuallyWatched(card, manuallyWatchedIds)) return true;
  if (hasWatchedAriaLabel(card)) return true;
  const ratio = progressRatio(card);
  if (ratio === null) return false;
  return ratio >= threshold;
}

export function extractVideoId(card: HTMLElement): string | null {
  const anchor = card.querySelector<HTMLAnchorElement>("a#thumbnail, a[href*='watch?v=']");
  if (!anchor) return null;
  try {
    const url = new URL(anchor.href, location.origin);
    return url.searchParams.get("v");
  } catch {
    return null;
  }
}

function isManuallyWatched(card: HTMLElement, manuallyWatchedIds: ReadonlySet<string>): boolean {
  if (manuallyWatchedIds.size === 0) return false;
  const id = extractVideoId(card);
  if (!id) return false;
  return manuallyWatchedIds.has(id);
}

function progressRatio(card: HTMLElement): number | null {
  const nodes = PROGRESS_SELECTORS.flatMap((s) => [...card.querySelectorAll<HTMLElement>(s)]);

  // Read the inline percent first. It does not need layout, so a card that is
  // far from the viewport still reports the right ratio.
  for (const node of nodes) {
    if (isHiddenByStyle(node)) continue;
    const pct = inlinePercentWidth(node);
    if (pct !== null) return pct;
  }

  const node = nodes.find(isVisibleProgress);
  if (!node) return null;

  const rect = node.getBoundingClientRect();
  if (rect.width > 0) {
    const host = node.closest<HTMLElement>(PROGRESS_HOST_SELECTOR) ?? node.parentElement;
    const hostWidth = host?.getBoundingClientRect().width ?? 0;
    if (hostWidth > 0) return Math.min(1, rect.width / hostWidth);
  }

  return 1;
}

function inlinePercentWidth(node: HTMLElement): number | null {
  const inlineWidth = node.style.width;
  if (!inlineWidth.endsWith("%")) return null;
  const pct = Number.parseFloat(inlineWidth);
  if (!Number.isFinite(pct)) return null;
  return Math.min(1, Math.max(0, pct / 100));
}

function isHiddenByStyle(node: HTMLElement): boolean {
  const style = getComputedStyle(node);
  return style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0;
}

function isVisibleProgress(node: HTMLElement): boolean {
  if (isHiddenByStyle(node)) return false;

  const rect = node.getBoundingClientRect();
  if (rect.width > 1 && rect.height > 0) {
    return true;
  }

  const width = Number.parseFloat(getComputedStyle(node).width);
  return Number.isFinite(width) && width > 1;
}

function hasWatchedAriaLabel(card: HTMLElement): boolean {
  return WATCHED_LABELS.some((label) => Boolean(card.querySelector(`[aria-label*="${label}"]`)));
}

export function unique<T>(item: T, index: number, list: T[]): boolean {
  return list.indexOf(item) === index;
}

export function hideWatchedCards(
  scope: Scope,
  settings: Settings,
  manuallyWatchedIds: ReadonlySet<string>
): void {
  const threshold = settings.watchedThreshold;
  for (const card of getCards(scope, settings)) {
    if (isWatched(card, threshold, manuallyWatchedIds)) {
      card.setAttribute(HIDDEN_ATTR, "true");
      card.style.display = "none";
    } else if (card.getAttribute(HIDDEN_ATTR) === "true") {
      card.removeAttribute(HIDDEN_ATTR);
      card.style.display = "";
    }
  }
}

export function showHiddenCards(): void {
  for (const card of document.querySelectorAll<HTMLElement>(`[${HIDDEN_ATTR}="true"]`)) {
    card.removeAttribute(HIDDEN_ATTR);
    card.style.display = "";
  }
}
