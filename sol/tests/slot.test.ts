import { unpackSlots } from "@/slots";
import { ICall, ISlot } from "@litespace/types";
import { expect } from "chai";
import { dayjs } from "@/dayjs";

const sharedSlot = {
  id: 1,
  userId: 1,
  title: "-",
  createdAt: "",
  updatedAt: "",
} as const;

const sharedCall = {
  id: 1,
  type: ICall.Type.Interview,
  hostId: 1,
  attendeeId: 1,
  slotId: 1,
  createdAt: "",
  updatedAt: "",
  note: null,
  feedback: null,
} as const;

describe("Slots", () => {
  describe("Daily slots", () => {
    it("should unpack daily slots", () => {
      const slot: ISlot.Self = {
        weekday: -1,
        time: { start: "10:00:00", end: "18:00:00" },
        date: { start: "2024-08-10" },
        repeat: ISlot.Repeat.Daily,
        ...sharedSlot,
      };

      const unpacked = unpackSlots([slot], [], {
        start: dayjs.utc("2024-08-10", "YYYY-MM-DD"),
        window: 2,
      });

      expect(unpacked).to.be.deep.eq([
        {
          day: "2024-08-10T00:00:00.000Z",
          slots: [
            {
              start: "2024-08-10T10:00:00.000Z",
              end: "2024-08-10T18:00:00.000Z",
              ...sharedSlot,
            },
          ],
        },
        {
          day: "2024-08-11T00:00:00.000Z",
          slots: [
            {
              start: "2024-08-11T10:00:00.000Z",
              end: "2024-08-11T18:00:00.000Z",
              ...sharedSlot,
            },
          ],
        },
      ]);
    });

    it("should unpack daily slots with booked calls", () => {
      const slot: ISlot.Self = {
        weekday: -1,
        time: { start: "10:00:00", end: "18:00:00" },
        date: { start: "2024-08-10" },
        repeat: ISlot.Repeat.Daily,
        ...sharedSlot,
      };

      const calls: ICall.Self[] = [
        {
          start: "2024-08-10T10:30:00.000Z",
          duration: 30,
          ...sharedCall,
        },
        {
          start: "2024-08-10T12:00:00.000Z",
          duration: 30,
          ...sharedCall,
        },
        {
          start: "2024-08-11T11:30:00.000Z",
          duration: 30,
          ...sharedCall,
        },
      ];

      const unpacked = unpackSlots([slot], calls, {
        start: dayjs.utc("2024-08-10", "YYYY-MM-DD"),
        window: 2,
      });

      expect(unpacked).to.be.deep.eq([
        {
          day: "2024-08-10T00:00:00.000Z",
          slots: [
            {
              start: "2024-08-10T10:00:00.000Z",
              end: "2024-08-10T10:30:00.000Z",
              ...sharedSlot,
            },
            {
              start: "2024-08-10T11:00:00.000Z",
              end: "2024-08-10T12:00:00.000Z",
              ...sharedSlot,
            },
            {
              start: "2024-08-10T12:30:00.000Z",
              end: "2024-08-10T18:00:00.000Z",
              ...sharedSlot,
            },
          ],
        },
        {
          day: "2024-08-11T00:00:00.000Z",
          slots: [
            {
              start: "2024-08-11T10:00:00.000Z",
              end: "2024-08-11T11:30:00.000Z",
              ...sharedSlot,
            },
            {
              start: "2024-08-11T12:00:00.000Z",
              end: "2024-08-11T18:00:00.000Z",
              ...sharedSlot,
            },
          ],
        },
      ]);
    });
  });
});
