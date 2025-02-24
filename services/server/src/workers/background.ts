import { parentPort } from "node:worker_threads";
import { WorkerMessage, WorkerMessageType } from "@/workers/messages";
import { emailer } from "@/lib/email";
import { EmailTemplate } from "@litespace/emails";
import { IToken } from "@litespace/types";
import jwt from "jsonwebtoken";
import { tokensExpireTime, jwtSecret } from "@/constants";
import { safe } from "@litespace/utils/error";
import { nameof } from "@litespace/utils/utils";
import { PartentPortMessage } from "@/workers/messages";

function _postMessage(message: PartentPortMessage) {
  if (!parentPort) return;
  parentPort.postMessage(message);
}

async function sendAuthTokenEmail({
  email,
  user,
  callbackUrl,
  type,
}: {
  email: string;
  user: number;
  callbackUrl: string;
  type: IToken.Type.ForgetPassword | IToken.Type.VerifyEmail;
}) {
  const error = await safe(async () => {
    const payload: IToken.AuthTokenEmail = { type, user };
    const token = jwt.sign(payload, jwtSecret, {
      expiresIn: tokensExpireTime[type],
    });
    const url = new URL(callbackUrl);
    url.searchParams.set("token", token);

    await emailer.send({
      to: email,
      template:
        type === IToken.Type.VerifyEmail
          ? EmailTemplate.VerifyEmail
          : EmailTemplate.ForgetPassword,
      props: { redirectUrl: url.toString() },
    });
  });

  if (error instanceof Error) console.error(nameof(sendAuthTokenEmail), error);
}

parentPort?.on("message", async (message: WorkerMessage) => {
  if (
    message.type === WorkerMessageType.SendUserVerificationEmail ||
    message.type === WorkerMessageType.SendForgetPasswordEmail
  )
    return await sendAuthTokenEmail({
      callbackUrl: message.callbackUrl,
      email: message.email,
      user: message.user,
      type:
        message.type === WorkerMessageType.SendUserVerificationEmail
          ? IToken.Type.VerifyEmail
          : IToken.Type.ForgetPassword,
    });
});
