import { ApiContext } from "@/types/api";
import { Router } from "express";
import lesson from "@/handlers/lesson";

export default function router(context: ApiContext) {
  const router = Router();

  router.get("/attended/stats", lesson.findAttendedLessonsStats);
  router.get("/list", lesson.findLessons);
  router.get("/refundable", lesson.findRefundableLessons);
  router.get("/:id", lesson.findLessonById);
  router.get("/session/:sessionId", lesson.findBySessionId);
  router.post("/", lesson.create(context));
  router.post("/card", lesson.createWithCard);
  router.post("/ewallet", lesson.createWithEWallet);
  router.post("/fawry", lesson.createWithFawrRefNum);
  router.patch("/", lesson.update(context));
  router.patch("/cancel/:lessonId", lesson.cancel);
  router.patch("/report/:lessonId", lesson.report);

  return router;
}
