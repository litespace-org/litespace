import { Api } from "@fixtures/api";
import db, { flush } from "@fixtures/db";
import { ClientSocket } from "@fixtures/wss";
import { IUser, Wss } from "@litespace/types";

describe("Typing", () => {
  let tutor: IUser.FindCurrentUserApiResponse;
  let student: IUser.FindCurrentUserApiResponse;
  let room: number;
  let tutorSocket: ClientSocket;
  let studentSocket: ClientSocket;

  beforeEach(async () => {
    await flush();

    const tutorApi = await Api.forTutor();
    tutor = await tutorApi.findCurrentUser();

    const studentApi = await Api.forStudent();
    student = await studentApi.findCurrentUser();

    room = await db.room([student.id, tutor.id]);
    tutorSocket = new ClientSocket(tutorApi.token);
    studentSocket = new ClientSocket(studentApi.token);
  });

  afterEach(() => {
    tutorSocket.client.disconnect();
    studentSocket.client.disconnect();
  });

  it.skip("should emit an event", async () => {
    const result = tutorSocket.wait(Wss.ServerEvent.UserTyping);
    studentSocket.userTyping(room);

    const { userId, roomId } = await result;

    expect(roomId).toBe(room);
    expect(userId).toBe(student.id);
  }, 99999);

  it("should omit typing event incase user is not a room member", async () => {
    const unauthedStudentApi = await Api.forStudent();
    const unauthedStudentSocket = new ClientSocket(unauthedStudentApi.token);

    const result = tutorSocket.wait(Wss.ServerEvent.UserTyping);
    unauthedStudentSocket.userTyping(room);

    await result
      .then(() => {
        throw Error("Unexpected success");
      })
      .catch((error: Error) => expect(error.message).toBe("TIMEOUT"));

    unauthedStudentSocket.client.disconnect();
  });
});
