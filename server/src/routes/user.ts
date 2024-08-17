import user from "@/handlers/user";
import { Router } from "express";
import passport, { AuthStrategy } from "@/lib/passport";

const router = Router();

router
  .route("/")
  .post(user.create, passport.authenticate(AuthStrategy.Local), user.returnUser)
  .delete(user.delete); // todo: update delete user route

router.get("/interviewer/select", user.selectInterviewer);
router.get("/me", user.findMe);
router.get("/list", user.findUsers);
router.get("/:id", user.findById);
router.put("/:id", user.update);
router.get("/tutor/meta/:tutorId", user.findTutorMeta);

export default router;
