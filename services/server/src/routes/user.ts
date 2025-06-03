import user from "@/handlers/user";
import { Router } from "express";
import { ApiContext } from "@/types/api";
import { uploadMiddleware } from "@/lib/assets";
import { IUser } from "@litespace/types";

export default function router(context: ApiContext) {
  const router = Router();

  router.route("/").post(user.create);
  router.get("/interviewer/select", user.selectInterviewer);
  router.get("/current", user.findCurrentUser);
  router.get("/list", user.findUsers);
  router.put(
    "/asset",
    uploadMiddleware.fields([{ name: IUser.AssetFileName.Image, maxCount: 1 }]),
    user.uploadUserImage
  );
  router.put(
    "/asset/tutor",
    uploadMiddleware.fields([
      { name: IUser.AssetFileName.Image, maxCount: 1 },
      { name: IUser.AssetFileName.Video, maxCount: 1 },
      { name: IUser.AssetFileName.Thumbnail, maxCount: 1 },
    ]),
    user.uploadTutorAssets
  );
  router.get("/tutor/meta", user.findTutorMeta);
  router.get("/tutor/info/:tutorId", user.findTutorInfo);
  router.get("/tutor/list/onboarded", user.findOnboardedTutors);
  router.get("/tutor/stats/personalized", user.findPersonalizedTutorStats);
  router.get("/tutor/list/uncontacted", user.findUncontactedTutors);
  router.get("/tutor/stats/:tutor", user.findTutorStats);
  router.get("/tutor/activity/:tutor", user.findTutorActivityScores);
  router.get("/tutor/all/for/studio", user.findStudioTutors);
  router.get("/tutor/:tutorId/for/studio", user.findStudioTutor);
  router.get("/tutor/full-tutors", user.findFullTutors);
  router.get("/tutor/tutoring-minutes", user.findTutoringMinutes);
  router.get("/student/stats/personalized", user.findPersonalizedStudentStats);
  router.get("/student/stats/:student", user.findStudentStats);
  router.get("/studio/list", user.findStudios);

  router.get("/:id", user.findById);
  router.put("/:id", user.update(context));

  return router;
}
