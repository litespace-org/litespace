import user from "@/handlers/user";
import { Router } from "express";
import { ApiContext } from "@/types/api";
import { fileupload } from "@/middleware/fileupload";

export default function router(context: ApiContext) {
  const router = Router();

  router.route("/").post(user.create);

  router.get("/interviewer/select", user.selectInterviewer);
  router.get("/me", user.findMe);
  router.get("/list", user.findUsers);
  router.get("/:id", user.findById);
  router.put("/:id", fileupload, user.update(context));
  router.get("/tutor/meta/:tutorId", user.findTutorMeta);
  router.get("/tutor/list/available", user.findAvailableTutors);
  router.get("/tutor/stats/:tutor", user.findTutorStats);
  router.get("/tutor/activity/:tutor", user.findTutorActivityScores);
  router.get("/media-provider/tutors", user.findTutorsForMediaProvider);

  return router;
}
