import { emailer } from "@/lib/email";
import { EmailTemplate } from "@litespace/emails";
import { IToken } from "@litespace/types";
import jwt from "jsonwebtoken";
import { tokensExpireTime, jwtSecret } from "@/constants";
import { safe } from "@litespace/utils/error";
import { nameof } from "@litespace/utils/utils";
import { WorkerMessageOf, WorkerMessagePayloadOf } from "@/workers/types";
import { sessionEvents, tutors } from "@litespace/models";
import { joinTutorCache } from "@/lib/tutor";
import { cache } from "@/lib/cache";
import { isOnboard } from "@litespace/utils/tutor";
import dayjs from "@/lib/dayjs";
import { producer } from "@/lib/kafka";

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
  payload: WorkerMessageOf<"update-tutor-cache">["payload"]
) {
  const error = await safe(async () => {
    await cache.connect();
    const tutor = await tutors.findById(payload.tutorId);
    if (!tutor) return;

    // Remove tutors from cache in case they are no longer "onboard"
    if (!isOnboard(tutor)) return await cache.tutors.removeOne(payload.tutorId);

    const tutorCache = await cache.tutors.getOne(tutor.id);
    const joinedCache = await joinTutorCache(tutor, tutorCache);
    await cache.tutors.setOne(joinedCache);
  });

  if (error instanceof Error) console.error(error);
}

/**
 * Insert new event record in the database `events` table
 */
export async function createSessionEvent(
  payload: WorkerMessageOf<"create-session-event">["payload"]
) {
  const error = await safe(async () => {
    return sessionEvents.create(payload);
  });
  if (error instanceof Error) console.error(error);
}

function formatMessage(
  payload: WorkerMessagePayloadOf<"send-message">
): string {
  const formatDate = (date: string) =>
    dayjs(date).tz("Africa/Cairo").format("ddd D MMM hh:mm a");

  if (payload.type === "create-lesson") {
    const date = formatDate(payload.start);
    return `New lesson booked! A student has booked a lesson with you for ${payload.duration} minutes at ${date} (GMT+2)`;
  }

  if (payload.type === "update-lesson") {
    const prevStart = formatDate(payload.previous.start);
    const prevDuration = payload.previous.duration + " minutes";
    const currentStart = formatDate(payload.current.start);
    const currentDuration = payload.current.duration + " minutes";
    return `Your lesson at ${prevStart} (${prevDuration}) is now updated to ${currentStart} (${currentDuration})`;
  }

  const date = formatDate(payload.start);
  return `Your lesson at ${date} is canceled.`;
}

export async function sendMessage(
  payload: WorkerMessagePayloadOf<"send-message">
) {
  const message = formatMessage(payload);

  await producer.send({
    topic: payload.method,
    value: {
      to: payload.phone,
      message,
    },
  });
}
