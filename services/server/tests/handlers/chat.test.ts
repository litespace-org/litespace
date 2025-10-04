import { expect } from "chai";
import db from "@fixtures/db";
import { knex, messages, rooms } from "@litespace/models";
import { range } from "lodash";
import { IMessage, IRoom } from "@litespace/types";
import handlers from "@/handlers/chat";
import { mockApi } from "@fixtures/mockApi";
import { empty, forbidden } from "@/lib/error/api";
import { cache } from "@/lib/cache";

const findUserRooms = mockApi<
  object,
  { userId: number },
  IRoom.FindUserRoomsApiQuery,
  IRoom.FindUserRoomsApiResponse
>(handlers.findUserRooms);

const findRoomMessages = mockApi<
  object,
  { roomId: number },
  object,
  IMessage.FindRoomMessagesApiResponse
>(handlers.findRoomMessages);

const updateRoom = mockApi<
  IRoom.UpdateRoomApiPayload,
  { roomId: number },
  object,
  IRoom.UpdateRoomApiResponse
>(handlers.updateRoom);

describe("/api/v1/chat", () => {
  beforeAll(async () => {
    await cache.connect();
  });

  afterAll(async () => {
    await cache.disconnect();
  });

  beforeEach(async () => {
    await db.flush();
  });

  describe("PUT /api/v1/chat/room/:roomId", () => {
    it("should return error incase user is not authenticated", async () => {
      const tutor = await db.tutor();
      const student = await db.student();
      const room = await db.room([tutor.id, student.id]);

      const res = await updateRoom({
        user: await db.student(),
        params: { roomId: room },
        body: { muted: true, pinned: true },
      });
      expect(res).to.deep.eq(forbidden());
    });

    it("should response with error incase of empty request", async () => {
      const tutor = await db.tutor();
      const student = await db.student();
      const room = await db.room([tutor.id, student.id]);

      const res = await updateRoom({
        user: student,
        params: { roomId: room },
        body: {},
      });

      expect(res).to.deep.eq(empty());
    });

    it("should response with error incase user is not a member", async () => {
      const tutor = await db.tutor();
      const student = await db.student();
      const room = await db.room([tutor.id, student.id]);

      const res = await updateRoom({
        user: await db.student(),
        params: { roomId: room },
        body: {},
      });

      expect(res).to.deep.eq(forbidden());
    });

    it("should update user room settings", async () => {
      const tutor = await db.tutor();
      const student = await db.student();
      const room = await db.room([tutor.id, student.id]);

      const [firstMember, secondMember] = await rooms.findRoomMembers({
        roomIds: [room],
      });
      expect(firstMember.muted).to.be.false;
      expect(firstMember.pinned).to.be.false;
      expect(secondMember.muted).to.be.false;
      expect(secondMember.pinned).to.be.false;

      const res = await updateRoom({
        user: student,
        params: { roomId: room },
        body: {
          pinned: true,
          muted: true,
        },
      });

      expect(res).to.not.be.instanceof(Error);
      expect(res.body!.muted).to.be.true;
      expect(res.body!.pinned).to.be.true;
    });
  });

  describe("GET /api/v1/chat/list/rooms/:userId", () => {
    it("should response with an error when unauthorized user tries to get the messages", async () => {
      const tutor = await db.tutor();
      const student1 = await db.student();
      const room = await db.room([tutor.id, student1.id]);

      const student2 = await db.student();
      const res = await findRoomMessages({
        user: student2,
        params: { roomId: room },
      });

      expect(res).to.deep.eq(forbidden());
    });

    it("should get all user rooms", async () => {
      const tutor = await db.tutorUser();

      const seedData = await Promise.all(
        range(3).map(async () => {
          const student = await db.student();
          const room = await db.room([tutor.id, student.id]);
          const message = await messages.create({
            roomId: room,
            text: student.email,
            userId: student.id,
          });
          return { message, user: student };
        })
      );

      const res = await findUserRooms({
        user: tutor,
        params: { userId: tutor.id },
        query: {},
      });
      expect(res).to.not.be.instanceof(Error);
      expect(res.body!.total).to.be.eq(3);

      expect(
        res.body!.list.map((room) => room.latestMessage?.id)
      ).to.contain.members(seedData.map((data) => data.message.id));

      expect(
        res.body!.list.map((room) => room.otherMember.id)
      ).to.contain.members(seedData.map(({ user: info }) => info.id));
    });

    it("should get rooms that match specific keyword", async () => {
      const tutor = await db.tutorUser();

      for (const name of ["student-1", "student-2", "student-3"]) {
        const student = await db.student();
        const room = await db.room([tutor.id, student.id]);

        await knex.transaction(async (tx) =>
          db.message(tx, {
            roomId: room,
            userId: tutor.id,
            text: `Hello, ${name}`,
          })
        );
      }

      const tests = [
        { keyword: "Hello", total: 3 },
        { keyword: "student-2", total: 1 },
        { keyword: "<random>", total: 0 },
      ];

      for (const test of tests) {
        const res = await findUserRooms({
          user: tutor,
          params: { userId: tutor.id },
          query: { keyword: test.keyword },
        });
        expect(res).to.not.be.instanceof(Error);
        expect(res.body!.total).to.be.eq(test.total);
      }
    });
  });
});
