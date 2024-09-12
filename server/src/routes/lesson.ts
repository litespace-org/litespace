import { ApiContext } from "@/types/api";
import { Router } from "express";
import lesson from "@/handlers/lesson";

export default function router(context: ApiContext) {
  const router = Router();

  router.post("/", lesson.create(context));
  router.get("/list/:id", lesson.findUserLessons);
  router.delete("/:lessonId", lesson.cancel(context));

  return router;
}
