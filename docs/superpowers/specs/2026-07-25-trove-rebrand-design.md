# Trove Rebrand — v0.3.0 Design

**Date:** 2026-07-25
**Status:** Approved direction (Approach A, phase 1 of 3)
**Owner:** Aditya

## Goal

Make the app feel like a brand product, not a generic tool. The app is renamed
**Trove**, gains a visual mark and motif, a branded launch moment, and a
consistent warm-coach voice across all user-facing copy.

This spec covers **v0.3.0 only**. Follow-up phases get their own specs:
v0.3.1 (first-run onboarding + weekly recap ritual), v0.3.2 (README/outward
brand).

## Decisions already made

- **Name:** Trove (replaces "Notes"; original working name was "DSA Vault").
- **Voice:** Warm coach, quietly confident. Encouraging, never guilt-tripping,
  never cheesy. Celebrates real wins, states facts warmly.
- **Mark:** A faceted gem drawn from graph nodes and edges — reads "treasure"
  at a glance, "data structure" up close. Motif, not mascot.
- **Palette/fonts/radii unchanged:** warm aubergine dark `#131019` / lavender
  light `#faf9fc`, purple gradient accent `#8e6bf5 → #c084fc`, Gabarito
  display + DM Sans body + JetBrains Mono code, very rounded corners.

## 1. Rename mechanics

User-visible name becomes Trove; infrastructure identity stays fixed.

**Changes:**
- `tauri.conf.json`: `productName: "Trove"`, `mainBinaryName: "Trove"`.
- Window title, sidebar wordmark, tray tooltip, `package.json` `name`.
- CHANGELOG v0.3.0 section announces the rename.

**Explicitly unchanged (data + update continuity):**
- Bundle identifier `com.aditya.dsavault` — keeps `%APPDATA%` data dir, the
  SQLite DB, and webview localStorage.
- Updater signing keypair and endpoint
  (`github.com/xcyberpunkx0/notes/releases/latest/download/latest.json`).
- GitHub repo name (`notes`) and Rust crate name (`dsa-vault`) — internal
  only; renaming them buys nothing user-visible and adds risk.

**Accepted one-time cost:** installer name changes to
`Trove_0.3.0_x64-setup.exe`; install dir moves from `%LOCALAPPDATA%\Notes` to
`%LOCALAPPDATA%\Trove`. The old folder and Start Menu shortcut must be removed
manually once after updating. Documented in the release notes.

## 2. Visual identity

One mark, three derivatives — all shipped as SVG assets in `src/assets/brand/`
plus regenerated icon files in `src-tauri/icons/`.

- **Gem mark:** faceted gem outline whose vertices are small circles (graph
  nodes) and facet lines are edges. Works at 16 px (tray) through 512 px
  (installer). Monochrome and gradient variants.
- **App icon:** gem mark, purple gradient facets on aubergine rounded square.
  Replaces the current N-graph icon set (`icon.ico`, PNG sizes, `icon.icns`).
- **Wordmark:** lowercase "trove" in Gabarito bold with the full purple
  gradient applied to the whole word (matches the existing `.text-gradient`
  class). Replaces "Notes" + N logo in the sidebar header.
- **Facet motif:** a faint, large-scale pattern of facet lines/nodes as a
  reusable theme-aware React component (`<FacetMotif />`, opacity via CSS
  vars). Used in: empty states, splash, and later the weekly recap. Replaces
  the current concentric-circles background decoration.

The mark is designed in code (SVG), iterated with Aditya visually via
screenshots in both themes before the icon files are regenerated.

## 3. Launch moment (splash)

- On startup, a full-window overlay: aubergine (or lavender in light theme)
  field, gem mark fades + scales in (transform/opacity only, compositor-only —
  no JS-driven animation), holds briefly, then the overlay fades out to reveal
  the app. Total ≤ 1.2 s; never blocks interaction after fade-out starts.
- Implemented in React inside the existing window (no second Tauri window):
  overlay renders immediately at app mount, removed from the DOM when done.
- Respects `prefers-reduced-motion`: instant reveal, no animation.

## 4. Voice & copy pass

**Voice principles** (committed as `docs/copy-style.md`, one page):
- Warm, plain, short sentences. Address the user directly.
- Never guilt ("you missed…" is banned); frame gaps as opportunity.
- Numbers stated plainly; celebration only for real milestones.
- Brand vocabulary: the collection is "your Trove"; solves/debriefs are what
  you "add" to it.

**Strings rewritten in this pass:**
- Time-based greetings: ≥ 4 variants per time bucket, deterministic rotation
  (no `Math.random` in render) so a session keeps one greeting.
- Every empty state (home review card, topics, notes, problems, review queue,
  graph, search/palette no-results) — each gets one on-voice line + the facet
  motif where layout allows.
- Review nudges, streak copy, achievement names + descriptions (renamed on
  brand, e.g. first debrief → "First Facet"; existing unlock logic untouched).
- Dialogs and command palette labels where off-voice; update prompt becomes
  "A new Trove is ready".

Achievement *identifiers* in the DB stay stable — only display strings change.

## 5. Verification

- Unit tests: greeting rotation (deterministic per time bucket), any new
  string-selection logic. Existing 23 tests stay green.
- Visual pass in browser (dev server) of every touched screen in dark *and*
  light theme; smoothness judged on the release build per standing rule.
- Installed-build check on Windows: icon, window title, tray, installer name.
- **Update-chain test:** before announcing, verify a machine on v0.2.1
  auto-updates to v0.3.0 (artifact rename is the risk) and that data +
  settings survive.

## Out of scope for v0.3.0

Onboarding, weekly recap, README/landing rewrite, LeetCode import, any
palette/font changes, mascots.
