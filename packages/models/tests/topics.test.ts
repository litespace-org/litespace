import fixtures from "@fixtures/db";
import { nameof } from "@litespace/sol/utils";
import { knex, topics } from "@/index";
import { expect } from "chai";
import dayjs from "@/lib/dayjs";

describe("Topics", () => {
  beforeEach(async () => {
    return await fixtures.flush();
  });

  describe(nameof(topics.create), () => {
    it("should create new topic", async () => {
      const topic = await topics.create({
        name: {
          ar: "ar",
          en: "en",
        },
      });

      expect(topic.id).to.be.eq(1);
      expect(topic.name.ar).to.be.eq("ar");
      expect(topic.name.en).to.be.eq("en");
      expect(topic.createdAt).to.be.eq(
        dayjs.utc(topic.createdAt).toISOString()
      );
      expect(topic.updatedAt).to.be.eq(
        dayjs.utc(topic.updatedAt).toISOString()
      );
    });
  });

  describe(nameof(topics.update), () => {
    it("should update topic", async () => {
      const created = await fixtures.topic();
      const updated = await topics.update(created.id, {
        arabicName: "ar-2",
        englishName: "en-2",
      });

      expect(updated.id).to.be.eq(created.id);
      expect(updated.name.ar).to.be.eq("ar-2");
      expect(updated.name.en).to.be.eq("en-2");
      expect(updated.createdAt).to.be.eq(
        dayjs.utc(created.createdAt).toISOString()
      );
      expect(updated.updatedAt).to.be.eq(
        dayjs.utc(updated.updatedAt).toISOString()
      );
      expect(updated.updatedAt).to.be.not.eq(
        dayjs.utc(created.updatedAt).toISOString()
      );
    });
  });

  describe(nameof(topics.delete), () => {
    it("should delete topic by id", async () => {
      const topic = await fixtures.topic();
      expect(await topics.findById(topic.id)).to.exist;

      await knex.transaction(async (tx) => {
        await topics.delete(topic.id, tx);
      });

      expect(await topics.findById(topic.id)).to.null;
    });
  });

  describe(nameof(topics.findById), () => {
    it("should find topic by id", async () => {
      const created = await fixtures.topic();
      const fineded = await topics.findById(created.id);
      expect(fineded).to.exist;
      expect(fineded?.id).to.be.eq(created.id);
    });
  });

  describe(nameof(topics.find), () => {
    it("should find topics with filters", async () => {
      await fixtures.topic({
        name: { ar: "t1-ar", en: "t1-en" },
      });

      await fixtures.topic({
        name: { ar: "t2-ar", en: "t2-en" },
      });

      const tests = [
        { name: "t1", total: 1 },
        { name: "-ar", total: 2 },
        { name: "-en", total: 2 },
        { name: "t2-en", total: 1 },
        { name: "t3", total: 0 },
      ];

      for (const test of tests) {
        const result = await topics.find({
          name: test.name,
        });

        expect(result.list).to.be.of.length(test.total);
        expect(result.total).to.be.eq(test.total);
      }
    });
  });

  describe(nameof(topics.registerUserTopics), () => {
    it("register user topcis", async () => {
      const student = await fixtures.student();
      const topic = await fixtures.topic({
        name: { ar: "t1-ar", en: "t1-en" },
      });

      await topics.registerUserTopics({
        user: student.id,
        topics: [topic.id],
      });
    });

    it("register throw error when registering the same topic twice", async () => {
      const student = await fixtures.student();
      const topic = await fixtures.topic({
        name: { ar: "t1-ar", en: "t1-en" },
      });

      await topics
        .registerUserTopics({
          user: student.id,
          topics: [topic.id, topic.id],
        })
        .then(() => {
          throw new Error("Should never successed");
        })
        .catch((error) => {
          expect(error).to.be.instanceOf(Error);
        });
    });
  });
});
