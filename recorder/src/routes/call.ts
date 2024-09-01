import { Router } from "express";
import fileupload from "express-fileupload";
import call from "@/handlers/call";
import multer from "multer";

const router = Router();

// router.post("/chunk", fileupload({ createParentPath: true }), call.uploadChunk);
router.post("/chunk", multer().single("chunk"), call.uploadChunk);

export default router;
