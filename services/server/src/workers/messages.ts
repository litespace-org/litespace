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
