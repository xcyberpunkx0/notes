import type { ContextType, ReactNode } from "react";
import { UNSAFE_LocationContext } from "react-router";

// Router's "already inside a router?" check is `useContext(LocationContext)
// != null`, so null is the intended reset value; the type just doesn't say so.
const NO_LOCATION = null as unknown as ContextType<
  typeof UNSAFE_LocationContext
>;

/**
 * React Router refuses to mount a <Router> when an ancestor already provides
 * LocationContext ("You cannot render a <Router> inside another <Router>").
 * Resetting that context lets an independent router (e.g. a split-view pane's
 * memory router) mount inside the main app router with its own history.
 */
export function RouterIsolation({ children }: { children: ReactNode }) {
  return (
    <UNSAFE_LocationContext.Provider value={NO_LOCATION}>
      {children}
    </UNSAFE_LocationContext.Provider>
  );
}
