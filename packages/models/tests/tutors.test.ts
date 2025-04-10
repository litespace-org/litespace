import { tutors, Tutors } from "@/tutors";
import fixtures from "@fixtures/db";
import { expect } from "chai";
import { dayjs, nameof } from "@litespace/utils";
import { range } from "lodash";
import { Role } from "@litespace/types/dist/esm/user";
import { IUser } from "@litespace/types";

describe(nameof(Tutors), () => {
  beforeEach(async () => {
    return await fixtures.flush();
  });

  describe("testing CRUD on tutors table", () => {
    it("should insert new tutor row", async () => {
      const user = await fixtures.user({ role: IUser.Role.Tutor });
      const tutor = await tutors.create(user.id);
      expect(dayjs.utc(tutor.createdAt).isValid()).to.be.true;
      expect(dayjs.utc(tutor.updatedAt).isValid()).to.be.true;
    });

    it("should retrieve tutor row from the database", async () => {
      const user = await fixtures.user({ role: IUser.Role.Tutor });
      await tutors.create(user.id);
      const foundTutor = await tutors.findById(user.id);
      expect(foundTutor?.name).to.eq(user.name);
    });

    it("should update tutor info in the database", async () => {
      const user = await fixtures.user({ role: IUser.Role.Tutor });
      await tutors.create(user.id);
      await tutors.update(user.id, { bio: "my new bio" });
      const foundTutor = await tutors.findById(user.id);
      expect(foundTutor?.bio).to.eq("my new bio");
    });

    it("should delete tutor from the database", async () => {
      const user = await fixtures.user({ role: IUser.Role.Tutor });
      await tutors.create(user.id);
      await tutors.delete(user.id);
      const foundTutor = await tutors.findById(user.id);
      expect(foundTutor).to.eq(null);
    });
  });

  describe(nameof(tutors.findUncontactedTutorsForStudent), () => {
    it("should retrieve tutors that a specific student hasn't opened a chat room with yet", async () => {
      const admin = await fixtures.user({ role: Role.SuperAdmin });
      const studio = await fixtures.user({ role: Role.Studio });
      const student = await fixtures.user({ role: Role.Student });

      const mockTutors = await Promise.all(
        range(0, 5).map(() =>
          fixtures.tutor(
            {
              bio: "empty",
              about: "empty",
              video: "./video.mp4",
              thumbnail: "./image.jpg",
              studioId: studio.id,
              activated: true,
              activatedBy: admin.id,
            },
            {
              image: "./photo.jpg",
              city: IUser.City.Giza,
              phone: "01143759540",
              verifiedEmail: true,
              verifiedPhone: true,
            }
          )
        )
      );

      await fixtures.room([student.id, mockTutors[0].id]);
      await fixtures.room([student.id, mockTutors[1].id]);

      const res = await tutors.findUncontactedTutorsForStudent({
        student: student.id,
      });
      expect(res.total).to.eq(3);
      expect(res.list).to.have.length(3);

      const ids = res.list.map((info) => info.id);
      expect(ids).to.have.members(mockTutors.slice(2).map((e) => e.id));
    });
  });

  describe(nameof(tutors.findStudioTutors), () => {
    it("should retrieve tutors that subscribed to a specific studioId", async () => {
      const studio1 = await fixtures.user({ role: Role.Studio });
      const studio2 = await fixtures.user({ role: Role.Studio });

      const tutorsSet1 = await Promise.all(
        range(0, 5).map(() => fixtures.tutor({ studioId: studio1.id }))
      );
      const tutorsSet2 = await Promise.all(
        range(0, 3).map(() => fixtures.tutor({ studioId: studio2.id }))
      );

      const res1 = await tutors.findStudioTutors({ studioId: studio1.id });
      expect(res1.total).to.eq(5);
      expect(res1.list.map((res) => res.id).sort()).to.deep.eq(
        tutorsSet1.map((tutor) => tutor.id).sort()
      );

      const res2 = await tutors.findStudioTutors({ studioId: studio2.id });
      expect(res2.total).to.eq(3);
      expect(res2.list.map((res) => res.id).sort()).to.deep.eq(
        tutorsSet2.map((tutor) => tutor.id).sort()
      );
    });
  });

  describe(nameof(tutors.findStudioTutor), () => {
    it("should retrieve tutors that subscribed to a specific studioId", async () => {
      const studio = await fixtures.user({ role: Role.Studio });
      const tutor = await fixtures.tutor({ studioId: studio.id });

      const res1 = await tutors.findStudioTutor(0);
      expect(res1).to.eq(null);

      const res2 = await tutors.findStudioTutor(tutor.id);
      expect(res2?.studioId).to.eq(studio.id);
    });
  });
});
