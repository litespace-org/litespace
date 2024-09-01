import express, { json, urlencoded } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { serverConfig } from "@/config";
import call from "@/routes/call";
import { error } from "@/middlewares/error";
import "colors";

const app = express();

app.use(json());
app.use(urlencoded({ extended: true }));
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: serverConfig.origin }));
app.use("/", express.static(serverConfig.assets));
app.use("/api/v1/call", call);
app.use(error);

app.listen(serverConfig.port, () =>
  console.log(`Server is running on port ${serverConfig.port}`.green)
);
