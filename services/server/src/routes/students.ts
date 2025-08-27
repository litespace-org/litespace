import { Router } from "express";
import students from "@/handlers/students";

export default function router() {
  const router = Router();

  router.route("/").post(students.create);
  router.route("/list").get(students.find);

  return router;
}
