import { flush } from "@fixtures/shared";
import { Api, unexpectedApiSuccess } from "@fixtures/api";
import { expect } from "chai";
import { safe } from "@litespace/sol/error";
import db from "@fixtures/db";
import { rooms } from "@litespace/models";
import { first } from "lodash";

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
