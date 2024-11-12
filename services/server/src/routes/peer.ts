import peer from "@/handlers/peer";
import { Router } from "express";

const router = Router();

router.post("/", peer.registerPeerId);
router.delete("/", peer.deletePeerId);
router.get("/", peer.findPeerId);

export default router;
