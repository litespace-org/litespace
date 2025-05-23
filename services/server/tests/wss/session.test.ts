import { Api } from "@fixtures/api";
import db from "@fixtures/db";
import { ClientSocket } from "@fixtures/wss";
import { IUser, Wss } from "@litespace/types";
import dayjs from "@/lib/dayjs";
import { expect } from "chai";
import { cache } from "@/lib/cache";

describe("sessions test suite", () => {
  let tutor: IUser.FindCurrentUserApiResponse;
  let student: IUser.FindCurrentUserApiResponse;

  let tutorApi: Api;
  let studentApi: Api;

  beforeAll(async () => {
    await cache.connect();
  });

  afterAll(async () => {
    await cache.disconnect();
  });

  beforeEach(async () => {
    await db.flush();
    await cache.flush();

    tutorApi = await Api.forTutor();
    tutor = await tutorApi.findCurrentUser();

    studentApi = await Api.forStudent();
    student = await studentApi.findCurrentUser();

    await db.subscription({
      userId: student.id,
      start: dayjs().toISOString(),
      end: dayjs().add(1, "month").toISOString(),
    });
  });

  it("should join the user socket in the socket.io room when the user pre-join", async () => {
    const now = dayjs.utc();

    const slot = await db.slot({
      userId: tutor.id,
      start: now.startOf("day").toISOString(),
      end: now.add(2, "day").startOf("day").toISOString(),
    });

    const lesson = await studentApi.api.lesson.create({
      start: now.add(1, "hour").toISOString(),
      duration: 30,
      slotId: slot.id,
      tutorId: tutor.id,
    });

    const tutorSocket = new ClientSocket(tutorApi.token);
    let ack = await tutorSocket.preJoinSession(lesson.sessionId);

    const sessionMembersIds = await cache.session.getMembers(lesson.sessionId);
    expect(ack.code).to.eq(Wss.AcknowledgeCode.Ok);
    expect(sessionMembersIds).to.be.of.length(0);

    const result = tutorSocket.wait(Wss.ServerEvent.MemberJoinedSession);

    const studentSocket = new ClientSocket(studentApi.token);
    ack = await studentSocket.joinSession(lesson.sessionId);
    expect(ack.code).to.eq(Wss.AcknowledgeCode.Ok);

    const { userId } = await result;
    expect(userId).to.eq(student.id);

    tutorSocket.client.disconnect();
    studentSocket.client.disconnect();
  });

  it.skip("should broadcast the event when the user join a session", async () => {
    const now = dayjs.utc();

    const slot = await db.slot({
      userId: tutor.id,
      start: now.startOf("day").toISOString(),
      end: now.add(2, "day").startOf("day").toISOString(),
    });

    const lesson = await studentApi.api.lesson.create({
      start: now.add(1, "hour").toISOString(),
      duration: 30,
      slotId: slot.id,
      tutorId: tutor.id,
    });

    const tutorSocket = new ClientSocket(tutorApi.token);
    let ack = await tutorSocket.joinSession(lesson.sessionId);

    let sessionMembersIds = await cache.session.getMembers(lesson.sessionId);
    expect(ack.code).to.eq(Wss.AcknowledgeCode.Ok);
    expect(sessionMembersIds).to.be.of.length(1);
    expect(sessionMembersIds[0]).to.be.eq(tutor.id);

    const studentSocket = new ClientSocket(studentApi.token);
    ack = await studentSocket.joinSession(lesson.sessionId);

    sessionMembersIds = await cache.session.getMembers(lesson.sessionId);
    expect(ack.code).to.eq(Wss.AcknowledgeCode.Ok);
    expect(sessionMembersIds).to.be.of.length(2);
    expect(sessionMembersIds.map((memberId) => memberId)).to.be.members([
      student.id,
      tutor.id,
    ]);

    tutorSocket.client.disconnect();
    studentSocket.client.disconnect();
  });

  it("should NOT broadcast when user tries to join a lesson to which he doesn't belong", async () => {
    const now = dayjs.utc();

    const slot = await db.slot({
      userId: tutor.id,
      start: now.startOf("day").toISOString(),
      end: now.add(2, "day").startOf("day").toISOString(),
    });

    const lesson = await studentApi.api.lesson.create({
      start: now.add(1, "hour").toISOString(),
      duration: 30,
      slotId: slot.id,
      tutorId: tutor.id,
    });

    const newTutorApi = await Api.forTutor();

    const tutorSocket = new ClientSocket(newTutorApi.token);
    const studentSocket = new ClientSocket(studentApi.token);

    const result = studentSocket.wait(Wss.ServerEvent.MemberJoinedSession);
    tutorSocket.joinSession(lesson.sessionId);

    await result
      .then(() => expect(false))
      .catch((e) => expect(e.message).to.be.eq("TIMEOUT"));

    tutorSocket.client.disconnect();
    studentSocket.client.disconnect();
  });

  it("should NOT broadcast when user tries to join a session before its start", async () => {
    const now = dayjs.utc();

    const slot = await db.slot({
      userId: tutor.id,
      start: now.add(1, "day").startOf("day").toISOString(),
      end: now.add(2, "day").startOf("day").toISOString(),
    });

    const lesson = await studentApi.api.lesson.create({
      start: slot.start,
      duration: 30,
      slotId: slot.id,
      tutorId: tutor.id,
    });

    const newTutorApi = await Api.forTutor();
    const tutorSocket = new ClientSocket(newTutorApi.token);
    const studentSocket = new ClientSocket(studentApi.token);

    const result = studentSocket.wait(Wss.ServerEvent.MemberJoinedSession);
    tutorSocket.joinSession(lesson.sessionId);

    await result
      .then(() => expect(false))
      .catch((e) => expect(e.message).to.be.eq("TIMEOUT"));

    tutorSocket.client.disconnect();
    studentSocket.client.disconnect();
  });
});
