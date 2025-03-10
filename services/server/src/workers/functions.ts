import { emailer } from "@/lib/email";
import { EmailTemplate } from "@litespace/emails";
import { IToken } from "@litespace/types";
import jwt from "jsonwebtoken";
import { tokensExpireTime, jwtSecret } from "@/constants";
import { safe } from "@litespace/utils/error";
import { nameof } from "@litespace/utils/utils";
import { WorkerMessagePayloadMap } from "@/workers/types";
import { tutors } from "@litespace/models";
import { isOnboard, joinTutorCache } from "@/lib/tutor";
import { cache } from "@/lib/cache";

export async function sendAuthTokenEmail({
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

/**
 * This function is responsible of updating the tutors cache data and verifying its integrity
 */
export async function updateTutorCache(
  payload: WorkerMessagePayloadMap["update-tutor-in-cache"]
) {
  const error = await safe(async () => {
    await cache.connect();
    const tutor = await tutors.findById(payload.tutorId);
    if (!tutor) return;

    // remove tutors from cache in case they are no longer "onboard"
    if (!isOnboard(tutor)) {
      await cache.tutors.removeOne(payload.tutorId);
      return;
    }

    const tutorCache = await cache.tutors.getOne(tutor.id);
    const joinedCache = await joinTutorCache(tutor, tutorCache);
    await cache.tutors.setOne(joinedCache);

    /* TODO: Notify clients (users) that a tutor cache data has been updated
     * So users keep up-to-date
      context.io
        .to(Wss.Room.TutorsCache)
        .emit(Wss.ServerEvent.TutorUpdated, tutor);
    */
  });

  if (error instanceof Error) console.error(error);
}
