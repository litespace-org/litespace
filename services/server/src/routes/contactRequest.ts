import { Router } from "express";
import contactRequest from "@/handlers/contactRequest";

const router = Router();

router.post("/", contactRequest.create);

export default router;
