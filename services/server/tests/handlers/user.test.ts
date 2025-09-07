import { ITutor, IUser } from "@litespace/types";
import { Api } from "@fixtures/api";
import db, { faker, lesson } from "@fixtures/db";
import { expect } from "chai";
import { mockApi, mockApiContext } from "@fixtures/mockApi";
import { safe } from "@litespace/utils/error";
import { cacheTutors } from "@/lib/tutor";
import dayjs from "@/lib/dayjs";
import { cache } from "@/lib/cache";
import { tutors, users } from "@litespace/models";
import { first, range } from "lodash";
import { bad, forbidden, notfound } from "@/lib/error";
import handlers from "@/handlers/user";
import { nameof } from "@litespace/utils";

const createUser = mockApi<
  IUser.CreateApiPayload,
  void,
  void,
  IUser.LoginApiResponse
>(handlers.create);

const updateUser = mockApi<
  IUser.UpdateApiPayload & ITutor.UpdateApiPayload,
  { id: number },
  void,
  IUser.UpdateUserApiResponse
>(handlers.update(mockApiContext()));

const findPersonalizedStudentStats = mockApi<
  void,
  void,
  void,
  IUser.FindPersonalizedStudentStatsApiResponse
>(handlers.findPersonalizedStudentStats);

const findStudios = mockApi(handlers.findStudios);

const findStudioTutor = mockApi(handlers.findStudioTutor);

const findStudioTutors = mockApi(handlers.findStudioTutors);

const findOnboardedTutors = mockApi<
  object,
  object,
  object,
  ITutor.FindOnboardedTutorsApiResponse
>(handlers.findOnboardedTutors);

const findFullTutors = mockApi<
  void,
  void,
  ITutor.FindFullTutorsApiQuery,
  ITutor.FindFullTutorsApiResponse
>(handlers.findFullTutors);

const findTutoringMinutes = mockApi<
  void,
  void,
  ITutor.FindTutoringMinutesApiQuery,
  ITutor.FindTutoringMinutesApiResponse
>(handlers.findTutoringMinutes);

describe("/api/v1/user/", () => {
  beforeEach(async () => {
    await cache.flush();
    await db.flush();
  });

  beforeAll(async () => {
    await cache.connect();
  });

  afterAll(async () => {
    await cache.disconnect();
  });

  describe("POST /api/v1/user", () => {
    it("should create a student", async () => {
      const email = "student@example.com";
      const password = "StudentExample101%^&";
      const { body } = await createUser({
        body: {
          role: IUser.Role.Student,
          email,
          password,
        },
      });
      expect(body?.user.email).to.be.eq(email);
      expect(body?.user.password).to.be.eq(true);
      expect(body?.user.password).to.be.eq(true);
      expect(body?.user.role).to.be.eq(IUser.Role.Student);
    });
  });

  describe(nameof(updateUser), () => {
    it("should respond with forbidden in case a non-admin user tries to update a tutor's onboarding flag", async () => {
      const tutor = await db.tutorUser();
      const res = await updateUser({
        user: tutor,
        params: { id: tutor.id },
        body: { bypassOnboarding: true },
      });
      expect(res).to.deep.eq(forbidden());
    });

    it("should successfully update tutor onboarding flag", async () => {
      const admin = await db.user({ role: IUser.Role.RegularAdmin });
      const tutor = await db.tutor();
      expect(tutor.bypassOnboarding).to.be.false;

      const res = await updateUser({
        user: admin,
        params: { id: tutor.id },
        body: { bypassOnboarding: true },
      });
      expect(res).to.not.be.instanceof(Error);

      const updated = await tutors.findById(tutor.id);
      expect(updated?.bypassOnboarding).to.be.true;
    });

    // it("should respond with Error when trying to update notification method with unverified phone", async () => {
    //   const user = await db.user({
    //     verifiedPhone: false,
    //     role: IUser.Role.Student,
    //   });
    //   const res = await updateUser({
    //     user,
    //     params: { id: user.id },
    //     body: { notificationMethod: IUser.NotificationMethod.Whatsapp },
    //   });
    //   expect(res).to.deep.eq(unverifiedPhone());
    // });
  });

  describe("GET /api/v1/user/tutor/list/onboarded", () => {
    it("should retrieve a list of onboarded tutors with the tutor managers at the top for unsubscribed users", async () => {
      const student = await db.student();

      await Promise.all([
        db.onboardedTutor(),
        db.onboardedTutorManager(),
        db.onboardedTutor(),
        db.onboardedTutorManager(),
        db.onboardedTutor(),
      ]);

      const res = await findOnboardedTutors({ user: student });
      expect(res.body?.total).to.eq(5);
      expect(res.body?.list[0].role).to.eq(IUser.Role.TutorManager);
      expect(res.body?.list[1].role).to.eq(IUser.Role.TutorManager);
    });

    it("should retrieve a list of onboarded tutors with the regular tutors at the top for subscribed users", async () => {
      const student = await db.student();
      await db.validSubscription(student.id);

      await Promise.all([
        db.onboardedTutorManager(),
        db.onboardedTutor(),
        db.onboardedTutorManager(),
        db.onboardedTutor(),
        db.onboardedTutorManager(),
      ]);

      const res = await findOnboardedTutors({ user: student });
      expect(res.body?.total).to.eq(5);
      expect(res.body?.list[0].role).to.eq(IUser.Role.Tutor);
      expect(res.body?.list[1].role).to.eq(IUser.Role.Tutor);
    });
  });

  describe.skip("/api/v1/user/:id", () => {
    describe("GET /api/v1/user/:id", () => {
      it("should be able to find a user by id", async () => {
        const adminApi = await Api.forSuperAdmin();
        const dbUser = await db.user();
        const user = await adminApi.api.user.findById(dbUser.id);
        expect(user.id).to.be.eq(dbUser.id);
        expect(user.email).to.be.eq(dbUser.email);
        expect(user.role).to.be.eq(dbUser.role);
      });

      it("should response with 404 incase user is not found", async () => {
        const adminApi = await Api.forSuperAdmin();
        const result = await safe(async () => adminApi.api.user.findById(100));
        expect(result).to.be.deep.eq(new Error("User not found"));
      });
    });

    describe("GET /api/v1/user/tutor/list/onboarded", () => {
      it("should successfully load onboard tutors from db to cache", async () => {
        expect(await cache.tutors.exists()).to.eql(false);

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
          video: "/video.mp4",
          thumbnail: "/thumbnail.jpg",
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
        const newTutor = await db.tutor();

        const mockData = {
          about: faker.lorem.paragraphs(),
          bio: faker.person.bio(),
          activated: true,
          video: "/video.mp4",
          thumbnail: "/thumbnail.jpg",
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
        const res = await studentApi.api.user.findOnboardedTutors();

        expect(res.total).to.eq(1);
      });

      it("should load onboard tutors data from db to cache on first HTTP request", async () => {
        const newTutor = await db.tutor();

        const mockData = {
          about: faker.lorem.paragraphs(),
          bio: faker.person.bio(),
          activated: true,
          video: "/video.mp4",
          thumbnail: "/thumbnail.jpg",
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
        await studentApi.api.user.findOnboardedTutors();

        const ctutors = await cache.tutors.getAll();
        expect(await cache.tutors.exists()).to.eql(true);
        expect(first(ctutors)?.id).to.eql(newTutor.id);
      });

      it("should retrieve onboard tutors data ordered/searched by name and topic", async () => {
        const mockData = [
          {
            name: "Mohamed",
            about: faker.lorem.paragraphs(),
            bio: faker.person.bio(),
            activated: true,
            video: "/video1.mp4",
            thumbnail: "/thumbnail.jpg",
            notice: 7,
          },
          {
            name: "Ahmed",
            about: faker.lorem.paragraphs(),
            bio: faker.person.bio(),
            activated: true,
            video: "/video2.mp4",
            thumbnail: "/thumbnail.jpg",
            notice: 12,
          },
          {
            name: "Mostafa",
            about: faker.lorem.paragraphs(),
            bio: faker.person.bio(),
            activated: true,
            video: "/video3.mp4",
            thumbnail: "/thumbnail.jpg",
            notice: 14,
          },
          {
            name: "Mahmoud",
            about: faker.lorem.paragraphs(),
            bio: faker.person.bio(),
            activated: true,
            video: "/video4.mp4",
            thumbnail: "/thumbnail.jpg",
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
        const res = await studentApi.api.user.findOnboardedTutors({
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
        await tutorApi.api.user.update(newTutor.id, { bio: "my new bio" });
        expect(await cache.tutors.exists()).to.eql(false);
      });
    });
  });

  describe.skip("GET /api/v1/user/tutor/list/uncontacted", () => {
    it("should successfully retrieve list of tutors with which the student has not chat room yet.", async () => {
      const studentApi = await Api.forStudent();
      const student = await studentApi.findCurrentUser();

      const mockTutors = await Promise.all(range(0, 5).map(() => db.tutor()));

      await db.room([student.id, mockTutors[0].id]);
      await db.room([student.id, mockTutors[1].id]);

      const res = await studentApi.api.user.findUncontactedTutors();

      expect(res.total).to.eq(3);
      expect(res.list).to.have.length(3);
    });

    it("should respond with forbidden in case the requester is not a student.", async () => {
      const tutorApi = await Api.forTutor();
      const res = await safe(async () =>
        tutorApi.api.user.findUncontactedTutors()
      );
      expect(res).to.deep.eq(forbidden());
    });
  });

  describe.skip("/api/v1/user/tutor/info/:tutorId", () => {
    it("should retrieve tutor info successfully", async () => {
      const newTutor = await db.tutor();

      const mockData = {
        about: faker.lorem.paragraphs(),
        bio: faker.person.bio(),
        activated: true,
        video: "/video.mp4",
        thumbnail: "/thumbnail.jpg",
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
      const res = await studentApi.api.user.findTutorInfo(newTutor.id);

      expect(res.id).to.eq(newTutor.id);
    });

    it("should retrieve tutor info from db, in case it's not in the cache, and then save it in the cache.", async () => {
      expect(await cache.tutors.exists()).to.eq(false);

      const newTutor = await db.tutor();

      const mockData = {
        about: faker.lorem.paragraphs(),
        bio: faker.person.bio(),
        activated: true,
        video: "/video.mp4",
        thumbnail: "/thumbnail.jpg",
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
      const res = await studentApi.api.user.findTutorInfo(newTutor.id);

      // ensure data is saved and can be retrieved from the cache
      expect(await cache.tutors.exists()).to.eq(true);
      expect(first(await cache.tutors.getAll())?.id).to.eq(res.id);
    });

    it("should response with 404 in case tutor is not onboard", async () => {
      const newTutor = await db.tutor();

      const studentApi = await Api.forStudent();
      const res = await safe(async () =>
        studentApi.api.user.findTutorInfo(newTutor.id)
      );

      expect(res).to.be.deep.eq(notfound.tutor());
    });
  });

  describe.skip("GET /api/v1/user/tutor/stats/personalized", () => {
    it("should retrieve tutor stats by current logged-in user id.", async () => {
      const tutorApi = await Api.forTutor();
      const tutor = await tutorApi.findCurrentUser();

      // make the tutor onboard
      await tutors.update(tutor.id, {
        about: faker.lorem.paragraphs(),
        bio: faker.person.bio(),
        activated: true,
        video: "/video.mp4",
        thumbnail: "/thumbnail.jpg",
        notice: 10,
      });
      await users.update(tutor.id, {
        verifiedEmail: true,
        verifiedPhone: true,
        image: "/image.jpg",
        gender: IUser.Gender.Female,
        name: "Sara",
        phone: "01112223334",
      });

      // defining slots
      const slot1 = await db.slot({
        userId: tutor.id,
        start: dayjs.utc().subtract(2, "days").toISOString(),
      });
      const slot2 = await db.slot({
        userId: tutor.id,
        start: dayjs.utc().add(2, "days").toISOString(),
      });
      const slot3 = await db.slot({
        userId: tutor.id,
        start: dayjs.utc().add(3, "days").toISOString(),
      });

      // inserting lessons
      const students = await db.students(3);

      const { lesson: lesson1 } = await db.lesson({
        tutor: tutor.id,
        student: students[0].id,
        slot: slot1.id,
        start: slot1.start,
      });

      await db.lesson({
        tutor: tutor.id,
        student: students[1].id,
        slot: slot2.id,
      });

      await db.lesson({
        tutor: tutor.id,
        student: students[2].id,
        slot: slot3.id,
        canceled: true, // should not be counted
      });

      const res = await tutorApi.api.user.findPersonalizedTutorStats();

      expect(res.studentCount).to.eq(2);
      expect(res.completedLessonCount).to.eq(1);
      expect(res.totalLessonCount).to.eq(2);
      expect(res.totalTutoringTime).to.eq(lesson1.duration);
    });

    it("should respond with forbidden if the user is not a tutor.", async () => {
      const studentApi = await Api.forStudent();
      const res = await safe(async () =>
        studentApi.api.user.findPersonalizedTutorStats()
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

      const { body } = await findPersonalizedStudentStats({ user: student });
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
      const tutor = await db.tutor();
      const res = await findStudioTutor({
        params: {
          tutorId: tutor.id,
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

    it("should respond with a list of all tutors associated to any studioId.", async () => {
      const superAdmin = await db.user({ role: IUser.Role.SuperAdmin });

      const studio1 = await db.user({ role: IUser.Role.Studio });
      const studio2 = await db.user({ role: IUser.Role.Studio });

      await Promise.all([
        db.tutor({}, { studioId: studio1.id }),
        db.tutor({}, { studioId: studio1.id }),

        db.tutor({}, { studioId: studio2.id }),
        db.tutor({}, { studioId: studio2.id }),

        db.tutor({}),
        db.tutor({}),
      ]);

      const res = await findStudioTutors({
        query: {
          studioId: undefined,
          pagination: {
            page: 1,
            size: 10,
          },
        },
        user: superAdmin,
      });

      expect(res).to.not.be.instanceof(Error);
      const resBody = res.body as ITutor.FindStudioTutorsApiResponse;
      expect(resBody.list).to.have.length(6);
    });
  });

  describe("GET /api/v1/user/studios", () => {
    it("should retrieve all studios successfully", async () => {
      const admin = await db.user({ role: IUser.Role.RegularAdmin });

      await Promise.all([
        db.user({ role: IUser.Role.Studio }),
        db.user({ role: IUser.Role.Studio }),
        db.user({ role: IUser.Role.Studio }),

        db.user({ role: IUser.Role.Tutor }),
        db.user({ role: IUser.Role.Student }),
      ]);

      const res = await findStudios({
        query: {
          page: 1,
          size: 10,
        },
        user: admin,
      });

      expect(res).to.not.be.instanceof(Error);

      const resBody = res.body as IUser.FindStudiosApiResponse;
      expect(resBody.list).to.have.length(3);

      const sample = first(resBody.list) as IUser.Self;
      expect(sample.email).to.be.undefined;
      expect(sample.password).to.be.undefined;
      expect(sample.creditScore).to.be.undefined;
      expect(sample.phone).to.be.undefined;

      expect(sample.id).to.not.be.undefined;
      expect(sample.name).to.not.be.undefined;
      expect(sample.address).to.not.be.undefined;
      expect(sample.image).to.not.be.undefined;
    });
  });

  describe("GET /api/v1/user/tutor/fullTutors", () => {
    it("should retrieve all tutors", async () => {
      const admin = await db.user({ role: IUser.Role.RegularAdmin });

      await Promise.all([
        db.tutor(),
        db.tutor(),
        db.tutor(),
        db.tutor(),
        db.tutor(),
      ]);

      const res = await findFullTutors({
        query: {},
        user: admin,
      });

      expect(res).to.not.be.instanceof(Error);

      const resBody = res.body as ITutor.FindFullTutorsApiResponse;
      expect(resBody.list.length).to.be.eq(5);
    });

    it("should filter tutors succussfully based on string", async () => {
      const admin = await db.user({ role: IUser.Role.RegularAdmin });

      await Promise.all([
        db.tutor(),
        db.tutor({}, { bio: "Hello!" }),
        db.tutor(),
        db.tutor(),
        db.tutor(),
      ]);

      const res = await findFullTutors({
        query: {
          bio: "Hello",
        },
        user: admin,
      });

      expect(res).to.not.be.instanceof(Error);

      const resBody = res.body as ITutor.FindFullTutorsApiResponse;
      expect(resBody.list.length).to.be.eq(1);
    });

    it("should filter tutors succussfully based on numerical filtering", async () => {
      const admin = await db.user({ role: IUser.Role.RegularAdmin });

      await Promise.all([
        db.tutor({}, { notice: 30 }),
        db.tutor({}, { notice: 20 }),
        db.tutor({}, { notice: 15 }),
        db.tutor({}, { notice: 10 }),
      ]);

      const res1 = await findFullTutors({
        query: { notice: 20 },
        user: admin,
      });

      const resBody1 = res1.body;
      expect(resBody1?.list.length).to.be.eq(1);

      // get values larger and lower than certain limits
      const res2 = await findFullTutors({
        query: {
          notice: {
            gte: 15,
            lte: 20,
          },
        },
        user: admin,
      });

      expect(res2).to.not.be.instanceof(Error);

      const resBody2 = res2.body;
      expect(resBody2?.list.length).to.be.eq(2);

      // get values larger and lower than certain limits
      const res3 = await findFullTutors({
        query: {
          notice: {
            gt: 20,
          },
        },
        user: admin,
      });

      expect(res3).to.not.be.instanceof(Error);

      const resBody3 = res3.body as ITutor.FindFullTutorsApiResponse;

      expect(resBody3.list.length).to.be.eq(1);
    });

    it("should give error due to no admin previlage", async () => {
      await Promise.all([
        db.tutor(),
        db.tutor(),
        db.tutor(),
        db.tutor(),
        db.tutor(),
      ]);

      const res = await findFullTutors({
        query: {},
      });

      expect(res).to.be.instanceof(Error);
      expect(res).to.deep.eq(forbidden());
    });
  });
  describe("GET /api/v1/user/tutor/tutoring-minutes", () => {
    it("should return error due to not having admin privelages", async () => {
      const user = await db.user({ role: IUser.Role.Student });

      await Promise.all([
        lesson({
          timing: "past",
          canceled: false,
        }),
        lesson({
          timing: "past",
          canceled: false,
        }),
      ]);

      const response = await findTutoringMinutes({
        user,
      });
      expect(response).to.deep.eq(forbidden());
    });

    it("should return error due to invalid date range", async () => {
      const user = await db.user({ role: IUser.Role.RegularAdmin });

      await Promise.all([
        lesson({
          timing: "past",
          canceled: false,
        }),
        lesson({
          timing: "past",
          canceled: false,
        }),
      ]);

      const response = await findTutoringMinutes({
        user,
        query: {
          after: dayjs.utc().subtract(5, "day").toISOString(),
          before: dayjs.utc().subtract(8, "day").toISOString(),
        },
      });
      expect(response).to.deep.eq(bad());
    });

    it("should return empty array when no lessons exist", async () => {
      const adminUser = await db.user({ role: IUser.Role.RegularAdmin });

      const res = await findTutoringMinutes({
        user: adminUser,
        query: {},
      });

      expect(res.body).to.deep.eq([]);
    });

    it("should return empty array when no lessons exist in the timeframe", async () => {
      const adminUser = await db.user({ role: IUser.Role.RegularAdmin });
      const past = dayjs.utc().subtract(1, "day").toISOString();
      const tutor = await db.tutor();

      await Promise.all([
        lesson({
          tutor: tutor.id,
          duration: 15,
          start: past,
          canceled: false,
        }),
        lesson({
          tutor: tutor.id,
          duration: 15,
          start: past,
          canceled: false,
        }),
      ]);

      const res = await findTutoringMinutes({
        user: adminUser,
        query: {
          after: dayjs.utc().subtract(2, "h").toISOString(),
          before: dayjs.utc().toISOString(),
        },
      });

      expect(res.body).to.deep.eq([]);
    });

    it("should return aggregated tutoring minutes", async () => {
      const adminUser = await db.user({ role: IUser.Role.RegularAdmin });

      const past1 = dayjs.utc().subtract(1, "day").toISOString();
      const past2 = dayjs.utc().subtract(2, "day").toISOString();
      const past3 = dayjs.utc().subtract(3, "day").toISOString();
      const past4 = dayjs.utc().subtract(4, "day").toISOString();
      const past5 = dayjs.utc().subtract(5, "day").toISOString();

      const tutor1 = await db.tutor();
      const tutor2 = await db.tutor();
      const tutor3 = await db.tutor();

      const lessonsConfig = [
        // for the first tutor
        { tutor: tutor1.id, duration: 15, start: past1, canceled: false },
        { tutor: tutor1.id, duration: 15, start: past1, canceled: false },
        { tutor: tutor1.id, duration: 15, start: past2, canceled: false },
        { tutor: tutor1.id, duration: 15, start: past2, canceled: false },
        { tutor: tutor1.id, duration: 15, start: past3, canceled: false },
        { tutor: tutor1.id, duration: 15, start: past5, canceled: false },

        // for the second tutor
        { tutor: tutor2.id, duration: 15, start: past1, canceled: false },
        { tutor: tutor2.id, duration: 15, start: past1, canceled: false },
        { tutor: tutor2.id, duration: 15, start: past2, canceled: false },
        { tutor: tutor2.id, duration: 15, start: past3, canceled: false },
        { tutor: tutor2.id, duration: 15, start: past5, canceled: false },

        // for the third tutor
        { tutor: tutor3.id, duration: 15, start: past1, canceled: false },
        { tutor: tutor3.id, duration: 15, start: past2, canceled: false },
        { tutor: tutor3.id, duration: 15, start: past3, canceled: false },
        { tutor: tutor3.id, duration: 15, start: past5, canceled: false },
      ];

      for (const l of lessonsConfig) {
        await lesson(l);
      }

      const expectedResult = [
        {
          tutorId: tutor1.id,
          tutoringMinutes: 75,
        },
        {
          tutorId: tutor2.id,
          tutoringMinutes: 60,
        },
        {
          tutorId: tutor3.id,
          tutoringMinutes: 45,
        },
      ];

      // we call the handler directly
      const res = await findTutoringMinutes({
        user: adminUser,
        query: {
          before: dayjs.utc().toISOString(),
          after: past4,
        },
      });

      expect(res.body).to.deep.eq(expectedResult);
    });

    it("should return aggregated tutoring minutes, but not include canceled", async () => {
      const adminUser = await db.user({ role: IUser.Role.RegularAdmin });

      const past1 = dayjs.utc().subtract(1, "day").toISOString();
      const past2 = dayjs.utc().subtract(2, "day").toISOString();
      const past3 = dayjs.utc().subtract(3, "day").toISOString();
      const past4 = dayjs.utc().subtract(4, "day").toISOString();
      const past5 = dayjs.utc().subtract(5, "day").toISOString();

      const tutor1 = await db.tutor();
      const tutor2 = await db.tutor();
      const tutor3 = await db.tutor();

      const lessonsConfig = [
        // for the first tutor
        { tutor: tutor1.id, duration: 15, start: past1, canceled: false },
        { tutor: tutor1.id, duration: 15, start: past1, canceled: false },
        { tutor: tutor1.id, duration: 15, start: past2, canceled: true },
        { tutor: tutor1.id, duration: 15, start: past2, canceled: false },
        { tutor: tutor1.id, duration: 15, start: past3, canceled: false },
        { tutor: tutor1.id, duration: 15, start: past5, canceled: false },

        // for the second tutor
        { tutor: tutor2.id, duration: 15, start: past1, canceled: false },
        { tutor: tutor2.id, duration: 15, start: past1, canceled: true },
        { tutor: tutor2.id, duration: 15, start: past2, canceled: false },
        { tutor: tutor2.id, duration: 15, start: past3, canceled: false },
        { tutor: tutor2.id, duration: 15, start: past5, canceled: false },

        // for the third tutor
        { tutor: tutor3.id, duration: 15, start: past1, canceled: false },
        { tutor: tutor3.id, duration: 15, start: past2, canceled: true },
        { tutor: tutor3.id, duration: 15, start: past3, canceled: false },
        { tutor: tutor3.id, duration: 15, start: past5, canceled: false },
      ];

      for (const l of lessonsConfig) {
        await lesson(l);
      }

      const expectedResult = [
        {
          tutorId: tutor1.id,
          tutoringMinutes: 60,
        },
        {
          tutorId: tutor2.id,
          tutoringMinutes: 45,
        },
        {
          tutorId: tutor3.id,
          tutoringMinutes: 30,
        },
      ];

      // we call the handler directly
      const res = await findTutoringMinutes({
        user: adminUser,
        query: {
          before: dayjs.utc().toISOString(),
          after: past4,
        },
      });

      expect(res.body).to.deep.eq(expectedResult);
    });
  });
});
