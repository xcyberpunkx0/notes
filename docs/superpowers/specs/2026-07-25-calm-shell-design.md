# Calm Shell — v0.4.0 Design

**Date:** 2026-07-25
**Status:** Approved (Aditya approved the rendered mockup)
**Reference:** `docs/design/2026-07-25-calm-shell-mockup.html` — the approved
mockup. Its CSS values are the design source of truth; when this spec and the
mockup disagree, the mockup wins.

## Goal

Trove's shell adopts Notion's calm, content-first design language while
keeping Trove's brand (gem mark, purple accents, warm-coach voice). "Notion's
feel, Trove's soul." Approved after Aditya rejected louder directions
(gem-glow luxe, parchment grimoire — "too old school") and asked for
"Notion-like".

## Design principles (from the approved mockup)

- Neutral surfaces; purple is an *accent*, never a wash. Gradient reserved
  for the gem mark alone.
- Content-first: pages are centered columns (max-width 708px) on a flat
  canvas; chrome is small, muted, and hover-revealed.
- Small type (13.5–14px UI), compact rows, generous page padding.
- Emoji are welcome again in this language (Notion-native); the Fluent-3D
  emoji plan is dropped.

## Tokens (dark, from mockup)

bg `#191919` · sidebar `#202020` · hover `#2c2c2c` · line `#2e2e2e` ·
text `#e8e6e3` · dim `#9b9a97` · faint `#6f6e69` · accent `#a78bfa` ·
accent-soft `rgba(167,139,250,.12)`. Fonts unchanged (DM Sans body — Inter
was mockup-only; Gabarito stays for the wordmark/splash only; JetBrains Mono
for kbd/code).

Light theme equivalents (same relationships, Notion-light temperature):
bg `#ffffff` · sidebar `#f8f7fa` · hover `#ececf1` · line `#e7e5ec` ·
text `#2f2c38` · dim `#787486` · faint `#a5a1b2` · accent `#7c5cf0`.

## Shell

1. **Frameless window + custom titlebar.** `decorations: false`; the top bar
   (44px) becomes: breadcrumb (`Workspace / Page`) · drag region ·
   split-view toggle · window controls (minimize, maximize/restore, close)
   drawn in-app, calm-styled; close hovers red. Kills the generic Windows
   chrome (Aditya's "cross button" complaint). Capabilities: add
   `core:window:allow-minimize`, `core:window:allow-toggle-maximize`,
   `core:window:allow-close`, `core:window:allow-start-dragging`.
2. **Sidebar (244px)**: workspace header (gem + workspace name, default
   "Trove", stored in ui store for later personalization); Search row
   (opens palette, shows `Ctrl K`); Home; Review with due-count badge;
   `STUDY` section: Topics, Problems, Re-solve, Graph; `PAGES` section:
   top-level topics as page rows (◆ glyph) + "New topic" row; footer:
   streak row. Gem-family icons at 15px, muted.
3. **Tabs** stay (Ctrl+T/W); TabBar renders under the titlebar only when
   more than one tab is open.

## Pages

- **PageShell** component: centered 708px column, optional page icon,
  large title (38px/700), muted subtitle line.
- **Home** (per mockup): gem page icon; greeting as title; date subtitle;
  review status as a **Callout** block; **property chips** row
  (Topics/Notes/Solved/Streak — zeros render dim); "Recently solved" list
  (empty state = the on-voice hint with kbd chip); "Pick up where you left
  off" list rows.
- **All other routes** adopt PageShell (title + content in the column);
  existing page content restyles to flat rows/callouts — no glowing cards,
  no gradient panels. Detail pages keep BlockNote as-is inside the column.

## Explicitly kept / out of scope

Kept: splash (tokens follow the new bg), greetings, copy voice,
achievements (emoji stay), all Phase 1–4 features, review loop mechanics.
Out of scope: onboarding, weekly recap, README, LeetCode import, Backdrop
removal decision (superseded — Backdrop dies with the old Home layout).

## Verification

Tests green; both themes browser-passed on every route; installed-build
check; release v0.4.0 with changelog; live update-chain test (installed
app → 0.4.0) — carries the still-open v0.3.0 update-chain verification.
