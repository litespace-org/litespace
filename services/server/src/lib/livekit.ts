import { livekitConfig } from "@/constants";
import { RoomServiceClient } from "livekit-server-sdk";

export const livekitRoom = new RoomServiceClient(
  livekitConfig.host,
  livekitConfig.apiKey,
  livekitConfig.apiSecret
);
