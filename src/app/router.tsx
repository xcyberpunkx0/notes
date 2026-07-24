import { createBrowserRouter } from "react-router";
import { AppShell } from "./AppShell";
import { HomePage } from "@/features/home/HomePage";
import { ReviewPage } from "@/features/review/ReviewPage";
import { TopicsPage } from "@/features/topics/TopicsPage";
import { TopicDetailPage } from "@/features/topics/TopicDetailPage";
import { NotePage } from "@/features/notes/NotePage";
import { ProblemsPage } from "@/features/problems/ProblemsPage";
import { ProblemDetailPage } from "@/features/problems/ProblemDetailPage";
import { ResolvePage } from "@/features/problems/ResolvePage";
import { GraphPage } from "@/features/graph/GraphPage";

/** Shared by the main window and split-view panes. */
export const childRoutes = [
  { index: true, element: <HomePage /> },
  { path: "review", element: <ReviewPage /> },
  { path: "topics", element: <TopicsPage /> },
  { path: "topics/:topicId", element: <TopicDetailPage /> },
  { path: "notes/:noteId", element: <NotePage /> },
  { path: "problems", element: <ProblemsPage /> },
  { path: "problems/:problemId", element: <ProblemDetailPage /> },
  { path: "resolve", element: <ResolvePage /> },
  { path: "graph", element: <GraphPage /> },
];

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: childRoutes,
  },
]);
