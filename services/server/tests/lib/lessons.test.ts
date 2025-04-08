import dayjs from "@/lib/dayjs";
import { evaluateAttendance } from "@/lib/lesson";
import { ISessionEvent } from "@litespace/types";

describe("evaluateAttendance", () => {
  const SESSION_ID = 1;
  let now: dayjs.Dayjs;

  beforeAll(() => {
    now = dayjs.utc();
  });

  // Helper function to create event objects
  function createEvent(
    userId: number,
    type: ISessionEvent.EventType,
    minutesAgo?: number
  ): ISessionEvent.Self {
    return {
      id: Math.random(), // Mock ID
      userId,
      type,
      sessionId: `lesson:${SESSION_ID}`,
      createdAt: minutesAgo
        ? now.subtract(minutesAgo, "minute").toISOString()
        : now.toISOString(),
    };
  }

  it("should pass when user attends >25% of 30min lesson", () => {
    const events = [
      createEvent(1, ISessionEvent.EventType.UserJoined, 10), // Joined 10 mins ago
      createEvent(1, ISessionEvent.EventType.UserLeft, 0), // Left now
    ];

    const result = evaluateAttendance({
      events,
      userIds: [1],
      duration: 30,
    });

    expect(result[1]).toBe(true);
  });

  it("should fail when user attends <25% of 15min lesson", () => {
    const events = [
      createEvent(1, ISessionEvent.EventType.UserJoined, 3), // Joined 3 mins ago
      createEvent(1, ISessionEvent.EventType.UserLeft, 0), // Left now
    ];

    const result = evaluateAttendance({
      events,
      userIds: [1],
      duration: 15,
    });

    expect(result[1]).toBe(false);
  });

  it("should handle multiple join-leave cycles", () => {
    const events = [
      createEvent(1, ISessionEvent.EventType.UserJoined, 15), // 5 mins
      createEvent(1, ISessionEvent.EventType.UserLeft, 10),
      createEvent(1, ISessionEvent.EventType.UserJoined, 8), // 8 mins
      createEvent(1, ISessionEvent.EventType.UserLeft, 0),
    ];

    const result = evaluateAttendance({
      events,
      userIds: [1],
      duration: 30,
    });

    expect(result[1]).toBe(true); // Total 13 mins (43%)
  });

  it("should ignore events from other users", () => {
    const events = [
      createEvent(1, ISessionEvent.EventType.UserJoined, 10),
      createEvent(2, ISessionEvent.EventType.UserLeft, 0), // Different user
    ];

    const result = evaluateAttendance({
      events,
      userIds: [1],
      duration: 30,
    });

    expect(result[1]).toBe(false);
  });

  it("should handle exact 25% threshold", () => {
    const events = [
      createEvent(1, ISessionEvent.EventType.UserJoined, 7.5),
      createEvent(1, ISessionEvent.EventType.UserLeft, 0),
    ];

    const result = evaluateAttendance({
      events,
      userIds: [1],
      duration: 30,
    });

    expect(result[1]).toBe(true);
  });

  it("should mark user absent if only join exists", () => {
    const events = [createEvent(1, ISessionEvent.EventType.UserJoined, 10)];

    const result = evaluateAttendance({
      events,
      userIds: [1],
      duration: 30,
    });

    expect(result[1]).toBe(false);
  });

  it("should correctly evaluate multiple users", () => {
    const events = [
      // User 1: 10 minutes (33%)
      createEvent(1, ISessionEvent.EventType.UserJoined, 10),
      createEvent(1, ISessionEvent.EventType.UserLeft, 0),
      // User 2: 5 minutes (16%)
      createEvent(2, ISessionEvent.EventType.UserJoined, 5),
      createEvent(2, ISessionEvent.EventType.UserLeft, 0),
    ];

    const result = evaluateAttendance({
      events,
      userIds: [1, 2],
      duration: 30,
    });

    expect(result[1]).toBe(true);
    expect(result[2]).toBe(false);
  });

  it("should ignore consecutive joins without leaves", () => {
    const events = [
      createEvent(1, ISessionEvent.EventType.UserJoined, 20),
      createEvent(1, ISessionEvent.EventType.UserJoined, 15), // Ignored
      createEvent(1, ISessionEvent.EventType.UserLeft, 5),
    ];

    const result = evaluateAttendance({
      events,
      userIds: [1],
      duration: 30,
    });

    expect(result[1]).toBe(true);
  });
});
