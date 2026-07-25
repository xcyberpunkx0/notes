# Calm Shell (v0.4.0) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Trove's shell and page layouts in the approved Notion-calm design language.

**Architecture:** Token swap first (everything inherits), then shell (titlebar/sidebar), then a reusable PageShell/Callout/PropertyChips kit, then per-route adoption. The approved mockup `docs/design/2026-07-25-calm-shell-mockup.html` is the visual source of truth — implementers copy exact colors/sizes/spacings from it.

**Tech Stack:** Tauri 2 (frameless window, `@tauri-apps/api/window`), React 19, Tailwind v4 tokens in `src/styles/globals.css`, Zustand ui store.

**Spec:** `docs/superpowers/specs/2026-07-25-calm-shell-design.md`

## Global Constraints

- The mockup file's CSS values are authoritative: dark bg `#191919`, sidebar `#202020`, hover `#2c2c2c`, line `#2e2e2e`, text `#e8e6e3`, dim `#9b9a97`, faint `#6f6e69`, accent `#a78bfa`, accent-soft `rgba(167,139,250,.12)`. Light: bg `#ffffff`, sidebar `#f8f7fa`, hover `#ececf1`, line `#e7e5ec`, text `#2f2c38`, dim `#787486`, faint `#a5a1b2`, accent `#7c5cf0`.
- Purple gradient (`#8e6bf5→#c084fc`) appears ONLY in the gem mark (GemMark component). No gradient buttons, panels, or text in the new shell (the splash keeps GemMark as-is).
- Bundle identifier, updater config, signing, achievement keys, DB schema: UNCHANGED.
- Animations remain transform/opacity-only CSS.
- Voice/copy strings from v0.3.0 are kept verbatim unless a task names a change.
- Branch `feature/calm-shell`; commit per task; tests + `npx tsc --noEmit` green before every commit.
- Existing keyboard shortcuts (Ctrl+K/T/W/\, Ctrl+Shift+P/R) keep working.

---

### Task 1: Calm design tokens

**Files:** Modify `src/styles/globals.css` only (the `@theme inline` block at ~line 41 and the `:root`/`[data-theme]` token definitions it references).

**Interfaces — Produces:** same token names the app already consumes (`--bg`, `--surface`, `--surface-2`, `--surface-3`, `--line`, `--text`, `--text-dim`, `--text-faint`, `--accent`, `--accent-soft`, plus any others present) remapped to the calm values above for BOTH themes. Add two new tokens: `--sidebar` (dark `#202020` / light `#f8f7fa`) and map `--color-sidebar` in the `@theme` block.

- [ ] Read the current token block; remap each dark token to its calm value (surface≈`#232323` for callout-like fills, surface-2=hover `#2c2c2c`, surface-3≈`#333`), then the light equivalents.
- [ ] Remove/neutralize any global gradient utility USAGE that leaks into surfaces (`.btn-primary` becomes solid `--accent`, white text, radius 8px; `.text-gradient` stays defined for the wordmark only).
- [ ] `npm test`, `npx tsc --noEmit`, then `npm run dev` + curl check; commit `feat(shell): calm design tokens`.

### Task 2: Frameless window + custom titlebar

**Files:** Modify `src-tauri/tauri.conf.json` (window `"decorations": false`), `src-tauri/capabilities/default.json` (add `core:window:allow-minimize`, `core:window:allow-toggle-maximize`, `core:window:allow-close`, `core:window:allow-start-dragging`). Create `src/app/TitleBar.tsx`. Modify `src/app/AppShell.tsx` (mount TitleBar as the topmost full-width row; TabBar moves directly beneath it and renders only when `tabs.length > 1`), delete `src/app/Topbar.tsx` usage (its search moves to the sidebar in Task 3; its split toggle moves into TitleBar).

**Interfaces — Produces:** `<TitleBar />`: 44px row = breadcrumb (`{workspaceName} / {pageTitle}` — resolve pageTitle with the same logic TabBar uses, extract that resolver to `src/lib/page-title.ts` and share it), flexible drag region (`data-tauri-drag-region` on the bar and its non-interactive children), split-view toggle button, then Minus/Square/X window-control buttons (36px hit areas, `hover:bg-[--surface-2]`; close `hover:bg-[#e5484d] hover:text-white`) calling `getCurrentWindow().minimize() / .toggleMaximize() / .close()` from `@tauri-apps/api/window`, each wrapped in try/catch so the browser dev environment doesn't throw.

- [ ] Config + capabilities changes; TitleBar component; extract shared `pageTitleFor(path)` helper + reuse in TabBar; wire into AppShell; remove Topbar from the layout.
- [ ] Tests + typecheck; verify in `npm run tauri dev` that dragging, minimize, maximize toggle, and close all work and the native frame is gone (this task REQUIRES the tauri dev window, not the browser).
- [ ] Commit `feat(shell): frameless window with calm titlebar`.

### Task 3: Sidebar rebuild

**Files:** Rewrite `src/app/Sidebar.tsx`. Modify `src/app/store.ts` (add `workspaceName: string` default `"Trove"`, persisted).

**Interfaces — Consumes:** gem `GemMark`, due-count query (reuse the existing review-badge query), topics list query (existing topics fetch). **Produces:** sidebar per mockup: workspace header row (GemMark 18px + workspaceName, 13.5px/600); Search row opening the palette with `Ctrl K` kbd hint; Home; Review with count badge (accent-soft pill); `STUDY` section label (11px/600 faint) with Topics/Problems/Re-solve/Graph rows (gem-family SVG icons copied from mockup, 15px, opacity .75); `PAGES` section listing top-level topics as rows (◆ glyph, navigate to topic) + "New topic" row (faint, + icon, triggers the existing new-topic flow); footer streak row. Row metrics from mockup: 13.5px text, 5px/10px padding, 6px radius, hover `--surface-2`, active `--accent-soft` + text color full.

- [ ] Implement; keep collapse behavior if the current sidebar has it (collapsed = icons only, workspace header shows gem only); update-available indicator stays (calm-styled row above footer).
- [ ] Tests + typecheck + browser check both themes; commit `feat(shell): calm workspace sidebar`.

### Task 4: Page kit — PageShell, Callout, PropertyChips, ListRow

**Files:** Create `src/components/page/PageShell.tsx`, `Callout.tsx`, `PropertyChips.tsx`, `ListRow.tsx`. Test: `src/components/page/page-kit.test.tsx` (renderToString: PageShell renders title + children; Callout renders icon slot + title + body; PropertyChips dims zero values; ListRow renders tag slot).

**Interfaces — Produces:**
- `PageShell({ icon?, title, subtitle?, children })` — centered `max-w-[708px] mx-auto px-6 pt-12 pb-32`; icon 60px; title 38px/700 tracking `-.015em`; subtitle faint.
- `Callout({ icon, title, body })` — flex row, `bg-[--surface]` radius 8px, padding 16/18.
- `PropertyChips({ items: {icon, label, value}[] })` — horizontal row, 12px faint labels, 15px/600 values, value `0` renders `--text-dim`; bottom border `--line`.
- `ListRow({ icon?, glyph?, children, tag?, onClick? })` — 13.5px row, hover `--surface-2`, radius 6px; optional accent-soft tag pill.

- [ ] TDD: tests first, then components; commit `feat(shell): page kit components`.

### Task 5: Home page rebuild

**Files:** Rewrite `src/features/home/HomePage.tsx` render (keep all data hooks/logic). Delete `src/components/Backdrop.tsx` usage here; if no other route uses Backdrop, delete the file.

**Interfaces — Consumes:** Task 4 kit, `greeting()`, existing queries (due count, stats, streak, recent problems, recent topics). **Produces:** per mockup: PageShell(icon=GemMark 60px, title=greeting(), subtitle=long date); Callout(review-loop icon, "Nothing due. You're clear." / due-count variant "N to review — keep them warm" linking to /review); PropertyChips(Topics/Notes/Solved/Streak); "Recently solved" section (h2 15px/600 + "See all →" faint link to /problems; list of recent problems as ListRow with difficulty tag; empty state = existing on-voice hint + `Ctrl Shift P` kbd chip); "Pick up where you left off" ListRows of 2-3 recent topics (hidden when none).

- [ ] Implement; tests + typecheck + browser pass both themes; commit `feat(shell): calm home page`.

### Task 6: Route adoption — Topics, Problems, Review, Re-solve, Graph

**Files:** Modify the page components in `src/features/{topics,problems,review,graph}` (+ ResolvePage) to wrap content in PageShell (title = current page names; keep existing eyebrow text as subtitle where it exists) and restyle their internal cards/panels to calm surfaces (flat `--surface` fills, `--line` borders, no gradients/glows). Detail pages (TopicDetailPage, ProblemDetailPage, NotePage) adopt the centered column via PageShell with their existing title logic; BlockNote area untouched.

- [ ] Route by route; after each, browser-check both themes; keep list/grid information density (this is restyling, not re-architecting; FTS palette, heatmap, mastery, graph canvas all keep working — graph canvas colors read tokens where they already do).
- [ ] Tests + typecheck; commit `feat(shell): calm page layouts across routes`.

### Task 7: Chrome polish — dialogs, palette, buttons

**Files:** `src/features/palette/CommandPalette.tsx`, `QuickLogDialog`, `FontDialog`, `ImportMarkdownDialog`, shared button/input classes in `globals.css`.

- [ ] Dialogs/palette restyle: `--surface` panels, `--line` borders, 8-10px radii, small muted headers — match sidebar/topbar temperature. Buttons: primary = solid accent; secondary = hover-surface text buttons. No gradient remnants outside GemMark (verify: `grep -rn "text-gradient\|btn-primary" src` reviewed line by line; wordmark uses of `.text-gradient` may remain only if the sidebar still uses it — Task 3 decides; splash untouched).
- [ ] Tests + typecheck + browser pass; commit `feat(shell): calm chrome polish`.

### Task 8: v0.4.0 + changelog

**Files:** `package.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`, `src-tauri/Cargo.lock` (dsa-vault block) → `0.4.0`; `CHANGELOG.md` new section above v0.3.0:

```markdown
## v0.4.0

### 🪶 The Calm Shell
- **A completely redesigned, Notion-calm interface** — quiet neutral
  surfaces, a workspace sidebar with your topics as pages, and content
  that sits on a clean centered page
- **Custom window frame** — Trove now draws its own title bar, breadcrumbs
  and window controls; the generic OS chrome is gone
- Purple now lives where it belongs: small accents and the gem itself
- Same features, same data, same shortcuts — nothing to relearn
```

- [ ] Bump, changelog, `npm test && npm run build`; commit `chore: v0.4.0`.

### Task 9: Ship and verify

- [ ] PR `feature/calm-shell` → master, merge; tag `v0.4.0`, push; watch the release workflow (draft flips public with `Trove_0.4.0` installers + latest.json).
- [ ] Update-chain test on the installed app (this also closes the still-open v0.3.0 chain verification): launch installed Trove, apply the offered update, verify relaunch shows the calm shell with data intact.
- [ ] If the updater does not offer 0.4.0: check `latest.json` platform keys and endpoint (now `/trove/`) before anything else; do not delete releases.

---

## Self-review

Spec coverage: tokens→T1; titlebar/frameless→T2; sidebar→T3; page kit→T4; Home→T5; other routes→T6; kept-features polish→T7; release→T8/T9. Mockup referenced as authority throughout. Types consistent: PageShell/Callout/PropertyChips/ListRow names match between T4 producer and T5/T6 consumers; `pageTitleFor` shared T2↔TabBar. No placeholders; exact hex values inline or in the mockup file committed in-repo.
