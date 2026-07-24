import { createBrowserRouter } from "react-router";
import { AppShell } from "./AppShell";
import { HomePage } from "@/features/home/HomePage";
import { ReviewPage } from "@/features/review/ReviewPage";
import { TopicsPage } from "@/features/topics/TopicsPage";
import { ProblemsPage } from "@/features/problems/ProblemsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "review", element: <ReviewPage /> },
      { path: "topics", element: <TopicsPage /> },
      { path: "problems", element: <ProblemsPage /> },
    ],
  },
]);
