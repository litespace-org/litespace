import { forbidden, notfound, refused } from "@/lib/error";
import { Api } from "@fixtures/api";
import db, { faker } from "@fixtures/db";
import { topics } from "@litespace/models";
import { MAX_TOPICS_COUNT, safe } from "@litespace/sol";
import { expect } from "chai";
import { range } from "lodash";

describe("/api/v1/topic/", () => {
  beforeEach(async () => {
    await db.flush();
  });

  describe("POST /api/v1/topic/user", () => {
    it("should respond with 401 if the user neither a student, a tutor, nor a tutor-manager.", async () => {
      const adminApi = await Api.forSuperAdmin();
      const res = await safe(async () => adminApi.atlas.topic.addUserTopics({
        topicIds: [1],
      }));
      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with 403 if the number of topics will exceed the MAX_TOPICS_NUM.", async () => {
      const studentApi = await Api.forStudent();
      const mockTopicIds = await Promise.all(
        range(0, MAX_TOPICS_COUNT + 1).map(
          async (i) => (await db.topic({
            name: {
              ar: `${faker.animal.bear()}-${i}`,
              en: `${faker.animal.bird()}-${i}`,
            }
          })).id)
      );

      const res1 = await safe(
        async () => studentApi.atlas.topic.addUserTopics({
          topicIds: mockTopicIds.slice(0, MAX_TOPICS_COUNT),
        })
      );
      expect(res1).to.eq("OK");

      const res2 = await safe(
        async () => studentApi.atlas.topic.addUserTopics({
          topicIds: mockTopicIds.slice(MAX_TOPICS_COUNT),
        })
      );
      expect(res2).to.deep.eq(refused());
    });

    it("should respond with 404 if atleast one topic is not found.", async () => {
      const studentApi = await Api.forStudent();
      const res = await safe(async () => studentApi.atlas.topic.addUserTopics({
        topicIds: [123]
      }));
      expect(res).to.deep.eq(notfound.topic());
    });

    it("should respond with 200 and successfully insert user topics in the database.", async () => {
      const studentApi = await Api.forStudent();
      const student = await studentApi.findCurrentUser();

      const mockTopicIds = await Promise.all(
        range(0, 3).map(
          async (i) => (await db.topic({
            name: {
              ar: `${faker.animal.bear()}-${i}`,
              en: `${faker.animal.bird()}-${i}`,
            }
          })).id)
      );

      const res1 = await safe(async () => studentApi.atlas.topic.addUserTopics({ topicIds: mockTopicIds }));
      expect(res1).to.eq("OK");

      // it should ignore duplicated topics
      const res2 = await safe(async () => studentApi.atlas.topic.addUserTopics({ topicIds: mockTopicIds }));
      expect(res2).to.eq("OK");

      const myTopics = await topics.findUserTopics({ users: [student.user.id] });
      expect(myTopics.length).to.eq(3);
    });
  });

  describe("DELETE /api/v1/topic/user", () => {
    it("should respond with 401 if the user neither a student, a tutor, nor a tutor-manager.", async () => {
      const adminApi = await Api.forSuperAdmin();
      const res = await safe(async () => adminApi.atlas.topic.deleteUserTopics({ topicIds: [1] }));
      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with 200 even when the user delete topics that he doesn't have.", async () => {
      const studentApi = await Api.forStudent();

      const mockTopicIds = await Promise.all(
        range(0, 3).map(
          async (i) => (await db.topic({
            name: {
              ar: `${faker.animal.bear()}-${i}`,
              en: `${faker.animal.bird()}-${i}`,
            }
          })).id)
      );

      const res = await safe(async () => studentApi.atlas.topic.deleteUserTopics({ topicIds: mockTopicIds }));
      expect(res).to.deep.eq("OK");
    });

    it("should respond with 200 and successfully remove user topics.", async () => {
      const studentApi = await Api.forStudent();
      const student = await studentApi.findCurrentUser();

      const mockTopicIds = await Promise.all(
        range(0, 3).map(
          async (i) => (await db.topic({
            name: {
              ar: `${faker.animal.bear()}-${i}`,
              en: `${faker.animal.bird()}-${i}`,
            }
          })).id)
      );

      const res1 = await safe(
        async () => studentApi.atlas.topic.addUserTopics({ topicIds: mockTopicIds })
      );
      expect(res1).to.eq("OK");

      const res = await safe(
        async () => studentApi.atlas.topic.deleteUserTopics({ topicIds: mockTopicIds.slice(0,2) })
      );
      expect(res).to.deep.eq("OK");

      const myTopics = await topics.findUserTopics({ users: [student.user.id] });
      expect(myTopics.length).to.eq(1);
    });
  });

  describe("GET /api/v1/topic/user", () => {
    it("should respond with 401 if the user neither a student, a tutor, nor a tutor-manager.", async () => {
      const adminApi = await Api.forSuperAdmin();
      const res = await safe(async () => adminApi.atlas.topic.findUserTopics());
      expect(res).to.deep.eq(forbidden());
    });

    it("should successfully retrieve a list of user topics.", async () => {
      const studentApi = await Api.forStudent();

      const mockTopics = await Promise.all(
        range(0, 3).map(
          async (i) => await db.topic({
            name: {
              ar: `${faker.animal.bear()}-${i}`,
              en: `${faker.animal.bird()}-${i}`,
            }
          }))
      );
      const mockTopicIds = mockTopics.map(t => t.id);

      const res = await safe(async () => studentApi.atlas.topic.addUserTopics({ topicIds: mockTopicIds }));
      expect(res).to.eq("OK");

      const myTopics = await safe(async () => studentApi.atlas.topic.findUserTopics());
      expect(myTopics).to.be.an("array");
      expect(myTopics).to.have.length(3);
    });
  });
});
