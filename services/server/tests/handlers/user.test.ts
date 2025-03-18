import { ITutor, IUser } from "@litespace/types";
import db, { faker } from "@fixtures/db";
import { expect } from "chai";
import { mockApi } from "@fixtures/mockApi";
import { cacheTutors } from "@/lib/tutor";
import dayjs from "@/lib/dayjs";
import { cache } from "@/lib/cache";
import { tutors, users } from "@litespace/models";
import { Role } from "@litespace/types/dist/esm/user";
import { first, range } from "lodash";
import { forbidden, notfound } from "@/lib/error";
import handlers from "@/handlers/user";
import { Readable } from "stream";

const createUser = mockApi<IUser.CreateApiPayload>(handlers.create);
const findPersonalizedStudentStats = mockApi(
  handlers.findPersonalizedStudentStats
);

const findStudios = mockApi(handlers.findStudios);
const findById = mockApi(handlers.findById);
const findOnboardedTutors = mockApi(handlers.findOnboardedTutors);
const findUncontactedTutors = mockApi(handlers.findUncontactedTutors);
const findTutorInfo = mockApi(handlers.findTutorInfo);
const findPersonalizedTutorStats = mockApi(handlers.findPersonalizedTutorStats);

const findStudioTutor = mockApi(handlers.findStudioTutor);
const findStudioTutors = mockApi(handlers.findStudioTutors);

const update = mockApi(handlers.update);
const uploadUserImage = mockApi(handlers.uploadUserImage);
const uploadTutorAssets = mockApi(handlers.uploadTutorAssets);

const getMockFile = (): Express.Multer.File => ({
  filename: "mockfile",
  fieldname: "mockfield",
  originalname: "mockname",
  encoding: "testing",
  mimetype: "testing",
  size: 1,
  stream: new Readable(),
  destination: "empty",
  path: "/tmp",
  buffer: Buffer.from(new ArrayBuffer()),
});

describe("/api/v1/user/", () => {
  beforeAll(async () => {
    await cache.connect();
  });

  afterAll(async () => {
    await cache.disconnect();
  });

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

  describe("/api/v1/user/:id", () => {
    describe("GET /api/v1/user/:id", () => {
      it("should be able to find a user by id", async () => {
        const admin = await db.user({ role: IUser.Role.SuperAdmin });
        const dbUser = await db.user();

        const res = await findById({
          params: { id: dbUser.id },
          user: admin,
        });
        const user = res.body as IUser.Self;

        expect(user.id).to.be.eq(dbUser.id);
        expect(user.email).to.be.eq(dbUser.email);
        expect(user.role).to.be.eq(dbUser.role);
      });

      it("should response with 404 incase user is not found", async () => {
        const admin = await db.user({ role: IUser.Role.SuperAdmin });
        const res = await findById({
          params: { id: 1000 },
          user: admin,
        });
        expect(res).to.deep.eq(notfound.user());
      });
    });

    describe("PUT /api/v1/user/:id", () => {
      it("should update a user", async () => {
        const student = await db.student();

        await update({
          params: { id: student.id },
          body: { name: "just-a-new-name" },
          user: student,
        });

        const user = await users.findById(student.id);
        expect(user?.name).to.be.eq("just-a-new-name");
      });
    });

    describe("GET /api/v1/user/tutor/list/onboarded", () => {
      beforeEach(async () => {
        await db.flush();
        await cache.flush();
      });

      it("should successfully load onboard tutors from db to cache", async () => {
        expect(await cache.tutors.exists()).to.eql(false);

        const admin = await db.user({ role: Role.SuperAdmin });
        const tutor = await db.tutor();
        const studio = await db.user({ role: Role.Studio });

        await users.update(tutor.id, {
          verifiedEmail: true,
          verifiedPhone: true,
          image: "/image.jpg",
          phone: "01012345678",
          city: IUser.City.Giza,
        });
        await tutors.update(tutor.id, {
          about: faker.lorem.paragraphs(),
          bio: faker.person.bio(),
          activated: true,
          activatedBy: admin.id,
          video: "/video.mp4",
          thumbnail: "/thumbnail.jpg",
          studioId: studio.id,
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

      it("should retrieve onboard tutors data ordered/searched by name and topic", async () => {
        const newUser = await db.user({ role: Role.SuperAdmin });
        const studio = await db.user({ role: Role.Studio });

        const mockData = [
          {
            name: "Mohamed",
            about: faker.lorem.paragraphs(),
            bio: faker.person.bio(),
            activated: true,
            activatedBy: newUser.id,
            video: "/video1.mp4",
            thumbnail: "/thumbnail.jpg",
            notice: 7,
            studioId: studio.id,
          },
          {
            name: "Ahmed",
            about: faker.lorem.paragraphs(),
            bio: faker.person.bio(),
            activated: true,
            activatedBy: newUser.id,
            video: "/video2.mp4",
            thumbnail: "/thumbnail.jpg",
            notice: 12,
            studioId: studio.id,
          },
          {
            name: "Mostafa",
            about: faker.lorem.paragraphs(),
            bio: faker.person.bio(),
            activated: true,
            activatedBy: newUser.id,
            video: "/video3.mp4",
            thumbnail: "/thumbnail.jpg",
            notice: 14,
            studioId: studio.id,
          },
          {
            name: "Mahmoud",
            about: faker.lorem.paragraphs(),
            bio: faker.person.bio(),
            activated: true,
            activatedBy: newUser.id,
            video: "/video4.mp4",
            thumbnail: "/thumbnail.jpg",
            notice: 7,
            studioId: studio.id,
          },
        ];

        for (const data of mockData) {
          const newTutor = await db.tutor({ name: data.name });
          await users.update(newTutor.id, {
            verifiedEmail: true,
            verifiedPhone: true,
            image: "/image.jpg",
            phone: "01012345678",
            city: IUser.City.Giza,
          });
          await tutors.update(newTutor.id, data);
        }

        const student = await db.student();
        const res = await findOnboardedTutors({
          user: student,
          query: { search: "mos" },
        });
        expect(res.status).to.eq(200);

        const body = res.body as ITutor.FindOnboardedTutorsApiResponse;
        expect(body.total).to.eq(1);
        expect(mockData[2].name).to.deep.eq(body.list[0].name);
      });

      // There was a bug in which every user update request stores tutor info in the cache
      it("should NOT add (non-onboard) tutor data to cache on every update HTTP request", async () => {
        const tutor = await db.user({ role: IUser.Role.Tutor });
        await update({
          params: { id: tutor.id },
          body: { bio: "my new bio" },
          user: tutor,
        });
        expect(await cache.tutors.exists()).to.eql(false);
      });
    });
  });

  describe("GET /api/v1/user/tutor/list/uncontacted", () => {
    beforeEach(async () => {
      await db.flush();
      await cache.flush();
    });

    it("should successfully retrieve list of tutors with which the student has no chat room yet.", async () => {
      const student = await db.student();

      const mockTutors = await Promise.all(range(0, 5).map(() => db.tutor()));

      await db.room([student.id, mockTutors[0].id]);
      await db.room([student.id, mockTutors[1].id]);

      const res = await findUncontactedTutors({ user: student });
      const body = res.body as ITutor.FindFullUncontactedTutorsApiResponse;

      expect(body.total).to.eq(3);
      expect(body.list).to.have.length(3);
    });

    it("should respond with forbidden in case the requester is not a student.", async () => {
      const tutor = await db.user({ role: IUser.Role.Tutor });
      const res = await findUncontactedTutors({ user: tutor });
      expect(res).to.deep.eq(forbidden());
    });
  });

  describe("/api/v1/user/tutor/info/:tutorId", () => {
    beforeEach(async () => {
      await db.flush();
      await cache.flush();
    });

    it("should retrieve tutor info successfully", async () => {
      const newUser = await db.user({ role: Role.SuperAdmin });
      const newTutor = await db.tutor();
      const studio = await db.user({ role: Role.Studio });

      const mockData = {
        about: faker.lorem.paragraphs(),
        bio: faker.person.bio(),
        activated: true,
        activatedBy: newUser.id,
        video: "/video.mp4",
        thumbnail: "/thumbnail.jpg",
        notice: 10,
        studioId: studio.id,
      };

      await users.update(newTutor.id, {
        verifiedEmail: true,
        verifiedPhone: true,
        image: "/image.jpg",
        phone: "01012345678",
        city: IUser.City.Giza,
      });
      await tutors.update(newTutor.id, mockData);

      const student = await db.student();
      const res = await findTutorInfo({
        user: student,
        params: { tutorId: newTutor.id },
      });
      const body = res.body as ITutor.FindTutorInfoApiResponse;

      expect(body.id).to.eq(newTutor.id);
    });

    it("should retrieve tutor info from db, in case it's not in the cache, and then save it in the cache.", async () => {
      expect(await cache.tutors.exists()).to.eq(false);

      const newUser = await db.user({ role: Role.SuperAdmin });
      const newTutor = await db.tutor();
      const studio = await db.user({ role: Role.Studio });

      const mockData = {
        about: faker.lorem.paragraphs(),
        bio: faker.person.bio(),
        activated: true,
        activatedBy: newUser.id,
        video: "/video.mp4",
        thumbnail: "/thumbnail.jpg",
        notice: 10,
        studioId: studio.id,
      };

      await users.update(newTutor.id, {
        verifiedEmail: true,
        verifiedPhone: true,
        image: "/image.jpg",
        phone: "01012345678",
        city: IUser.City.Giza,
      });
      await tutors.update(newTutor.id, mockData);

      const student = await db.student();
      // this shall save tutor in cache if not found
      const res = await findTutorInfo({
        user: student,
        params: { tutorId: newTutor.id },
      });
      const body = res.body as ITutor.FindTutorInfoApiResponse;

      // ensure data is saved and can be retrieved from the cache
      expect(await cache.tutors.exists()).to.eq(true);
      expect(first(await cache.tutors.getAll())?.id).to.eq(body.id);
    });

    it("should response with 404 in case tutor is not onboard", async () => {
      const newTutor = await db.tutor();
      const student = await db.student();
      const res = await findTutorInfo({
        user: student,
        params: { tutorId: newTutor.id },
      });
      expect(res).to.deep.eq(notfound.tutor());
    });
  });

  describe("GET /api/v1/user/tutor/stats/personalized", () => {
    beforeEach(async () => {
      await db.flush();
    });

    it("should retrieve tutor stats by current logged-in user id.", async () => {
      const admin = await db.user({ role: Role.SuperAdmin });
      const tutor = await db.tutor();
      const studio = await db.user({ role: Role.Studio });

      // make the tutor onboard
      await tutors.update(tutor.id, {
        about: faker.lorem.paragraphs(),
        bio: faker.person.bio(),
        activated: true,
        activatedBy: admin.id,
        video: "/video.mp4",
        thumbnail: "/thumbnail.jpg",
        notice: 10,
        studioId: studio.id,
      });
      await users.update(tutor.id, {
        name: "Sara",
        gender: IUser.Gender.Female,
        verifiedEmail: true,
        verifiedPhone: true,
        image: "/image.jpg",
        phone: "01112223334",
        city: IUser.City.Giza,
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

      const user = (await users.findById(tutor.id))!;
      expect(user).to.not.be.null;
      const res = await findPersonalizedTutorStats({ user });
      const body = res.body as ITutor.FindPersonalizedTutorStatsApiResponse;

      expect(body.studentCount).to.eq(2);
      expect(body.completedLessonCount).to.eq(1);
      expect(body.totalLessonCount).to.eq(2);
      expect(body.totalTutoringTime).to.eq(lesson1.duration);
    });

    it("should respond with forbidden if the user is not a tutor.", async () => {
      const student = await db.student();
      const res = await findPersonalizedTutorStats({ user: student });
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

    it("should successfully upload and drop user assets", async () => {
      const admin = await db.user({ role: IUser.Role.SuperAdmin });
      const studio = await db.user({ role: IUser.Role.Studio });
      const tutor = await db.tutor({}, { studioId: studio.id });

      // update image asset
      let res = await uploadUserImage({
        query: { forUser: tutor.id },
        files: {
          [IUser.AssetFileName.Image]: [getMockFile()],
        },
        user: admin,
      });
      expect(res.status).to.eq(200);

      // update video and thumbnail assets
      res = await uploadTutorAssets({
        query: { tutorId: tutor.id },
        files: {
          [IUser.AssetFileName.Image]: [getMockFile()],
          [IUser.AssetFileName.Video]: [getMockFile()],
          [IUser.AssetFileName.Thumbnail]: [getMockFile()],
        },
        user: studio,
      });
      expect(res.status).to.eq(200);

      // ensure that all assets have been updated
      let updated = await tutors.findById(tutor.id);
      expect(updated).to.not.be.null;
      expect(updated?.video).to.not.be.null;
      expect(updated?.thumbnail).to.not.be.null;

      // Delete all assets
      res = await update({
        params: { id: tutor.id },
        body: { image: null, video: null, thumbnail: null },
        user: admin,
      });
      expect(res.status).to.eq(200);

      // ensure that all assets have been deleted
      updated = await tutors.findById(tutor.id);
      expect(updated).to.not.be.null;
      expect(updated?.image).to.be.null;
      expect(updated?.video).to.be.null;
      expect(updated?.thumbnail).to.be.null;
    });
  });
});
