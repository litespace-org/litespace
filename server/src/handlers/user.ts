import { tutors, users, count, knex } from "@litespace/models";
import { ITutor, IUser } from "@litespace/types";
import { isAdmin } from "@/lib/common";
import { badRequest, forbidden, notfound, userExists } from "@/lib/error";
import { hashPassword } from "@/lib/user";
import { schema } from "@/validation";
import { NextFunction, Request, Response } from "express";
import safe from "express-async-handler";
import { sendUserVerificationEmail } from "@/lib/email";
import {
  email,
  gender,
  identityObject,
  password,
  id,
  pagination,
  string,
} from "@/validation/utils";
import { uploadSingle } from "@/lib/media";
import { FileType } from "@/constants";
import { enforceRequest } from "@/middleware/accessControl";
import { httpQueryFilter } from "@/validation/http";
import { concat, drop, entries, first, orderBy, reduce, sample } from "lodash";
import zod from "zod";
import { Knex } from "knex";
import dayjs from "@/lib/dayjs";
import { availableTutorsCache } from "@/redis/tutor";
import { cacheAvailableTutors } from "@/lib/tutor";
import { ApiContext } from "@/types/api";
import { Schedule } from "@litespace/sol";
import { authorizer } from "@litespace/auth";

const updateUserPayload = zod.object({
  email: zod.optional(email),
  password: zod.optional(password),
  name: zod.optional(string),
  gender: zod.optional(gender),
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

const findAvailableTutorsQuery = zod.object({
  page: zod.optional(zod.coerce.number().min(1)),
  size: zod.optional(zod.coerce.number().max(50)),
});

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

  next(); // Next handler should be the "Local Auth" from passport.
}

function update(context: ApiContext) {
  return safe(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = identityObject.parse(req.params);

    const allowed = enforceRequest(req, id === req.user?.id);
    if (!allowed) return next(forbidden());

    const currentUser = req.user;
    const targetUser = await users.findById(id);
    if (!targetUser) return next(notfound.user());

    const { email, name, password, gender, birthYear, drop, bio, about } =
      updateUserPayload.parse(req.body);

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
      await cacheAvailableTutors(start);
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
  });
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

  const filter = httpQueryFilter(users.columns.filterable, req.query);

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
 * 1. First available tutors (1st order).
 * 2. Same gender as user (2nd order)
 * 3. Online (3rd order)
 * 4. Rate (4th order) (not implemented)
 *
 * Best candidate will be: available in the nerest time, same gender as the user
 * and online.
 *
 *
 * To be able to sort tutors by their availablity we should have access to their
 * schedule (rules) and their upcoming lessons. It is an expensive operation to
 * do for all of our tutors **on each request**. That's why we will do this
 * operation once and cache it (using Redis). It should be shared between all
 * students.
 *
 *
 * ### When to updated the cache?
 * - When the tutor info is updated (e.g., status, bio, about, ...).
 * - When the tutor schedule (rules) is modified (CRUD).
 * - When a new lesson is canceled or registered.
 *
 * ### Notify cache updates
 * On updating the cache, specific event will be emitted to specific **shared
 * room** (e.g., available_tutors) at which all active students will be there.
 * The event will trigger the client to refetch the available tutors cache.
 *
 * ### Date size & Cache TTL (time to live)
 *
 * At the worse case, student should have access to the tutors' shcedules for
 * the next 30 days (in case he just got subscribed today). Other students will
 * be some where in their monthly subscription.
 *
 * - We will unpack all tutors rules in next 30 days.
 * - We will keep the cache for 15 days and then rebuild it again.
 *
 * This mean that at first day from the cache, studnets has access to 30 days of
 * data. At the last day of the cache they will have access 15 days of
 * information.
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

  // filter old rules and create a new map
  const unpackedRules = reduce(
    entries(cache.unpackedRules),
    (acc: ITutor.Cache["unpackedRules"], [tutorId, rules]) => {
      acc[tutorId] = Schedule.order(
        rules.filter((rule) => dayjs.utc(rule.end).isAfter(dayjs.utc())),
        "asc"
      );
      return acc;
    },
    {}
  );

  const iteratees = [
    // sort in ascending order by the first availablity
    (tutor: ITutor.FullTutor) => {
      const rules = unpackedRules[tutor.id.toString()];
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

export default {
  create: safe(create),
  update,
  findById: safe(findById),
  findUsers: safe(findUsers),
  findMe: safe(findMe),
  returnUser: safe(returnUser),
  selectInterviewer: safe(selectInterviewer),
  findTutorMeta: safe(findTutorMeta),
  findAvailableTutors: safe(findAvailableTutors),
  findTutorsForMediaProvider: safe(findTutorsForMediaProvider),
};
