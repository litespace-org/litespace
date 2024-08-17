import { asDiscrateSlot, splitSlot, unpackSlots } from "@/slots";
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

  describe.only("TEST", () => {
    const data = {
      calls: [
        {
          start: "2024-09-01T08:00:00.000Z",
          duration: 30,
          ...sharedCall,
        },
      ],
      slots: [
        {
          weekday: -1,
          time: { start: "08:00:00", end: "13:00:00" },
          date: { start: "2024-08-14T21:00:00.000Z" },
          repeat: ISlot.Repeat.Daily,
          ...sharedSlot,
        },
        {
          weekday: -1,
          time: { start: "17:00:00", end: "22:00:00" },
          date: { start: "2024-08-14T21:00:00.000Z" },
          repeat: ISlot.Repeat.Daily,
          ...sharedSlot,
        },
      ],
    };

    const unpacked = unpackSlots(data.slots, data.calls, {
      start: dayjs.utc("2024-09-01", "YYYY-MM-DD"), // ISO date format
      window: 1,
    });
    console.log(JSON.stringify(unpacked, null, 2), unpacked);
  });

  describe("Split slots", () => {
    it("should split slot into 30 minutes blocks", () => {
      const slot: ISlot.Self = {
        weekday: -1,
        time: { start: "10:00:00", end: "12:00:00" },
        date: { start: "2024-08-10" },
        repeat: ISlot.Repeat.Daily,
        ...sharedSlot,
      };

      const discrete = asDiscrateSlot(
        slot,
        dayjs.utc("2024-08-10", "YYYY-MM-DD")
      );

      const slots = splitSlot(discrete);
      expect(slots).to.be.deep.eq(
        [
          {
            start: "2024-08-10T10:00:00.000Z",
            end: "2024-08-10T10:30:00.000Z",
          },
          {
            start: "2024-08-10T10:30:00.000Z",
            end: "2024-08-10T11:00:00.000Z",
          },
          {
            start: "2024-08-10T11:00:00.000Z",
            end: "2024-08-10T11:30:00.000Z",
          },
          {
            start: "2024-08-10T11:30:00.000Z",
            end: "2024-08-10T12:00:00.000Z",
          },
        ].map(({ start, end }) => ({ ...discrete, start, end }))
      );
    });

    it("should split slot into 15 minutes blocks", () => {
      const slot: ISlot.Self = {
        weekday: -1,
        time: { start: "10:00:00", end: "10:50:00" },
        date: { start: "2024-08-10" },
        repeat: ISlot.Repeat.Daily,
        ...sharedSlot,
      };

      const discrete = asDiscrateSlot(
        slot,
        dayjs.utc("2024-08-10", "YYYY-MM-DD")
      );

      const slots = splitSlot(discrete, 15);
      expect(slots).to.be.deep.eq(
        [
          {
            start: "2024-08-10T10:00:00.000Z",
            end: "2024-08-10T10:15:00.000Z",
          },
          {
            start: "2024-08-10T10:15:00.000Z",
            end: "2024-08-10T10:30:00.000Z",
          },
          {
            start: "2024-08-10T10:30:00.000Z",
            end: "2024-08-10T10:45:00.000Z",
          },
        ].map(({ start, end }) => ({ ...discrete, start, end }))
      );
    });
  });
});
