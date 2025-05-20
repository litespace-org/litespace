import { createServer } from "node:http";
import express, { Request, Response, NextFunction } from "express";
import safeRequest from "express-async-handler";
import {
  EgressClient,
  EncodedFileOutput,
  EncodedFileType,
  EncodingOptionsPreset,
  S3Upload,
} from "livekit-server-sdk";
import zod, { ZodError } from "zod";
import cors from "cors";
import logger from "morgan";
import bodyParser from "body-parser";
import { isAxiosError } from "axios";
import "colors";

import { authMiddleware } from "@litespace/auth";
import { isUser, ResponseError } from "@litespace/utils";
import { ApiError } from "@litespace/types";
import { sockets } from "@litespace/atlas";

import {
  environment,
  jwtSecret,
  livekitConfig,
  serverConfig,
  spaceConfig,
} from "@/constants";

// global error handling
// this is needed to prevent the server process from exit.
process.on("uncaughtException", async (error) => {
  console.log("Uncaught exception");
  console.error(error);
  try {
    /*
    await msg(
      `uncaught exception: ${error.message}\n${error.stack?.split("\n")}`
    );
    */
  } catch (error) {
    console.log(
      `Faield to notify exception`,
      isAxiosError(error) ? error.response : error
    );
  }
});

const app = express();
const server = createServer(app);

app.use(
  logger(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
    ].join(" ");
  })
);

// @TODO: specify allowed origins
app.use(cors({ credentials: true, origin: true }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(authMiddleware({ jwtSecret, ghostPassword: "" }));

app.post(
  "/record/:sessionId",
  safeRequest(async (req, res, next) => {
    const user = req.user;
    if (!isUser(user)) {
      return next(
        new ResponseError({
          errorCode: ApiError.Forbidden,
          statusCode: 403,
          message: "not allowed",
        })
      );
    }

    const { sessionId } = zod
      .object({
        sessionId: zod.string({ coerce: true }).regex(/^lesson:|^interview:*/i),
      })
      .parse(req.params);

    const egressClient = new EgressClient(
      sockets.livekit[environment],
      livekitConfig.apiKey,
      livekitConfig.apiSecret
    );

    console.log(sockets.livekit[environment]);

    const output: EncodedFileOutput = new EncodedFileOutput({
      fileType: EncodedFileType.MP4,
      // @NOTE: Assining the file name to the session_id shall simplify
      // requesting the file from s3 afterward.
      filepath: sessionId,
      output: {
        case: "s3",
        value: new S3Upload({
          accessKey: spaceConfig.accessKeyId,
          secret: spaceConfig.secretAccessKey,
          bucket: spaceConfig.bucketName,
          region: "fra1",
          forcePathStyle: true,
        }),
      },
    });

    const info = await egressClient.startRoomCompositeEgress(
      sessionId,
      output,
      {
        layout: "grid",
        encodingOptions: EncodingOptionsPreset.H264_1080P_30,
        audioOnly: false,
      }
    );

    console.log(
      `The room with id=${info.roomId} and name=${info.roomName} is being recorded.`
    );

    res.sendStatus(200);
  })
);

app.use(
  (
    error: Error | ResponseError | ZodError,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error("recorder service: ", error);
    if (error instanceof ResponseError) return res.sendStatus(error.statusCode);
    else if (error instanceof ZodError) return res.sendStatus(400);
    res.sendStatus(500);
  }
);

server.listen(serverConfig.port, () =>
  console.log(`Server is running on port ${serverConfig.port}`.cyan)
);
