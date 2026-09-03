import {
  getSettings,
  saveSettings,
  type Scope,
  type Settings
} from "./storage";
import {
  detectScope,
  hideWatchedCards,
  showHiddenCards
} from "./content/cards";
import { applyMarkButtons, MARK_BTN_CLASS } from "./content/mark";
import { BUTTON_ID, removeButton, upsertButton } from "./content/toolbar";

let settings: Settings | null = null;
let manuallyWatchedIdSet: ReadonlySet<string> = new Set();
let currentUrl = location.href;
let observer: MutationObserver | null = null;
let filterTimer: number | undefined;
let filterDeadline = 0;
let viewportTimer: number | undefined;
let syncTimer: number | undefined;
let markTimer: number | undefined;

// A short debounce keeps bursts of DOM changes cheap. The max wait makes sure a
// long burst (for example while the user keeps scrolling) cannot delay the
// filter forever.
const FILTER_DEBOUNCE_MS = 120;
const FILTER_MAX_WAIT_MS = 600;
const VIEWPORT_FILTER_MS = 200;

void start();

async function start(): Promise<void> {
  setSettings(await getSettings());
  syncPage();
  watchNavigation();
  watchDomChanges();
  watchViewportChanges();

  chrome.storage.onChanged.addListener((_changes, area) => {
    if (area !== "sync") return;

    void getSettings().then((nextSettings) => {
      setSettings(nextSettings);
      syncPage();
    });
  });
}

function setSettings(nextSettings: Settings): void {
  settings = nextSettings;
  manuallyWatchedIdSet = new Set(nextSettings.manuallyWatchedIds);
}

function syncPage(): void {
  if (!settings?.enabled) {
    cancelFilter();
    removeButton();
    showHiddenCards();
    applyShortsSection(false);
    applyHomeShelves(false);
    return;
  }

  const scope = detectScope();
  upsertButton(scope, settings, () => toggleCurrentTab());
  applyShortsSection(settings.removeShortsSection && !isOnShortsWatchPage());
  applyHomeShelves(scope === "home" ? settings.hideHomeShelves : false);
  applyMarkButtons(scope, manuallyWatchedIdSet);

  if (scope && settings.activeScopes[scope]) {
    scheduleFilter();
  } else {
    cancelFilter();
    showHiddenCards();
  }
}

function scheduleFilter(): void {
  const now = Date.now();
  if (filterTimer === undefined) {
    filterDeadline = now + FILTER_MAX_WAIT_MS;
  }

  const wait = Math.max(0, Math.min(FILTER_DEBOUNCE_MS, filterDeadline - now));
  window.clearTimeout(filterTimer);
  filterTimer = window.setTimeout(() => {
    filterTimer = undefined;
    runFilter();
  }, wait);
}

function cancelFilter(): void {
  window.clearTimeout(filterTimer);
  filterTimer = undefined;
  window.clearTimeout(viewportTimer);
  viewportTimer = undefined;
}

function runFilter(): void {
  if (!settings?.enabled) return;
  const scope = detectScope();
  if (!scope || !settings.activeScopes[scope]) return;
  hideWatchedCards(scope, settings, manuallyWatchedIdSet);
}

// YouTube can add a card long before it renders its watched overlay, and an
// off-screen card may have no measurable size. Re-check on scroll and resize so
// cards that come into view are hidden too.
function watchViewportChanges(): void {
  const options: AddEventListenerOptions = { passive: true, capture: true };
  window.addEventListener("scroll", requestViewportFilter, options);
  window.addEventListener("resize", requestViewportFilter, options);
}

function requestViewportFilter(): void {
  if (viewportTimer !== undefined) return;
  viewportTimer = window.setTimeout(() => {
    viewportTimer = undefined;
    runFilter();
  }, VIEWPORT_FILTER_MS);
}

function scheduleMarkButtons(scope: Scope): void {
  window.clearTimeout(markTimer);
  markTimer = window.setTimeout(() => {
    if (settings) applyMarkButtons(scope, manuallyWatchedIdSet);
  }, 200);
}

function applyShortsSection(hide: boolean): void {
  document.documentElement.setAttribute("data-fadee-hide-shorts", String(hide));
}

function isOnShortsWatchPage(): boolean {
  return /^\/shorts\/[^/]+/.test(location.pathname);
}

function applyHomeShelves(hide: boolean): void {
  document.documentElement.setAttribute("data-fadee-hide-home-shelves", String(hide));
}

async function toggleCurrentTab(): Promise<void> {
  if (!settings) return;
  const scope = detectScope();
  if (!scope) return;

  const nextSettings: Settings = {
    ...settings,
    activeScopes: {
      ...settings.activeScopes,
      [scope]: !settings.activeScopes[scope]
    }
  };

  setSettings(nextSettings);
  await saveSettings(nextSettings);
  syncPage();
}

function watchNavigation(): void {
  window.addEventListener("yt-navigate-finish", handleNavigation);
  window.addEventListener("popstate", handleNavigation);

  window.setInterval(() => {
    if (location.href !== currentUrl) {
      handleNavigation();
    }
  }, 750);
}

function handleNavigation(): void {
  currentUrl = location.href;
  window.setTimeout(syncPage, 250);
}

function requestSync(): void {
  window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(syncPage, 250);
}

function watchDomChanges(): void {
  observer?.disconnect();
  observer = new MutationObserver((records) => {
    if (!settings?.enabled) return;

    // Skip if all mutations are our own (avoid feedback loop)
    if (records.every(isOwnMutation)) return;

    if (!document.querySelector(`#${BUTTON_ID}`)) {
      requestSync();
    }

    const scope = detectScope();
    if (!scope) return;
    scheduleMarkButtons(scope);
    if (settings.activeScopes[scope]) {
      scheduleFilter();
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
}

function isOwnMutation(record: MutationRecord): boolean {
  const target = record.target as HTMLElement;
  if (
    target.classList?.contains(MARK_BTN_CLASS) ||
    target.closest?.(`.${MARK_BTN_CLASS}, #${BUTTON_ID}`)
  ) {
    return true;
  }
  for (const node of record.addedNodes) {
    if (node instanceof HTMLElement && node.classList.contains(MARK_BTN_CLASS)) return true;
  }
  return false;
}
