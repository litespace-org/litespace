import { tutors, Tutors } from "@/tutors";
import fixtures from "@fixtures/db";
import { expect } from "chai";
import { dayjs, nameof } from "@litespace/utils";
import { range } from "lodash";
import { Role } from "@litespace/types/dist/esm/user";
import { IUser } from "@litespace/types";
import { faker } from "@faker-js/faker/locale/en";

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

  describe(nameof(tutors.find), () => {
    it("should retrive all tutors", async () => {
      await fixtures.tutor();
      await fixtures.tutor();
      await fixtures.tutor();
      await fixtures.tutor();
      await fixtures.tutor();

      const res = await tutors.find({});
      expect(res.list.length).to.be.eq(5);
    });

    it("should filter based on cities", async () => {
      await fixtures.tutor({}, { city: IUser.City.Alexandria });
      await fixtures.tutor({}, { city: IUser.City.Damietta });
      await fixtures.tutor();
      await fixtures.tutor();
      await fixtures.tutor();

      const res = await tutors.find({
        city: [IUser.City.Alexandria, IUser.City.Damietta],
      });
      expect(res.list.length).to.be.eq(2);
    });

    it("should filter based on genders", async () => {
      await fixtures.tutor({}, { gender: IUser.Gender.Male });
      await fixtures.tutor({}, { gender: IUser.Gender.Male });
      await fixtures.tutor({}, { gender: IUser.Gender.Female });
      await fixtures.tutor({}, { gender: IUser.Gender.Female });
      await fixtures.tutor({}, { gender: IUser.Gender.Female });

      const res1 = await tutors.find({});
      expect(res1.list.length).to.be.eq(5);

      const res2 = await tutors.find({
        gender: [IUser.Gender.Female],
      });
      expect(res2.list.length).to.be.eq(3);

      const res3 = await tutors.find({
        gender: [IUser.Gender.Male],
      });
      expect(res3.list.length).to.be.eq(2);

      const res4 = await tutors.find({
        gender: [IUser.Gender.Female, IUser.Gender.Male],
      });
      expect(res4.list.length).to.be.eq(5);
    });

    it("should filter based on notification methods", async () => {
      await fixtures.tutor(
        {},
        { notificationMethod: IUser.NotificationMethod.Telegram }
      );
      await fixtures.tutor(
        {},
        { notificationMethod: IUser.NotificationMethod.Telegram }
      );
      await fixtures.tutor(
        {},
        { notificationMethod: IUser.NotificationMethod.Telegram }
      );
      await fixtures.tutor(
        {},
        { notificationMethod: IUser.NotificationMethod.Whatsapp }
      );
      await fixtures.tutor(
        {},
        { notificationMethod: IUser.NotificationMethod.Whatsapp }
      );

      const res1 = await tutors.find({});
      expect(res1.list.length).to.be.eq(5);

      const res2 = await tutors.find({
        notificationMethod: [IUser.NotificationMethod.Telegram],
      });
      expect(res2.list.length).to.be.eq(3);

      const res3 = await tutors.find({
        notificationMethod: [IUser.NotificationMethod.Whatsapp],
      });
      expect(res3.list.length).to.be.eq(2);

      const res4 = await tutors.find({
        notificationMethod: [
          IUser.NotificationMethod.Telegram,
          IUser.NotificationMethod.Whatsapp,
        ],
      });
      expect(res4.list.length).to.be.eq(5);
    });

    it("should filter based on name", async () => {
      await fixtures.tutor({}, { name: "Mostafa Kamar" });
      await fixtures.tutor({}, { name: null });
      await fixtures.tutor({}, { name: "Ahmed Ibrahim" });
      await fixtures.tutor({}, { name: "Mahmoud Ehab" });
      await fixtures.tutor({}, { name: "Mohamed Ali" });

      const res1 = await tutors.find({
        name: "kamar",
      });
      expect(res1.list.length).to.be.eq(1);

      const res2 = await tutors.find({ name: null });
      expect(res2.list.length).to.be.eq(1);
    });

    it("should filter based on bio", async () => {
      await fixtures.tutor({ bio: "Hello, I am here" });
      await fixtures.tutor({ bio: "Hello, I am not here" });
      await fixtures.tutor({ bio: "Hello, i am here" });
      await fixtures.tutor({});

      const res1 = await tutors.find({
        bio: "not",
      });
      expect(res1.list.length).to.be.eq(1);

      const res2 = await tutors.find({ bio: null });
      expect(res2.list.length).to.be.eq(1);

      const res3 = await tutors.find({
        bio: "here",
      });
      expect(res3.list.length).to.be.eq(3);
    });

    it("should filter based on about", async () => {
      await fixtures.tutor({ about: "Hello, I am here" });
      await fixtures.tutor({ about: "Hello, I am not here" });
      await fixtures.tutor({ about: "Hello, i am here" });
      await fixtures.tutor({});

      const res1 = await tutors.find({ about: "not" });
      expect(res1.list.length).to.be.eq(1);

      const res2 = await tutors.find({ about: null });
      expect(res2.list.length).to.be.eq(1);

      const res3 = await tutors.find({
        about: "here",
      });
      expect(res3.list.length).to.be.eq(3);
    });

    it("should filter based on phone", async () => {
      const t1 = await fixtures.tutor(
        {},
        { phone: faker.phone.number().slice(0, 12) }
      );
      await fixtures.tutor({}, { phone: faker.phone.number().slice(0, 12) });
      await fixtures.tutor({}, { phone: faker.phone.number().slice(0, 12) });
      await fixtures.tutor();

      const res1 = await tutors.find({
        phone: t1.phone,
      });
      expect(res1.list.length).to.be.eq(1);

      const res2 = await tutors.find({ phone: null });
      expect(res2.list.length).to.be.eq(1);
    });

    it("should filter based on email", async () => {
      await fixtures.tutor({}, { email: "s1@litespace.org" });
      await fixtures.tutor({}, { email: "s2@litespace.org" });
      await fixtures.tutor({}, { email: "s3@litespace.org" });
      await fixtures.tutor({}, { email: "s4@litespace.org" });
      await fixtures.tutor({}, { email: "s5@litespace.org" });

      const res1 = await tutors.find({ email: "@litespace.org" });
      expect(res1.list.length).to.be.eq(5);

      const res2 = await tutors.find({ email: "s1@litespace.org" });
      expect(res2.list.length).to.be.eq(1);
    });

    it("should filter based on activated", async () => {
      await fixtures.tutor({ activated: false });
      await fixtures.tutor({ activated: true });
      await fixtures.tutor({ activated: true });
      await fixtures.tutor({ activated: false });
      await fixtures.tutor({ activated: false });

      const res1 = await tutors.find({
        activated: true,
      });
      expect(res1.list.length).to.be.eq(2);

      const res2 = await tutors.find({
        activated: false,
      });
      expect(res2.list.length).to.be.eq(3);
    });

    it("should filter based on verifiedEmail", async () => {
      await fixtures.tutor({}, { verifiedEmail: true });
      await fixtures.tutor({}, { verifiedEmail: true });
      await fixtures.tutor({}, { verifiedEmail: false });
      await fixtures.tutor({}, { verifiedEmail: false });
      await fixtures.tutor({}, { verifiedEmail: false });

      const res1 = await tutors.find({ verifiedEmail: true });
      expect(res1.list.length).to.be.eq(2);

      const res2 = await tutors.find({ verifiedEmail: false });
      expect(res2.list.length).to.be.eq(3);
    });

    it("should filter based on verifiedPhone", async () => {
      await fixtures.tutor({}, { verifiedPhone: true });
      await fixtures.tutor({}, { verifiedPhone: true });
      await fixtures.tutor({}, { verifiedPhone: false });
      await fixtures.tutor({}, { verifiedPhone: false });
      await fixtures.tutor({}, { verifiedPhone: false });

      const res1 = await tutors.find({ verifiedPhone: true });
      expect(res1.list.length).to.be.eq(2);

      const res2 = await tutors.find({ verifiedPhone: false });
      expect(res2.list.length).to.be.eq(3);
    });

    it("should filter based on verifiedTelegram", async () => {
      await fixtures.tutor({}, { verifiedTelegram: true });
      await fixtures.tutor({}, { verifiedTelegram: true });
      await fixtures.tutor({}, { verifiedTelegram: false });
      await fixtures.tutor({}, { verifiedTelegram: false });
      await fixtures.tutor({}, { verifiedTelegram: false });

      const res1 = await tutors.find({ verifiedTelegram: true });
      expect(res1.list.length).to.be.eq(2);

      const res2 = await tutors.find({ verifiedTelegram: false });
      expect(res2.list.length).to.be.eq(3);
    });

    it("should filter based on verifiedWhatsapp", async () => {
      await fixtures.tutor({}, { verifiedWhatsApp: true });
      await fixtures.tutor({}, { verifiedWhatsApp: true });
      await fixtures.tutor({}, { verifiedWhatsApp: false });
      await fixtures.tutor({}, { verifiedWhatsApp: false });
      await fixtures.tutor({}, { verifiedWhatsApp: false });

      const res1 = await tutors.find({ verifiedWhatsapp: true });
      expect(res1.list.length).to.be.eq(2);

      const res2 = await tutors.find({ verifiedWhatsapp: false });
      expect(res2.list.length).to.be.eq(3);
    });

    it("should filter based on password", async () => {
      await fixtures.tutor({}, {}, true);
      await fixtures.tutor({}, {}, true);
      await fixtures.tutor({}, {});
      await fixtures.tutor({}, {});
      await fixtures.tutor({}, {});

      const res1 = await tutors.find({ password: true });
      expect(res1.list.length).to.be.eq(2);

      const res2 = await tutors.find({ password: false });
      expect(res2.list.length).to.be.eq(3);
    });

    it("should filter based on image", async () => {
      await fixtures.tutor({}, { image: "/image" });
      await fixtures.tutor({}, { image: "/image" });
      await fixtures.tutor({}, { image: null });
      await fixtures.tutor({}, { image: null });
      await fixtures.tutor({}, { image: null });

      const res1 = await tutors.find({ image: true });
      expect(res1.list.length).to.be.eq(2);

      const res2 = await tutors.find({
        image: false,
      });
      expect(res2.list.length).to.be.eq(3);
    });

    it("should filter based on thumbnail", async () => {
      await fixtures.tutor({ thumbnail: "/image" });
      await fixtures.tutor({ thumbnail: "/image" });
      await fixtures.tutor({ thumbnail: null });
      await fixtures.tutor({ thumbnail: null });
      await fixtures.tutor({ thumbnail: null });

      const res1 = await tutors.find({ thumbnail: true });
      expect(res1.list.length).to.be.eq(2);

      const res2 = await tutors.find({ thumbnail: false });
      expect(res2.list.length).to.be.eq(3);
    });

    it("should filter based on video", async () => {
      await fixtures.tutor({ video: "/video" });
      await fixtures.tutor({ video: "/video" });
      await fixtures.tutor({ video: null });
      await fixtures.tutor({ video: null });
      await fixtures.tutor({ video: null });

      const res1 = await tutors.find({ video: true });
      expect(res1.list.length).to.be.eq(2);

      const res2 = await tutors.find({ video: false });
      expect(res2.list.length).to.be.eq(3);
    });

    it("should filter based on notice", async () => {
      await fixtures.tutor({ notice: 40 });
      await fixtures.tutor({ notice: 30 });
      await fixtures.tutor({ notice: 20 });
      await fixtures.tutor({ notice: 10 });
      await fixtures.tutor({ notice: 5 });

      const res1 = await tutors.find({ notice: 40 });
      expect(res1.list.length).to.be.eq(1);

      const res2 = await tutors.find({ notice: { gt: 20 } });
      expect(res2.list.length).to.be.eq(2);

      const res3 = await tutors.find({ notice: { gte: 20 } });
      expect(res3.list.length).to.be.eq(3);

      const res4 = await tutors.find({ notice: { lte: 20 } });
      expect(res4.list.length).to.be.eq(3);

      const res5 = await tutors.find({ notice: { lt: 20 } });
      expect(res5.list.length).to.be.eq(2);
    });

    it("should filter based on birthYear", async () => {
      await fixtures.tutor({}, { birthYear: 2000 });
      await fixtures.tutor({}, { birthYear: 2020 });
      await fixtures.tutor({}, { birthYear: 2002 });
      await fixtures.tutor({}, { birthYear: 1995 });
      await fixtures.tutor({}, { birthYear: 1998 });

      const res1 = await tutors.find({ birthYear: 2000 });
      expect(res1.list.length).to.be.eq(1);

      const res2 = await tutors.find({ birthYear: { gt: 2000 } });
      expect(res2.list.length).to.be.eq(2);

      const res3 = await tutors.find({ birthYear: { gte: 2000 } });
      expect(res3.list.length).to.be.eq(3);

      const res4 = await tutors.find({ birthYear: { lte: 2000 } });
      expect(res4.list.length).to.be.eq(3);

      const res5 = await tutors.find({ birthYear: { lt: 2000 } });
      expect(res5.list.length).to.be.eq(2);
    });

    it("should filter based on createdAt", async () => {
      const t1 = await fixtures.tutor({});
      const t2 = await fixtures.tutor({});
      await fixtures.tutor({});
      await fixtures.tutor({});
      await fixtures.tutor({});

      const res1 = await tutors.find({ createdAt: t1.createdAt });
      expect(res1.list.length).to.be.eq(1);

      const res2 = await tutors.find({
        createdAt: { gt: t2.createdAt },
      });
      expect(res2.list.length).to.be.eq(3);

      const res3 = await tutors.find({
        createdAt: { gte: t2.createdAt },
      });
      expect(res3.list.length).to.be.eq(4);

      const res4 = await tutors.find({
        createdAt: {
          lte: t2.createdAt,
        },
      });
      expect(res4.list.length).to.be.eq(2);

      const res5 = await tutors.find({
        createdAt: {
          lt: t2.createdAt,
        },
      });
      expect(res5.list.length).to.be.eq(1);

      const res6 = await tutors.find({
        createdAt: {
          noeq: t2.createdAt,
        },
      });
      expect(res6.list.length).to.be.eq(4);
    });
  });
});
