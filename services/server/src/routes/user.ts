import user from "@/handlers/user";
import { Router } from "express";
import { ApiContext } from "@/types/api";
import { fileupload } from "@/middleware/fileupload";

export default function router(context: ApiContext) {
  const router = Router();

  router.route("/").post(user.create);

  router.get("/interviewer/select", user.selectInterviewer);
  router.get("/current", user.findCurrentUser);
  router.get("/list", user.findUsers);
  router.get("/:id", user.findById);
  router.put("/:id", fileupload, user.update(context));
  router.get("/studio/tutors", user.findTutorsForStudio);
  router.get("/tutor/meta/:tutorId", user.findTutorMeta);
  router.get("/tutor/info/:tutorId", user.findTutorInfo);
  router.get("/tutor/list/onboarded", user.findOnboardedTutors);
  router.get("/tutor/stats/personalized", user.findPersonalizedTutorStats);
  router.get("/tutor/list/uncontacted", user.findUncontactedTutors);
  router.get("/tutor/stats/:tutor", user.findTutorStats);
  router.get("/tutor/activity/:tutor", user.findTutorActivityScores);
  router.get("/student/stats/personalized", user.findPersonalizedStudentStats);
  router.get("/student/stats/:student", user.findStudentStats);

  return router;
}
