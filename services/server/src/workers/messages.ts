import { Server } from "@litespace/types";

export enum WorkerMessageType {
  SendUserVerificationEmail,
  SendForgetPasswordEmail,
}

export type WorkerMessage = {
  type:
    | WorkerMessageType.SendUserVerificationEmail
    | WorkerMessageType.SendForgetPasswordEmail;
  user: number;
  email: string;
  callbackUrl: string;
};

export enum PartentPortMessageType {
  Stats,
}

export type PartentPortMessage = {
  type: PartentPortMessageType.Stats;
  stats: Server.Stats;
};
