import { flush } from "@fixtures/shared";
import { Api, unexpectedApiSuccess } from "@fixtures/api";
import { expect } from "chai";
import db from "@fixtures/db";
import { rooms } from "@litespace/models";
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

  it("Should throw an error when another user try to get the messages", async () => {
    const tutorApi = await Api.forTutor();
    const student1Api = await Api.forStudent();
    const student2Api = await Api.forStudent();
    const tutor = await tutorApi.atlas.user.findCurrentUser();
    const student1 = await student1Api.atlas.user.findCurrentUser();
    await tutorApi.atlas.chat.createRoom(student1.user.id);

    await student2Api.atlas.chat.findUserRooms(tutor.user.id).then(unexpectedApiSuccess)
      .catch((error) =>
        expect(error.message).to.be.eq("Unauthorized access")
      );

  })

  it("Should get all the rooms of a user", async () => {
    const tutorApi = await Api.forTutor();
    const tutor = await tutorApi.atlas.user.findCurrentUser();

    range(3).map(async () => {
      const api = await Api.forStudent();
      const student = await api.atlas.user.findCurrentUser();
      await tutorApi.atlas.chat.createRoom(student.user.id)
    })

    const rooms = await tutorApi.atlas.chat.findUserRooms(tutor.user.id);
    expect(rooms.list.length).to.be.eq(3)
    expect(rooms.list.map(r => r.otherMember.role)).to.be.deep.equal([IUser.Role.Student, IUser.Role.Student, IUser.Role.Student])
    expect(rooms.list.map(r => r.unReadMessagesCount)).to.be.deep.equal([0, 0, 0])
    expect(rooms.list.map(r => r.latestMessage)).to.be.deep.equal([null, null, null])
  })

  it("Should get rooms with specific keyword", async () => {
    const tutorApi = await Api.forTutor();
    const tutor = await tutorApi.atlas.user.findCurrentUser();

    ["student-1", "student-2", "student-3"].map(async (name) => {
      const api = await Api.forStudent();
      const student = await api.atlas.user.findCurrentUser();
      await db.make.room({ members: [tutor.user.id, student.user.id], initialMessages: [`hi from ${name}`] })
    })

    const tests = [
      { keyword: "hi", total: 3 },
      { keyword: "student-2", total: 1 },
      { keyword: "hi from student-1", total: 1 },
      { keyword: "Non Existent", total: 0 },
    ]

    for (const test of tests) {
      const rooms = await tutorApi.atlas.chat.findUserRooms(tutor.user.id, {keyword: test.keyword});
      expect(rooms.list.length).to.be.eq(test.total)
    }
  })

});
