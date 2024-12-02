import { Api } from "@fixtures/api";
import db, { flush } from "@fixtures/db";
import { ClientSocket } from "@fixtures/wss";
import { IUser, Wss } from "@litespace/types";
import { number } from "zod";

describe("calls test suite", () => {
  let admin: IUser.LoginApiResponse;
  let tutor: IUser.LoginApiResponse;

  let callId: number;

  let adminSocket: ClientSocket;
  let tutorSocket: ClientSocket;

  beforeEach(async () => {
    await flush();

    const adminApi = await Api.forSuperAdmin();
    admin = await adminApi.findCurrentUser();

    const tutorApi = await Api.forTutor();
    tutor = await tutorApi.findCurrentUser();

    let interview = await db.interview({
      interviewer: admin.user.id,
      interviewee: tutor.user.id
    });
    callId = interview.ids.call;

    adminSocket = new ClientSocket(admin.token);
    tutorSocket = new ClientSocket(tutor.token);
  });

  it("should the user (client) emit an event when joining a call", async () => {
    const asyncResult = adminSocket.wait(Wss.ServerEvent.MemberJoinedCall);
    tutorSocket.joinCall(callId);

    const { memberId } = await asyncResult;

    expect(memberId).toBe(number);
    expect(memberId).toEqual(tutor.user.id);
  });

  it("should the user (client) emit an event when leaving a call", async () => {
    const asyncResult = adminSocket.wait(Wss.ServerEvent.MemberLeftCall);
    tutorSocket.joinCall(callId);
    tutorSocket.leaveCall(callId);

    const { memberId } = await asyncResult;

    expect(memberId).toBe(number);
    expect(memberId).toEqual(tutor.user.id);
  });
});
