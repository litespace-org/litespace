import { flush } from "@fixtures/shared";
import { Api, unexpectedApiSuccess } from "@fixtures/api";
import { expect } from "chai";
import db from "@fixtures/db";
import { messages, rooms } from "@litespace/models";
import { IUser } from "@litespace/types";
import { range } from "lodash";

describe("/api/v1/chat", () => {
  beforeEach(async () => {
    await flush();
  });

  describe("PUT /api/v1/chat/room/:roomId", () => {
    it("should return error incase user is not authenticated", async () => {
      const publicApi = new Api();
      await publicApi.atlas.chat
        .updateRoom(1, { muted: true, pinned: true })
        .then(unexpectedApiSuccess)
        .catch((error) =>
          expect(error.message).to.be.eq("Unauthorized access")
        );
    });

    it("should response with error incase of empty request", async () => {
      const tutorApi = await Api.forTutor();
      const studentApi = await Api.forStudent();

      const tutor = await tutorApi.atlas.user.findCurrentUser();
      const student = await studentApi.atlas.user.findCurrentUser();
      await studentApi.atlas.chat.createRoom(tutor.user.id);
      const { room } = await studentApi.atlas.chat.findRoomByMembers([
        tutor.user.id,
        student.user.id,
      ]);

      await studentApi.atlas.chat
        .updateRoom(room, {})
        .then(unexpectedApiSuccess)
        .catch((error) => expect(error.message).to.be.eq("Empty request"));
    });

    it("should response with error incase user is not a member", async () => {
      const tutorApi = await Api.forTutor();
      const studentApi = await Api.forStudent();

      const tutor = await tutorApi.atlas.user.findCurrentUser();
      const student = await studentApi.atlas.user.findCurrentUser();

      await studentApi.atlas.chat.createRoom(tutor.user.id);
      const { room } = await studentApi.atlas.chat.findRoomByMembers([
        tutor.user.id,
        student.user.id,
      ]);

      const unathorizedStudentApi = await Api.forStudent();
      await unathorizedStudentApi.atlas.chat
        .updateRoom(room, {})
        .then(unexpectedApiSuccess)
        .catch((error) =>
          expect(error.message).to.be.eq("Unauthorized access")
        );
    });

    it("should update user room settings", async () => {
      const tutorApi = await Api.forTutor();
      const studentApi = await Api.forStudent();

      const tutor = await tutorApi.atlas.user.findCurrentUser();
      const student = await studentApi.atlas.user.findCurrentUser();

      await studentApi.atlas.chat.createRoom(tutor.user.id);
      const { room } = await studentApi.atlas.chat.findRoomByMembers([
        tutor.user.id,
        student.user.id,
      ]);

      const [firstMember, secondMember] = await rooms.findRoomMembers({
        roomIds: [room],
      });
      expect(firstMember.muted).to.be.false;
      expect(firstMember.pinned).to.be.false;
      expect(secondMember.muted).to.be.false;
      expect(secondMember.pinned).to.be.false;

      const updated = await studentApi.atlas.chat.updateRoom(room, {
        pinned: true,
        muted: true,
      });

      expect(updated.muted).to.be.true;
      expect(updated.pinned).to.be.true;
    });
  });
});

describe("GET /api/v1/chat/list/rooms/:userId", () => {
  it("should response with an error when unauthorized user tries to get the messages", async () => {
    const tutorApi = await Api.forTutor();
    const student1Api = await Api.forStudent();
    const student2Api = await Api.forStudent();
    const tutor = await tutorApi.atlas.user.findCurrentUser();
    await student1Api.atlas.chat.createRoom(tutor.user.id);

    await student2Api.atlas.chat
      .findRooms(tutor.user.id)
      .then(unexpectedApiSuccess)
      .catch((error) => expect(error.message).to.be.eq("Unauthorized access"));
  });

  it("should get all user rooms", async () => {
    const tutorApi = await Api.forTutor();
    const tutor = await tutorApi.findCurrentUser();

    const seedData = await Promise.all(
      range(3).map(async () => {
        const studnetApi = await Api.forStudent();
        const student = await studnetApi.findCurrentUser();
        const { roomId } = await studnetApi.atlas.chat.createRoom(
          tutor.user.id
        );
        const message = await messages.create({
          roomId,
          text: student.user.email,
          userId: student.user.id,
        });

        return { message, user: student };
      })
    );

    const rooms = await tutorApi.atlas.chat.findRooms(tutor.user.id);
    expect(rooms.list.length).to.be.eq(3);

    expect(rooms.list.map((room) => room.latestMessage)).to.be.deep.members(
      seedData.map((data) => data.message)
    );

    expect(rooms.list.map((room) => room.otherMember)).to.be.deep.members(
      seedData.map(({ user: info }) => ({
        id: info.user.id,
        name: info.user.name,
        image: info.user.image,
        online: info.user.online,
        role: info.user.role,
        lastSeen: info.user.updatedAt,
      }))
    );
  });

  it("should get rooms that match specific keyword", async () => {
    const tutorApi = await Api.forTutor();
    const tutor = await tutorApi.atlas.user.findCurrentUser();

    await Promise.all(
      ["student-1", "student-2", "student-3"].map(async (name) => {
        const studnetApi = await Api.forStudent();
        const student = await studnetApi.findCurrentUser();
        const room = await db.room([tutor.user.id, student.user.id]);
        await db.message({ roomId: room, text: `Hello, ${name}` });
      })
    );

    const tests = [
      { keyword: "Hello", total: 3 },
      { keyword: "student-2", total: 1 },
      { keyword: "<random>", total: 0 },
    ];

    for (const test of tests) {
      const rooms = await tutorApi.atlas.chat.findRooms(tutor.user.id, {
        keyword: test.keyword,
      });
      expect(rooms.list.length).to.be.eq(test.total);
    }
  });
});
