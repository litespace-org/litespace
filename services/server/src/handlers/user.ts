import {
  tutors,
  users,
  knex,
  lessons,
  confirmationCodes,
} from "@litespace/models";
import { IConfirmationCode, ILesson, ITutor, IUser } from "@litespace/types";
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
  pageNumber,
  pageSize,
  id,
  numericFilter,
  dateFilter,
  queryBoolean,
} from "@/validation/utils";
import { jwtSecret, paginationDefaults } from "@/constants";
import { drop, entries, groupBy, sample } from "lodash";
import zod from "zod";
import { Knex } from "knex";
import dayjs from "@/lib/dayjs";
import {
  asTutorInfoResponseBody,
  cacheTutors,
  joinTutorCache,
  orderTutors,
} from "@/lib/tutor";
import { ApiContext } from "@/types/api";
import { asIsoDate } from "@litespace/utils/dayjs";
import {
  isAdmin,
  isStudio,
  isStudent,
  isUser,
  isRegularUser,
  isSuperAdmin,
  isTutor,
  isTutorManager,
} from "@litespace/utils/user";
import { encodeAuthJwt } from "@litespace/auth";
import { cache } from "@/lib/cache";
import { sendBackgroundMessage } from "@/workers";
import { isValidPassword } from "@litespace/utils/validation";
import { getRequestFile, upload } from "@/lib/assets";
import bytes from "bytes";
import s3 from "@/lib/s3";
import { isOnboard } from "@litespace/utils/tutor";
import {
  CONFIRMATION_CODE_VALIDITY_MINUTES,
  isEmptyObject,
} from "@litespace/utils";
import { generateConfirmationCode } from "@/lib/confirmationCodes";

const createUserPayload = zod.object({
  role,
  password,
  email,
});

const updateUserPayload = zod.object({
  email: email.optional(),
  password: zod
    .object({
      current: zod.union([zod.string(), zod.null()]),
      new: zod.string(),
    })
    .optional(),
  name: zod.union([zod.null(), string]).optional(),
  gender: gender.nullable().optional(),
  birthYear: zod.number().positive().optional(),
  image: zod.null().optional(),
  thumbnail: zod.null().optional(),
  video: zod.null().optional(),
  bio: zod.union([zod.null(), string]).optional(),
  about: zod.union([zod.null(), string]).optional(),
  city: zod.union([zod.nativeEnum(IUser.City), zod.null()]).optional(),
  notificationMethod: zod
    .nativeEnum(IUser.NotificationMethod)
    .nullable()
    .optional(),
  phone: zod.union([zod.string().max(15).trim(), zod.null()]).optional(),
  activated: zod.boolean().optional(),
  notice: zod.number().positive().int().optional(),
  studioId: id.optional(),
});

const findUsersQuery = zod.object({
  role: role.optional(),
  verified: queryBoolean.optional(),
  gender: gender.optional(),
  online: queryBoolean.optional(),
  city: zod.nativeEnum(IUser.City),
  page: pageNumber.optional(),
  size: pageSize.optional(),
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

const findStudiosQuery = zod.object({
  page: zod.optional(pageNumber).default(paginationDefaults.page),
  size: zod.optional(pageSize).default(paginationDefaults.size),
});

const findStudioTutorParams = zod.object({
  tutorId: id,
});

const findStudioTutorsQuery = zod.object({
  studioId: zod.optional(id),
  pagination: zod.optional(pagination),
  search: zod.optional(string),
});

const findFullTutorsQuery = zod.object({
  bio: zod
    .union([zod.string(), zod.null()])
    .describe("search by tutor bio")
    .optional(),
  about: zod
    .union([zod.string(), zod.null()])
    .optional()
    .describe("search by tutor about"),
  name: zod
    .union([zod.string(), zod.null()])
    .optional()
    .describe("search by tutor name"),
  phone: zod
    .union([zod.string(), zod.null()])
    .optional()
    .describe("search by tutor phone number"),
  email: zod.string().optional().describe("search by tutor email"),
  video: queryBoolean
    .optional()
    .describe("filter by tutor having video or not"),
  thumbnail: queryBoolean
    .optional()
    .describe("filter by tutor having thumbnail or not"),
  image: queryBoolean
    .optional()
    .describe("filter by tutor having image or not"),
  activated: queryBoolean
    .optional()
    .describe("filter by tutor either activated or not"),
  verifiedEmail: queryBoolean
    .optional()
    .describe("filter by tutor either verified their email or not"),
  verifiedPhone: queryBoolean
    .optional()
    .describe("filter by tutor either verified their phone or not"),
  verifiedWhatsapp: queryBoolean
    .optional()
    .describe("filter by tutor either verified their whatsapp or not"),
  verifiedTelegram: queryBoolean
    .optional()
    .describe("filter by tutor either verified their telegram or not"),
  password: queryBoolean
    .optional()
    .describe("filter by tutor either having password or not"),
  notice: numericFilter.optional().describe("filter by tutors notice period"),
  birthYear: numericFilter.describe("filter by tutor birth year").optional(),
  notificationMethod: zod
    .nativeEnum(IUser.NotificationMethod)
    .array()
    .optional()
    .describe("filter by a list of available notification methods"),
  city: zod
    .nativeEnum(IUser.City)
    .array()
    .optional()
    .describe("filter by a list of available cities"),
  gender: zod
    .nativeEnum(IUser.Gender)
    .array()
    .optional()
    .describe("filter by a list of available cities"),
  createdAt: dateFilter.optional().describe("filter by tutors created at date"),
  page: zod.optional(pageNumber).default(paginationDefaults.page),
  size: zod.optional(pageSize).default(paginationDefaults.size),
});

export async function create(req: Request, res: Response, next: NextFunction) {
  const payload: IUser.CreateApiPayload = createUserPayload.parse(req.body);
  const creator = req.user;
  const admin = isAdmin(creator);
  // both students and tutors can create/register account on the application,
  // hover, currently only students can register. (that's temporary)
  // TODO: check if its a regular user rather than just a student, once the tutor
  // on-boarding is finalized.
  if (payload.role !== IUser.Role.Student && !admin) return next(forbidden());

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

    const tutor = isTutor(user);
    const admin = isAdmin(creator);
    if (tutor) await tutors.create(user.id, tx);
    if (tutor && admin) await tutors.update(user.id, { activated: true }, tx);
    return user;
  });

  const { code } = await confirmationCodes.create({
    userId: user.id,
    purpose: IConfirmationCode.Purpose.VerifyEmail,
    code: generateConfirmationCode(),
    expiresAt: dayjs
      .utc()
      .add(CONFIRMATION_CODE_VALIDITY_MINUTES, "minutes")
      .toISOString(),
  });

  sendBackgroundMessage({
    type: "send-user-verification-code-email",
    payload: { code, email: user.email },
  });

  const token = encodeAuthJwt(user.id, jwtSecret);
  const response: IUser.RegisterApiResponse = { user, token };
  res.status(200).json(response);
}

function update(_: ApiContext) {
  return safeRequest(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = identityObject.parse(req.params);

      const user = req.user;
      const allowed = isUser(user);
      if (!allowed) return next(forbidden());

      const target = await users.findById(id);
      if (!target) return next(notfound.user());

      const tutor = await tutors.findById(target.id);

      const {
        email,
        name,
        password,
        gender,
        birthYear,
        image,
        thumbnail,
        video,
        bio,
        about,
        notice,
        studioId,
        phone,
        city,
        notificationMethod,
        activated,
      }: IUser.UpdateApiPayload = updateUserPayload.parse(req.body);

      // return forbidden if the current user is neither admin nor studio and
      // tring to update the data for another user.
      if (user.id !== target.id && isRegularUser(user))
        return next(forbidden());

      // return forbidden if the studio is trying to drop user image
      if (isStudio(user) && image === null) return next(forbidden());

      // return forbidden if the studio is trying to drop media for an unassociated user
      if (isStudio(user) && tutor?.studioId !== user.id)
        return next(forbidden());

      // non-admins cannot update tutor `activet` status.
      if (!isAdmin(user) && activated !== undefined) return next(forbidden());

      if (password) {
        const expectedPasswordHash = await users.findUserPasswordHash(
          target.id
        );

        const noPassword =
          password.current === null && expectedPasswordHash === null;

        const matchPassword =
          password.current &&
          expectedPasswordHash &&
          isSamePassword(password.current, expectedPasswordHash);

        const isValidCurrentPassword = noPassword || matchPassword;
        if (!isValidCurrentPassword) return next(wrongPassword());

        const validPassword = isValidPassword(password.new);
        if (validPassword !== true) return next(apierror(validPassword, 400));
      }

      // remove assets from the object store
      if (image === null && target.image) s3.drop(target.image);
      if (tutor && video === null && tutor.video) await s3.drop(tutor.video);
      if (tutor && thumbnail === null && tutor.thumbnail)
        await s3.drop(tutor.thumbnail);

      // remove assets ids from the database / update user data
      const updated = await knex.transaction(async (tx: Knex.Transaction) => {
        const newEmail = email && email !== target.email;
        const newPhone = phone && phone !== target.phone;

        const updateUserPayload: IUser.UpdatePayloadModel = {
          city,
          name,
          gender,
          birthYear,
          phone,
          image,
          email,
          // reset user verification status incase his email or phone got updated.
          verifiedEmail: newEmail ? false : undefined,
          verifiedPhone: newPhone ? false : undefined,
          verifiedTelegram: newPhone ? false : undefined,
          verifiedWhatsApp: newPhone ? false : undefined,
          password: password ? hashPassword(password.new) : undefined,
          // reset notification method incase the user phone got updated
          notificationMethod: newPhone ? null : notificationMethod,
        };

        const updated = await users.update(id, updateUserPayload, tx);

        const updateTutorPayload: ITutor.UpdatePayload = {
          bio,
          about,
          notice,
          studioId,
          video,
          thumbnail,
          activated,
        };

        if (!isEmptyObject(updateTutorPayload))
          await tutors.update(target.id, updateTutorPayload, tx);

        return updated;
      });

      if (tutor)
        sendBackgroundMessage({
          type: "update-tutor-cache",
          payload: { tutorId: tutor.id },
        });

      const response: IUser.UpdateUserApiResponse = await withImageUrl(updated);

      res.status(200).json(response);
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

  const response: IUser.FindCurrentUserApiResponse = await withImageUrl(user);

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
  const user = req.user;
  const { tutorId } = withNamedId("tutorId").parse(req.params);
  const cached = await cache.tutors.getOne(tutorId);

  if (cached !== null) {
    const response: ITutor.FindTutorInfoApiResponse =
      await asTutorInfoResponseBody(cached);
    res.status(200).json(response);
    return;
  }

  const tutor = await tutors.findById(tutorId);
  if (!tutor) return next(notfound.tutor());

  const onboarded = isOnboard(tutor);
  const owner = (isTutor(user) || isTutorManager(user)) && user.id === tutorId;
  const allowed = onboarded || owner;
  if (!allowed) return next(notfound.tutor());

  const cacheable = await joinTutorCache(tutor, null);
  if (onboarded) await cache.tutors.setOne(cacheable);

  const response: ITutor.FindTutorInfoApiResponse =
    await asTutorInfoResponseBody(cacheable);
  res.status(200).json(response);
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

  // order tutors based on time of the first event, gender of the user
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

async function findStudios(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isTutor(user) || isAdmin(user);
  if (!allowed) return next(forbidden());

  const { size, page } = findStudiosQuery.parse(req.query);

  const { list, total } = await users.find({
    role: IUser.Role.Studio,
    page,
    size,
  });

  const response: IUser.FindStudiosApiResponse = {
    list: await withImageUrls(
      list.map(
        (studio): IUser.PublicStudioDetails => ({
          id: studio.id,
          name: studio.name,
          address: studio.address,
          image: studio.image,
        })
      )
    ),
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

  const { tutorId }: ITutor.FindStudioTutorParams = findStudioTutorParams.parse(
    req.params
  );

  const tutor = await tutors.findStudioTutor(tutorId);
  if (!tutor) return next(notfound.tutor());

  if (isStudio(user) && tutor.studioId !== user.id) return next(forbidden());

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
  if (!tutor) return next(notfound.tutor());

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

// TODO: filter based on if he is onboarded or not
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
        // the previous one. There is no need to remove the previous image. Also
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

  if (!tutor.image || !tutor.video || !tutor.thumbnail) {
    await knex.transaction(async (tx) => {
      if (!tutor.image) await users.update(tutorId, { image: imageId }, tx);

      if (!tutor.video || !tutor.thumbnail)
        await tutors.update(
          tutorId,
          {
            video: videoId,
            thumbnail: thumbnailId,
          },
          tx
        );
    });

    sendBackgroundMessage({
      type: "update-tutor-cache",
      payload: { tutorId: tutor.tutorId },
    });
  }

  res.sendStatus(200);
}

async function findFullTutors(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user);
  if (!allowed) return next(forbidden());

  const query: ITutor.FindFullTutorsApiQuery = findFullTutorsQuery.parse(
    req.query
  );

  const { list, total } = await tutors.find(query);

  const response: ITutor.FindFullTutorsApiResponse = {
    list: await withImageUrls(list),
    total,
  };

  res.status(200).json(response);
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
  findStudios: safeRequest(findStudios),
  findStudioTutor: safeRequest(findStudioTutor),
  findStudioTutors: safeRequest(findStudioTutors),
  findUncontactedTutors: safeRequest(findUncontactedTutors),
  findStudentStats: safeRequest(findStudentStats),
  findPersonalizedStudentStats: safeRequest(findPersonalizedStudentStats),
  findFullTutors: safeRequest(findFullTutors),
  uploadUserImage: safeRequest(uploadUserImage),
  uploadTutorAssets: safeRequest(uploadTutorAssets),
};
