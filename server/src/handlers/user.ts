import { tutors, users } from "@/models";
import { ITutor, IUser } from "@litespace/types";
import { isAdmin } from "@/lib/common";
import { badRequest, forbidden, notfound, userExists } from "@/lib/error";
import { hashPassword } from "@/lib/user";
import { schema } from "@/validation";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { sendUserVerificationEmail } from "@/lib/email";
import {
  email,
  gender,
  identityObject,
  password,
  name,
  id,
} from "@/validation/utils";
import { uploadSingle } from "@/lib/media";
import { FileType } from "@/constants";
import { enforceRequest } from "@/middleware/accessControl";
import { httpQueryFilter } from "@/validation/http";
import { count, knex } from "@/models/query";
import { concat, drop, first, orderBy, reduce, sample } from "lodash";
import zod from "zod";
import { Knex } from "knex";
import dayjs from "@/lib/dayjs";
import { availableTutorsCache } from "@/redis/tutor";
import { cacheAvailableTutors } from "@/lib/tutor";
import { ApiContext } from "@/types/api";

const updateUserPayload = zod.object({
  email: zod.optional(email),
  password: zod.optional(password),
  name: zod.optional(
    zod.object({ ar: zod.optional(name), en: zod.optional(name) })
  ),
  gender: zod.optional(gender),
  birthYear: zod.optional(zod.number().positive()),
  drop: zod.optional(
    zod.object({
      photo: zod.optional(zod.boolean()),
      video: zod.optional(zod.boolean()),
    })
  ),
  bio: zod.optional(zod.string().trim()),
  about: zod.optional(zod.string().trim()),
});

const findTutorMetaParams = zod.object({ tutorId: id });

const findAvailableTutorsQuery = zod.object({
  page: zod.optional(zod.coerce.number().min(1)),
  size: zod.optional(zod.coerce.number().max(50)),
});

export async function create(req: Request, res: Response, next: NextFunction) {
  const allowed = enforceRequest(req);
  if (!allowed) return next(forbidden());

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

  next(); // Next handler should be the "Local Auth" from passport.
}

function update(context: ApiContext) {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = identityObject.parse(req.params);

      const allowed = enforceRequest(req, id === req.user?.id);
      if (!allowed) return next(forbidden());

      const currentUser = req.user;
      const targetUser = await users.findById(id);
      if (!targetUser) return next(forbidden());

      const { email, name, password, gender, birthYear, drop, bio, about } =
        updateUserPayload.parse(req.body);

      const files = {
        image: {
          file: req.files?.[IUser.UpdateMediaFilesApiKeys.Photo],
          type: FileType.Image,
        },
        video: {
          file: req.files?.[IUser.UpdateMediaFilesApiKeys.Video],
          type: FileType.Video,
        },
      };

      // Only media provider can update tutor media files (images and videos)
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

      // Only media providers can upload videos.
      // e.g., students/interviewers cannot try to upload videos
      if (files.video.file && !isEligibleUser) return next(forbidden());

      const [photo, video] = await Promise.all(
        [
          { file: req.files?.photo, type: FileType.Image },
          { file: req.files?.video, type: FileType.Video },
        ].map(({ file, type }) => (file ? uploadSingle(file, type) : undefined))
      );

      const user = await knex.transaction(async (tx: Knex.Transaction) => {
        const user = await users.update(
          id,
          {
            name,
            email,
            gender,
            birthYear,
            photo: drop?.photo === true ? null : photo,
            password: password ? hashPassword(password) : undefined,
          },
          tx
        );

        if (bio || about || video || drop?.video)
          await tutors.update(
            targetUser.id,
            { bio, about, video: drop?.video ? null : video },
            tx
          );

        return user;
      });

      const end = () => {
        res.status(200).json(user);
      };

      // handle available tutors cache
      const isTutor = user.role === IUser.Role.Tutor;
      if (!isTutor) return end();

      const start = dayjs.utc().startOf("day");
      const exists = await availableTutorsCache.exists();
      const dates = await availableTutorsCache.getDates();
      if (
        !exists ||
        !dates.start ||
        !dates.end ||
        !start.isBetween(dates.start, dates.end, "day", "[]")
      ) {
        await cacheAvailableTutors(dayjs.utc().startOf("day"));
        context.io.sockets.emit("update");
        return end();
      }

      // todo: handle deactivated tutors
      const tutor = await tutors.findById(targetUser.id);
      if (!tutor) return next(notfound.tutor());
      if (!tutor.activated) return end();

      const list = await availableTutorsCache.getTutors();
      const filtered = list ? list.filter((t) => t.id !== tutor.id) : [];
      const updated = concat(filtered, tutor);
      await availableTutorsCache.setTutors(updated);
      // ideally, we will emit the event to a sepecial room
      context.io.sockets.emit("update");
      return end();
    }
  );
}

async function delete_(req: Request, res: Response) {
  const { id } = schema.http.user.delete.query.parse(req.query);
  await users.delete(id);
  res.status(200).send();
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
  const allowed = enforceRequest(req);
  if (!allowed) return next(forbidden());

  const filter = httpQueryFilter<keyof IUser.Row>(
    users.columns.filterable,
    req.query
  );

  const [list, total] = await Promise.all([
    users.find(filter),
    count(users.table),
  ]);

  res.status(200).json({ list, total });
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

/**
 * Tutors selection algorithm:
 * 1. Online tutors comes first.
 * 2. Same gener comes first.
 * 3. High rated tutor comes first (not implemented)
 * 4. Available tutors comes first.
 *
 *
 * List should be cached and shared between all of our students.
 *
 * Globally accessable list of tutors and their schedules will be cached in
 * Redis instance.
 *
 * Cache will be updated based on events emitted:
 * 1. Information update (e.g., status: online vs offline) will only update
 *    status of the cached list.
 * 2. Updating/Creating schedule will update
 * 3. Scheduling a new lesson with a given tutor should trigger and update to
 *    the cache.
 *
 * # Why use Cache?
 * It will enable use to store expensive information about a tutor.
 * 1. Schedule, which will enable us to sort tutors by their availablity.
 * 2. Tutor avg. rating which will be the agreggate result for all his ratings.
 * 3: Will be the base for "Available now" feature.
 *
 *
 * ### Unpacking bounds for the in memory cache?
 *
 * Notes:
 * 1. At the time of selecting a tutors, all students are subscribed (or have
 *    free minutes).
 * 2. Subscriptions will be monthly.
 *
 * The worest case sendairo will be that the student just get subscribed today
 * and we need to unpack the rest of month for him.
 *
 * This mean we can unpack only one month starting from today.
 *
 * The cache time for the tutors list will be "one day"
 *
 * ### Implemenation steps:
 * 1. Construct the tutors list with their schedules.
 * 2. Set the cache.
 * 3. Apply the sorting on the cache.
 *
 *
 * TODO: txs in redis
 */
async function findAvailableTutors(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id;
  const allowedRole = req.user?.role === IUser.Role.Student;
  if (!userId || !allowedRole) return next(forbidden());

  const query = findAvailableTutorsQuery.parse(req.query);
  const start = dayjs.utc().startOf("day");
  const [dates, exists] = await Promise.all([
    availableTutorsCache.getDates(),
    availableTutorsCache.exists(),
  ]);

  const validCache =
    exists &&
    dates.start &&
    dates.end &&
    start.isBetween(dates.start, dates.end, "day", "[]");

  const cache = validCache
    ? {
        tutors: await availableTutorsCache.getTutors(),
        unpackedRules: await availableTutorsCache.getRules(),
      }
    : await cacheAvailableTutors(start);

  if (!cache.tutors || !cache.unpackedRules) return next(badRequest()); // should send "ServerError"

  const iteratees = [
    // sort in ascending order by the first availablity
    (tutor: ITutor.FullTutor) => {
      const rules = cache.unpackedRules?.[tutor.id.toString()];
      const rule = first(rules);
      if (!rule) return Infinity;
      return dayjs.utc(rule.start).unix();
    },
    (tutor: ITutor.FullTutor) => {
      if (!req.user.gender) return 0; // disable ordering by gender if user gener is unkown.
      if (!tutor.gender) return Infinity;
      const same = req.user.gender === tutor.gender;
      return same ? 0 : 1;
    },
    "online",
  ];
  const orders: Array<"asc" | "desc"> = ["asc", "asc", "desc"];
  const tutors = orderBy(cache.tutors, iteratees, orders);
  const unpackedRules = cache.unpackedRules;
  const page = query.page || 1;
  const size = query.size || 10;
  const offset = (page - 1) * size;
  const total = tutors.length;
  const paginated = drop(tutors, offset).slice(0, size);
  const rules = reduce(
    paginated,
    (acc: ITutor.Cache["unpackedRules"], tutor) => {
      const id = tutor.id.toString();
      acc[id] = unpackedRules[id] || [];
      return acc;
    },
    {}
  );

  res.status(200).json({ total, tutors: paginated, rules });
}

export default {
  create: asyncHandler(create),
  update,
  delete: asyncHandler(delete_),
  findById: asyncHandler(findById),
  findUsers: asyncHandler(findUsers),
  findMe: asyncHandler(findMe),
  returnUser: asyncHandler(returnUser),
  selectInterviewer: asyncHandler(selectInterviewer),
  findTutorMeta: asyncHandler(findTutorMeta),
  findAvailableTutors: asyncHandler(findAvailableTutors),
};
