import { ITutor, IUser } from "@litespace/types";
import { Api } from "@fixtures/api";
import db, { faker } from "@fixtures/db";
import { expect } from "chai";
import { mockApi } from "@fixtures/mockApi";
import { safe } from "@litespace/utils/error";
import { cacheTutors } from "@/lib/tutor";
import dayjs from "@/lib/dayjs";
import { cache } from "@/lib/cache";
import { tutors, users } from "@litespace/models";
import { Role } from "@litespace/types/dist/esm/user";
import { first, range } from "lodash";
import { forbidden, notfound } from "@/lib/error";
import handlers from "@/handlers/user";

const createUser = mockApi<IUser.CreateApiPayload>(handlers.create);
const findPersonalizedStudentStats = mockApi(
  handlers.findPersonalizedStudentStats
);

const findStudioTutor = mockApi(handlers.findStudioTutor);

const findStudioTutors = mockApi(handlers.findStudioTutors);

describe("/api/v1/user/", () => {
  beforeEach(async () => {
    await db.flush();
  });

  describe("POST /api/v1/user", () => {
    it("should create a student", async () => {
      const email = "student@example.com";
      const password = "StudentExample101%^&";
      const { body } = await createUser<IUser.LoginApiResponse>({
        body: {
          role: IUser.Role.Student,
          email,
          password,
          callbackUrl: "https://litespace.org/verify-email",
        },
      });
      expect(body?.user.email).to.be.eq(email);
      expect(body?.user.password).to.be.eq(true);
      expect(body?.user.password).to.be.eq(true);
      expect(body?.user.role).to.be.eq(IUser.Role.Student);
    });
  });

  describe.skip("/api/v1/user/:id", () => {
    describe("GET /api/v1/user/:id", () => {
      it("should be able to find a user by id", async () => {
        const adminApi = await Api.forSuperAdmin();
        const dbUser = await db.user();
        const user = await adminApi.atlas.user.findById(dbUser.id);
        expect(user.id).to.be.eq(dbUser.id);
        expect(user.email).to.be.eq(dbUser.email);
        expect(user.role).to.be.eq(dbUser.role);
      });

      it("should response with 404 incase user is not found", async () => {
        const adminApi = await Api.forSuperAdmin();
        const result = await safe(async () =>
          adminApi.atlas.user.findById(100)
        );
        expect(result).to.be.deep.eq(new Error("User not found"));
      });
    });

    describe("PUT /api/v1/user/:id", () => {
      it("should update a user", async () => {
        const userApi = await Api.forStudent();
        const u0 = await userApi.atlas.user.findCurrentUser();
        await userApi.atlas.user.update(u0.user.id, {
          name: "updated-1",
        });
        const u1 = await userApi.atlas.user.findCurrentUser();
        await userApi.atlas.user.update(u0.user.id, {
          name: "updated-2",
        });
        const u2 = await userApi.atlas.user.findCurrentUser();
        expect(u1.user.name).to.be.eq("updated-1");
        expect(u2.user.name).to.be.eq("updated-2");
      });
    });

    describe("GET /api/v1/user/tutor/list/onboarded", () => {
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

      it("should successfully load onboard tutors from db to cache", async () => {
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
          notice: 10,
        });

        await cacheTutors();

        expect(await cache.tutors.exists()).to.eql(true);
        const ctutors = await cache.tutors.getAll();
        expect(ctutors).to.have.length(1);
      });

      it("should NOT load unverified tutors from db to cache", async () => {
        const newTutor = await db.tutor();
        await users.update(newTutor.id, {
          verifiedEmail: false,
          verifiedPhone: false,
        });

        await cacheTutors();

        expect(await cache.tutors.exists()).to.eql(false);
      });

      it("should retrieve onboard tutors data from the cache with HTTP request", async () => {
        const newUser = await db.user({ role: Role.SuperAdmin });
        const newTutor = await db.tutor();

        const mockData = {
          about: faker.lorem.paragraphs(),
          bio: faker.person.bio(),
          activated: true,
          activatedBy: newUser.id,
          video: "/video.mp4",
          notice: 10,
        };

        await users.update(newTutor.id, {
          verifiedEmail: true,
          verifiedPhone: true,
          // NOTE: image is not in tutors table.
          image: "/image.jpg",
        });
        await tutors.update(newTutor.id, mockData);

        const studentApi = await Api.forStudent();
        const res = await studentApi.atlas.user.findOnboardedTutors();

        expect(res.total).to.eq(1);
      });

      it("should load onboard tutors data from db to cache on first HTTP request", async () => {
        const newUser = await db.user({ role: Role.SuperAdmin });
        const newTutor = await db.tutor();

        const mockData = {
          about: faker.lorem.paragraphs(),
          bio: faker.person.bio(),
          activated: true,
          activatedBy: newUser.id,
          video: "/video.mp4",
          notice: 10,
        };

        await users.update(newTutor.id, {
          verifiedEmail: true,
          verifiedPhone: true,
          // NOTE: image is not in tutors table.
          image: "/image.jpg",
        });
        await tutors.update(newTutor.id, mockData);

        expect(await cache.tutors.exists()).to.eql(false);

        const studentApi = await Api.forStudent();
        await studentApi.atlas.user.findOnboardedTutors();

        const ctutors = await cache.tutors.getAll();
        expect(await cache.tutors.exists()).to.eql(true);
        expect(first(ctutors)?.id).to.eql(newTutor.id);
      });

      it("should retrieve onboard tutors data ordered/searched by name and topic", async () => {
        const newUser = await db.user({ role: Role.SuperAdmin });

        const mockData = [
          {
            name: "Mohamed",
            about: faker.lorem.paragraphs(),
            bio: faker.person.bio(),
            activated: true,
            activatedBy: newUser.id,
            video: "/video1.mp4",
            notice: 7,
          },
          {
            name: "Ahmed",
            about: faker.lorem.paragraphs(),
            bio: faker.person.bio(),
            activated: true,
            activatedBy: newUser.id,
            video: "/video2.mp4",
            notice: 12,
          },
          {
            name: "Mostafa",
            about: faker.lorem.paragraphs(),
            bio: faker.person.bio(),
            activated: true,
            activatedBy: newUser.id,
            video: "/video3.mp4",
            notice: 14,
          },
          {
            name: "Mahmoud",
            about: faker.lorem.paragraphs(),
            bio: faker.person.bio(),
            activated: true,
            activatedBy: newUser.id,
            video: "/video4.mp4",
            notice: 7,
          },
        ];

        for (const data of mockData) {
          const newTutor = await db.tutor({ name: data.name });
          await users.update(newTutor.id, {
            verifiedEmail: true,
            verifiedPhone: true,
            image: "/image.jpg",
          });
          await tutors.update(newTutor.id, data);
        }

        const studentApi = await Api.forStudent();
        const res = await studentApi.atlas.user.findOnboardedTutors({
          search: "mos",
        });

        expect(res.total).to.eq(1);
        expect(mockData[2].name).to.deep.eq(res.list[0].name);
      });

      // There was a bug in which every user update request stores tutor info in the cache
      it("should NOT add (non-onboard) tutor data to cache on every update HTTP request", async () => {
        const tutorApi = await Api.forTutor();
        const newTutor = await db.tutor();
        // any dump update
        await tutorApi.atlas.user.update(newTutor.id, { bio: "my new bio" });
        expect(await cache.tutors.exists()).to.eql(false);
      });
    });
  });

  describe.skip("GET /api/v1/user/tutor/list/uncontacted", () => {
    beforeEach(async () => {
      await db.flush();
    });

    it("should successfully retrieve list of tutors with which the student has not chat room yet.", async () => {
      const studentApi = await Api.forStudent();
      const student = (await studentApi.findCurrentUser()).user;

      const mockTutors = await Promise.all(range(0, 5).map(() => db.tutor()));

      await db.room([student.id, mockTutors[0].id]);
      await db.room([student.id, mockTutors[1].id]);

      const res = await studentApi.atlas.user.findUncontactedTutors();

      expect(res.total).to.eq(3);
      expect(res.list).to.have.length(3);
    });

    it("should respond with forbidden in case the requester is not a student.", async () => {
      const tutorApi = await Api.forTutor();
      const res = await safe(async () =>
        tutorApi.atlas.user.findUncontactedTutors()
      );
      expect(res).to.deep.eq(forbidden());
    });
  });

  describe.skip("/api/v1/user/tutor/info/:tutorId", () => {
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

    it("should retrieve tutor info successfully", async () => {
      const newUser = await db.user({ role: Role.SuperAdmin });
      const newTutor = await db.tutor();

      const mockData = {
        about: faker.lorem.paragraphs(),
        bio: faker.person.bio(),
        activated: true,
        activatedBy: newUser.id,
        video: "/video.mp4",
        notice: 10,
      };

      await users.update(newTutor.id, {
        verifiedEmail: true,
        verifiedPhone: true,
        // NOTE: image is not in tutors table.
        image: "/image.jpg",
        phone: "01012345678",
      });
      await tutors.update(newTutor.id, mockData);

      const studentApi = await Api.forStudent();
      const res = await studentApi.atlas.user.findTutorInfo(newTutor.id);

      expect(res.id).to.eq(newTutor.id);
    });

    it("should retrieve tutor info from db, in case it's not in the cache, and then save it in the cache.", async () => {
      expect(await cache.tutors.exists()).to.eq(false);

      const newUser = await db.user({ role: Role.SuperAdmin });
      const newTutor = await db.tutor();

      const mockData = {
        about: faker.lorem.paragraphs(),
        bio: faker.person.bio(),
        activated: true,
        activatedBy: newUser.id,
        video: "/video.mp4",
        notice: 10,
      };

      await users.update(newTutor.id, {
        verifiedEmail: true,
        verifiedPhone: true,
        // NOTE: image is not in tutors table.
        image: "/image.jpg",
        phone: "01012345678",
      });
      await tutors.update(newTutor.id, mockData);

      const studentApi = await Api.forStudent();
      // this shall save tutor in cache if not found
      const res = await studentApi.atlas.user.findTutorInfo(newTutor.id);

      // ensure data is saved and can be retrieved from the cache
      expect(await cache.tutors.exists()).to.eq(true);
      expect(first(await cache.tutors.getAll())?.id).to.eq(res.id);
    });

    it("should response with 404 in case tutor is not onboard", async () => {
      const newTutor = await db.tutor();

      const studentApi = await Api.forStudent();
      const res = await safe(async () =>
        studentApi.atlas.user.findTutorInfo(newTutor.id)
      );

      expect(res).to.be.deep.eq(notfound.tutor());
    });
  });

  describe.skip("GET /api/v1/user/tutor/stats/personalized", () => {
    beforeEach(async () => {
      await db.flush();
    });

    it("should retrieve tutor stats by current logged-in user id.", async () => {
      const tutorApi = await Api.forTutor();
      const tutor = await tutorApi.findCurrentUser();

      // make the tutor onboard
      await tutors.update(tutor.user.id, {
        about: faker.lorem.paragraphs(),
        bio: faker.person.bio(),
        activated: true,
        activatedBy: tutor.user.id,
        video: "/video.mp4",
        notice: 10,
      });
      await users.update(tutor.user.id, {
        verifiedEmail: true,
        verifiedPhone: true,
        image: "/image.jpg",
        gender: IUser.Gender.Female,
        name: "Sara",
        phone: "01112223334",
      });

      // defining slots
      const slot1 = await db.slot({
        userId: tutor.user.id,
        start: dayjs.utc().subtract(2, "days").toISOString(),
      });
      const slot2 = await db.slot({
        userId: tutor.user.id,
        start: dayjs.utc().add(2, "days").toISOString(),
      });
      const slot3 = await db.slot({
        userId: tutor.user.id,
        start: dayjs.utc().add(3, "days").toISOString(),
      });

      // inserting lessons
      const students = await db.students(3);

      const { lesson: lesson1 } = await db.lesson({
        tutor: tutor.user.id,
        student: students[0].id,
        slot: slot1.id,
        start: slot1.start,
      });

      await db.lesson({
        tutor: tutor.user.id,
        student: students[1].id,
        slot: slot2.id,
      });

      await db.lesson({
        tutor: tutor.user.id,
        student: students[2].id,
        slot: slot3.id,
        canceled: true, // should not be counted
      });

      const res = await tutorApi.atlas.user.findPersonalizedTutorStats();

      expect(res.studentCount).to.eq(2);
      expect(res.completedLessonCount).to.eq(1);
      expect(res.totalLessonCount).to.eq(2);
      expect(res.totalTutoringTime).to.eq(lesson1.duration);
    });

    it("should respond with forbidden if the user is not a tutor.", async () => {
      const studentApi = await Api.forStudent();
      const res = await safe(async () =>
        studentApi.atlas.user.findPersonalizedTutorStats()
      );
      expect(res).to.deep.eq(forbidden());
    });
  });

  describe("GET /api/v1/user/student/stats/personalized", () => {
    it("should retrieve student stats by current logged-in user id.", async () => {
      const student = await db.student();
      const tutor1 = await db.tutor();
      const tutor2 = await db.tutor();
      const tutor3 = await db.tutor();

      const slot1 = await db.slot({
        userId: student.id,
        start: dayjs.utc().subtract(2, "days").toISOString(),
      });
      const slot2 = await db.slot({
        userId: student.id,
        start: dayjs.utc().add(2, "days").toISOString(),
      });
      const slot3 = await db.slot({
        userId: student.id,
        start: dayjs.utc().add(3, "days").toISOString(),
      });

      const lesson1 = await db.lesson({
        student: student.id,
        tutor: tutor1.id,
        slot: slot1.id,
        start: slot1.start,
      });

      await db.lesson({
        student: student.id,
        tutor: tutor2.id,
        slot: slot2.id,
      });

      await db.lesson({
        student: student.id,
        tutor: tutor3.id,
        slot: slot3.id,
        canceled: true,
      });

      const { body } =
        await findPersonalizedStudentStats<IUser.FindPersonalizedStudentStatsApiResponse>(
          {
            user: student,
          }
        );

      expect(body?.tutorCount).to.eq(2);
      expect(body?.totalLearningTime).to.eq(lesson1.lesson.duration);
      expect(body?.completedLessonCount).to.eq(1);
      expect(body?.upcomingLessonCount).to.eq(1);
    });

    it("should respond with forbidden if the user is not a student.", async () => {
      const tutor = await db.user({ role: IUser.Role.Tutor });
      const res = await findPersonalizedStudentStats({ user: tutor });
      expect(res).to.deep.eq(forbidden());
    });
  });

  describe("GET /api/v1/user/tutor/:tutorId/for/:studioId", () => {
    it("should respond with forbidden if the user is neither admin nor studio.", async () => {
      const res = await findStudioTutor({
        query: {
          tutorId: 1,
          studioId: 1,
        },
        user: IUser.Role.Tutor,
      });
      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with forbidden if the studio doesn't have a permision to access the tutor data", async () => {
      const studio = await db.user({ role: IUser.Role.Studio });
      const res = await findStudioTutor({
        params: {
          tutorId: 1,
          studioId: studio.id + 1,
        },
        user: studio,
      });
      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with not found in case the tutorId is not associated to the passed studioId.", async () => {
      const studio = await db.user({ role: IUser.Role.Studio });
      const res = await findStudioTutor({
        params: {
          tutorId: 1,
          studioId: studio.id,
        },
        user: studio,
      });
      expect(res).to.deep.eq(notfound.tutor());
    });

    it("should respond with a list of the tutors associated to a specific studioId.", async () => {
      const superAdmin = await db.user({ role: IUser.Role.SuperAdmin });
      const admin = await db.user({ role: IUser.Role.RegularAdmin });

      const studio = await db.user({ role: IUser.Role.Studio });
      const tutor = await db.tutor({}, { studioId: studio.id });

      const res1 = await findStudioTutor({
        params: {
          tutorId: tutor.id,
          studioId: studio.id,
        },
        user: superAdmin,
      });

      const res2 = await findStudioTutor({
        params: {
          tutorId: tutor.id,
          studioId: studio.id,
        },
        user: admin,
      });

      const res3 = await findStudioTutor({
        params: {
          tutorId: tutor.id,
          studioId: studio.id,
        },
        user: studio,
      });

      expect(res1).to.not.be.instanceof(Error);
      expect(await res1.body).to.deep.eq(await res2.body);
      expect(await res2.body).to.deep.eq(await res3.body);
    });
  });

  describe("GET /api/v1/user/tutor/all/for/:studioId", () => {
    it("should respond with forbidden if the user is neither admin nor studio.", async () => {
      const res = await findStudioTutors({
        query: { studioId: 1 },
        user: IUser.Role.Tutor,
      });
      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with forbidden if the requester is studio its id != studioId.", async () => {
      const studio = await db.user({ role: IUser.Role.Studio });
      const res = await findStudioTutors({
        query: {
          studioId: studio.id + 1,
          pagination: {
            page: 1,
            size: 10,
          },
        },
        user: studio,
      });
      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with a list of the tutors associated to a specific studioId.", async () => {
      const superAdmin = await db.user({ role: IUser.Role.SuperAdmin });
      const admin = await db.user({ role: IUser.Role.RegularAdmin });

      const studio = await db.user({ role: IUser.Role.Studio });

      await db.tutor({}, { studioId: studio.id });
      await db.tutor({}, { studioId: studio.id });
      await db.tutor({}, { studioId: studio.id });

      const res1 = await findStudioTutors({
        query: {
          studioId: studio.id,
          pagination: {
            page: 1,
            size: 10,
          },
        },
        user: superAdmin,
      });

      const res2 = await findStudioTutors({
        query: {
          studioId: studio.id,
          pagination: {
            page: 1,
            size: 10,
          },
        },
        user: admin,
      });

      const res3 = await findStudioTutors({
        query: {
          studioId: studio.id,
          pagination: {
            page: 1,
            size: 10,
          },
        },
        user: studio,
      });

      expect(res1).to.not.be.instanceof(Error);
      const res1Body = res1.body as ITutor.FindStudioTutorsApiResponse;
      expect(res1Body.list).to.have.length(3);

      expect(await res1.body).to.deep.eq(await res2.body);
      expect(await res2.body).to.deep.eq(await res3.body);
    });
  });
});
