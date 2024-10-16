import { tutors, users, knex, lessons } from "@litespace/models";
import { ILesson, ITutor, IUser, Wss } from "@litespace/types";
import { isAdmin } from "@/lib/common";
import { badRequest, forbidden, notfound, userExists } from "@/lib/error";
import { hashPassword } from "@/lib/user";
import { schema } from "@/validation";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import { sendUserVerificationEmail } from "@/lib/email";
import {
  email,
  gender,
  identityObject,
  password,
  id,
  pagination,
  string,
  withNamedId,
} from "@/validation/utils";
import { uploadSingle } from "@/lib/media";
import { FileType } from "@/constants";
import { enforceRequest } from "@/middleware/accessControl";
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
import { authorizer } from "@litespace/auth";
import { generateJwtToken } from "@/lib/auth";
import { cache } from "@/lib/cache";

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

const findTutorMetaParams = zod.object({ tutorId: id });

export async function create(req: Request, res: Response, next: NextFunction) {
  const { email, password, role } = schema.http.user.create.parse(req.body);

  const creatorRole = req.user?.role;
  const admin = isAdmin(creatorRole);
  const publicRole = [IUser.Role.Tutor, IUser.Role.Student].includes(role);
  if (!publicRole && !admin) return next(forbidden());

  const exists = await users.findByEmail(email);
  if (exists) return next(userExists());

  const user = await knex.transaction(async (tx) => {
    const user = await users.create(
      { role, email, password: hashPassword(password) },
      tx
    );

    if (role === IUser.Role.Tutor) await tutors.create(user.id, tx);
    return user;
  });

  const origin = req.get("origin");
  if (!origin) return next(badRequest());

  await sendUserVerificationEmail({
    userId: user.id,
    email: user.email,
    origin,
  });

  const response: IUser.RegisterApiResponse = {
    user,
    token: generateJwtToken(user.id),
  };
  res.status(200).json(response);
}

function update(context: ApiContext) {
  return safeRequest(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = identityObject.parse(req.params);

      const allowed = authorizer()
        .admin()
        .superAdmin()
        .authenticated()
        .check(req.user);
      if (!allowed) return next(forbidden());

      const currentUser = req.user;
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
  const id = schema.http.user.findById.params.parse(req.params).id;
  const user = await users.findById(id);
  if (!user) return next(notfound.user());

  const owner = user.id === req.user.id;
  const admin = isAdmin(req.user.role);
  const interviewer = req.user.role === IUser.Role.Interviewer;
  const eligible = owner || admin || interviewer;
  if (!eligible) return next(forbidden());
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

async function findMe(req: Request, res: Response, next: NextFunction) {
  const allowed = enforceRequest(req);
  if (!allowed) return next(forbidden());
  res.status(200).json(req.user);
}

async function returnUser(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return next(notfound.user());
  res.status(200).json(req.user);
}

async function selectInterviewer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // const allowed = enforceRequest(req);
  // console.log({ allowed });
  // if (!allowed) return next(forbidden());

  const interviewers = await users.findManyBy("role", IUser.Role.Interviewer);
  const interviewer = sample(interviewers);
  if (!interviewer) return next(notfound.user());

  res.status(200).json(interviewer);
}

async function findTutorMeta(req: Request, res: Response, next: NextFunction) {
  const allowed = enforceRequest(req);
  if (!allowed) return next(forbidden());

  const { tutorId } = findTutorMetaParams.parse(req.params);
  const meta = await tutors.findSelfById(tutorId);
  if (!meta) return next(notfound.tutor());
  res.status(200).json(meta);
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
  const allowed = authorizer().admin().mediaProvider().check(req.user);
  if (!allowed) return next(forbidden());

  const query = pagination.parse(req.query);
  const list: ITutor.FindTutorsForMediaProviderApiResponse =
    await tutors.findForMediaProvider(query);
  res.status(200).json(list);
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
  findMe: safeRequest(findMe),
  findById: safeRequest(findById),
  findUsers: safeRequest(findUsers),
  returnUser: safeRequest(returnUser),
  findTutorMeta: safeRequest(findTutorMeta),
  findTutorStats: safeRequest(findTutorStats),
  selectInterviewer: safeRequest(selectInterviewer),
  findOnboardedTutors: safeRequest(findOnboardedTutors),
  findTutorActivityScores: safeRequest(findTutorActivityScores),
  findTutorsForMediaProvider: safeRequest(findTutorsForMediaProvider),
};
