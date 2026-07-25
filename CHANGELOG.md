# Changelog

Release notes are written per version below. The release workflow extracts the
section matching the pushed tag and uses it as the GitHub release description.

## v0.4.0

### 🪶 The Calm Shell
- **A completely redesigned, Notion-calm interface** — quiet neutral
  surfaces, a workspace sidebar with your topics as pages, and content
  that sits on a clean centered page
- **Custom window frame** — Trove now draws its own title bar, breadcrumbs
  and window controls; the generic OS chrome is gone
- Purple now lives where it belongs: small accents and the gem itself
- Same features, same data, same shortcuts — nothing to relearn

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

## v0.2.1

### 🔧 Fixes
- **Fixed the app crashing on launch** with "You cannot render a `<Router>` inside another `<Router>`" — opening split view (`Ctrl+\`) once made the app unlaunchable, because the split pane's independent router couldn't mount inside the main one and the split state is remembered between launches
- Split view now recovers gracefully: if the pane ever fails, it closes itself instead of taking the whole app down

> If v0.2.0 crashes on launch for you, install this version over it — no need to uninstall first.

## v0.2.0

First public release — everything from Phases 1–4.

### ✍️ Notes & editing
- Block-based editor with slash commands, headings, code blocks, and rich markdown rendering
- Import existing markdown files straight into notes
- Drawing blocks — sketch diagrams inline with Excalidraw (`/drawing`), theme-aware
- Pick your own editor font from a curated font library

### 🧠 Practice & review
- Problem tracker with post-solve debriefs to capture what you learned
- Spaced-repetition review loop so solved problems come back before you forget them
- Flashcards generated from your debriefs
- Re-solve mode — get served a random past problem to solve again from scratch

### 📊 Insights
- Knowledge graph visualizing how your topics and problems connect
- Activity heatmap, mastery tracking, and weak-spot detection

### 🖥️ App
- In-app tabs (`Ctrl+T` / `Ctrl+W`) with persistent state
- Split view (`Ctrl+\`) for note + problem side by side
- Command palette (`Ctrl+K`) and global search
- System tray with quick-capture shortcuts
- Offline backup and export of your entire vault
- Signed auto-updates — install once, future releases arrive automatically
- Light and dark themes
