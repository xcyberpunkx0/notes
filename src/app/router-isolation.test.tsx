import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { createMemoryRouter, RouterProvider } from "react-router";
import { RouterIsolation } from "./router-isolation";

/**
 * The split view mounts a second (memory) router inside the main app router.
 * Regression test for the v0.2.0 startup crash: with splitPath persisted, the
 * nested RouterProvider threw "You cannot render a <Router> inside another
 * <Router>" on every launch.
 */

function nestedApp(wrapPane: (pane: React.ReactNode) => React.ReactNode) {
  const paneRouter = createMemoryRouter([
    { path: "/", element: <span>pane-content</span> },
  ]);
  const mainRouter = createMemoryRouter([
    { path: "/", element: <div>{wrapPane(<RouterProvider router={paneRouter} />)}</div> },
  ]);
  return <RouterProvider router={mainRouter} />;
}

describe("split-view router nesting", () => {
  it("a bare nested RouterProvider throws (the v0.2.0 crash)", () => {
    expect(() => renderToString(nestedApp((pane) => pane))).toThrow(
      /cannot render a <Router> inside another <Router>/,
    );
  });

  it("RouterIsolation lets the pane router mount with its own history", () => {
    const html = renderToString(
      nestedApp((pane) => <RouterIsolation>{pane}</RouterIsolation>),
    );
    expect(html).toContain("pane-content");
  });
});
