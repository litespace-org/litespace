import { tutors, users, knex, lessons } from "@litespace/models";
import { ILesson, ITutor, IUser, Wss } from "@litespace/types";
import { forbidden, notfound, userExists } from "@/lib/error";
import { hashPassword } from "@/lib/user";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import {
  email,
  gender,
  identityObject,
  password,
  pagination,
  string,
  withNamedId,
  role,
  url,
} from "@/validation/utils";
import { uploadSingle } from "@/lib/media";
import { FileType, jwtSecret } from "@/constants";
import {
  drop,
  entries,
  first,
  flatten,
  groupBy,
  orderBy,
  sample,
} from "lodash";
import zod from "zod";
import { Knex } from "knex";
import dayjs from "@/lib/dayjs";
import { cacheTutors, isPublicTutor } from "@/lib/tutor";
import { ApiContext } from "@/types/api";
import { asIsoDate, safe, Schedule } from "@litespace/sol";
import {
  authorizer,
  encodeAuthJwt,
  isAdmin,
  isMedaiProvider,
  isTutor,
  isUser,
} from "@litespace/auth";
import { cache } from "@/lib/cache";
import { sendBackgroundMessage } from "@/workers";
import { WorkerMessageType } from "@/workers/messages";

const createUserPayload = zod.object({
  role,
  email,
  password,
  callbackUrl: url,
});

const updateUserPayload = zod.object({
  email: zod.optional(email),
  password: zod.optional(password),
  name: zod.optional(string),
  gender: zod.optional(gender),
  notice: zod.optional(zod.number().positive().int()),
  birthYear: zod.optional(zod.number().positive()),
  drop: zod.optional(
    zod.object({
      image: zod.optional(zod.boolean()),
      video: zod.optional(zod.boolean()),
    })
  ),
  bio: zod.optional(zod.string().trim()),
  about: zod.optional(zod.string().trim()),
});

export async function create(req: Request, res: Response, next: NextFunction) {
  const payload = createUserPayload.parse(req.body);
  const admin = isAdmin(req.user);
  const publicRole = [IUser.Role.Tutor, IUser.Role.Student].includes(
    payload.role
  );
  if (!publicRole && !admin) return next(forbidden());

  const exists = await users.findByEmail(payload.email);
  if (exists) return next(userExists());

  const user = await knex.transaction(async (tx) => {
    const user = await users.create(
      {
        role: payload.role,
        email: payload.email,
        password: hashPassword(payload.password),
      },
      tx
    );

    if (payload.role === IUser.Role.Tutor) await tutors.create(user.id, tx);
    return user;
  });

  sendBackgroundMessage({
    type: WorkerMessageType.SendUserVerificationEmail,
    callbackUrl: payload.callbackUrl,
    email: user.email,
    user: user.id,
  });

  const token = encodeAuthJwt(user.id, jwtSecret);
  const response: IUser.RegisterApiResponse = { user, token };
  res.status(200).json(response);
}

function update(context: ApiContext) {
  return safeRequest(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = identityObject.parse(req.params);

      const currentUser = req.user;
      const allowed = isAdmin(currentUser) || isUser(currentUser);
      if (!allowed) return next(forbidden());

      const targetUser = await users.findById(id);
      if (!targetUser) return next(notfound.user());

      const {
        email,
        name,
        password,
        gender,
        birthYear,
        drop,
        bio,
        about,
        notice,
      }: IUser.UpdateApiPayload = updateUserPayload.parse(req.body);

      const files = {
        image: {
          file: req.files?.[IUser.UpdateMediaFilesApiKeys.Image],
          type: FileType.Image,
        },
        video: {
          file: req.files?.[IUser.UpdateMediaFilesApiKeys.Video],
          type: FileType.Video,
        },
      } as const;

      // Only media provider and admins can update tutor media files (images and videos)
      // Tutor cannot upload it for himself.
      const isUpdatingTutorMedia =
        (files.image.file || files.video.file) &&
        targetUser.role === IUser.Role.Tutor;
      const isEligibleUser = [
        IUser.Role.SuperAdmin,
        IUser.Role.RegularAdmin,
        IUser.Role.MediaProvider,
      ].includes(currentUser.role);
      if (isUpdatingTutorMedia && !isEligibleUser) return next(forbidden());

      // Only media providers and admins can upload videos.
      // e.g., students/interviewers cannot upload videos
      if (files.video.file && !isEligibleUser) return next(forbidden());

      const [image, video] = await Promise.all(
        [files.image, files.video].map(({ file, type }) =>
          file ? uploadSingle(file, type) : undefined
        )
      );

      const user = await knex.transaction(async (tx: Knex.Transaction) => {
        const user = await users.update(
          id,
          {
            name,
            email,
            gender,
            birthYear,
            image: drop?.image === true ? null : image,
            password: password ? hashPassword(password) : undefined,
          },
          tx
        );

        const tutorData = bio || about || video || drop?.video || notice;
        if (targetUser.role === IUser.Role.Tutor && tutorData)
          await tutors.update(
            targetUser.id,
            { bio, about, video: drop?.video ? null : video, notice },
            tx
          );

        return user;
      });

      // todo: remove the tutor from the case incase tutor is no longer fully onboarded
      res.status(200).json(user);
      // todo: handle cache update using a specific worker
      const isTutor = user.role === IUser.Role.Tutor;
      if (!isTutor) return;

      const error = await safe(async () => {
        const tutor = await tutors.findById(user.id);
        if (!tutor) return;
        // update tutor cache
        await cache.tutors.setOne(tutor);
        // notify clients
        context.io
          .to(Wss.Room.TutorsCache)
          .emit(Wss.ServerEvent.TutorUpdated, tutor);
      });

      if (error instanceof Error) console.error(error);
    }
  );
}

async function findById(req: Request, res: Response, next: NextFunction) {
  const currentUser = req.user;
  const allowed = isAdmin(currentUser);
  if (!allowed) return next(forbidden());

  const { id } = withNamedId("id").parse(req.params);
  const user = await users.findById(id);
  if (!user) return next(notfound.user());

  res.status(200).json(user);
}

async function findUsers(req: Request, res: Response, next: NextFunction) {
  const allowed = authorizer().admin().superAdmin().check(req.user);
  if (!allowed) return next(forbidden());

  const query = pagination.parse(req.query);
  const result = await users.find({ pagination: query });
  const response: IUser.FindUsersApiResponse = result;

  res.status(200).json(response);
}

async function findCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isUser(user);
  if (!allowed) return next(forbidden());
  res.status(200).json(req.user);
}

async function selectInterviewer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // only tutors can select interviewers
  const user = req.user;
  const allowed = isTutor(user);
  if (!allowed) return next(forbidden());

  const interviewers = await users.findManyBy("role", IUser.Role.Interviewer);
  // todo: select best interviewer based on his sechudle
  const interviewer = sample(interviewers);
  if (!interviewer) return next(notfound.user());

  res.status(200).json(interviewer);
}

async function findTutorMeta(req: Request, res: Response, next: NextFunction) {
  const { tutorId } = withNamedId("tutorId").parse(req.params);
  const tutor = await tutors.findSelfById(tutorId);
  if (!tutor) return next(notfound.tutor());
  const response: ITutor.FindTutorMetaApiResponse = tutor;
  res.status(200).json(response);
}

async function findOnboardedTutors(req: Request, res: Response) {
  const query = pagination.parse(req.query);
  const now = dayjs.utc();
  const start = now.startOf("day");

  const [isTutorsCached, isRulesCached] = await Promise.all([
    cache.tutors.exists(),
    cache.rules.exists(),
  ]);

  const validCacheState = isTutorsCached && isRulesCached;

  const { tutors, rules } = validCacheState
    ? {
        tutors: await cache.tutors.getAll(),
        rules: await cache.rules.getAll(),
      }
    : await cacheTutors(start);

  const selectRuleEvents = (tutor: ITutor.FullTutor) => {
    const tutorRules = rules.filter((rule) => rule.tutor === tutor.id);
    const events = flatten(tutorRules.map((rule) => rule.events)).filter(
      (event) => {
        const adjustedNow = now.add(tutor.notice, "minutes");
        const start = dayjs.utc(event.start);
        const same = start.isSame(adjustedNow);
        const after = start.isAfter(adjustedNow);
        const between = adjustedNow.isBetween(
          event.start,
          // rule should have some time suitable for booking at least one short lesson.
          dayjs.utc(event.end).subtract(ILesson.Duration.Short, "minutes"),
          "minute",
          "[]"
        );
        return same || after || between;
      }
    );
    return Schedule.order(events, "asc");
  };

  const iteratees = [
    // sort in ascending order by the first availablity
    (tutor: ITutor.FullTutor) => {
      const events = selectRuleEvents(tutor);
      const event = first(events);
      if (!event) return Infinity;
      return dayjs.utc(event.start).unix();
    },
    (tutor: ITutor.FullTutor) => {
      if (!req.user?.gender) return 0; // disable ordering by gender if user gener is unkown.
      if (!tutor.gender) return Infinity;
      const same = req.user.gender === tutor.gender;
      return same ? 0 : 1;
    },
    "online",
    "notice",
  ];
  const orders: Array<"asc" | "desc"> = ["asc", "asc", "desc", "asc"];
  const filtered = tutors.filter((tutor) => isPublicTutor(tutor));
  const ordered = orderBy(filtered, iteratees, orders);
  const page = query.page || 1;
  const size = query.size || 10;
  const offset = (page - 1) * size;
  const total = ordered.length;
  const paginated = drop(ordered, offset).slice(0, size);
  const list = paginated.map((tutor) => ({
    ...tutor,
    rules: selectRuleEvents(tutor),
  }));

  const response: ITutor.FindOnboardedTutorsApiResponse = {
    list,
    total,
  };

  res.status(200).json(response);
}

async function findTutorsForMediaProvider(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const allowed = isAdmin(req.user) || isMedaiProvider(req.user);
  if (!allowed) return next(forbidden());

  const query = pagination.parse(req.query);
  const result: ITutor.FindTutorsForMediaProviderApiResponse =
    await tutors.findForMediaProvider(query);
  res.status(200).json(result);
}

async function findTutorStats(req: Request, res: Response, next: NextFunction) {
  const { tutor: id } = withNamedId("tutor").parse(req.params);

  const tutor = await tutors.findById(id);
  if (!isPublicTutor(tutor)) return next(notfound.tutor());

  // only include "past" "uncanceled" lessons
  const flags = { future: false, canceled: false } as const;

  const [lessonCount, studentCount, totalMinutes] = await Promise.all([
    lessons.countLessons({ users: [id], ...flags }),
    lessons.countTutorStudents({ tutor: id, ...flags }),
    lessons.sumDuration({ users: [id], ...flags }),
  ]);

  const response: ITutor.FindTutorStatsApiResponse = {
    lessonCount,
    studentCount,
    totalMinutes,
  };

  res.status(200).json(response);
}

async function findTutorActivityScores(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { tutor: id } = withNamedId("tutor").parse(req.params);
  const tutor = await tutors.findById(id);
  if (!isPublicTutor(tutor)) return next(notfound.tutor());

  const lessonDays = await lessons.findLessonDays({
    user: id,
    canceled: false,
    future: false,
  });

  const lessonDayMap = groupBy(lessonDays, ({ start }) => asIsoDate(start));
  const activityScoreMap: ITutor.ActivityScoreMap = {};

  for (const [day, lessonDays] of entries(lessonDayMap)) {
    const score = lessonDays.reduce((total, lessonDay) => {
      const score = lessonDay.duration === ILesson.Duration.Long ? 2 : 1;
      return total + score;
    }, 0);

    activityScoreMap[day] = { score, lessonCount: lessonDays.length };
  }

  const response: ITutor.FindTutorActivityScores = activityScoreMap;
  res.status(200).json(response);
}

export default {
  update,
  create: safeRequest(create),
  findById: safeRequest(findById),
  findUsers: safeRequest(findUsers),
  findTutorMeta: safeRequest(findTutorMeta),
  findTutorStats: safeRequest(findTutorStats),
  findCurrentUser: safeRequest(findCurrentUser),
  selectInterviewer: safeRequest(selectInterviewer),
  findOnboardedTutors: safeRequest(findOnboardedTutors),
  findTutorActivityScores: safeRequest(findTutorActivityScores),
  findTutorsForMediaProvider: safeRequest(findTutorsForMediaProvider),
};
