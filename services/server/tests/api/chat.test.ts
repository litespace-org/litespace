import { Api, unexpectedApiSuccess } from "@fixtures/api";
import { expect } from "chai";
import db from "@fixtures/db";
import { knex, messages, rooms } from "@litespace/models";
import { range } from "lodash";
import { ClientSocket } from "@fixtures/wss";
import { ApiError, Wss } from "@litespace/types";

describe("/api/v1/chat", () => {
  beforeEach(async () => {
    await db.flush();
  });

  describe("PUT /api/v1/chat/room/:roomId", () => {
    it("should return error incase user is not authenticated", async () => {
      const publicApi = new Api();
      await publicApi.api.chat
        .updateRoom(1, { muted: true, pinned: true })
        .then(unexpectedApiSuccess)
        .catch((error) => expect(error.message).to.be.eq(ApiError.Forbidden));
    });

    it("should response with error incase of empty request", async () => {
      const tutorApi = await Api.forTutor();
      const studentApi = await Api.forStudent();

      const tutor = await tutorApi.api.user.findCurrentUser();
      const student = await studentApi.api.user.findCurrentUser();
      await studentApi.api.chat.createRoom(tutor.id);
      const { room } = await studentApi.api.chat.findRoomByMembers([
        tutor.id,
        student.id,
      ]);

      await studentApi.api.chat
        .updateRoom(room, {})
        .then(unexpectedApiSuccess)
        .catch((error) =>
          expect(error.message).to.be.eq(ApiError.EmptyRequest)
        );
    });

    it("should response with error incase user is not a member", async () => {
      const tutorApi = await Api.forTutor();
      const studentApi = await Api.forStudent();

      const tutor = await tutorApi.api.user.findCurrentUser();
      const student = await studentApi.api.user.findCurrentUser();

      await studentApi.api.chat.createRoom(tutor.id);
      const { room } = await studentApi.api.chat.findRoomByMembers([
        tutor.id,
        student.id,
      ]);

      const unathorizedStudentApi = await Api.forStudent();
      await unathorizedStudentApi.api.chat
        .updateRoom(room, {})
        .then(unexpectedApiSuccess)
        .catch((error) => expect(error.message).to.be.eq(ApiError.Forbidden));
    });

    it("should update user room settings", async () => {
      const tutorApi = await Api.forTutor();
      const studentApi = await Api.forStudent();

      const tutor = await tutorApi.api.user.findCurrentUser();
      const student = await studentApi.api.user.findCurrentUser();

      await studentApi.api.chat.createRoom(tutor.id);
      const { room } = await studentApi.api.chat.findRoomByMembers([
        tutor.id,
        student.id,
      ]);

      const [firstMember, secondMember] = await rooms.findRoomMembers({
        roomIds: [room],
      });
      expect(firstMember.muted).to.be.false;
      expect(firstMember.pinned).to.be.false;
      expect(secondMember.muted).to.be.false;
      expect(secondMember.pinned).to.be.false;

      const updated = await studentApi.api.chat.updateRoom(room, {
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
    const tutor = await tutorApi.api.user.findCurrentUser();
    await student1Api.api.chat.createRoom(tutor.id);

    await student2Api.api.chat
      .findRooms(tutor.id)
      .then(unexpectedApiSuccess)
      .catch((error) => expect(error.message).to.be.eq(ApiError.Forbidden));
  });

  it("should get all user rooms", async () => {
    const tutorApi = await Api.forTutor();
    const tutor = await tutorApi.findCurrentUser();

    const seedData = await Promise.all(
      range(3).map(async () => {
        const studnetApi = await Api.forStudent();
        const student = await studnetApi.findCurrentUser();
        const { roomId } = await studnetApi.api.chat.createRoom(tutor.id);
        const message = await messages.create({
          roomId,
          text: student.email,
          userId: student.id,
        });

        return { message, user: student };
      })
    );

    const rooms = await tutorApi.api.chat.findRooms(tutor.id);
    expect(rooms.list.length).to.be.eq(3);

    expect(rooms.list.map((room) => room.latestMessage?.id)).to.contain.members(
      seedData.map((data) => data.message.id)
    );

    expect(rooms.list.map((room) => room.otherMember.id)).to.contain.members(
      seedData.map(({ user: info }) => info.id)
    );
  });

  it("should other room member online status", async () => {
    const tutorApi = await Api.forTutor();
    const tutor = await tutorApi.findCurrentUser();

    const seedData = await Promise.all(
      range(3).map(async () => {
        const studnetApi = await Api.forStudent();
        const student = await studnetApi.findCurrentUser();
        const { roomId } = await studnetApi.api.chat.createRoom(tutor.id);
        const message = await messages.create({
          roomId,
          text: student.email,
          userId: student.id,
        });

        return { message, user: student, token: studnetApi.token };
      })
    );

    // make the first student online
    new ClientSocket(seedData[0].token);
    const tutorSocket = new ClientSocket(tutorApi.token);
    await tutorSocket.wait(Wss.ServerEvent.UserStatusChanged);

    const rooms = await tutorApi.api.chat.findRooms(tutor.id);

    expect(
      rooms.list.map((room) => room.otherMember.online)
    ).to.contain.members([true, false, false]);
  });

  it("should get rooms that match specific keyword", async () => {
    const tutorApi = await Api.forTutor();
    const tutor = await tutorApi.api.user.findCurrentUser();

    for (const name of ["student-1", "student-2", "student-3"]) {
      const studnetApi = await Api.forStudent();
      const student = await studnetApi.findCurrentUser();

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
      const rooms = await tutorApi.api.chat.findRooms(tutor.id, {
        keyword: test.keyword,
      });
      expect(rooms.list.length).to.be.eq(test.total);
    }
  });
});
