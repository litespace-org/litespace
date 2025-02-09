import express, { json } from "express";
import { config } from "@/config";
import handler from "@/handler";
import { error } from "@/middlewares/error";

const app = express();

app.use(json());

app.post("/", handler);
app.use(error);

app.listen(config.port, config.host, () =>
  console.log(`Server is running on ${config.host}:${config.port}`)
);
