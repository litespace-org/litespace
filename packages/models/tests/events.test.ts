import fixtures from "@fixtures/db";
import { events, knex } from "@/index";
import { IEvent, IUser } from "@litespace/types";
import db from "@fixtures/db";
import { expect } from "chai";
import { first } from "lodash";

describe("Events", () => {
  beforeEach(async () => {
    await fixtures.flush();
  });

  it("should successfully create new event records and retrieve a record with its id", async () => {
    const user = await db.user({ role: IUser.Role.Tutor });

    const createdEvents = await knex.transaction((tx) => {
      return events.create(
        [
          {
            type: IEvent.EventType.UserJoined,
            userId: user.id,
          },
        ],
        tx
      );
    });

    const event = first(createdEvents) as IEvent.Self;
    expect(event).to.not.be.null;

    const found = await events.findById(event.id);
    expect(event).to.deep.eq(found);
  });

  it("should find a list of events for a specific userId", async () => {
    const user1 = await db.user({ role: IUser.Role.Tutor });
    const user2 = await db.user({ role: IUser.Role.TutorManager });

    await knex.transaction((tx) => {
      return events.create(
        [
          {
            type: IEvent.EventType.UserJoined,
            userId: user1.id,
          },
          {
            type: IEvent.EventType.UserLeft,
            userId: user2.id,
          },
          {
            type: IEvent.EventType.UserJoined,
            userId: user2.id,
          },
        ],
        tx
      );
    });

    const res = await events.findByUserId(user2.id);
    expect(res).have.length(2);
  });
});
