import express, { json, NextFunction, Request, Response } from "express";
import { serverConfig } from "@/constants";

const app = express();

app.use(json());

app.post("/", (_req: Request, _res: Response, _next: NextFunction) => {
  // logic will go here
});

app.listen(serverConfig.port, serverConfig.host, () =>
  console.log(`Server is running on ${serverConfig.host}:${serverConfig.port}`)
);
