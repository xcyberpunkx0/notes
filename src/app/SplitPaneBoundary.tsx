import { Component, type ReactNode } from "react";
import { useUiStore } from "./store";

/**
 * A crash inside the split pane must never take down the whole shell —
 * splitPath is persisted, so an unguarded render error would make the app
 * crash on every launch until localStorage is cleared. On error we close the
 * split (clearing the persisted state) and let the main window live on.
 */
export class SplitPaneBoundary extends Component<
  { children: ReactNode },
  { crashed: boolean }
> {
  state = { crashed: false };

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Split pane crashed, closing split:", error);
    useUiStore.getState().closeSplit();
  }

  render() {
    return this.state.crashed ? null : this.props.children;
  }
}
