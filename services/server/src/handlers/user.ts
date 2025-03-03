import { tutors, users, knex, lessons } from "@litespace/models";
import { ILesson, ITutor, IUser, Wss } from "@litespace/types";
import {
  apierror,
  bad,
  exists,
  forbidden,
  notfound,
  unexpected,
  wrongPassword,
} from "@/lib/error";
import {
  hashPassword,
  isSamePassword,
  withImageUrl,
  withImageUrls,
} from "@/lib/user";
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
  pageNumber,
  pageSize,
  jsonBoolean,
  orderDirection,
  id,
} from "@/validation/utils";
import { jwtSecret, paginationDefaults } from "@/constants";
import { drop, entries, groupBy, sample } from "lodash";
import zod from "zod";
import { Knex } from "knex";
import dayjs from "@/lib/dayjs";
import {
  asTutorInfoResponseBody,
  cacheTutors,
  isOnboard,
  joinTutorCache,
  orderTutors,
} from "@/lib/tutor";
import { ApiContext } from "@/types/api";
import { safe } from "@litespace/utils/error";
import { asIsoDate } from "@litespace/utils/dayjs";
import {
  encodeAuthJwt,
  isAdmin,
  isStudio,
  isStudent,
  isUser,
} from "@litespace/auth";
import { cache } from "@/lib/cache";
import { sendBackgroundMessage } from "@/workers";
import { WorkerMessageType } from "@/workers/messages";
import { isValidPassword } from "@litespace/utils/validation";
import {
  isSuperAdmin,
  isTutor,
  isTutorManager,
} from "@litespace/auth/dist/authorization";
import { getRequestFile, upload } from "@/lib/assets";
import bytes from "bytes";

const createUserPayload = zod.object({
  role,
  email,
  password,
  callbackUrl: url,
});

const updateUserPayload = zod.object({
  email: zod.optional(email),
  password: zod.optional(
    zod.object({
      current: zod.union([zod.string(), zod.null()]),
      new: zod.string(),
    })
  ),
  name: zod.optional(zod.union([zod.null(), string])),
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
  city: zod.optional(zod.union([zod.nativeEnum(IUser.City), zod.null()])),
  phoneNumber: zod.optional(
    zod.union([zod.string().max(15).trim(), zod.null()])
  ),
});

const orderByOptions = ["created_at", "updated_at"] as const satisfies Array<
  IUser.FindUsersApiQuery["orderBy"]
>;

const findUsersQuery = zod.object({
  role: zod.optional(role),
  verified: zod.optional(jsonBoolean),
  gender: zod.optional(gender),
  online: zod.optional(jsonBoolean),
  city: zod.optional(zod.nativeEnum(IUser.City)),
  page: zod.optional(pageNumber).default(paginationDefaults.page),
  size: zod.optional(pageSize).default(paginationDefaults.size),
  orderBy: zod.optional(zod.enum(orderByOptions)),
  orderDirection: zod.optional(orderDirection),
});

const findOnboardedTutorsQuery = zod.object({
  search: zod.optional(string),
  page: zod.optional(pageNumber).default(paginationDefaults.page),
  size: zod.optional(pageSize).default(paginationDefaults.size),
});

const findUncontactedTutorsQuery = zod.object({
  page: zod.optional(pageNumber).default(paginationDefaults.page),
  size: zod.optional(pageSize).default(paginationDefaults.size),
});

const uploadUserImageQuery = zod.object({
  forUser: zod.optional(id),
});

const uploadTutorAssetsQuery = zod.object({
  tutorId: id,
});

const findStudioTutorParams = zod.object({
  studioId: id,
  tutorId: id,
});

const findStudioTutorsQuery = zod.object({
  studioId: id,
  pagination: zod.optional(pagination),
  search: zod.optional(string),
});

export async function create(req: Request, res: Response, next: NextFunction) {
  const payload = createUserPayload.parse(req.body);
  const admin = isAdmin(req.user);
  const publicRole = [
    IUser.Role.TutorManager,
    IUser.Role.Tutor,
    IUser.Role.Student,
  ].includes(payload.role);
  if (!publicRole && !admin) return next(forbidden());

  const userObject = await users.findByEmail(payload.email);
  if (userObject) return next(exists.user());

  const user = await knex.transaction(async (tx) => {
    const user = await users.create(
      {
        role: payload.role,
        email: payload.email,
        password: hashPassword(payload.password),
      },
      tx
    );

    if (isTutor(user) || isTutorManager(user)) {
      await tutors.create(user.id, tx);
    }

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
        phoneNumber,
        city,
      }: IUser.UpdateApiPayload = updateUserPayload.parse(req.body);

      if (password) {
        const expectedPasswordHash = await users.findUserPasswordHash(
          targetUser.id
        );

        const isValidCurrentPassword =
          (password.current === null && expectedPasswordHash === null) ||
          (password.current &&
            expectedPasswordHash &&
            isSamePassword(password.current, expectedPasswordHash));
        if (!isValidCurrentPassword) return next(wrongPassword());

        const validPassword = isValidPassword(password.new);
        if (validPassword !== true) return next(apierror(validPassword, 400));
      }

      const user = await knex.transaction(async (tx: Knex.Transaction) => {
        const user = await users.update(
          id,
          {
            city,
            name,
            email,
            gender,
            birthYear,
            phoneNumber,
            // Reset user verification status incase his email updated.
            verified: email ? false : undefined,
            password: password ? hashPassword(password.new) : undefined,
          },
          tx
        );

        const tutorData = bio || about || drop?.video || notice;
        if (tutorData && (isTutor(targetUser) || isTutorManager(targetUser)))
          await tutors.update(targetUser.id, { bio, about, notice }, tx);

        return user;
      });

      // todo: remove the tutor from the cache incase tutor is no longer fully onboarded
      res.status(200).json(await withImageUrl(user));
      // todo: handle cache update using a specific worker
      if (!isTutor(user) && !isTutorManager(user)) return;

      const error = await safe(async () => {
        const tutor = await tutors.findById(user.id);
        if (!tutor) return;
        // should only update the cache if it's an onboard (activated) tutor
        if (!isOnboard(tutor)) return;

        const tutorCache = await cache.tutors.getOne(tutor.id);
        const joinedCache = await joinTutorCache(tutor, tutorCache);
        await cache.tutors.setOne(joinedCache);

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
  res.status(200).json(await withImageUrl(user));
}

async function findUsers(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user);
  if (!allowed) return next(forbidden());

  const query: IUser.FindUsersApiQuery = findUsersQuery.parse(req.query);
  const { list, total } = await users.find(query);

  const response: IUser.FindUsersApiResponse = {
    list: await withImageUrls(list),
    total,
  };

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

  const response: IUser.FindCurrentUserApiResponse = {
    user: await withImageUrl(user),
    token: encodeAuthJwt(user.id, jwtSecret),
  };

  res.status(200).json(response);
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

  const tutorManagers = await users.findManyBy("role", IUser.Role.TutorManager);
  // todo: select best interviewer based on his sechudle
  const interviewer = sample(tutorManagers);

  if (!interviewer) return next(notfound.user());

  res.status(200).json(interviewer);
}

async function findTutorMeta(req: Request, res: Response, next: NextFunction) {
  const { tutorId } = withNamedId("tutorId").parse(req.params);
  const tutor = await tutors.findSelfById(tutorId);
  if (!tutor) return next(notfound.tutor());
  const response: ITutor.FindTutorMetaApiResponse = await withImageUrl(tutor);
  res.status(200).json(response);
}

async function findTutorInfo(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { tutorId } = withNamedId("tutorId").parse(req.params);
  const ctutor = await cache.tutors.getOne(tutorId);
  if (ctutor !== null) {
    const response: ITutor.FindTutorInfoApiResponse =
      await asTutorInfoResponseBody(ctutor);
    res.status(200).json(response);
    return;
  }

  const tutor = await tutors.findById(tutorId);
  if (tutor !== null && isOnboard(tutor)) {
    const ctutor = await joinTutorCache(tutor, null);
    await cache.tutors.setOne(ctutor);
    const response: ITutor.FindTutorInfoApiResponse =
      await asTutorInfoResponseBody(ctutor);
    res.status(200).json(response);
    return;
  }

  return next(notfound.tutor());
}

async function findOnboardedTutors(req: Request, res: Response) {
  const query: ITutor.FindOnboardedTutorsParams =
    findOnboardedTutorsQuery.parse(req.query);

  const isTutorsCached = await cache.tutors.exists();

  // retrieve/set tutors and rules from/in cache (redis)
  const tutorsCache = isTutorsCached
    ? await cache.tutors.getAll()
    : // DONE: Update the tutors cache according to the new design in (@/architecture/v1.0/tutors.md)
      await cacheTutors();

  // order tutors based on time of the first event, genger of the user
  // online state, and notice.
  const user = req.user;
  const userGender =
    isUser(user) && user.gender ? (user.gender as IUser.Gender) : undefined;

  const filtered = query.search
    ? tutorsCache.filter((tutor) => {
        if (!query.search) return true;
        const regex = new RegExp(query.search, "gi");
        const nameMatch = tutor.name && regex.test(tutor.name);
        const topicMatch = tutor.topics.find((topic) => regex.test(topic));
        return nameMatch || topicMatch;
      })
    : tutorsCache;

  const ordered = orderTutors({
    tutors: filtered,
    userGender,
  });

  // paginate the ordered (tutors) list
  const page = query.page || 1;
  const size = query.size || 10;
  const offset = (page - 1) * size;
  const total = ordered.length;
  const paginated = drop(ordered, offset).slice(0, size);

  // restructure the 'paginated' list to match the
  // ITutor.FindOnboardedTutorsApiResponse list attribute
  const list = paginated.map((tutor) => ({
    ...tutor,
    slots: [], // TODO: retrieve AvailabilitySlots from the db
  }));

  // DONE: Update the response to match the new design in (@/architecture/v1.0/tutors.md)
  const response: ITutor.FindOnboardedTutorsApiResponse = {
    list: await withImageUrls(list),
    total,
  };

  res.status(200).json(response);
}

async function findStudioTutor(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isSuperAdmin(user) || isAdmin(user) || isStudio(user);
  if (!allowed) return next(forbidden());

  const { studioId, tutorId }: ITutor.FindStudioTutorPayload =
    findStudioTutorParams.parse(req.params);

  if (isStudio(req.user) && req.user.id !== studioId) return next(forbidden());

  const tutor = await tutors.findStudioTutor(tutorId);
  if (!tutor) return next(notfound.tutor());

  const response: ITutor.FindStudioTutorApiResponse = await withImageUrl(tutor);

  res.status(200).json(response);
}

async function findStudioTutors(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const allowed =
    isSuperAdmin(req.user) || isAdmin(req.user) || isStudio(req.user);
  if (!allowed) return next(forbidden());

  const { studioId, pagination, search }: ITutor.FindStudioTutorsQuery =
    findStudioTutorsQuery.parse(req.query);

  if (isStudio(req.user) && req.user.id !== studioId) return next(forbidden());

  const { list, total }: ITutor.FindStudioTutorsApiResponse =
    await tutors.findStudioTutors({ studioId, search, ...pagination });

  const response: ITutor.FindStudioTutorsApiResponse = {
    list: await withImageUrls(list),
    total,
  };

  res.status(200).json(response);
}

async function findTutorStats(req: Request, res: Response, next: NextFunction) {
  const { tutor: id } = withNamedId("tutor").parse(req.params);

  const tutor = await tutors.findById(id);
  if (!tutor || !isOnboard(tutor)) return next(notfound.tutor());

  // only include "past" and "fulfilled" lessons
  const filters = {
    future: false,
    canceled: false,
    past: true,
    fulfilled: true,
  } as const;

  const [lessonCount, studentCount, totalMinutes] = await Promise.all([
    lessons.countLessons({ users: [id], ...filters }),
    lessons.countCounterpartMembers({ user: id, ...filters }),
    lessons.sumDuration({ users: [id], ...filters }),
  ]);

  const response: ITutor.FindTutorStatsApiResponse = {
    lessonCount,
    studentCount,
    totalMinutes,
  };

  res.status(200).json(response);
}

async function findPersonalizedTutorStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isUser(user) && (isTutor(user) || isTutorManager(user));
  if (!allowed) return next(forbidden());

  const id = user.id;
  const tutor = await tutors.findById(id);
  if (!tutor || !isOnboard(tutor)) return next(notfound.tutor());

  const now = dayjs.utc().toISOString();
  const [
    studentCount,
    totalLessonCount,
    completedLessonCount,
    totalTutoringTime,
  ] = await Promise.all([
    lessons.countCounterpartMembers({
      user: id,
      ratified: true,
      canceled: false,
    }),
    lessons.countLessons({
      users: [id],
      ratified: true,
      canceled: false,
    }),
    lessons.countLessons({
      users: [id],
      ratified: true,
      canceled: false,
      before: now,
    }),
    lessons.sumDuration({
      users: [id],
      ratified: true,
      canceled: false,
      before: now,
    }),
  ]);

  const response: ITutor.FindPersonalizedTutorStatsApiResponse = {
    studentCount,
    completedLessonCount,
    totalLessonCount,
    totalTutoringTime,
  };

  res.status(200).json(response);
}

async function findStudentStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const { student } = withNamedId("student").parse(req.params);
  const owner = isStudent(user) && user.id === student;
  const allowed = owner || isAdmin(user);
  if (!allowed) return next(forbidden());

  const studentData = await users.findById(student);
  if (!studentData) return next(notfound.student());

  // todo: cache student stats

  const totalLessonCount = await lessons.countLessons({
    users: [student],
    ratified: true,
    canceled: true,
    future: true,
    past: true,
  });

  const futureLessonCount = await lessons.countLessons({
    users: [student],
    ratified: true,
    canceled: true,
    future: true,
    past: false,
  });

  const futureFulfilledLessons = await lessons.countLessons({
    users: [student],
    ratified: true,
    canceled: false,
    future: true,
    past: false,
  });

  const futureCanceledLessons = await lessons.countLessons({
    users: [student],
    ratified: false,
    canceled: true,
    future: true,
    past: false,
  });

  const pastLessonCount = await lessons.countLessons({
    users: [student],
    ratified: true,
    canceled: true,
    future: false,
    past: true,
  });

  const pastFulfilledLessons = await lessons.countLessons({
    users: [student],
    ratified: true,
    canceled: false,
    future: false,
    past: true,
  });

  const pastCanceledLessons = await lessons.countLessons({
    users: [student],
    ratified: false,
    canceled: true,
    future: false,
    past: true,
  });

  const ratifiedLessonCount = await lessons.countLessons({
    users: [student],
    ratified: true,
    canceled: false,
    future: true,
    past: true,
  });

  const canceledLessonCount = await lessons.countLessons({
    users: [student],
    ratified: false,
    canceled: true,
    future: true,
    past: true,
  });

  const totalTutorCount = await lessons.countCounterpartMembers({
    user: student,
    ratified: true,
    canceled: true,
    future: true,
    past: true,
  });

  const canceledTutorCount = await lessons.countCounterpartMembers({
    user: student,
    ratified: false,
    canceled: true,
    future: true,
    past: true,
  });

  const fulfilledTutorCount = totalTutorCount - canceledTutorCount;

  const totalMinutes = await lessons.sumDuration({
    users: [student],
    ratified: true,
    canceled: true,
    future: true,
    past: true,
  });

  const canceledMinutes = await lessons.sumDuration({
    users: [student],
    ratified: false,
    canceled: true,
    future: true,
    past: true,
  });

  const fulfilledMinutes = totalMinutes - canceledMinutes;

  const response: IUser.FindStudentStatsApiResponse = {
    lessonCount: {
      total: totalLessonCount,
      ratified: ratifiedLessonCount,
      canceled: canceledLessonCount,
      future: {
        total: futureLessonCount,
        ratified: futureFulfilledLessons,
        canceled: futureCanceledLessons,
      },
      past: {
        total: pastLessonCount,
        ratified: pastFulfilledLessons,
        canceled: pastCanceledLessons,
      },
    },
    tutorCount: {
      total: totalTutorCount,
      canceled: canceledTutorCount,
      ratified: fulfilledTutorCount,
    },
    minutes: {
      total: totalMinutes,
      ratified: fulfilledMinutes,
      canceled: canceledMinutes,
    },
  };

  res.status(200).json(response);
}

async function findPersonalizedStudentStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isStudent(user);
  if (!allowed) return next(forbidden());

  const id = user.id;
  const studentData = await users.findById(id);
  if (!studentData) return next(notfound.student());

  const now = dayjs.utc().toISOString();

  const [
    tutorCount,
    completedLessonCount,
    upcomingLessonCount,
    totalLearningTime,
  ] = await Promise.all([
    await lessons.countCounterpartMembers({
      user: id,
      ratified: true,
      canceled: false,
    }),
    await lessons.countLessons({
      users: [id],
      ratified: true,
      canceled: false,
      before: now,
    }),
    await lessons.countLessons({
      users: [id],
      ratified: true,
      canceled: false,
      after: now,
    }),
    await lessons.sumDuration({
      users: [id],
      ratified: true,
      canceled: false,
      before: now,
    }),
  ]);

  const response: IUser.FindPersonalizedStudentStatsApiResponse = {
    tutorCount,
    completedLessonCount,
    totalLearningTime,
    upcomingLessonCount,
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
  if (!tutor || !isOnboard(tutor)) return next(notfound.tutor());

  const lessonDays = await lessons.findLessonDays({
    users: [id],
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

/**
 * handles requests from students and responds with data of tutors
 * who the student (requester) didn't open a chat room with.
 */
async function findUncontactedTutors(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isStudent(user);
  if (!allowed) return next(forbidden());

  const pagination = findUncontactedTutorsQuery.parse(req.query);
  const { list, total }: ITutor.FindUncontactedTutors =
    await tutors.findUncontactedTutorsForStudent({
      student: user.id,
      pagination,
    });

  const onlineStatuses = await cache.onlineStatus.isOnlineBatch(
    list.map((t) => t.id)
  );

  const tutorsList: ITutor.FindFullUncontactedTutorsApiResponse = {
    list: await withImageUrls(
      list.map((tutor) => ({
        ...tutor,
        online: onlineStatuses.get(tutor.id) || false,
      }))
    ),
    total,
  };

  res.status(200).json(tutorsList);
}

/**
 * @description This route can be used by admins, studios and students to update
 * their photos. It can be used by tutors or tutor managers.
 */
async function uploadUserImage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  if (
    !isStudent(user) &&
    !isAdmin(user) &&
    !isSuperAdmin(user) &&
    !isStudio(user)
  )
    return next(forbidden());

  const { forUser } = uploadUserImageQuery.parse(req.query);

  // Only admins can update other users images
  if (forUser && !isAdmin(user)) return next(forbidden());

  // Image file is required.
  const image = getRequestFile(req.files, IUser.AssetFileName.Image);
  if (!image) return next(bad());

  // If an admin provided a user id, it will be used instead of his id. This
  // indicate that he wants to update the image of another user and not
  // himself.
  const target = forUser || user.id;
  const userData = forUser ? await users.findById(forUser) : user;
  if (!userData) return next(notfound.user());

  const limit = bytes("8mb");
  if (!limit) return next(unexpected());
  // todo: return proper error code (LargeImageFile)
  if (image.size > limit) return next(bad());

  const imageId = await upload({
    data: image.buffer,
    type: image.mimetype,
    // Use the existing image name as the key. The new image will override
    // the previous onc. There is no need to remove the previous image. Also
    // there is not need to update the user row in the database in this case.
    key: userData.image,
  });

  // Only update user image incase he didn't had one before.
  if (!userData.image) await users.update(target, { image: imageId });

  res.sendStatus(200);
}

/**
 * @description this route can be used by studios to upload tutor related assets
 * (image, video, thumbnail)
 */
async function uploadTutorAssets(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  if (!isStudio(user) && !isAdmin(user) && !isSuperAdmin(user))
    return next(forbidden());

  const { tutorId } = uploadTutorAssetsQuery.parse(req.query);

  const tutor = await tutors.findTutorAssets(tutorId);
  if (!tutor) return next(notfound.tutor());

  // Tutor assets cannot be updated before selecting a studio.
  if (!tutor.studioId) return next(bad());
  // Studio can only update its tutors (tutors who selected it).
  if (isStudio(user) && tutor.studioId !== user.id) return next(forbidden());

  const image = getRequestFile(req.files, IUser.AssetFileName.Image);
  const video = getRequestFile(req.files, IUser.AssetFileName.Video);
  const thumbnail = getRequestFile(req.files, IUser.AssetFileName.Thumbnail);
  if (!image && !video && !thumbnail) return next(bad());

  const imageId = image
    ? await upload({
        data: image.buffer,
        type: image.mimetype,
        // Use the existing image name as the key. The new image will override
        // the previous onc. There is no need to remove the previous image. Also
        // there is not need to update the user row in the database in this case.
        key: tutor.image,
      })
    : undefined;

  const videoId = video
    ? await upload({
        data: video.buffer,
        type: video.mimetype,
        key: tutor.video,
      })
    : undefined;

  const thumbnailId = thumbnail
    ? await upload({
        data: thumbnail.buffer,
        type: thumbnail.mimetype,
        key: tutor.thumbnail,
      })
    : undefined;

  if (!tutor.image || !tutor.video || !tutor.thumbnail)
    await knex.transaction(async (tx) => {
      if (!tutor.image) await users.update(tutorId, { image: imageId }, tx);

      if (tutor.video || !tutor.thumbnail)
        await tutors.update(
          tutorId,
          {
            video: videoId,
            thumbnail: thumbnailId,
          },
          tx
        );
    });

  // TODO: update tutor cache

  res.sendStatus(200);
}

export default {
  update,
  create: safeRequest(create),
  findById: safeRequest(findById),
  findUsers: safeRequest(findUsers),
  findTutorMeta: safeRequest(findTutorMeta),
  findTutorInfo: safeRequest(findTutorInfo),
  findTutorStats: safeRequest(findTutorStats),
  findPersonalizedTutorStats: safeRequest(findPersonalizedTutorStats),
  findCurrentUser: safeRequest(findCurrentUser),
  selectInterviewer: safeRequest(selectInterviewer),
  findOnboardedTutors: safeRequest(findOnboardedTutors),
  findTutorActivityScores: safeRequest(findTutorActivityScores),
  findStudioTutor: safeRequest(findStudioTutor),
  findStudioTutors: safeRequest(findStudioTutors),
  findUncontactedTutors: safeRequest(findUncontactedTutors),
  findStudentStats: safeRequest(findStudentStats),
  findPersonalizedStudentStats: safeRequest(findPersonalizedStudentStats),
  uploadUserImage: safeRequest(uploadUserImage),
  uploadTutorAssets: safeRequest(uploadTutorAssets),
};
