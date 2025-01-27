import { empty, forbidden, notfound, refused } from "@/lib/error";
import { mockApiHandler } from "@fixtures/mockApi";
import db, { faker } from "@fixtures/db";
import { topics } from "@litespace/models";
import { MAX_TOPICS_COUNT, safe } from "@litespace/sol";
import { expect } from "chai";
import { range } from "lodash";
import topicHandlers from "@/handlers/topic";
import { ITopic, IUser } from "@litespace/types";

describe("/api/v1/topic/", () => {
  const addUserTopicsHandler = mockApiHandler<ITopic.AddUserTopicsApiPayload>(
    topicHandlers.addUserTopics
  );
  const deleteUserTopicsHandler =
    mockApiHandler<ITopic.DeleteUserTopicsApiPayload>(
      topicHandlers.deleteUserTopics
    );
  const findUserTopicsHandler = mockApiHandler<ITopic.FindTopicsApiQuery>(
    topicHandlers.findUserTopics
  );
  const replaceUserTopicsHandler =
    mockApiHandler<ITopic.ReplaceUserTopicsApiPayload>(
      topicHandlers.replaceUserTopics
    );

  beforeEach(async () => {
    await db.flush();
  });

  describe("POST /api/v1/topic/user", () => {
    it("should respond with 401 if the user neither a student, a tutor, nor a tutor-manager.", async () => {
      const res = await safe(() =>
        addUserTopicsHandler({
          body: { topicIds: [1] },
          userRole: IUser.Role.SuperAdmin,
        })
      );
      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with 403 if the number of topics will exceed the MAX_TOPICS_NUM.", async () => {
      const mockTopicIds = await Promise.all(
        range(0, MAX_TOPICS_COUNT + 1).map(
          async (i) =>
            (
              await db.topic({
                name: {
                  ar: `${faker.animal.bear()}-${i}`,
                  en: `${faker.animal.bird()}-${i}`,
                },
              })
            ).id
        )
      );
      const res = await safe(() =>
        addUserTopicsHandler({
          body: { topicIds: mockTopicIds.slice(0, MAX_TOPICS_COUNT + 1) },
          userRole: IUser.Role.Student,
        })
      );
      expect(res).to.deep.eq(refused());
    });

    it("should respond with 404 if atleast one topic is not found.", async () => {
      const res = await safe(() =>
        addUserTopicsHandler({
          body: { topicIds: [123] },
          userRole: IUser.Role.Student,
        })
      );
      expect(res).to.deep.eq(notfound.topic());
    });

    it("should respond with 200 and successfully insert user topics in the database.", async () => {
      const student = await db.student();

      const mockTopicIds = await Promise.all(
        range(0, 3).map(
          async (i) =>
            (
              await db.topic({
                name: {
                  ar: `${faker.animal.bear()}-${i}`,
                  en: `${faker.animal.bird()}-${i}`,
                },
              })
            ).id
        )
      );

      const res1 = await safe(() =>
        addUserTopicsHandler({
          body: { topicIds: mockTopicIds },
          user: student,
        })
      );
      expect(res1).to.eq(200);

      // it should ignore duplicated topics
      const res2 = await safe(() =>
        addUserTopicsHandler({
          body: { topicIds: mockTopicIds },
          user: student,
        })
      );
      expect(res2).to.eq(200);

      const myTopics = await topics.findUserTopics({
        users: [student.id],
      });
      expect(myTopics.length).to.eq(3);
    });
  });

  describe("DELETE /api/v1/topic/user", () => {
    it("should respond with 401 if the user neither a student, a tutor, nor a tutor-manager.", async () => {
      const res = await safe(() =>
        deleteUserTopicsHandler({
          body: { topicIds: [1] },
          userRole: IUser.Role.SuperAdmin,
        })
      );
      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with 200 even when the user delete topics that he doesn't have.", async () => {
      const mockTopicIds = await Promise.all(
        range(0, 3).map(
          async (i) =>
            (
              await db.topic({
                name: {
                  ar: `${faker.animal.bear()}-${i}`,
                  en: `${faker.animal.bird()}-${i}`,
                },
              })
            ).id
        )
      );
      const res = await safe(() =>
        deleteUserTopicsHandler({
          body: { topicIds: mockTopicIds },
          userRole: IUser.Role.Student,
        })
      );
      expect(res).to.eq(200);
    });

    it("should respond with 200 and successfully remove user topics.", async () => {
      const student = await db.student();

      const mockTopicIds = await Promise.all(
        range(0, 3).map(
          async (i) =>
            (
              await db.topic({
                name: {
                  ar: `${faker.animal.bear()}-${i}`,
                  en: `${faker.animal.bird()}-${i}`,
                },
              })
            ).id
        )
      );

      const res1 = await safe(() =>
        addUserTopicsHandler({
          body: { topicIds: mockTopicIds },
          user: student,
        })
      );
      expect(res1).to.eq(200);

      const res2 = await safe(() =>
        deleteUserTopicsHandler({
          body: { topicIds: mockTopicIds.slice(0, 2) },
          user: student,
        })
      );
      expect(res2).to.deep.eq(200);

      const myTopics = await topics.findUserTopics({
        users: [student.id],
      });
      expect(myTopics.length).to.eq(1);
    });
  });

  describe("GET /api/v1/topic/user", () => {
    it("should respond with 401 if the user neither a student, a tutor, nor a tutor-manager.", async () => {
      const res = await safe(() =>
        findUserTopicsHandler({ userRole: IUser.Role.SuperAdmin })
      );
      expect(res).to.deep.eq(forbidden());
    });

    it("should successfully retrieve a list of user topics.", async () => {
      const student = await db.student();

      const mockTopics = await Promise.all(
        range(0, 3).map(
          async (i) =>
            await db.topic({
              name: {
                ar: `${faker.animal.bear()}-${i}`,
                en: `${faker.animal.bird()}-${i}`,
              },
            })
        )
      );
      const mockTopicIds = mockTopics.map((t) => t.id);

      const res = await safe(() =>
        addUserTopicsHandler({
          body: { topicIds: mockTopicIds },
          user: student,
        })
      );
      expect(res).to.eq(200);

      const myTopics = await safe(async () =>
        findUserTopicsHandler({ user: student })
      );
      expect(myTopics).to.be.an("array");
      expect(myTopics).to.have.length(3);
    });
  });

  describe("PATCH /api/v1/topic/of/user", () => {
    it("should respond with 200 and replace users list of topics with new one.", async () => {
      const student = await db.student();

      const mockTopicIds = await Promise.all(
        range(0, 4).map(
          async (i) =>
            (
              await db.topic({
                name: {
                  ar: `${faker.animal.bear()}-${i}`,
                  en: `${faker.animal.bird()}-${i}`,
                },
              })
            ).id
        )
      );

      await topics.registerUserTopics({
        user: student.id,
        topics: mockTopicIds.slice(0, 2),
      });

      const res = await safe(() =>
        replaceUserTopicsHandler({
          body: {
            removeTopics: mockTopicIds.slice(0, 2),
            addTopics: mockTopicIds.slice(2, 4),
          },
          user: student,
        })
      );
      expect(res).to.eq(200);
    });

    it("should respond with 400 when the old and new list have different lengths.", async () => {
      const student = await db.student();

      const mockTopicIds = await Promise.all(
        range(0, 4).map(
          async (i) =>
            (
              await db.topic({
                name: {
                  ar: `${faker.animal.bear()}-${i}`,
                  en: `${faker.animal.bird()}-${i}`,
                },
              })
            ).id
        )
      );

      await topics.registerUserTopics({
        user: student.id,
        topics: mockTopicIds.slice(0, 2),
      });

      const res = await safe(async () =>
        replaceUserTopicsHandler({
          body: {
            removeTopics: mockTopicIds.slice(0, 2),
            addTopics: mockTopicIds.slice(3, 4),
          },
          user: student,
        })
      );
      expect(res).to.deep.eq(200);
    });

    it("should respond with 403 if the number of topics will exceed the MAX_TOPICS_NUM.", async () => {
      const student = await db.student();

      const mockTopicIds = await Promise.all(
        range(0, 31).map(
          async (i) =>
            (
              await db.topic({
                name: {
                  ar: `${faker.animal.bear()}-${i}`,
                  en: `${faker.animal.bird()}-${i}`,
                },
              })
            ).id
        )
      );

      await topics.registerUserTopics({
        user: student.id,
        topics: mockTopicIds.slice(0, 30),
      });

      const res = await safe(async () =>
        replaceUserTopicsHandler({
          body: {
            removeTopics: [],
            addTopics: mockTopicIds.slice(30, 31),
          },
          user: student,
        })
      );
      expect(res).to.deep.eq(refused());
    });

    it("should respond with 200 when any of the lists is empty.", async () => {
      const student = await db.student();

      const mockTopicIds = await Promise.all(
        range(0, 4).map(
          async (i) =>
            (
              await db.topic({
                name: {
                  ar: `${faker.animal.bear()}-${i}`,
                  en: `${faker.animal.bird()}-${i}`,
                },
              })
            ).id
        )
      );

      await topics.registerUserTopics({
        user: student.id,
        topics: mockTopicIds.slice(0, 2),
      });

      const res1 = await safe(async () =>
        replaceUserTopicsHandler({
          body: {
            removeTopics: [],
            addTopics: mockTopicIds.slice(2, 4),
          },
          user: student,
        })
      );
      expect(res1).to.eq(200);

      const res2 = await safe(async () =>
        replaceUserTopicsHandler({
          body: {
            removeTopics: mockTopicIds.slice(0, 2),
            addTopics: [],
          },
          user: student,
        })
      );
      expect(res2).to.eq(200);
    });

    it("should respond with 400 when both lists are empty.", async () => {
      const student = await db.student();

      const mockTopicIds = await Promise.all(
        range(0, 4).map(
          async (i) =>
            (
              await db.topic({
                name: {
                  ar: `${faker.animal.bear()}-${i}`,
                  en: `${faker.animal.bird()}-${i}`,
                },
              })
            ).id
        )
      );

      await topics.registerUserTopics({
        user: student.id,
        topics: mockTopicIds.slice(0, 2),
      });

      const res = await safe(() =>
        replaceUserTopicsHandler({
          body: {
            removeTopics: [],
            addTopics: [],
          },
          user: student,
        })
      );
      expect(res).to.deep.eq(empty());
    });

    it("should respond with 404 when any of ids of the oldTopics list doesn't exists.", async () => {
      const student = await db.student();

      const mockTopicIds = await Promise.all(
        range(0, 4).map(
          async (i) =>
            (
              await db.topic({
                name: {
                  ar: `${faker.animal.bear()}-${i}`,
                  en: `${faker.animal.bird()}-${i}`,
                },
              })
            ).id
        )
      );

      await topics.registerUserTopics({
        user: student.id,
        topics: mockTopicIds.slice(0, 2),
      });

      const res = await safe(async () =>
        replaceUserTopicsHandler({
          body: {
            removeTopics: [...mockTopicIds.slice(0, 2), 123],
            addTopics: [...mockTopicIds.slice(2, 4), 321],
          },
          user: student,
        })
      );
      expect(res).to.deep.eq(notfound.topic());
    });

    it("should respond with 404 when any of ids of the newTopics list doesn't exists.", async () => {
      const student = await db.student();

      const mockTopicIds = await Promise.all(
        range(0, 4).map(
          async (i) =>
            (
              await db.topic({
                name: {
                  ar: `${faker.animal.bear()}-${i}`,
                  en: `${faker.animal.bird()}-${i}`,
                },
              })
            ).id
        )
      );

      await topics.registerUserTopics({
        user: student.id,
        topics: mockTopicIds.slice(0, 2),
      });

      const res = await safe(async () =>
        replaceUserTopicsHandler({
          body: {
            removeTopics: [...mockTopicIds.slice(0, 2)],
            addTopics: [...mockTopicIds.slice(2, 3), 123],
          },
          user: student,
        })
      );
      expect(res).to.deep.eq(notfound.topic());
    });
  });
});
