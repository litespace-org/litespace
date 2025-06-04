import { fixtures } from "@litespace/tests";
import { sessionEvents, knex } from "@/index";
import { ISessionEvent, IUser } from "@litespace/types";
import { expect } from "chai";

describe("Events", () => {
  beforeEach(async () => {
    await fixtures.flush();
  });

  it("should successfully create new event records and retrieve a record with its id", async () => {
    const user = await fixtures.user({ role: IUser.Role.Tutor });

    const event = await knex.transaction((tx) => {
      return sessionEvents.create(
        {
          type: ISessionEvent.EventType.UserJoined,
          userId: user.id,
          sessionId: "lesson:0x",
        },
        tx
      );
    });

    expect(event.sessionId).to.be.eq("lesson:0x");
    expect(event.type).to.be.eq(ISessionEvent.EventType.UserJoined);
    expect(event.userId).to.be.eq(user.id);
  });

  it("should find a list of events for a specific userId", async () => {
    const user1 = await fixtures.user({ role: IUser.Role.Tutor });
    const user2 = await fixtures.user({ role: IUser.Role.TutorManager });

    await knex.transaction((tx) => {
      return sessionEvents.createMany(
        [
          {
            type: ISessionEvent.EventType.UserJoined,
            userId: user1.id,
            sessionId: "interview:0x",
          },
          {
            type: ISessionEvent.EventType.UserLeft,
            userId: user2.id,
            sessionId: "lesson:0x",
          },
          {
            type: ISessionEvent.EventType.UserJoined,
            userId: user2.id,
            sessionId: "lesson:0x",
          },
        ],
        tx
      );
    });

    const res = await sessionEvents.find({ users: [user2.id] });
    expect(res).have.length(2);
  });
});
