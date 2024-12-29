import { flush } from "@fixtures/shared";
import { IUser } from "@litespace/types";
import { Api } from "@fixtures/api";
import db, { faker } from "@fixtures/db";
import { expect } from "chai";
import { safe } from "@litespace/sol/error";
import { cacheTutors } from "@/lib/tutor";
import dayjs from "@/lib/dayjs";
import { cache } from "@/lib/cache";
import { tutors, users } from "@litespace/models";
import { Role } from "@litespace/types/dist/esm/user";
import { first, range } from "lodash";
import { forbidden, notfound } from "@/lib/error";

describe("/api/v1/user/", () => {
  beforeEach(async () => {
    await flush();
  });

  describe("POST /api/v1/user", () => {
    it("should create a student", async () => {
      const email = "student@example.com";
      const password = "StudentExample101%^&";
      const api = new Api();
      const result = await api.createUser({
        role: IUser.Role.Student,
        email,
        password,
        callbackUrl: "https://litespace.org/verify-email",
      });
      expect(result.user.email).to.be.eq(email);
      expect(result.user.password).to.be.eq(true);
      expect(result.user.password).to.be.eq(true);
      expect(result.user.role).to.be.eq(IUser.Role.Student);
    });
  });

  describe("/api/v1/user/:id", () => {
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
        await flush();
        await cache.flush();
      });

      it("should successfully load onboard tutors from db to cache", async () => {
        expect(await cache.tutors.exists()).to.eql(false);

        const newUser = await db.user({ role: Role.SuperAdmin });
        const newTutor = await db.tutor();

        await users.update(newTutor.id, {
          verified: true,
          image: "/image.jpg",
          phoneNumber: "01012345678",
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
        await users.update(newTutor.id, { verified: false });

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
          verified: true,
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
          verified: true,
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

        for (let data of mockData) {
          const newTutor = await db.tutor({ name: data.name });
          await users.update(newTutor.id, {
            verified: true,
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

  describe("GET /api/v1/user/tutor/list/uncontacted", () => {
    beforeEach(async () => {
      await flush();
    });

    it("should successfully retrieve list of tutors with which the student has not chat room yet.", async () => {
      const studentApi = await Api.forStudent();
      const student = (await studentApi.findCurrentUser()).user;
      
      const mockTutors = await Promise.all(range(0,5).map(() => db.tutor()));

      await Promise.all([
        db.room([student.id, mockTutors[0].id]),
        db.room([student.id, mockTutors[1].id]),
      ]);

      const res = await studentApi.atlas.user.findUncontactedTutors();

      expect(res.total).to.eq(3);
      expect(res.list).to.have.length(3);
    });

    it("should respond with forbidden in case the requester is not a student.", async () => {
      const tutorApi = await Api.forTutor();
      const res = await safe(async () => tutorApi.atlas.user.findUncontactedTutors());
      expect(res).to.deep.eq(forbidden())
    });
  });

  describe("/api/v1/user/tutor/info/:tutorId", () => {
    beforeAll(async () => {
      await cache.connect();
    });

    afterAll(async () => {
      await cache.disconnect();
    });

    beforeEach(async () => {
      await flush();
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
        verified: true,
        // NOTE: image is not in tutors table.
        image: "/image.jpg",
        phoneNumber: "01012345678",
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
        verified: true,
        // NOTE: image is not in tutors table.
        image: "/image.jpg",
        phoneNumber: "01012345678",
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

  describe("GET /api/v1/user/tutor/stats/personalized", () => {
    beforeEach(async () => {
      await flush();
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
        verified: true,
        image: "/image.jpg",
        gender: IUser.Gender.Female,
        name: "Sara",
        phoneNumber: "01112223334"
      });

      // defining rules
      const rule1 = await db.rule({ 
        userId: tutor.user.id,
        start: dayjs.utc().subtract(2, "days").toISOString(),
      })
      const rule2 = await db.rule({ 
        userId: tutor.user.id,
        start: dayjs.utc().add(2, "days").toISOString(),
      })
      const rule3 = await db.rule({ 
        userId: tutor.user.id,
        start: dayjs.utc().add(3, "days").toISOString(),
      })

      // inserting lessons
      const students = await db.students(3);

      await db.lesson({ 
        tutor: tutor.user.id, 
        student: students[0].id, 
        rule: rule1.id, 
        start: rule1.start,
      });

      await db.lesson({ 
        tutor: tutor.user.id, 
        student: students[1].id, 
        rule: rule2.id,
      });

      await db.lesson({ 
        tutor: tutor.user.id, 
        student: students[2].id, 
        rule: rule3.id,
        canceled: true, // should not be counted
      });

      const res = await tutorApi.atlas.user.findPersonalizedTutorStats();
      
      expect(res.studentCount).to.eq(2);
      expect(res.upcomingLessonCount).to.eq(1);
      expect(res.completedLessonCount).to.eq(1);
      expect(res.totalLessonCount).to.eq(2);
    });

    it("should respond with forbidden if the user is not a tutor.", async () => {
      const studentApi = await Api.forStudent();
      const res = await safe(async () => studentApi.atlas.user.findPersonalizedTutorStats());
      expect(res).to.deep.eq(forbidden())
    });
  });

  describe("GET /api/v1/user/student/stats/personalized", () => {
    beforeEach(async () => {
      await flush();
    });

    it("should retrieve student stats by current logged-in user id.", async () => {
      const studentApi = await Api.forStudent();
      const student = await studentApi.findCurrentUser();

      const rule1 = await db.rule({ 
        userId: student.user.id,
        start: dayjs.utc().subtract(2, "days").toISOString(),
      })
      const rule2 = await db.rule({ 
        userId: student.user.id,
        start: dayjs.utc().add(2, "days").toISOString(),
      })
      const rule3 = await db.rule({ 
        userId: student.user.id,
        start: dayjs.utc().add(3, "days").toISOString(),
      })

      const lesson1 = await db.lesson({ 
        student: student.user.id, 
        rule: rule1.id, 
        start: rule1.start,
      });

      await db.lesson({ 
        student: student.user.id, 
        rule: rule2.id,
      });

      await db.lesson({ 
        student: student.user.id, 
        rule: rule3.id,
        canceled: true,
      });

      const res = await studentApi.atlas.user.findPersonalizedStudentStats();
      
      expect(res.tutorCount).to.eq(2);
      expect(res.totalLearningTime).to.eq(lesson1.lesson.duration);
      expect(res.upcomingLessonCount).to.eq(1);
      expect(res.completedLessonCount).to.eq(1);
    });

    it("should respond with forbidden if the user is not a student.", async () => {
      const tutorApi = await Api.forTutor();
      const res = await safe(async () => tutorApi.atlas.user.findPersonalizedStudentStats());
      expect(res).to.deep.eq(forbidden())
    });
  });

});
