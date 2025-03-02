import { tutors, Tutors } from "@/tutors";
import { users } from "@/users";
import { faker } from "@faker-js/faker/locale/ar";
import fixtures from "@fixtures/db";
import { expect } from "chai";
import { dayjs, nameof } from "@litespace/utils";
import { IUser } from "@litespace/types";
import { first, range } from "lodash";
import { Role } from "@litespace/types/dist/esm/user";

const mockUser = {
  id: 0,
  name: faker.person.fullName(),
  bio: faker.person.bio(),
  role: IUser.Role.Tutor,
  email: faker.internet.email(),
  password: "password",
  birthYear: 2001,
  gender: IUser.Gender.Male,
};

describe(nameof(Tutors), () => {
  describe("testing CRUD on tutors table", () => {
    it("should insert new tutor row", async () => {
      const newUser = await users.create(mockUser);
      mockUser.id = newUser.id; // used in subsequent tests
      const newTutor = await tutors.create(newUser.id);
      expect(dayjs.utc(newTutor.createdAt).isValid()).to.be.true;
      expect(dayjs.utc(newTutor.updatedAt).isValid()).to.be.true;
    });

    it("should retrieve tutor row from the database", async () => {
      const foundTutor = await tutors.findById(mockUser.id);
      expect(foundTutor?.name).to.eq(mockUser.name);
    });

    it("should update tutor info in the database", async () => {
      await tutors.update(mockUser.id, { bio: "my new bio" });
      const foundTutor = await tutors.findById(mockUser.id);
      expect(foundTutor?.bio).to.eq("my new bio");
    });

    it("should delete tutor from the database", async () => {
      await tutors.delete(mockUser.id);
      const foundTutor = await tutors.findById(mockUser.id);
      expect(foundTutor).to.eq(null);
    });
  });

  describe(nameof(tutors.findOnboardedTutors), () => {
    beforeEach(async () => {
      return await fixtures.flush();
    });

    it("should retrieve onboarded (activated) tutors", async () => {
      const adminUser = await fixtures.user({ role: Role.SuperAdmin });

      const tutor = await fixtures.tutor();
      await users.update(tutor.id, {
        verified: true,
        // NOTE: image is not in tutors table.
        image: "/image.jpg",
      });
      await tutors.update(tutor.id, {
        about: faker.lorem.paragraphs(),
        bio: faker.person.bio(),
        activated: true,
        activatedBy: adminUser.id,
        video: "/video.mp4",
        notice: 10,
      });

      const onboardedTutors = await tutors.findOnboardedTutors();
      expect(first(onboardedTutors)?.id).to.eq(tutor.id);
    });
  });

  describe(nameof(tutors.findUncontactedTutorsForStudent), () => {
    beforeEach(async () => {
      return await fixtures.flush();
    });

    it("should retrieve tutors that a specific student hasn't open a chat room with yet", async () => {
      const student = await fixtures.user({ role: Role.Student });

      const mockTutors = await Promise.all(
        range(0, 5).map(() => fixtures.tutor())
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

  describe(nameof(tutors.findForStudio), () => {
    beforeEach(async () => {
      return await fixtures.flush();
    });

    it("should retrieve tutors that subscribed to a specific studioId", async () => {
      const studio1 = await fixtures.user({ role: Role.Studio });
      const studio2 = await fixtures.user({ role: Role.Studio });

      const mockTutors1 = await Promise.all(
        range(0, 5).map(() => fixtures.tutor({ studioId: studio1.id }))
      );
      const mockTutors2 = await Promise.all(
        range(0, 3).map(() => fixtures.tutor({ studioId: studio2.id }))
      );

      const all = await tutors.find();
      expect(all.length).to.eq(8);

      const res1 = await tutors.findForStudio({ studioId: studio1.id });
      expect(res1.total).to.eq(5);
      expect(res1.list.map((res) => res.id).sort()).to.deep.eq(
        mockTutors1.map((tutor) => tutor.id).sort()
      );

      const res2 = await tutors.findForStudio({ studioId: studio2.id });
      expect(res2.total).to.eq(3);
      expect(res2.list.map((res) => res.id).sort()).to.deep.eq(
        mockTutors2.map((tutor) => tutor.id).sort()
      );

      const res3 = await tutors.findForStudio({
        studioId: studio1.id,
        filter: { id: mockTutors1[3].id },
      });
      expect(res3.total).to.eq(1);
      expect(first(res3.list)?.id).to.eq(mockTutors1[3].id);
    });
  });
});
