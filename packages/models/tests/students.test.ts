import fixtures from "@fixtures/db";
import { expect } from "chai";
import { nameof } from "@litespace/utils/utils";
import { IStudent, IUser } from "@litespace/types";
import dayjs from "@/lib/dayjs";
import { knex, students } from "@/index";

describe("Students", () => {
  afterEach(async () => {
    await knex("students").del();
  });

  describe(nameof(students.create), () => {
    it("creates a student row", async () => {
      const user = await fixtures.user({ role: IUser.Role.Student });
      const created = await students.create({
        userId: user.id,
        jobTitle: "Engineer",
        englishLevel: IStudent.EnglishLevel.Intermediate,
        learningObjective: "Practice speaking",
      });

      expect(created.userId).to.eq(user.id);
      expect(created.jobTitle).to.eq("Engineer");
      expect(created.englishLevel).to.eq(IStudent.EnglishLevel.Intermediate);
      expect(created.createdAt).to.eq(
        dayjs.utc(created.createdAt).toISOString()
      );
      expect(created.updatedAt).to.eq(
        dayjs.utc(created.updatedAt).toISOString()
      );
    });
  });

  describe(nameof(students.update), () => {
    it("updates a student row", async () => {
      const user = await fixtures.user({ role: IUser.Role.Student });
      const created = await students.create({
        userId: user.id,
        jobTitle: "Designer",
        englishLevel: IStudent.EnglishLevel.Advanced,
      });
      await students.update({ id: created.userId });

      const { list: updatedList } = await students.findMany({
        ids: [created.userId],
      });
      const updated = updatedList[0];

      expect(updated.userId).to.eq(created.userId);
      expect(updated.jobTitle).to.eq("Designer");
      expect(updated.englishLevel).to.eq(IStudent.EnglishLevel.Advanced);
      expect(updated.createdAt).to.eq(created.createdAt);
      expect(updated.updatedAt).to.not.eq(created.updatedAt);
    });
  });

  describe(nameof(students.findMany), () => {
    it("filters and selects fields", async () => {
      const u1 = await fixtures.user({ role: IUser.Role.Student });
      const u2 = await fixtures.user({ role: IUser.Role.Student });
      const s1 = await students.create({
        userId: u1.id,
        jobTitle: "Junior Engineer",
        englishLevel: IStudent.EnglishLevel.Beginner,
      });
      const s2 = await students.create({
        userId: u2.id,
        jobTitle: "Senior Designer",
        englishLevel: IStudent.EnglishLevel.Advanced,
      });

      const byTitle = await students.findMany({ jobTitle: "Engineer" });
      expect(byTitle.total).to.eq(1);
      expect(byTitle.list[0].id).to.eq(s1.id);

      const { list } = await students.findMany({});
      expect(list.map((s) => s.userId)).to.deep.eq([s2.userId, s1.userId]);
      expect(list[0].userId).to.eq(s2.userId);
      expect(list[1].userId).to.eq(s1.userId);
    });
  });
});
