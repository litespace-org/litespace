import express from "express";
import routes from "@/routes";
import { serverConfig } from "@/constants";
import "colors";

const app = express();

app.use("/api/v1/user", routes.user);

app.listen(serverConfig.port, () =>
  console.log(`Server is running on port ${serverConfig.port}`.cyan)
);
