import { Api } from "@fixtures/api";
import db, { flush } from "@fixtures/db";
import { ClientSocket } from "@fixtures/wss";
import { IMessage, IUser, Wss } from "@litespace/types";
import dayjs from "@/lib/dayjs";
import { IRule } from "@litespace/types";
import { Time } from "@litespace/sol/time";
import { faker } from "@faker-js/faker/locale/ar";
import { unpackRules } from "@litespace/sol/rule";
import { expect } from "chai";
import { messages } from "@litespace/models";

describe("Messages", () => {
  let tutor: IUser.LoginApiResponse;
  let student: IUser.LoginApiResponse;
  let room: number;
  let chatMessages: IMessage.Self[];
  let tutorSocket: ClientSocket;
  let studentSocket: ClientSocket;

  beforeEach(async () => {
    await flush();

    const tutorApi = await Api.forTutor();
    tutor = await tutorApi.findCurrentUser();

    const studentApi = await Api.forStudent();
    student = await studentApi.findCurrentUser();

    room = await db.room([student.user.id, tutor.user.id]);

    chatMessages = await Promise.all(
      [
        {
          text: "1",
          userId: student.user.id,
          roomId: room,
        },
        {
          text: "2",
          userId: student.user.id,
          roomId: room,
        },
        {
          text: "3",
          userId: student.user.id,
          roomId: room,
        },
      ].map(async (message) => {
        return await messages.create(message);
      })
    );
    tutorSocket = new ClientSocket(tutor.token);
    studentSocket = new ClientSocket(student.token);
  });

  describe("deleteMessage", () => {
    it("should delete a message and emits the results", async () => {
      const result1 = tutorSocket.wait(Wss.ServerEvent.RoomMessageDeleted);
      const result2 = studentSocket.wait(Wss.ServerEvent.RoomMessageDeleted);
      studentSocket.deleteMessage(chatMessages[1].id);

      const { messageId, roomId } = await result1;
      expect(messageId).to.be.eq(chatMessages[1].id);
      expect(roomId).to.be.eq(room);

      const { messageId: id, roomId: id2 } = await result2;
      expect(id).to.be.eq(chatMessages[1].id);
      expect(id2).to.be.eq(room);

      const message = await messages.findById(messageId);
      expect(message?.deleted).to.be.eq(true);
    });

    it("should not delete a message that is already deleted or not found", async () => {
      try {
        studentSocket.deleteMessage(chatMessages[1].id);
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).to.be.eq("Message not found");
        }
      }
    });

    it("should not delete a message if unauthorized user", async () => {
      try {
        tutorSocket.deleteMessage(chatMessages[1].id);
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).to.be.eq("Forbidden");
        }
      }
    });
  });

  describe("markAsRead", () => {
    it("should mark a message as read and emits the results", async () => {
      const result = studentSocket.wait(Wss.ServerEvent.MessageRead);
      tutorSocket.markAsRead(chatMessages[1].id);

      const { messageId } = await result;
      expect(messageId).to.be.eq(chatMessages[1].id);

      const message = await messages.findById(messageId);
      expect(message?.read).to.be.eq(true);
    });

    it("should not mark a not found message as read", async () => {
      try {
        tutorSocket.markAsRead(chatMessages[1].id);
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).to.be.eq("Message not found");
        }
      }
    });

    it("should not mark a message if unauthorized user", async () => {
      try {
        const tutorApi = await Api.forTutor();
        const unAuthorizedtutor = await tutorApi.findCurrentUser();
        const unAuthorizedtutorSocket = new ClientSocket(
          unAuthorizedtutor.token
        );

        unAuthorizedtutorSocket.markAsRead(chatMessages[1].id);
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).to.be.eq("Unauthorized");
        }
      }
    });
  });
});
