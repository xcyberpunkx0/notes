# Trove Rebrand (v0.3.0) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the app to Trove with a gem-mark identity, branded splash, and a warm-coach copy pass — while keeping data and auto-updates fully continuous.

**Architecture:** All brand assets are SVG-first React components in `src/assets/brand/`; the OS icon set is generated from the same SVG via a one-off script + `tauri icon`. Copy lives where it's used; only the greeting gains its own module (it has logic worth testing). No new dependencies at runtime.

**Tech Stack:** Tauri 2, React 19, TypeScript, Tailwind v4 (`src/styles/globals.css`), Vitest, `sharp` (dev-only, icon rendering).

**Spec:** `docs/superpowers/specs/2026-07-25-trove-rebrand-design.md`

## Global Constraints

- Bundle identifier stays `com.aditya.dsavault`; updater signing key, updater endpoint, GitHub repo name (`notes`), and Rust crate name (`dsa-vault`) are UNCHANGED.
- Achievement DB `key` values are UNCHANGED — only display strings change.
- Animations are transform/opacity only, CSS-driven (no JS animation loops). Respect `prefers-reduced-motion`.
- No `Math.random()` in render paths — greeting rotation is deterministic per day.
- Palette, fonts, radii unchanged: dark `#131019`, light `#faf9fc`, gradient `#8e6bf5 → #c084fc`, Gabarito/DM Sans/JetBrains Mono.
- Voice: warm coach, quietly confident. Never guilt-tripping ("you missed…" banned). The collection is "your Trove".
- Repo convention: work on a feature branch `feature/trove-rebrand`, commit per task, PR to master at the end.

---

### Task 1: Brand mark components (GemMark + FacetMotif)

**Files:**
- Create: `src/assets/brand/GemMark.tsx`
- Create: `src/assets/brand/FacetMotif.tsx`
- Test: `src/assets/brand/brand.test.tsx`

**Interfaces:**
- Produces: `GemMark({ className?, variant?: "gradient" | "mono" })` — an inline SVG gem built from graph nodes/edges. `FacetMotif({ className? })` — a decorative background SVG, `aria-hidden`, stroked with `currentColor`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/assets/brand/brand.test.tsx
import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { GemMark } from "./GemMark";
import { FacetMotif } from "./FacetMotif";

describe("brand marks", () => {
  it("GemMark renders node circles and facet edges", () => {
    const html = renderToString(<GemMark />);
    expect(html).toContain("<svg");
    expect((html.match(/<circle/g) ?? []).length).toBeGreaterThanOrEqual(6);
    expect((html.match(/<line/g) ?? []).length).toBeGreaterThanOrEqual(8);
  });

  it("GemMark mono variant uses currentColor, no gradient", () => {
    const html = renderToString(<GemMark variant="mono" />);
    expect(html).toContain("currentColor");
    expect(html).not.toContain("linearGradient");
  });

  it("FacetMotif is decorative", () => {
    const html = renderToString(<FacetMotif />);
    expect(html).toContain('aria-hidden="true"');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/assets/brand/brand.test.tsx`
Expected: FAIL — cannot resolve `./GemMark`.

- [ ] **Step 3: Implement GemMark**

The gem is a pentagon-ish brilliant: crown edge A(7,4)–B(17,4), girdle E(4,10)–C(20,10) through midpoint M(12,10), culet D(12,21). Outline edges A–B, B–C, C–D, D–E, E–A; internal facets A–M, B–M, M–D, plus girdle E–C. Nodes at all six points.

```tsx
// src/assets/brand/GemMark.tsx
const NODES: [number, number][] = [
  [7, 4], [17, 4], [20, 10], [12, 21], [4, 10], [12, 10],
];
const EDGES: [number, number][][] = [
  [[7, 4], [17, 4]], [[17, 4], [20, 10]], [[20, 10], [12, 21]],
  [[12, 21], [4, 10]], [[4, 10], [7, 4]],
  [[4, 10], [20, 10]], [[7, 4], [12, 10]], [[17, 4], [12, 10]],
  [[12, 10], [12, 21]],
];

export function GemMark({
  className,
  variant = "gradient",
}: {
  className?: string;
  variant?: "gradient" | "mono";
}) {
  const stroke = variant === "gradient" ? "url(#gem-grad)" : "currentColor";
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      {variant === "gradient" && (
        <defs>
          <linearGradient id="gem-grad" x1="4" y1="4" x2="20" y2="21" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8e6bf5" />
            <stop offset="1" stopColor="#c084fc" />
          </linearGradient>
        </defs>
      )}
      {EDGES.map(([[x1, y1], [x2, y2]], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      ))}
      {NODES.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1.4" fill={stroke} />
      ))}
    </svg>
  );
}
```

- [ ] **Step 4: Implement FacetMotif**

```tsx
// src/assets/brand/FacetMotif.tsx
/**
 * Faint facet-line background texture. Parent controls color via
 * `currentColor` and placement; keep opacity in the 0.04–0.08 range.
 */
export function FacetMotif({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <g stroke="currentColor" strokeWidth="1">
        <path d="M40 220 L120 60 L260 40 L370 150 L300 270 L110 280 Z" />
        <path d="M120 60 L300 270 M260 40 L110 280 M40 220 L370 150" />
      </g>
      <g fill="currentColor">
        {[[40, 220], [120, 60], [260, 40], [370, 150], [300, 270], [110, 280]].map(
          ([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="3" />,
        )}
      </g>
    </svg>
  );
}
```

- [ ] **Step 5: Run tests, expect PASS**

Run: `npx vitest run src/assets/brand/brand.test.tsx`

- [ ] **Step 6: Commit**

```bash
git add src/assets/brand/
git commit -m "feat(brand): GemMark and FacetMotif components"
```

---

### Task 2: Greeting module with deterministic rotation

**Files:**
- Create: `src/lib/greeting.ts`
- Test: `src/lib/greeting.test.ts`
- Modify: `src/features/home/HomePage.tsx:25-30` (delete local `greeting()`), `:91` (call the new module)

**Interfaces:**
- Produces: `greeting(now?: Date): string` — picks a time bucket (morning < 12, afternoon < 17, evening) and rotates variants by day-of-year, so the greeting is stable within a day and varies across days.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/greeting.test.ts
import { describe, expect, it } from "vitest";
import { greeting, GREETINGS } from "./greeting";

describe("greeting", () => {
  it("uses the morning bucket before noon", () => {
    expect(GREETINGS.morning).toContain(greeting(new Date(2026, 6, 25, 9)));
  });
  it("uses the evening bucket after 17:00", () => {
    expect(GREETINGS.evening).toContain(greeting(new Date(2026, 6, 25, 21)));
  });
  it("is stable within a day", () => {
    expect(greeting(new Date(2026, 6, 25, 13))).toBe(
      greeting(new Date(2026, 6, 25, 16)),
    );
  });
  it("rotates across days", () => {
    const a = greeting(new Date(2026, 6, 25, 13));
    const b = greeting(new Date(2026, 6, 26, 13));
    expect(a).not.toBe(b);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/greeting.test.ts`
Expected: FAIL — cannot resolve `./greeting`.

- [ ] **Step 3: Implement**

```ts
// src/lib/greeting.ts
export const GREETINGS = {
  morning: [
    "Good morning.",
    "Morning — fresh mind, hard problems.",
    "Early start. The Trove approves.",
    "Good morning. Add something worth keeping.",
  ],
  afternoon: [
    "Good afternoon.",
    "Back at it.",
    "Afternoon — a good time for a solve.",
    "Welcome back to your Trove.",
  ],
  evening: [
    "Good evening.",
    "Evening session — make it count.",
    "Good evening. One more, or call it here.",
    "The Trove kept everything safe.",
  ],
} as const;

function dayOfYear(d: Date): number {
  return Math.floor(
    (d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86_400_000,
  );
}

export function greeting(now: Date = new Date()): string {
  const h = now.getHours();
  const bucket =
    h < 12 ? GREETINGS.morning : h < 17 ? GREETINGS.afternoon : GREETINGS.evening;
  return bucket[dayOfYear(now) % bucket.length];
}
```

- [ ] **Step 4: Run tests, expect PASS**

Run: `npx vitest run src/lib/greeting.test.ts`

- [ ] **Step 5: Use it in HomePage**

In `src/features/home/HomePage.tsx`: delete the local `greeting()` function (lines 25–30) and add `import { greeting } from "@/lib/greeting";`. The call site at line 91 (`{greeting()}`) stays as-is.

- [ ] **Step 6: Full test run, expect all green**

Run: `npm test`

- [ ] **Step 7: Commit**

```bash
git add src/lib/greeting.ts src/lib/greeting.test.ts src/features/home/HomePage.tsx
git commit -m "feat(brand): rotating warm-coach greetings"
```

---

### Task 3: The rename — window, sidebar wordmark, tray, package metadata

**Files:**
- Modify: `src-tauri/tauri.conf.json:3-4` (`productName`, `mainBinaryName`), `:16` (window `title`)
- Modify: `src-tauri/src/lib.rs:116` (tray tooltip)
- Modify: `src/app/Sidebar.tsx:21` (LogoMark), `:92-96` (wordmark block)
- Modify: `package.json:2` (`name`), `index.html` (`<title>`)

**Interfaces:**
- Consumes: `GemMark` from Task 1.

- [ ] **Step 1: Tauri config**

In `src-tauri/tauri.conf.json` set `"productName": "Trove"`, `"mainBinaryName": "Trove"`, and the main window `"title": "Trove"`. Do NOT touch `"identifier"`.

- [ ] **Step 2: Tray tooltip**

In `src-tauri/src/lib.rs:116`: `.tooltip("Trove — Ctrl+Shift+Space to quick-log")`.

- [ ] **Step 3: Sidebar wordmark**

In `src/app/Sidebar.tsx`: delete the `LogoMark` function (line 21) and replace its usage. The header block (lines 92–96) becomes:

```tsx
<GemMark className="size-4" />
<span className="text-gradient font-display text-[15px] font-bold lowercase tracking-tight">
  trove
</span>
```

with `import { GemMark } from "@/assets/brand/GemMark";`. Match the existing header layout/classes around it — only the mark and the word change. (If `font-display`/`text-gradient` utilities are named differently in `src/styles/globals.css`, use the existing class names — the intent is Gabarito + full gradient.)

- [ ] **Step 4: Web metadata**

`package.json` `"name": "trove"`; `index.html` `<title>Trove</title>`.

- [ ] **Step 5: Verify in dev**

Run: `npm run dev`, open `http://localhost:1420/` — sidebar shows the gem + gradient "trove"; browser tab says Trove. Check both themes (theme toggle in sidebar footer). Stop the server.

- [ ] **Step 6: Commit**

```bash
git add src-tauri/tauri.conf.json src-tauri/src/lib.rs src/app/Sidebar.tsx package.json index.html
git commit -m "feat(brand): rename app to Trove"
```

---

### Task 4: App icon regeneration

**Files:**
- Create: `scripts/render-icon.mjs`, `src/assets/brand/icon-source.svg`
- Modify: `src-tauri/icons/*` (generated), `package.json` (devDependency `sharp`)

**Interfaces:**
- Consumes: gem geometry from Task 1 (copied into the standalone SVG — the icon must not depend on React).

- [ ] **Step 1: Author the icon source SVG**

`src/assets/brand/icon-source.svg` — 1024px, aubergine rounded square, gradient gem scaled to ~60% width, centered. Reuse the exact NODES/EDGES coordinates from `GemMark.tsx` scaled ×32 and offset +128 (24-unit viewBox → 768px gem in a 1024px canvas):

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="g" x1="256" y1="240" x2="800" y2="816" gradientUnits="userSpaceOnUse">
      <stop stop-color="#8e6bf5"/><stop offset="1" stop-color="#c084fc"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="232" fill="#131019"/>
  <path d="M352 240 L672 240 L800 448 L512 816 L224 448 Z" fill="url(#g)"/>
  <path d="M224 448 L800 448 M352 240 L512 448 L672 240 M512 448 L512 816"
        stroke="#131019" stroke-width="42" stroke-linejoin="round" fill="none" opacity="0.9"/>
</svg>
```

(Amended 2026-07-25: solid-facet design B chosen by Aditya over the original wireframe — matches Task 1b's GemMark.)

- [ ] **Step 2: Render script**

```js
// scripts/render-icon.mjs
import sharp from "sharp";
await sharp("src/assets/brand/icon-source.svg")
  .resize(1024, 1024)
  .png()
  .toFile("src/assets/brand/icon-source.png");
console.log("wrote src/assets/brand/icon-source.png");
```

Run: `npm i -D sharp && node scripts/render-icon.mjs`

- [ ] **Step 3: Generate the icon set**

Run: `npx tauri icon src/assets/brand/icon-source.png`
Expected: rewrites `src-tauri/icons/` (icon.ico, icon.icns, PNG sizes, Square*Logo.png).

- [ ] **Step 4: Visual check**

Open `src/assets/brand/icon-source.png` and `src-tauri/icons/32x32.png` — gem must stay legible at 32px. If facet lines vanish, raise `stroke-width` to 56 and node `r` to 52 in the SVG and regenerate.

- [ ] **Step 5: Commit**

```bash
git add scripts/render-icon.mjs src/assets/brand/icon-source.svg src/assets/brand/icon-source.png src-tauri/icons package.json package-lock.json
git commit -m "feat(brand): Trove gem app icon"
```

---

### Task 5: Launch splash

**Files:**
- Create: `src/app/Splash.tsx`
- Modify: `src/main.tsx:37` (render `<Splash />` after `<RouterProvider …/>`), `src/styles/globals.css` (splash styles)

**Interfaces:**
- Consumes: `GemMark` from Task 1.
- Produces: `<Splash />` — self-removing overlay; nothing else consumes it.

- [ ] **Step 1: Component**

```tsx
// src/app/Splash.tsx
import { useState } from "react";
import { GemMark } from "@/assets/brand/GemMark";

/** Branded launch overlay. Pure CSS timeline; unmounts itself when done. */
export function Splash() {
  const [gone, setGone] = useState(false);
  if (gone) return null;
  return (
    <div
      className="splash"
      onAnimationEnd={(e) => {
        if (e.animationName === "splash-out") setGone(true);
      }}
    >
      <GemMark className="splash-gem" />
    </div>
  );
}
```

- [ ] **Step 2: Styles**

Append to `src/styles/globals.css`:

```css
.splash {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: grid;
  place-items: center;
  background: var(--color-bg);
  animation: splash-out 0.3s ease 0.85s forwards;
}
.splash-gem {
  width: 72px;
  animation: splash-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes splash-in {
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes splash-out {
  to { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .splash { display: none; }
}
```

(If the background token in globals.css is not `--color-bg`, use the token the `bg-bg` utility maps to.)

- [ ] **Step 3: Mount it**

In `src/main.tsx`, render `<Splash />` as a sibling immediately after `<RouterProvider router={router} />` (inside the same providers is fine; it touches nothing).

- [ ] **Step 4: Verify in dev**

`npm run dev`, hard-reload: gem fades/scales in over ~0.5s, overlay fades out by ~1.2s, app interactive underneath afterward. Verify both themes. Total must feel like a beat, not a wait.

- [ ] **Step 5: Commit**

```bash
git add src/app/Splash.tsx src/main.tsx src/styles/globals.css
git commit -m "feat(brand): launch splash"
```

---

### Task 6: Copy pass — empty states, achievements, update prompt

**Files:**
- Modify: `src/db/achievements.ts:11-48` (display strings only)
- Modify: `src/features/home/HomePage.tsx` (review-card empty copy + motif)
- Modify: `src/features/topics/TopicsPage.tsx`, `src/features/review/ReviewPage.tsx`, `src/features/graph/GraphPage.tsx`, `src/features/problems/ResolvePage.tsx`, `src/features/palette/CommandPalette.tsx`, `src/app/Sidebar.tsx` (update prompt)

**Interfaces:**
- Consumes: `FacetMotif` from Task 1.

- [ ] **Step 1: Achievements (keys and logic untouched)**

In `src/db/achievements.ts` replace ONLY `title`/`description` values:

| key | title | description |
|---|---|---|
| first_note | Opening lines | Wrote your first note |
| first_problem | First gem | Added your first solved problem to the Trove |
| first_debrief | First Facet | Cut a solve into a full debrief |
| first_review | The loop begins | Finished your first review |
| problems_10 | Ten gems deep | Ten solved problems in the Trove |
| streak_7 | One week strong | Showed up seven days straight |

- [ ] **Step 2: Empty states**

In each file, locate the empty-state JSX (the block rendered when the relevant list/queue is empty — search for the current copy) and replace the strings; where the layout has room (HomePage review card, TopicsPage), add `<FacetMotif className="pointer-events-none absolute inset-0 text-text opacity-[0.05]" />` inside the (relatively positioned) empty-state container:

- HomePage review card — title `Nothing due. You're clear.` body `New notes and problems join the queue a day after you add them.`
- TopicsPage — title `Your Trove starts here` body `Create a topic for the first thing you want to truly know.`
- ReviewPage empty queue — `Queue is clear. Anything you add today comes back tomorrow.`
- GraphPage empty — `The graph grows as you link notes and problems — every @-mention becomes an edge.`
- ResolvePage empty — `Log a few problems first — then come back and re-solve them cold.`
- CommandPalette no results — `Nothing in the Trove matches — yet.`
- ProblemsPage — already on-voice (`Every solve, remembered`): leave the copy, no change.

- [ ] **Step 3: Update prompt**

In `src/app/Sidebar.tsx`, find the update-available block (it renders when the store's `updateVersion` is set) and set its label to `A new Trove is ready` with the action button `Update now` (keep the existing handler wiring).

- [ ] **Step 4: Verify**

`npm test` (all green — achievements tests, if any, only reference keys). Then `npm run dev` and click through: Home (empty review card), Topics, Review, Graph, Re-solve, palette with a garbage query. Both themes.

- [ ] **Step 5: Commit**

```bash
git add src/db/achievements.ts src/features src/app/Sidebar.tsx
git commit -m "feat(brand): warm-coach copy pass"
```

---

### Task 7: Copy style guide

**Files:**
- Create: `docs/copy-style.md`

- [ ] **Step 1: Write it**

```markdown
# Trove copy style

Voice: warm coach, quietly confident.

- Address the user directly; short, plain sentences.
- Never guilt. "You missed", "overdue", "failed" are banned; a gap is an
  opportunity ("Queue is clear", not "0 reviews done").
- Numbers stated plainly. Celebrate only real milestones — first of
  anything, 7-day streak, 10× counts.
- Vocabulary: the collection is "your Trove"; you "add" solves and notes
  to it; debriefs "cut facets".
- Buttons are verbs ("Update now", "Log problem"); titles are sentences
  without periods only when under ~4 words.
- Greetings live in `src/lib/greeting.ts` — add variants there, never
  inline.
```

- [ ] **Step 2: Commit**

```bash
git add docs/copy-style.md
git commit -m "docs: Trove copy style guide"
```

---

### Task 8: Version 0.3.0 + changelog

**Files:**
- Modify: `package.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`, `src-tauri/Cargo.lock` (dsa-vault entry) — all `0.2.1` → `0.3.0`
- Modify: `CHANGELOG.md` (new section above `## v0.2.1`)

- [ ] **Step 1: Bump all four versions to 0.3.0**

- [ ] **Step 2: Changelog section**

```markdown
## v0.3.0

### 💎 Meet Trove
- **The app has a name: Trove** — your vault of hard-won knowledge. New gem
  icon, new wordmark, same data: everything you've saved carries over
  untouched, and auto-updates continue working.
- A proper launch moment — the vault opens instead of a cold flash
- The whole app now speaks in one voice: new greetings, empty states, and
  achievement names
- Rotating daily greetings so mornings don't repeat themselves

> Heads-up: because the installer is now `Trove_…-setup.exe`, the old
> `Notes` folder in Local AppData and its Start Menu shortcut stick around
> after updating — delete them once and you're clean.
```

- [ ] **Step 3: Full check + commit**

Run: `npm test && npm run build`

```bash
git add package.json src-tauri/tauri.conf.json src-tauri/Cargo.toml src-tauri/Cargo.lock CHANGELOG.md
git commit -m "chore: v0.3.0"
```

---

### Task 9: Ship and verify the update chain

**Files:** none new — PR, tag, release, live update test.

- [ ] **Step 1: PR and merge**

```bash
git push -u origin feature/trove-rebrand
gh pr create --fill-first --body "v0.3.0 Trove rebrand per docs/superpowers/specs/2026-07-25-trove-rebrand-design.md"
gh pr merge --merge --delete-branch
```

- [ ] **Step 2: Tag and release**

```bash
git checkout master && git pull
git tag v0.3.0 && git push origin v0.3.0
gh run watch --exit-status  # release workflow ~12 min; draft flips public when installers attach
```

Expected release assets: `Trove_0.3.0_x64-setup.exe`, `Trove_0.3.0_x64_en-US.msi`, both `.sig`s, `latest.json`.

- [ ] **Step 3: Update-chain test (the critical one)**

On the machine running installed v0.2.1 (`%LOCALAPPDATA%\Notes\Notes.exe`): launch, wait for the update indicator, apply the update. Verify: app relaunches as Trove (title, icon, splash), DB content intact (topics/problems present), settings intact (theme/font), and version reads 0.3.0. Then delete `%LOCALAPPDATA%\Notes` and the old shortcut.

- [ ] **Step 4: If the updater does NOT offer 0.3.0**

Check `latest.json` on the release — the updater matches on platform key, not filename, so a miss means the endpoint/pubkey changed (it must not have). Diagnose before shipping anything else; do not delete the release while the old app can still see it.

---

## Self-review checklist (done at write time)

- Spec coverage: §1 rename → Task 3; §2 identity → Tasks 1, 4; §3 splash → Task 5; §4 voice/copy → Tasks 2, 6, 7; §5 verification → per-task steps + Task 9. CHANGELOG requirement → Task 8.
- No placeholders; all copy strings and code included.
- Interface consistency: `GemMark`/`FacetMotif` names match across Tasks 1, 3, 5, 6; greeting API matches Tasks 2 and HomePage usage.
