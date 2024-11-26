import { Api } from "@fixtures/api";
import db, { flush } from "@fixtures/db";
import { ClientSocket } from "@fixtures/wss";
import { IUser, Wss } from "@litespace/types";

describe("Typing", () => {
  let tutor: IUser.LoginApiResponse;
  let student: IUser.LoginApiResponse;
  let room: number;
  let tutorSocket: ClientSocket;
  let studentSocket: ClientSocket;

  beforeEach(async () => {
    await flush();

    const tutorApi = await Api.forTutor();
    tutor = await tutorApi.findCurrentUser();

    const studentApi = await Api.forStudent();
    student = await studentApi.findCurrentUser();

    room = await db.room([student.user.id, tutor.user.id]);
    tutorSocket = new ClientSocket(tutor.token);
    studentSocket = new ClientSocket(student.token);
  });

  it("should emit an event", async () => {
    const result = tutorSocket.wait(Wss.ServerEvent.UserTyping);
    studentSocket.userTyping(room);

    const { userId, roomId } = await result;

    expect(roomId).toBe(room);
    expect(userId).toBe(student.user.id);
  });

  it("should omit typing event incase user is not a room member", async () => {
    const unauthedStudentApi = await Api.forStudent();
    const unauthedStudent = await unauthedStudentApi.findCurrentUser();
    const unauthedStudentSocket = new ClientSocket(unauthedStudent.token);

    const result = tutorSocket.wait(Wss.ServerEvent.UserTyping);
    unauthedStudentSocket.userTyping(room);

    await result
      .then(() => {
        throw Error("Unexpected success");
      })
      .catch((error: Error) => expect(error.message).toBe("TIMEOUT"));
  });
});
