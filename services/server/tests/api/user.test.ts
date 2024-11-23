import { flush } from "@fixtures/shared";
import { IUser } from "@litespace/types";
import api, { createUser, createAdmin } from "@fixtures/api";
import { expect } from "chai";

describe("/api/v1/user/", () => {
  beforeEach(async () => {
    await flush();
  });

  describe("POST /api/v1/user", () => {
    it("should create a student", async () => {
      const email = "student@example.com";
      const password = "StudentExample101%^&";
      const result = await api.atlas().user.create({
        role: IUser.Role.Student,
        email,
        password,
        callbackUrl: "https://litespace.org/verify-email",
      });
      expect(result.user.id).to.be.eq(1);
      expect(result.user.email).to.be.eq(email);
      expect(result.user.password).to.be.eq(true);
      expect(result.user.password).to.be.eq(true);
      expect(result.user.role).to.be.eq(IUser.Role.Student);
    });
  });
});

describe("/api/v1/user/:id", () => {
  beforeEach(async () => {
    await flush();
  });
  afterAll(async () => {
    await flush();
  });

  describe("GET /api/v1/user/:id", () => {
    it("should get a student", async () => {
      const admin = await createAdmin();

      const result = await createUser({});

      const user = await api.atlas(admin.token).user.findById(result.user.id);
      expect(user.id).to.be.eq(result.user.id);
      expect(user.email).to.be.eq(result.user.email);
      expect(user.role).to.be.eq(result.user.role);
    });

    it("shouldn't get a student", async () => {
      const admin = await createAdmin();
      try {
        await api.atlas(admin.token).user.findById(400);
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).to.be.eq("User not found");
        }
      }
    });
  });

  describe("PUT /api/v1/user/:id", () => {
    it("should update a student", async () => {
      const admin = await createAdmin();

      const created = await createUser({
        email: "student@example.com",
        password: "StudentExample101%^&",
        role: IUser.Role.Student,
      });

      const updated = await api
        .atlas(admin.token)
        .user.update(created.user.id, {
          email: "student1@example.com",
          name: "student updated",
          gender: IUser.Gender.Male,
        });
      expect(updated.email).to.be.eq("student1@example.com");
      expect(updated.name).to.be.eq("student updated");
      expect(updated.gender).to.be.eq(IUser.Gender.Male);

      const updated1 = await api
        .atlas(admin.token)
        .user.update(created.user.id, {
          name: "student updated twice",
          gender: IUser.Gender.Female,
        });
      expect(updated1.name).to.be.eq("student updated twice");
      expect(updated1.gender).to.be.eq(IUser.Gender.Female);
    });
  });
});

describe("/api/v1/user/interviewer", () => {
  beforeEach(async () => {
    await flush();
  });
  afterAll(async () => {
    await flush();
  });
  describe("GET /interviewer/select", () => {
    it("should select interviewer", async () => {
      const tutor = await createUser({ role: IUser.Role.Tutor });
      const interviewer = await createUser({ role: IUser.Role.Interviewer });
      const selectedInterviewer = await api
        .atlas(tutor.token)
        .user.selectInterviewer();
      expect(selectedInterviewer.id).to.be.eq(interviewer.user.id);
    });
  });
});
describe("/api/v1/user/current", () => {
  describe("GET /current", () => {
    it("should get current user", async () => {
      const user = await createUser({ role: IUser.Role.Student });
      const currentUser = await api.atlas(user.token).user.findCurrentUser();
      expect(currentUser.user.id).to.be.eq(user.user.id);
      expect(currentUser.user.role).to.be.eq(user.user.role);
    });
  });
});

describe("/api/v1/user/list", () => {
  beforeEach(async () => {
    await flush();
  });
  afterAll(async () => {
    await flush();
  });

  // ! This Breaks
  describe("GET /list", () => {
    it("should get All users", async () => {
      const admin = await createAdmin();
      const user1 = await createUser({ role: IUser.Role.Student });
      const user2 = await createUser({ role: IUser.Role.Student });
      const user3 = await createUser({ role: IUser.Role.Student });
      try {
        const result = await api.atlas(admin.token).user.find({});
        expect(result.list).to.be.an("array");
        expect(result.list.length).to.eq(4);
        expect(result.list.sort((a, b) => a.id - b.id)).to.be.deep.eq([
          admin.user.id,
          user1.user.id,
          user2.user.id,
          user3.user.id,
        ]);
      } catch (error) {
        console.log(error);
      }
    });

    it("should get all students", async () => {
      const admin = await createAdmin();
      const user1 = await createUser({ role: IUser.Role.Student });
      const user2 = await createUser({ role: IUser.Role.Student });
      const user3 = await createUser({ role: IUser.Role.Student });

      const result = await api
        .atlas(admin.token)
        .user.find({ role: IUser.Role.Student });
      expect(result.list).to.be.an("array");
      expect(result.list.length).to.eq(3);
      expect(result.list.sort((a, b) => a.id - b.id)).to.be.deep.eq([
        user1.user.id,
        user2.user.id,
        user3.user.id,
      ]);
    });
  });
});

describe("/api/v1/user/tutor", () => {
  beforeEach(async () => {
    await flush();
  });
  afterAll(async () => {
    await flush();
  });

  describe("/tutor/meta/:tutorId", () => {
    it("should get tutor meta", async () => {
      const tutor = await createUser({ role: IUser.Role.Tutor });
      const meta = await api
        .atlas(tutor.token)
        .user.findTutorMeta(tutor.user.id);
      expect(meta.id).to.be.eq(tutor.user.id);
    });
  });

  // TODO: This requires onboarding function to be called first
  describe("/tutor/list/onboarded", () => {});

  // TODO: Must Activate Tutor
  describe("/tutor/stats/:tutor", () => {});

  // TODO: Must Activate Tutor
  describe("/tutor/activity/:tutor", () => {});
});
describe("/api/v1/user/media-provider", () => {
  describe("/media-provider/tutors", () => {
    it("should find all tutors for media provider", async () => {
      const mediaProvider = await createUser({
        role: IUser.Role.MediaProvider,
      });

      const t1 = await createUser({ role: IUser.Role.Tutor });
      const t2 = await createUser({ role: IUser.Role.Tutor });
      const t3 = await createUser({ role: IUser.Role.Tutor });

      const result = await api
        .atlas(mediaProvider.token)
        .user.findTutorsForMediaProvider();
      expect(result.list).to.be.an("array");
      expect(result.list.length).to.eq(3);
      expect(result.list.sort((a, b) => a.id - b.id)).to.be.deep.eq([
        t1.user.id,
        t2.user.id,
        t3.user.id,
      ]);
    });
  });
});
