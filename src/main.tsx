import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { IconContext } from "@phosphor-icons/react";
import "@fontsource-variable/gabarito";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/jetbrains-mono";
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
