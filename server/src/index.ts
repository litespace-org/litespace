import express, { json } from "express";
import routes from "@/routes";
import { serverConfig } from "@/constants";
import "colors";
import { errorHandler } from "@/middleware/error";

const app = express();

app.use(json());
app.use("/api/v1/user", routes.user);
app.use("/api/v1/slot", routes.slot);
app.use(errorHandler);

app.listen(serverConfig.port, () =>
  console.log(`Server is running on port ${serverConfig.port}`.cyan)
);
