import zod from "zod";

export const mediaConfig = {
  recordingDim: { width: 1280, height: 720 },
} as const;

export const serverConfig = {
  origin: ["http://localhost:5173"],
  assets: "assets/",
  artifacts: "artifacts/",
  port: zod.coerce.number().parse(process.env.PORT),
} as const;
