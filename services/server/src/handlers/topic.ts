import { apierror, empty, forbidden, notfound, refused } from "@/lib/error";
import {
  orderDirection,
  pageNumber,
  pageSize,
  string,
  withNamedId,
} from "@/validation/utils";
import { isAdmin, isStudent, isTutor, isTutorManager } from "@litespace/auth";
import { NextFunction, Request, Response } from "express";
import { knex, topics } from "@litespace/models";
import { ITopic } from "@litespace/types";
import { isValidTopicName } from "@litespace/sol/verification";
import safeRequest from "express-async-handler";
import zod from "zod";
import { Knex } from "knex";
import { MAX_TOPICS_NUM } from "@litespace/sol";

const createTopicPayload = zod.object({
  arabicName: string,
  englishName: string,
});

const updateTopicPayload = zod.object({
  arabicName: zod.optional(string),
  englishName: zod.optional(string),
});

const generalUserTopicsBodyParser = zod.object({
  topicIds: zod.array(zod.number()),
});

const orderByOptions = [
  "name_ar",
  "name_en",
  "updated_at",
  "created_at",
] as const satisfies Array<Required<ITopic.FindTopicsQueryFilter["orderBy"]>>;

const findTopicsQuery = zod.object({
  name: zod.optional(zod.string()),
  orderBy: zod.optional(zod.enum(orderByOptions)),
  orderDirection: zod.optional(orderDirection),
  page: zod.optional(pageNumber),
  size: zod.optional(pageSize),
});

async function createTopic(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user);
  if (!allowed) return next(forbidden());

  const payload: ITopic.CreateApiPayload = createTopicPayload.parse(req.body);
  const validArabicName = isValidTopicName(payload.arabicName);
  const validEnglishName = isValidTopicName(payload.englishName);

  if (validArabicName !== true)
    return next(apierror(validArabicName, "Invalid topic Arabic name", 400));
  if (validEnglishName !== true)
    return next(apierror(validEnglishName, "Invalid topic English name", 400));

  const topic = await topics.create({
    name: {
      ar: payload.arabicName,
      en: payload.englishName,
    },
  });

  const response: ITopic.CreateTopicApiResponse = topic;
  res.status(200).json(response);
}

async function updateTopic(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user);
  if (!allowed) return next(forbidden());

  const { id } = withNamedId("id").parse(req.params);
  const topic = await topics.findById(id);
  if (!topic) return next(notfound.topic());

  const payload = updateTopicPayload.parse(req.body);
  if (!payload.arabicName && !payload.englishName) return next(empty());

  if (payload.arabicName) {
    const validArabicName = isValidTopicName(payload.arabicName);

    if (validArabicName !== true)
      return next(apierror(validArabicName, "Invalid topic Arabic name", 400));
  }

  if (payload.englishName) {
    const validEnglishName = isValidTopicName(payload.englishName);
    if (validEnglishName !== true)
      return next(
        apierror(validEnglishName, "Invalid topic English name", 400)
      );
  }

  const updated = await topics.update(id, payload);
  const response: ITopic.UpdateTopicApiResponse = updated;

  res.status(200).json(response);
}

async function deleteTopic(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user);
  if (!allowed) return next(forbidden());

  const { id } = withNamedId("id").parse(req.params);
  const topic = await topics.findById(id);
  if (!topic) return next(notfound.topic());

  await knex.transaction(async (tx: Knex.Transaction) => {
    await topics.delete(id, tx);
  });

  res.status(200).send();
}

async function findTopics(req: Request, res: Response, _: NextFunction) {
  const query = findTopicsQuery.parse(req.query);
  const response: ITopic.FindTopicsApiResponse = await topics.find(query);
  res.status(200).json(response);
}

//async function findUserTopics(req: Request, res: Response, next: NextFunction) {}

async function addUserTopics(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isStudent(user) || isTutor(user) || isTutorManager(user);
  if (!allowed) return next(forbidden());
  const { topicIds } = generalUserTopicsBodyParser.parse(req.body);

  // filter passed topics to ignore the ones that does already exist
  const myTopics = await topics.findUserTopics({ users: [user.id] });
  const myTopicsIds = myTopics.map(t => t.id);
  const filteredIds = topicIds.filter(id => !myTopicsIds.includes(id));

  // ensure that user topics will not exceed the max num after insertion
  if (myTopics.length + filteredIds.length > MAX_TOPICS_NUM)
    return next(refused());

  if (filteredIds.length === 0) {
    res.sendStatus(200);
    return;
  }

  // verify that all topics do exist in the database
  const isExists = await topics.isExistsBatch(filteredIds);
  if (isExists.includes(false))
    return next(notfound.topic());

  await topics.registerUserTopics({
    user: user.id,
    topics: filteredIds,
  })

  res.sendStatus(200);
}

async function deleteUserTopics(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isStudent(user) || isTutor(user) || isTutorManager(user);
  if (!allowed) return next(forbidden());
  const { topicIds } = generalUserTopicsBodyParser.parse(req.body);

  // filter passed topics to include only the ones that the user has included 
  const myTopics = await topics.findUserTopics({ users: [user.id] });
  const myTopicsIds = myTopics.map(t => t.id);
  const filteredIds = topicIds.filter(id => myTopicsIds.includes(id));

  // remove user topics from the database
  if (filteredIds.length > 0)
    await topics.deleteUserTopics({ 
      user: user.id,
      topics: filteredIds,
    });

  res.sendStatus(200);
}

export default {
  createTopic: safeRequest(createTopic),
  updateTopic: safeRequest(updateTopic),
  deleteTopic: safeRequest(deleteTopic),
  findTopics: safeRequest(findTopics),
  //findUserTopics: safeRequest(findUserTopics),
  addUserTopics: safeRequest(addUserTopics),
  deleteUserTopics: safeRequest(deleteUserTopics),
};
