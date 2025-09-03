import fixtures from "@fixtures/db";
import { expect } from "chai";
import { nameof } from "@litespace/utils/utils";
import { IStudent, IUser } from "@litespace/types";
import dayjs from "@/lib/dayjs";
import { students } from "@/index";

describe("Students", () => {
  beforeEach(async () => {
    return await fixtures.flush();
  });

  describe(nameof(students.create), () => {
    it("should create a student row", async () => {
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
    it("should update a student row", async () => {
      const student = await fixtures.student({
        jobTitle: "Designer",
        englishLevel: IStudent.EnglishLevel.Advanced,
      });
      await students.update({ id: student.userId });

      const { list: updatedList } = await students.findMany({
        ids: [student.userId],
      });
      const updated = updatedList[0];

      expect(updated.userId).to.eq(student.userId);
      expect(updated.jobTitle).to.eq("Designer");
      expect(updated.englishLevel).to.eq(IStudent.EnglishLevel.Advanced);
      expect(updated.createdAt).to.eq(student.createdAt);
      expect(updated.updatedAt).to.not.eq(student.updatedAt);
    });
  });

  describe(nameof(students.findMany), () => {
    it("should filter and select fields", async () => {
      const s1 = await fixtures.student({
        jobTitle: "Junior Engineer",
        englishLevel: IStudent.EnglishLevel.Beginner,
      });
      const s2 = await fixtures.student({
        jobTitle: "Senior Designer",
        englishLevel: IStudent.EnglishLevel.Advanced,
      });

      const byTitle = await students.findMany({ jobTitle: "Engineer" });
      expect(byTitle.total).to.eq(1);
      expect(byTitle.list[0].userId).to.eq(s1.userId);

      const { list } = await students.findMany({});
      expect(list.map((s) => s.userId)).to.deep.eq([s2.userId, s1.userId]);
      expect(list[0].userId).to.eq(s2.userId);
      expect(list[1].userId).to.eq(s1.userId);
    });
  });
});
