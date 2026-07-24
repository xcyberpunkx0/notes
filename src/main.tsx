import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { IconContext } from "@phosphor-icons/react";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/instrument-sans";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource/pt-serif";
import "@fontsource/pt-serif/700.css";
import "@fontsource/tangerine";
import "@fontsource/tangerine/700.css";
import "@fontsource-variable/open-sans";
import "@fontsource-variable/roboto";
import "@fontsource-variable/caveat";
import "@fontsource/gaegu";
import "@fontsource/gaegu/700.css";
import "@fontsource/patrick-hand";
import "./styles/globals.css";
import { router } from "./app/router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <IconContext.Provider value={{ weight: "duotone" }}>
          <RouterProvider router={router} />
        </IconContext.Provider>
      </MotionConfig>
    </QueryClientProvider>
  </React.StrictMode>,
);
