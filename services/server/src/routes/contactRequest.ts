import { Router } from "express";
import contactRequest from "@/handlers/contactRequest";
import { rateLimit } from "express-rate-limit";
import ms from "ms";

const router = Router();

router.post(
  "/",
  rateLimit({
    skipFailedRequests: true,
    windowMs: ms("6 hours"),
    limit: 1,
  }),
  contactRequest.create
);

export default router;
