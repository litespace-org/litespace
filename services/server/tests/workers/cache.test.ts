import db, { faker } from "@fixtures/db";
import { expect } from "chai";
import { cache } from "@/lib/cache";
import { tutors, users } from "@litespace/models";
import { Role } from "@litespace/types/dist/esm/user";
import { nameof } from "@litespace/utils";
import { updateTutorCache } from "@/workers/functions";
import { sendBackgroundMessage } from "@/workers";

function wait(seconds: number) {
  return new Promise((resolve) =>
    setTimeout(() => resolve(seconds), seconds * 1000)
  );
}

describe("updating the cache with background workers", () => {
  beforeAll(async () => {
    await cache.connect();
  });

  afterAll(async () => {
    await cache.disconnect();
  });

  beforeEach(async () => {
    await db.flush();
    await cache.flush();
  });

  describe.skip(nameof(updateTutorCache), () => {
    it("should update the cache data when onboard tutor data is updated", async () => {
      expect(await cache.tutors.exists()).to.eql(false);

      const newUser = await db.user({ role: Role.SuperAdmin });
      const newTutor = await db.tutor();

      await users.update(newTutor.id, {
        verifiedEmail: true,
        verifiedPhone: true,
        image: "/image.jpg",
        phone: "01012345678",
      });
      await tutors.update(newTutor.id, {
        about: faker.lorem.paragraphs(),
        bio: faker.person.bio(),
        activated: true,
        activatedBy: newUser.id,
        video: "/video.mp4",
        thumbnail: "/thumbnail.jpg",
        notice: 10,
      });

      sendBackgroundMessage({
        type: "update-tutor-in-cache",
        payload: { tutorId: newTutor.id },
      });

      await wait(4);

      expect(await cache.tutors.exists()).to.eql(true);
      const ctutors = await cache.tutors.getAll();
      expect(ctutors).to.have.length(1);
    });
  });
});
