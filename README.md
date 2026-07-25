<div align="center">

<img src="src-tauri/icons/128x128.png" width="80" alt="Trove icon" />

# Trove

**A personal knowledge vault that refuses to let you forget.**
Capture what you learn, debrief what you solve, and let spaced repetition bring it back before it fades.

[![CI](https://github.com/xcyberpunkx0/trove/actions/workflows/ci.yml/badge.svg)](https://github.com/xcyberpunkx0/trove/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-8e6bf5.svg)](LICENSE)
[![Tauri 2](https://img.shields.io/badge/Tauri-2-24C8DB?logo=tauri&logoColor=white)](https://tauri.app)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)

</div>

---

This project started while studying Data Structures & Algorithms. I kept taking careful notes in Notion and solving problems on LeetCode — and then never looking at any of it again. The notes weren't the problem; the *coming back* was. Most notes apps are graveyards: you write things down, feel productive, and forget.

Trove is built around the opposite idea — **everything you put in comes back to you** on a spaced schedule, weak topics get flagged, and the app tells you what to study today. The DSA origin shows in some of its sharpest tools (problem debriefs, code-first blocks, complexity templates), but the loop works for anything you're trying to actually retain.

It's a native Windows desktop app: instant startup, fully offline, and your data lives in a single local SQLite file you own.

## Features

### Write

- **Notion-style block editor** — slash commands, drag-to-reorder blocks, headings, callouts, tables, images
- **DSA section templates** — type `/intuition`, `/dry-run`, `/complexity`, `/edge-cases`, `/mistakes`, `/patterns` and the section scaffolds itself
- **First-class code blocks** — C++ by default, syntax highlighting for 40+ languages, tab indentation
- **Mermaid diagrams** — flowcharts, trees, and graphs from text, with an edit/preview toggle
- **Topics** — organize concepts into a nested, color-coded library

### Track problems

- **60-second quick-log** — paste a problem URL; platform (LeetCode, Codeforces, AtCoder, …) and title auto-fill
- **The debrief** — eight reflection prompts asked one at a time, skippable, answerable in markdown:
  what concept it taught you, your first wrong approach, where you got stuck, which older concepts you forgot or reused, the mistake you made, the pattern that unlocked it, what to remember next time, and the one thing to keep if you forget everything in six months
- **Code variants** — store brute-force and optimized solutions side by side in an embedded CodeMirror editor
- **Filters** — by topic, difficulty, platform, favorites

### Connect

- **`@`-mention wiki-links** — link any note, problem, or topic from inside the editor
- **Backlinks** — every page shows what links to it
- **Instant full-text search** — `Ctrl+K` searches note text, debrief answers, and *inside your code* via SQLite FTS5

### Retain (the point of the whole app)

- **Spaced repetition** — every note and problem joins a review queue; rate recall Forgot / Hard / Good / Easy and an SM-2-style scheduler spaces the next visit
- **Streaks & achievements** — light gamification that rewards showing up
- **Activity heatmap** — 17 weeks of your writing, solving, and reviewing at a glance
- **Mastery rings** — each topic shows how well its material is actually retained
- **Weak-spots panel** — topics with low retention or repeated lapses surface on Home with one-click focused practice

### Desktop-first

- **Global quick capture** — `Ctrl+Shift+Space` from anywhere in Windows opens the problem log
- **System tray** — the vault is always a click away
- **Command palette** — `Ctrl+K` for navigation, search, and actions
- **Dark and light themes** — dark-first, both hand-tuned
- **Local-first** — no account, no cloud, no telemetry; one SQLite file in `%APPDATA%`

## Screenshots

> Coming soon.

<!--
Drop images into docs/screenshots/ with these names, then delete the
"Coming soon" line above and uncomment the block below.

<table>
  <tr>
    <td width="50%">
      <img src="docs/screenshots/home.png" alt="Home — review queue, streak, heatmap and weak spots" />
      <p align="center"><sub>Home — today's review, streak, heatmap, weak spots</sub></p>
    </td>
    <td width="50%">
      <img src="docs/screenshots/editor.png" alt="Note editor with DSA templates and code blocks" />
      <p align="center"><sub>Editor — slash templates, code blocks, mermaid</sub></p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="docs/screenshots/problem.png" alt="Problem debrief with markdown answers" />
      <p align="center"><sub>Problem debrief — reflection prompts, code variants</sub></p>
    </td>
    <td width="50%">
      <img src="docs/screenshots/review.png" alt="Review session with recall rating" />
      <p align="center"><sub>Review — spaced repetition with recall ratings</sub></p>
    </td>
  </tr>
</table>
-->

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl` `K` | Command palette / search |
| `Ctrl` `Shift` `P` | Quick-log a problem |
| `Ctrl` `Shift` `R` | Go to Review |
| `Ctrl` `Shift` `Space` | Quick-log from anywhere in Windows (global) |
| `/` in editor | Insert blocks & DSA templates |
| `@` in editor | Link a note, problem, or topic |

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) 24+ (LTS)
- [Rust](https://rustup.rs) (stable)
- Windows: Visual Studio C++ Build Tools ([Tauri prerequisites](https://tauri.app/start/prerequisites/))

### Develop

```sh
npm install
npm run tauri dev
```

### Test & typecheck

```sh
npm test          # vitest unit tests (scheduler, streaks, search extraction, platform detection)
npx tsc --noEmit  # typecheck
```

### Build the installer

```sh
npm run tauri build
```

Installers land in `src-tauri/target/release/bundle/` (NSIS `.exe` and `.msi`).

## Architecture

```
src/
├── app/          shell — sidebar, topbar, router, ui store
├── features/     home, topics, notes, problems, review, palette
├── components/   shared ui (markdown renderer, heatmap, backlinks, …)
├── editor/       BlockNote setup, custom blocks (code, mermaid), @-links, DSA templates
├── db/           typed query hooks over tauri-plugin-sql (TanStack Query)
└── lib/          pure logic — SM-2-lite scheduler, streaks, FTS text extraction (unit tested)
src-tauri/
├── migrations/   versioned SQL migrations, applied on launch
└── src/lib.rs    thin Rust shell — SQLite, tray, global shortcut, window state
```

**Stack:** Tauri 2 · React 19 · TypeScript · Tailwind CSS 4 · BlockNote · CodeMirror 6 · TanStack Query · Zustand · Motion · SQLite (FTS5)

**How review scheduling works:** each item tracks an interval, ease factor, rep count, and lapse count. Ratings adjust the interval multiplicatively (ease clamped to 1.3–3.0); *Forgot* resets progress and records a lapse. Topic mastery is the average of `min(interval / 30 days, 1)` across a topic's items — intervals only grow when you keep remembering, so the ring is a proxy for real retention. The scheduler is a pure function in [`src/lib/scheduler.ts`](src/lib/scheduler.ts) with unit tests.

## Roadmap

- Flashcards generated from debrief answers
- Re-solve mode — the app challenges you with an old problem, then shows your past solution
- Paste-markdown → note conversion
- LeetCode history import
- Tabs and split view
- Knowledge-graph visualization of all links

## License

[MIT](LICENSE) © 2026 Aditya
