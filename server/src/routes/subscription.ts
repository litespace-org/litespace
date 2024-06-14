import handlers from "@/handlers";
import { student, admins, authorizer } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router
  .route("/")
  .post(student, handlers.subscription.create)
  .put(authorizer().student().admins().handler(), handlers.subscription.update)
  .delete(
    authorizer().student().admins().handler(),
    handlers.subscription.delete
  )
  .get(
    authorizer().student().admins().handler(),
    handlers.subscription.getStudentSubscription
  );

router.get(
  "/list",
  authorizer().admins().handler(),
  handlers.subscription.getList
);

export default router;
