import { Router } from "express";
import asset from "@/handlers/asset";
import { ApiRoutes } from "@litespace/utils/routes";

const router = Router();
const sampleRouts = ApiRoutes.sample.routes;

router.get(sampleRouts.sample, asset.sample);

export default router;
