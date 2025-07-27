import { emailer } from "@/lib/email";
import { EmailTemplate } from "@litespace/emails";
import { safe, safePromise } from "@litespace/utils/error";
import { nameof } from "@litespace/utils/utils";
import { WorkerMessageOf } from "@/workers/types";
import { sessionEvents, tutors } from "@litespace/models";
import { joinTutorCache } from "@/lib/tutor";
import { cache } from "@/lib/cache";
import { isOnboarded } from "@litespace/utils/tutor";

export async function sendForgetPasswordCodeEmail({
  email,
  code,
}: {
  email: string;
  code: number;
}) {
  const result = await safePromise(
    emailer.send({
      to: email,
      template: EmailTemplate.ForgetPassword,
      props: { code },
    })
  );

  if (result instanceof Error)
    console.error(nameof(sendForgetPasswordCodeEmail), result);
}

export async function sendUserVerificationCodeEmail({
  email,
  code,
}: {
  email: string;
  code: number;
}) {
  const error = await safePromise(
    emailer.send({
      to: email,
      template: EmailTemplate.VerifyEmail,
      props: { code },
    })
  );

  if (error instanceof Error)
    console.error(nameof(sendUserVerificationCodeEmail), error);
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
    if (!isOnboarded(tutor))
      return await cache.tutors.removeOne(payload.tutorId);

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
