import { createBrowserRouter } from "react-router";
import { AppShell } from "./AppShell";
import { HomePage } from "@/features/home/HomePage";
import { ReviewPage } from "@/features/review/ReviewPage";
import { TopicsPage } from "@/features/topics/TopicsPage";
import { TopicDetailPage } from "@/features/topics/TopicDetailPage";
import { NotePage } from "@/features/notes/NotePage";
import { ProblemsPage } from "@/features/problems/ProblemsPage";
import { ProblemDetailPage } from "@/features/problems/ProblemDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "review", element: <ReviewPage /> },
      { path: "topics", element: <TopicsPage /> },
      { path: "topics/:topicId", element: <TopicDetailPage /> },
      { path: "notes/:noteId", element: <NotePage /> },
      { path: "problems", element: <ProblemsPage /> },
      { path: "problems/:problemId", element: <ProblemDetailPage /> },
    ],
  },
]);
