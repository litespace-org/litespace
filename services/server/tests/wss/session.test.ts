import { Api } from "@fixtures/api";
import { flush } from "@fixtures/db";
import { ClientSocket } from "@fixtures/wss";
import { IUser, Wss } from "@litespace/types";
import dayjs from "@/lib/dayjs";
import { IRule } from "@litespace/types";
import { Time } from "@litespace/sol/time";
import { faker } from "@faker-js/faker/locale/ar";
import { unpackRules } from "@litespace/sol/rule";
import { expect } from "chai";
import { cache } from "@/lib/cache";

describe("sessions test suite", () => {
  let tutor: IUser.LoginApiResponse;
  let student: IUser.LoginApiResponse;

  let tutorApi: Api;
  let studentApi: Api;

  beforeAll(async () => {
    await cache.connect();
  });

  afterAll(async () => {
    await cache.disconnect();
  });

  beforeEach(async () => {
    await flush();
    await cache.flush();

    tutorApi = await Api.forTutor();
    tutor = await tutorApi.findCurrentUser();

    studentApi = await Api.forStudent();
    student = await studentApi.findCurrentUser();
  });

  it("should broadcast the event when the user join a session", async () => {
    const now = dayjs();

    const rule = await tutorApi.atlas.rule.create({
      start: now.utc().startOf("day").toISOString(),
      end: now.utc().add(10, "day").startOf("day").toISOString(),
      duration: 8 * 60,
      frequency: IRule.Frequency.Daily,
      time: Time.from(now.hour() + ":" + now.minute())
        .utc()
        .format("railway"),
      title: faker.lorem.words(3),
    });

    const unpackedRules = unpackRules({
      rules: [rule],
      slots: [],
      start: rule.start,
      end: rule.end,
    });

    const selectedRuleEvent = unpackedRules[0];

    const lesson = await studentApi.atlas.lesson.create({
      start: selectedRuleEvent.start,
      duration: 30,
      ruleId: rule.id,
      tutorId: tutor.user.id,
    });

    const tutorSocket = new ClientSocket(tutor.token);
    const studentSocket = new ClientSocket(student.token);

    const studentResult = studentSocket.wait(
      Wss.ServerEvent.MemberJoinedSession
    );
    tutorSocket.joinSession(lesson.sessionId);

    const { userId } = await studentResult;

    const sessionMembersIds = await cache.session.getMembers(lesson.sessionId);
    expect(sessionMembersIds).to.be.of.length(1);
    expect(sessionMembersIds[0]).to.be.eq(tutor.user.id);
    expect(userId).to.be.eq(tutor.user.id);

    const tutorResult = tutorSocket.wait(Wss.ServerEvent.MemberJoinedSession);
    studentSocket.joinSession(lesson.sessionId);

    const { userId: studentId } = await tutorResult;
    const sessionMembersIdsSecondSnapshot = await cache.session.getMembers(
      lesson.sessionId
    );
    expect(sessionMembersIdsSecondSnapshot).to.be.of.length(2);
    expect(
      sessionMembersIdsSecondSnapshot.map((memberId) => memberId)
    ).to.be.members([student.user.id, tutor.user.id]);

    expect(studentId).to.be.eq(student.user.id);

    tutorSocket.client.disconnect();
    studentSocket.client.disconnect();
  });

  it("should NOT broadcast when user tries to join a lesson to which he doesn't belong", async () => {
    const now = dayjs();
    const rule = await tutorApi.atlas.rule.create({
      start: now.utc().startOf("day").toISOString(),
      end: now.utc().add(10, "day").startOf("day").toISOString(),
      duration: 8 * 60,
      frequency: IRule.Frequency.Daily,
      time: Time.from(now.hour() + ":" + now.minute())
        .utc()
        .format("railway"),
      title: faker.lorem.words(3),
    });

    const unpackedRules = unpackRules({
      rules: [rule],
      slots: [],
      start: rule.start,
      end: rule.end,
    });

    const selectedRuleEvent = unpackedRules[0];

    const lesson = await studentApi.atlas.lesson.create({
      start: selectedRuleEvent.start,
      duration: 30,
      ruleId: rule.id,
      tutorId: tutor.user.id,
    });

    const newTutorApi = await Api.forTutor();
    const newTutor = await newTutorApi.findCurrentUser();

    const tutorSocket = new ClientSocket(newTutor.token);
    const studentSocket = new ClientSocket(student.token);

    const result = studentSocket.wait(Wss.ServerEvent.MemberJoinedSession);
    tutorSocket.joinSession(lesson.sessionId);

    await result
      .then(() => expect(false))
      .catch((e) => expect(e.message).to.be.eq("TIMEOUT"));

    tutorSocket.client.disconnect();
    studentSocket.client.disconnect();
  });

  it("should NOT broadcast when user tries to join a session before its start", async () => {
    const now = dayjs();
    const rule = await tutorApi.atlas.rule.create({
      start: now.add(1, "day").utc().startOf("day").toISOString(),
      end: now.utc().add(10, "day").startOf("day").toISOString(),
      duration: 8 * 60,
      frequency: IRule.Frequency.Daily,
      time: Time.from(now.hour() + ":" + now.minute())
        .utc()
        .format("railway"),
      title: faker.lorem.words(3),
    });

    const unpackedRules = unpackRules({
      rules: [rule],
      slots: [],
      start: rule.start,
      end: rule.end,
    });
    const selectedRuleEvent = unpackedRules[0];

    const lesson = await studentApi.atlas.lesson.create({
      start: selectedRuleEvent.start,
      duration: 30,
      ruleId: rule.id,
      tutorId: tutor.user.id,
    });

    const newTutorApi = await Api.forTutor();
    const newTutor = await newTutorApi.findCurrentUser();

    const tutorSocket = new ClientSocket(newTutor.token);
    const studentSocket = new ClientSocket(student.token);

    const result = studentSocket.wait(Wss.ServerEvent.MemberJoinedSession);
    tutorSocket.joinSession(lesson.sessionId);

    await result
      .then(() => expect(false))
      .catch((e) => expect(e.message).to.be.eq("TIMEOUT"));

    tutorSocket.client.disconnect();
    studentSocket.client.disconnect();
  });
});
