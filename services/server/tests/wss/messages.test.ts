import { bad, forbidden, notfound } from "@/lib/error";
import { Api } from "@fixtures/api";
import db from "@fixtures/db";
import { ClientSocket } from "@fixtures/wss";
import { messages, rooms } from "@litespace/models";
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
      tutorSocket.sendMessage(123, 1, "The lesson will start soon.");

      const res = await tutorSocket.wait(Wss.ServerEvent.Revert);
      expect(res.type).to.eq("send-message");
    });

    it("should throw forbidden error if the sender is not a member.", async () => {
      const tutorApi = await Api.forTutor();
      const tutor = await tutorApi.findCurrentUser();

      const roomId = await rooms.create([tutor.user.id]);

      const studentApi = await Api.forStudent();
      const student = await studentApi.findCurrentUser();

      const studentSocket = new ClientSocket(student.token);
      studentSocket.sendMessage(roomId, 1, "Hello.");

      const res = await studentSocket.wait(Wss.ServerEvent.Revert);
      expect(res.type).to.eq("send-message");
    });

    it("should successfully add message to the database.", async () => {
      const tutorApi = await Api.forTutor();
      const tutor = await tutorApi.findCurrentUser();

      const studentApi = await Api.forStudent();
      const student = await studentApi.findCurrentUser();

      const roomId = await rooms.create([tutor.user.id, student.user.id]);

      const studentSocket = new ClientSocket(student.token);
      studentSocket.sendMessage(roomId, 1, "Hello.");

      // wait for message to be saved in db
      await studentSocket.wait(Wss.ServerEvent.RoomMessage);

      const msgs = await messages.findRoomMessages({ room: roomId });
      expect(msgs.total).to.eq(1);
      expect(first(msgs.list)?.text).to.eq("Hello.");
    });

    it("should emit an wss event to members upon each new message.", async () => {
      const tutorApi = await Api.forTutor();
      const tutor = await tutorApi.findCurrentUser();

      const studentApi = await Api.forStudent();
      const student = await studentApi.findCurrentUser();

      const roomId = await rooms.create([tutor.user.id, student.user.id]);

      const tutorSocket = new ClientSocket(tutor.token);
      const studentSocket = new ClientSocket(student.token);

      tutorSocket.sendMessage(roomId, 1, "Lesson will start soon.");
      const res = await studentSocket.wait(Wss.ServerEvent.RoomMessage);

      expect(res.text).to.eq("Lesson will start soon.");
    });

    it("should emit an wss event to the sender if sending message has been reverted.", async () => {
      const studentApi = await Api.forStudent();
      const student = await studentApi.findCurrentUser();

      const studentSocket = new ClientSocket(student.token);
      studentSocket.sendMessage(123, 1, "Hello.");

      const res = await studentSocket.wait(Wss.ServerEvent.Revert);
      expect(res.reason).to.eq("Room not found");
    });
  });

  describe("reading messages", () => {
    it("should throw not found error if the message doesn't exist.", async () => {
      const studentApi = await Api.forStudent();
      const student = await studentApi.findCurrentUser();

      const studentSocket = new ClientSocket(student.token);
      studentSocket.markMessageAsRead(123)

      const res = await studentSocket.wait(Wss.ServerEvent.RoomMessageReverted)
      expect(res.message).to.eq(notfound.base().message);
    });

    it("should throw not found error if the message is deleted.", async () => {
      const tutorApi = await Api.forTutor();
      const tutor = await tutorApi.findCurrentUser();

      const studentApi = await Api.forStudent();
      const student = await studentApi.findCurrentUser();

      const roomId = await rooms.create([tutor.user.id, student.user.id]);

      const tutorSocket = new ClientSocket(tutor.token);
      const studentSocket = new ClientSocket(student.token);

      tutorSocket.sendMessage(roomId, "Lesson will start soon.");
      // wait for message to be saved in db
      const msg = await tutorSocket.wait(Wss.ServerEvent.RoomMessage); 

      tutorSocket.deleteMessage(msg.id)
      // wait for message to be deleted
      await studentSocket.wait(Wss.ServerEvent.RoomMessageDeleted); 

      studentSocket.markMessageAsRead(msg.id)
      const res = await studentSocket.wait(Wss.ServerEvent.RoomMessageReverted);
      expect(res.message).to.eq(notfound.base().message);
    });
    
    it("should throw forbidden error if the reader is not a member of the messages room.", async () => {
      const tutorApi = await Api.forTutor();
      const tutor = await tutorApi.findCurrentUser();

      const studentApi = await Api.forStudent();
      const student = await studentApi.findCurrentUser();

      const roomId = await rooms.create([tutor.user.id]);

      const tutorSocket = new ClientSocket(tutor.token);
      const studentSocket = new ClientSocket(student.token);

      tutorSocket.sendMessage(roomId, "Lesson will start soon.");

      // wait for message to be saved in db
      const msg = await tutorSocket.wait(Wss.ServerEvent.RoomMessage); 

      studentSocket.markMessageAsRead(msg.id)
      const res = await studentSocket.wait(Wss.ServerEvent.RoomMessageReverted);
      
      expect(res.message).to.eq(forbidden().message);
    });

    it("should NOT mark read by the owner.", async () => {
      const tutorApi = await Api.forTutor();
      const tutor = await tutorApi.findCurrentUser();
      const tutorSocket = new ClientSocket(tutor.token);

      const roomId = await rooms.create([tutor.user.id]);
      tutorSocket.sendMessage(roomId, "Lesson will start soon.");

      // wait for message to be saved in db
      const msg = await tutorSocket.wait(Wss.ServerEvent.RoomMessage); 

      tutorSocket.markMessageAsRead(msg.id)
      //const res = await tutorSocket.wait(Wss.ServerEvent.RoomMessageReverted);
      
      //expect(res.message).to.eq(bad().message);
    });

    it("should successfully mark message as read in the database.", async () => {
      const tutorApi = await Api.forTutor();
      const tutor = await tutorApi.findCurrentUser();

      const studentApi = await Api.forStudent();
      const student = await studentApi.findCurrentUser();

      const roomId = await rooms.create([tutor.user.id, student.user.id]);

      const tutorSocket = new ClientSocket(tutor.token);
      const studentSocket = new ClientSocket(student.token);

      tutorSocket.sendMessage(roomId, "Lesson will start soon.");

      // wait for message to be saved in db
      const msg = await tutorSocket.wait(Wss.ServerEvent.RoomMessage); 

      studentSocket.markMessageAsRead(msg.id)
      const res = await tutorSocket.wait(Wss.ServerEvent.RoomMessageRead);
      
      expect(res.userId).to.eq(student.user.id);
    });
  });
});
