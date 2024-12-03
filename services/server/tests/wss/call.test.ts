import { Api } from "@fixtures/api";
import db, { flush, interview } from "@fixtures/db";
import { ClientSocket } from "@fixtures/wss";
import { IUser, Wss } from "@litespace/types";
import dayjs from "@/lib/dayjs";
import { IRule } from "@litespace/types";
import { Time } from "@litespace/sol/time";
import { faker } from "@faker-js/faker/locale/ar";
import { unpackRules } from "@litespace/sol/rule";
import { expect } from "chai";

describe("calls test suite", () => {
  let tutor: IUser.LoginApiResponse;
  let student: IUser.LoginApiResponse;

  let tutorApi: Api;
  let studentApi: Api;

  let rule: IRule.Self;
  let selectedRuleEvent: IRule.RuleEvent;

  beforeEach(async () => {
    await flush();

    tutorApi = await Api.forTutor();
    tutor = await tutorApi.findCurrentUser();

    studentApi = await Api.forStudent();
    student = await studentApi.findCurrentUser();
  });

  it("should broadcast the event when the user join the call", async () => {
    const now = dayjs();
    rule = await tutorApi.atlas.rule.create({
      start: now.utc().startOf("day").toISOString(),
      end: now.utc().add(10, "day").startOf("day").toISOString(),
      duration: 8 * 60,
      frequency: IRule.Frequency.Daily,
      time: Time.from(now.hour() + ":" + now.minute()).utc().format("railway"),
      title: faker.lorem.words(3),
    });
    const unpackedRules = unpackRules({
      rules: [rule],
      slots: [],
      start: rule.start,
      end: rule.end,
    });
    selectedRuleEvent = unpackedRules[0];

    const lesson = await studentApi.atlas.lesson.create({
      start: selectedRuleEvent.start,
      duration: 30,
      ruleId: rule.id,
      tutorId: tutor.user.id,
    });

    const tutorSocket = new ClientSocket(tutor.token);
    const studentSocket = new ClientSocket(student.token);

    const result = studentSocket.wait(Wss.ServerEvent.MemberJoinedCall);
    tutorSocket.joinCall(lesson.callId, "lesson");

    const { userId } = await result;
    expect(userId).to.be.eq(tutor.user.id);
  });

  it("should NOT broadcast when user tries to join a lesson to which he doesn't belong", async () => {
    const now = dayjs();
    rule = await tutorApi.atlas.rule.create({
      start: now.utc().startOf("day").toISOString(),
      end: now.utc().add(10, "day").startOf("day").toISOString(),
      duration: 8 * 60,
      frequency: IRule.Frequency.Daily,
      time: Time.from(now.hour() + ":" + now.minute()).utc().format("railway"),
      title: faker.lorem.words(3),
    });
    const unpackedRules = unpackRules({
      rules: [rule],
      slots: [],
      start: rule.start,
      end: rule.end,
    });
    selectedRuleEvent = unpackedRules[0];
    
    const lesson = await studentApi.atlas.lesson.create({
      start: selectedRuleEvent.start,
      duration: 30,
      ruleId: rule.id,
      tutorId: tutor.user.id,
    });

    const newTutorApi = await Api.forTutor();
    tutor = await newTutorApi.findCurrentUser();

    const tutorSocket = new ClientSocket(tutor.token);
    const studentSocket = new ClientSocket(student.token);

    const result = studentSocket.wait(Wss.ServerEvent.MemberJoinedCall);
    tutorSocket.joinCall(lesson.callId, "lesson");

    try {
      const _ = await result;
      expect(false);
    }
    catch(e) {
      expect(true);
    }
  })

  it("should NOT broadcast when user tries to join a call before its start", async () => {
    const now = dayjs();
    rule = await tutorApi.atlas.rule.create({
      start: now.add(1, "day").utc().startOf("day").toISOString(),
      end: now.utc().add(10, "day").startOf("day").toISOString(),
      duration: 8 * 60,
      frequency: IRule.Frequency.Daily,
      time: Time.from(now.hour() + ":" + now.minute()).utc().format("railway"),
      title: faker.lorem.words(3),
    });
    const unpackedRules = unpackRules({
      rules: [rule],
      slots: [],
      start: rule.start,
      end: rule.end,
    });
    selectedRuleEvent = unpackedRules[0];

    const lesson = await studentApi.atlas.lesson.create({
      start: selectedRuleEvent.start,
      duration: 30,
      ruleId: rule.id,
      tutorId: tutor.user.id,
    });

    const newTutorApi = await Api.forTutor();
    tutor = await newTutorApi.findCurrentUser();

    const tutorSocket = new ClientSocket(tutor.token);
    const studentSocket = new ClientSocket(student.token);

    const result = studentSocket.wait(Wss.ServerEvent.MemberJoinedCall);
    tutorSocket.joinCall(lesson.callId, "lesson");

    try {
      const _ = await result;
      expect(false);
    }
    catch(e) {
      expect(true);
    }
  })
});
