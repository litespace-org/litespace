import { tutors, Tutors } from "@/tutors";
import { users } from "@/users";
import { faker } from "@faker-js/faker/locale/ar";
import fixtures from "@fixtures/db";
import { expect } from "chai";
import { dayjs, nameof } from "@litespace/sol";
import { IUser } from "@litespace/types";
import { first } from "lodash";
import { Role } from "@litespace/types/dist/esm/user";
import { lessons } from "@/lessons";

const mockUser = {
  id: 0,
  name: faker.person.fullName(),
  bio: faker.person.bio(),
  role: IUser.Role.Tutor,
  email: faker.internet.email(),
  password: "password",
  birthYear: 2001,
  gender: IUser.Gender.Male,
}

describe(nameof(Tutors), () => {
  beforeAll(async () => {
    return await fixtures.flush();
  })

  describe("testing CRUD on tutors table", () => {
    it("should insert new tutor row", async () => {
      const newUser = await users.create(mockUser);
      mockUser.id = newUser.id; // used in subsequent tests
      const newTutor = await tutors.create(newUser.id);
      expect(dayjs.utc(newTutor.createdAt).isValid()).to.be.true;
      expect(dayjs.utc(newTutor.updatedAt).isValid()).to.be.true;
    })

    it("should retrieve tutor row from the database", async () => {
      const foundTutor = await tutors.findById(mockUser.id);
      expect(foundTutor?.name).to.eq(mockUser.name);
    })

    it("should update tutor info in the database", async () => {
      await tutors.update(mockUser.id, { bio: "my new bio" });
      const foundTutor = await tutors.findById(mockUser.id);
      expect(foundTutor?.bio).to.eq("my new bio");
    })

    it("should delete tutor from the database", async () => {
      await tutors.delete(mockUser.id);
      const foundTutor = await tutors.findById(mockUser.id);
      expect(foundTutor).to.eq(null);
    })
  })

  describe(nameof(tutors.findOnboardedTutors), () => {
    it("should retrieve onboarded (activated) tutors", async () => {
      const adminUser = await fixtures.user({ role: Role.SuperAdmin });
      
      const tutor = await fixtures.tutor();
      await users.update(tutor.id, { 
        verified: true, 
        // NOTE: image is not in tutors table.
        image: "/image.jpg",
      });
      await tutors.update(
        tutor.id,
        {
          about: faker.lorem.paragraphs(),
          bio: faker.person.bio(),
          activated: true,
          activatedBy: adminUser.id,
          video: "/video.mp4",
          notice: 10,
        }
      );

      const onboardedTutors = await tutors.findOnboardedTutors();
      expect(first(onboardedTutors)?.id).to.eq(tutor.id);
    })
  })
});

