# History

Release history for the fadee Chrome extension. Each entry corresponds to a published Chrome Web Store version and a matching `v<version>` git tag / GitHub Release.

## 0.1.3 — 2026-09-03

- **Bug fix**: Watched videos are hidden on the search page again. YouTube changed the watched overlay to a new `ytw-` element, so the extension could not find it and hid nothing. Watched cards inside a shelf on the search page are now hidden too. (#15)
- **Bug fix**: Cards that come into view while scrolling are checked again, so watched videos loaded later are hidden too. (#15)
- **Behavior change**: The "Counts as watched after" slider now really works. Before, progress was always read as 100%, so the slider did nothing. The default is 0%, so the default view does not change. (#15)

## 0.1.2 — 2026-05-28

- **Bug fix**: Toolbar icon now follows the OS color scheme after disabling and re-enabling the extension from `chrome://extensions`. Previously the icon could stay on the light variant until reinstall or browser restart. (#13)

## 0.1.1 — 2026-05-28

- **Bug fix**: When "Hide all Shorts" is enabled, opening a Short directly via `/shorts/{id}` no longer hides the player. Feed-level Shorts hiding is unchanged. (#12)
