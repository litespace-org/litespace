import { Api } from "@fixtures/api";
import db from "@fixtures/db";
import { ClientSocket } from "@fixtures/wss";
import { knex, messages, rooms } from "@litespace/models";
import { Wss } from "@litespace/types";
import { expect } from "chai";
import { first } from "lodash";

describe("wss message test suite", () => {
  beforeEach(async () => {
    await db.flush();
  });

  describe("sending messages", () => {
    it("should throw not found error if the room doesn't exist.", async () => {
      const tutorApi = await Api.forTutor();
      const tutor = await tutorApi.findCurrentUser();

      const tutorSocket = new ClientSocket(tutor.token);
      const res = await tutorSocket.sendMessage(
        123,
        "The lesson will start soon."
      );

      expect(res.code).to.eq(Wss.AcknowledgeCode.RoomNotFound);
    });

    it("should throw forbidden error if the sender is not a member.", async () => {
      const tutorApi = await Api.forTutor();
      const tutor = await tutorApi.findCurrentUser();

      const roomId = await knex.transaction(async (tx) =>
        rooms.create([tutor.user.id], tx)
      );

      const studentApi = await Api.forStudent();
      const student = await studentApi.findCurrentUser();

      const studentSocket = new ClientSocket(student.token);
      const res = await studentSocket.sendMessage(roomId, "Hello.");

      expect(res.code).to.eq(Wss.AcknowledgeCode.NotMember);
    });

    it("should successfully add message to the database.", async () => {
      const tutorApi = await Api.forTutor();
      const tutor = await tutorApi.findCurrentUser();

      const studentApi = await Api.forStudent();
      const student = await studentApi.findCurrentUser();

      const roomId = await db.room([tutor.user.id, student.user.id]);

      const studentSocket = new ClientSocket(student.token);
      const res = await studentSocket.sendMessage(roomId, "Hello.");
      expect(res.code).to.eq(Wss.AcknowledgeCode.Ok);

      const msgs = await messages.findRoomMessages({ room: roomId });
      expect(msgs.total).to.eq(1);
      expect(first(msgs.list)?.text).to.eq("Hello.");
    });

    it("should emit an wss event to members upon each new message.", async () => {
      const tutorApi = await Api.forTutor();
      const tutor = await tutorApi.findCurrentUser();

      const studentApi = await Api.forStudent();
      const student = await studentApi.findCurrentUser();

      const roomId = await db.room([tutor.user.id, student.user.id]);

      const tutorSocket = new ClientSocket(tutor.token);
      const studentSocket = new ClientSocket(student.token);

      tutorSocket.sendMessage(roomId, "Lesson will start soon.");
      const res = await studentSocket.wait(Wss.ServerEvent.RoomMessage);

      expect(res.text).to.eq("Lesson will start soon.");
    });

    it("should emit an wss event to the sender if sending message has been reverted.", async () => {
      const studentApi = await Api.forStudent();
      const student = await studentApi.findCurrentUser();

      const studentSocket = new ClientSocket(student.token);
      const res = await studentSocket.sendMessage(123, "Hello.");

      expect(res.code).to.eq(Wss.AcknowledgeCode.RoomNotFound);
    });
  });

  describe("deleting messages", () => {
    it("should return not found if the message doesn't exist.", async () => {
      const tutorApi = await Api.forTutor();
      const tutor = await tutorApi.findCurrentUser();
      const tutorSocket = new ClientSocket(tutor.token);

      const res = await tutorSocket.deleteMessage(123);
      expect(res.code).to.eq(Wss.AcknowledgeCode.MessageNotFound);
    });

    it("should return not found if the message is already deleted.", async () => {
      const tutorApi = await Api.forTutor();
      const tutor = await tutorApi.findCurrentUser();
      const tutorSocket = new ClientSocket(tutor.token);

      const roomId = await knex.transaction(async (tx) =>
        rooms.create([tutor.user.id], tx)
      );
      tutorSocket.sendMessage(roomId, "Lesson will start soon.");
      // wait for message to be saved in db
      const msg = await tutorSocket.wait(Wss.ServerEvent.RoomMessage);

      // first deletion
      tutorSocket.deleteMessage(msg.id);
      await tutorSocket.wait(Wss.ServerEvent.RoomMessageDeleted);

      // second deletion
      const res = await tutorSocket.deleteMessage(msg.id);
      expect(res.code).to.eq(Wss.AcknowledgeCode.MessageNotFound);
    });

    it("should return forbidden if the user is not the owner.", async () => {
      const tutorApi = await Api.forTutor();
      const tutor = await tutorApi.findCurrentUser();
      const tutorSocket = new ClientSocket(tutor.token);

      const roomId = await knex.transaction(async (tx) =>
        rooms.create([tutor.user.id], tx)
      );
      tutorSocket.sendMessage(roomId, "Lesson will start soon.");
      // wait for message to be saved in db
      const msg = await tutorSocket.wait(Wss.ServerEvent.RoomMessage);

      const secTutorApi = await Api.forTutor();
      const secTutor = await secTutorApi.findCurrentUser();
      const secTutorSocket = new ClientSocket(secTutor.token);

      const res = await secTutorSocket.deleteMessage(msg.id);
      expect(res.code).to.eq(Wss.AcknowledgeCode.NotOwner);
    });

    it("should successfully delete the message (mark as deleted).", async () => {
      const tutorApi = await Api.forTutor();
      const tutor = await tutorApi.findCurrentUser();
      const tutorSocket = new ClientSocket(tutor.token);

      const roomId = await knex.transaction(async (tx) =>
        rooms.create([tutor.user.id], tx)
      );
      tutorSocket.sendMessage(roomId, "Lesson will start soon.");
      // wait for message to be saved in db
      const msg = await tutorSocket.wait(Wss.ServerEvent.RoomMessage);

      tutorSocket.deleteMessage(msg.id);
      // wait for message to be saved in db
      const res = await tutorSocket.wait(Wss.ServerEvent.RoomMessageDeleted);

      const found = await messages.findById(res.messageId);
      expect(found).to.not.eq(null);
      expect(found?.id).to.eq(msg.id);
      expect(found?.deleted).to.eq(true);

      const list = await messages.findRoomMessages({ room: res.roomId });
      expect(list.total).to.eq(0);
    });
  });

  describe("reading messages", () => {
    it("should throw not found error if the message doesn't exist.", async () => {
      const studentApi = await Api.forStudent();
      const student = await studentApi.findCurrentUser();

      const studentSocket = new ClientSocket(student.token);

      const res = await studentSocket.markMessageAsRead(123);
      expect(res.code).to.eq(Wss.AcknowledgeCode.MessageNotFound);
    });

    it("should throw not found error if the message is deleted.", async () => {
      const tutorApi = await Api.forTutor();
      const tutor = await tutorApi.findCurrentUser();

      const studentApi = await Api.forStudent();
      const student = await studentApi.findCurrentUser();

      const roomId = await db.room([tutor.user.id, student.user.id]);

      const tutorSocket = new ClientSocket(tutor.token);
      const studentSocket = new ClientSocket(student.token);

      tutorSocket.sendMessage(roomId, "Lesson will start soon.");
      // wait for message to be saved in db
      const msg = await tutorSocket.wait(Wss.ServerEvent.RoomMessage);
      await messages.markAsDeleted(msg.id);

      const res = await studentSocket.markMessageAsRead(msg.id);
      expect(res.code).to.eq(Wss.AcknowledgeCode.MessageNotFound);
    });

    it("should throw forbidden error if the reader is not a member of the messages room.", async () => {
      const tutorApi = await Api.forTutor();
      const tutor = await tutorApi.findCurrentUser();

      const studentApi = await Api.forStudent();
      const student = await studentApi.findCurrentUser();

      const roomId = await knex.transaction(async (tx) =>
        rooms.create([tutor.user.id], tx)
      );

      const tutorSocket = new ClientSocket(tutor.token);
      const studentSocket = new ClientSocket(student.token);

      tutorSocket.sendMessage(roomId, "Lesson will start soon.");

      // wait for message to be saved in db
      const msg = await tutorSocket.wait(Wss.ServerEvent.RoomMessage);

      const res = await studentSocket.markMessageAsRead(msg.id);
      expect(res.code).to.eq(Wss.AcknowledgeCode.NotMember);
    });

    it("should NOT mark read by the owner.", async () => {
      const tutorApi = await Api.forTutor();
      const tutor = await tutorApi.findCurrentUser();
      const tutorSocket = new ClientSocket(tutor.token);

      const roomId = await knex.transaction(async (tx) =>
        rooms.create([tutor.user.id], tx)
      );
      tutorSocket.sendMessage(roomId, "Lesson will start soon.");

      // wait for message to be saved in db
      const msg = await tutorSocket.wait(Wss.ServerEvent.RoomMessage);

      const res = await tutorSocket.markMessageAsRead(msg.id);
      expect(res.code).to.eq(Wss.AcknowledgeCode.Unallowed);
    });

    it("should successfully mark message as read in the database.", async () => {
      const tutorApi = await Api.forTutor();
      const tutor = await tutorApi.findCurrentUser();

      const studentApi = await Api.forStudent();
      const student = await studentApi.findCurrentUser();

      const roomId = await db.room([tutor.user.id, student.user.id]);

      const tutorSocket = new ClientSocket(tutor.token);
      const studentSocket = new ClientSocket(student.token);

      tutorSocket.sendMessage(roomId, "Lesson will start soon.");

      // wait for message to be saved in db
      const msg = await tutorSocket.wait(Wss.ServerEvent.RoomMessage);

      studentSocket.markMessageAsRead(msg.id);
      const res = await tutorSocket.wait(Wss.ServerEvent.RoomMessageRead);
      expect(res.userId).to.eq(student.user.id);
    });
  });
});
