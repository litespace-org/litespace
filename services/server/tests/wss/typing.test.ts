import { Api } from "@fixtures/api";
import db, { user } from "@fixtures/db";
import { ClientSocket } from "@fixtures/wss";
import { Wss } from "@litespace/types";

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("Typing", () => {
  it("should emit an event", async () => {
    const tutorApi = await Api.forTutor();
    const tutor = await tutorApi.findCurrentUser();
    const studentApi = await Api.forStudent();
    const student = await studentApi.findCurrentUser();

    const room = await db.room([student.user.id, tutor.user.id]);

    const tutorSocket = new ClientSocket(tutor.token);
    tutorSocket.client.on(Wss.ServerEvent.UserTyping, ({ roomId }) => {
      console.log("Tutor is typing");
      console.log(roomId);
    });

    const stuentSocket = new ClientSocket(student.token);
    stuentSocket.userTyping(room);

    console.log("waiting");
    await sleep(5_000);
  }, 999999999);
});
