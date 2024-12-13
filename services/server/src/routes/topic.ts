import { Router } from "express";
import topic from "@/handlers/topic";

const router = Router();

router.post("/", topic.createTopic);
router.put("/:id", topic.updateTopic);
router.delete("/:id", topic.deleteTopic);
router.get("/list", topic.findTopics);

export default router;
