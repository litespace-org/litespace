import { apierror, bad, empty, forbidden, notfound } from "@/lib/error";
import {
  id,
  pageNumber,
  pageSize,
  string,
  withNamedId,
} from "@/validation/utils";
import {
  isAdmin,
  isStudent,
  isTutor,
  isTutorManager,
  isUser,
} from "@litespace/utils/user";
import { NextFunction, Request, Response } from "express";
import { knex, topics } from "@litespace/models";
import { ITopic } from "@litespace/types";
import { isValidTopicName } from "@litespace/utils/validation";
import safeRequest from "express-async-handler";
import zod from "zod";
import { Knex } from "knex";
import { MAX_TOPICS_COUNT } from "@litespace/utils";
import { isEmpty } from "lodash";
import { sendBackgroundMessage } from "@/workers";

const createTopicPayload = zod.object({
  arabicName: string,
  englishName: string,
});

const updateTopicPayload = zod.object({
  arabicName: zod.optional(string),
  englishName: zod.optional(string),
});

const generalUserTopicsPayload = zod.object({
  topicIds: zod.array(zod.number()),
});

const replaceUserTopicsPayload = zod.object({
  removeTopics: zod.array(id),
  addTopics: zod.array(id),
});

const findTopicsQuery = zod.object({
  name: zod.string().optional(),
  page: pageNumber.optional(),
  size: pageSize.optional(),
});

async function createTopic(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user);
  if (!allowed) return next(forbidden());

  const payload: ITopic.CreateApiPayload = createTopicPayload.parse(req.body);
  const validArabicName = isValidTopicName(payload.arabicName);
  const validEnglishName = isValidTopicName(payload.englishName);

  if (validArabicName !== true) return next(apierror(validArabicName, 400));
  if (validEnglishName !== true) return next(apierror(validEnglishName, 400));

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

    if (validArabicName !== true) return next(apierror(validArabicName, 400));
  }

  if (payload.englishName) {
    const validEnglishName = isValidTopicName(payload.englishName);
    if (validEnglishName !== true) return next(apierror(validEnglishName, 400));
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

async function findTopics(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isUser(user);
  if (!allowed) return next(forbidden());
  const query = findTopicsQuery.parse(req.query);
  const response: ITopic.FindTopicsApiResponse = await topics.find(query);
  res.status(200).json(response);
}

async function findUserTopics(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isStudent(user) || isTutor(user);
  if (!allowed) return next(forbidden());

  const userTopics = await topics.findUserTopics({ users: [user.id] });
  const response: ITopic.FindUserTopicsApiResponse = userTopics;
  res.status(200).json(response);
}

async function addUserTopics(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isStudent(user) || isTutor(user) || isTutorManager(user);
  if (!allowed) return next(forbidden());
  const { topicIds }: ITopic.AddUserTopicsApiPayload =
    generalUserTopicsPayload.parse(req.body);

  // filter passed topics to ignore the ones that does already exist
  const userTopics = await topics.findUserTopics({ users: [user.id] });
  const userTopicsIds = userTopics.map((t) => t.id);
  const filteredIds = topicIds.filter((id) => !userTopicsIds.includes(id));

  // ensure that user topics will not exceed the max num after insertion
  if (userTopics.length + filteredIds.length > MAX_TOPICS_COUNT)
    return next(forbidden());

  if (filteredIds.length === 0) {
    res.sendStatus(200);
    return;
  }

  // verify that all topics do exist in the database
  const isExists = await topics.isExistsBatch(filteredIds);
  if (Object.values(isExists).includes(false)) return next(notfound.topic());

  await topics.registerUserTopics({
    user: user.id,
    topics: filteredIds,
  });

  res.sendStatus(200);
}

async function replaceUserTopics(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isStudent(user) || isTutor(user) || isTutorManager(user);
  if (!allowed) return next(forbidden());

  const { removeTopics, addTopics }: ITopic.ReplaceUserTopicsApiPayload =
    replaceUserTopicsPayload.parse(req.body);

  if (isEmpty(removeTopics) && isEmpty(addTopics)) return next(empty());

  // ensure that all topics in `addTopics` exists for the current user
  const inDBTopics = await topics.findUserTopics({ users: [user.id] });
  const inDBTopicIds = inDBTopics.map((topic) => topic.id);
  for (const topicId of removeTopics) {
    if (!inDBTopicIds.includes(topicId)) return next(notfound.topic());
  }

  // verify that all topics do exist in the database
  const isExists = await topics.isExistsBatch(addTopics);
  if (Object.values(isExists).includes(false)) return next(notfound.topic());

  // ensure that user topics will not exceed the max num after insertion
  const exceededMaxAllowedTopics =
    inDBTopicIds.length + addTopics.length - removeTopics.length >
    MAX_TOPICS_COUNT;
  if (exceededMaxAllowedTopics) return next(forbidden());

  await knex.transaction(async (tx: Knex.Transaction) => {
    if (!isEmpty(removeTopics))
      await topics.deleteUserTopics({
        user: user.id,
        topics: removeTopics,
        tx,
      });

    if (!isEmpty(addTopics))
      await topics.registerUserTopics(
        {
          user: user.id,
          topics: addTopics,
        },
        tx
      );
  });

  if (isTutor(user))
    sendBackgroundMessage({
      type: "update-tutor-cache",
      payload: { tutorId: user.id },
    });
  res.sendStatus(200);
}

async function deleteUserTopics(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isStudent(user) || isTutor(user) || isTutorManager(user);
  if (!allowed) return next(forbidden());
  const { topicIds }: ITopic.DeleteUserTopicsApiPayload =
    generalUserTopicsPayload.parse(req.body);

  if (topicIds.length === 0) return next(bad());

  // verify that all topics do exist in the database
  const isExists = await topics.isExistsBatch(topicIds);
  if (Object.values(isExists).includes(false)) return next(notfound.topic());

  // remove user topics from the database
  await topics.deleteUserTopics({
    user: user.id,
    topics: topicIds,
  });

  res.sendStatus(200);
}

export default {
  createTopic: safeRequest(createTopic),
  updateTopic: safeRequest(updateTopic),
  deleteTopic: safeRequest(deleteTopic),
  findTopics: safeRequest(findTopics),
  findUserTopics: safeRequest(findUserTopics),
  addUserTopics: safeRequest(addUserTopics),
  deleteUserTopics: safeRequest(deleteUserTopics),
  replaceUserTopics: safeRequest(replaceUserTopics),
};
