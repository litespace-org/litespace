import { Api } from "@fixtures/api";
import db, { flush } from "@fixtures/db";
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

  beforeEach(async () => {
    await flush();

    tutorApi = await Api.forTutor();
    tutor = await tutorApi.findCurrentUser();

    studentApi = await Api.forStudent();
    student = await studentApi.findCurrentUser();
  });

  it("should broadcast the event when the user join the call", async () => {
    const rule = await tutorApi.atlas.rule.create({
      start: dayjs.utc().startOf("day").toISOString(),
      end: dayjs.utc().add(10, "day").startOf("day").toISOString(),
      duration: 8 * 60,
      frequency: IRule.Frequency.Daily,
      time: Time.from("12:00").utc().format("railway"),
      title: faker.lorem.words(3),
    });

    const unpackedRules = unpackRules({
      rules: [rule],
      slots: [],
      start: rule.start,
      end: rule.end,
    });

    const [selectedRule] = unpackedRules;

    const lesson = await studentApi.atlas.lesson.create({
      start: selectedRule.start,
      duration: 30,
      ruleId: rule.id,
      tutorId: tutor.user.id,
    });

    const tutorSocket = new ClientSocket(tutor.token);
    const studentSocket = new ClientSocket(student.token);

    const result = studentSocket.wait(Wss.ServerEvent.MemberJoinedCall);
    tutorSocket.joinCall(lesson.callId);

    const { userId } = await result;
    expect(userId).to.be.eq(tutor.user.id);
  });
});
