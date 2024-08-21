import { asDiscreteSlot, splitSlot, unpackSlots } from "@/slots";
import { ICall, ISlot } from "@litespace/types";
import { expect } from "chai";
import { dayjs } from "@/dayjs";
import { Time } from "@/time";

// user:
//     date:
//          start: 10-8-2024
//          end:
//     time:
//          start: 12am

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
  describe("Discrate slots", () => {
    const testSlots = {
      first: {
        ...sharedSlot,
        start: dayjs("2024-08-10").utc().format(),
        end: null,
        time: Time.from("1am").utc().format(),
        duration: 180,
        weekday: -1,
        repeat: ISlot.Repeat.Daily,
      },
      second: {
        ...sharedSlot,
        start: dayjs("2024-08-10").utc().format(),
        end: null,
        time: Time.from("12pm").utc().format(),
        duration: 180,
        weekday: -1,
        repeat: ISlot.Repeat.Daily,
      },
      third: {
        ...sharedSlot,
        start: dayjs("2024-08-10").utc().format(),
        end: dayjs("2024-08-15").utc().format(),
        time: Time.from("1am").utc().format(),
        duration: 180,
        weekday: -1,
        repeat: ISlot.Repeat.Daily,
      },
    };

    it("should unpack slot to a discrate date (1)", () => {
      const slots = asDiscreteSlot(testSlots.first, dayjs.utc("2024-08-11"));
      const expected = [
        { start: "2024-08-11T00:00:00.000Z", end: "2024-08-11T01:00:00.000Z" },
        { start: "2024-08-11T22:00:00.000Z", end: "2024-08-12T00:00:00.000Z" },
      ];

      expect(slots).to.be.of.length(2);

      slots.forEach((slot, idx) => {
        expect(slot.start).to.be.eq(expected[idx].start);
        expect(slot.end).to.be.eq(expected[idx].end);
      });
    });

    it("should unpack slot to a discrate date (2)", () => {
      const slots = asDiscreteSlot(testSlots.first, dayjs.utc("2024-08-10"));
      const expected = [
        { start: "2024-08-10T00:00:00.000Z", end: "2024-08-10T01:00:00.000Z" },
        { start: "2024-08-10T22:00:00.000Z", end: "2024-08-11T00:00:00.000Z" },
      ];

      expect(slots).to.be.of.length(2);

      slots.forEach((slot, idx) => {
        expect(slot.start).to.be.eq(expected[idx].start);
        expect(slot.end).to.be.eq(expected[idx].end);
      });
    });

    it("should unpack slot to a discrate date (3)", () => {
      const slots = asDiscreteSlot(testSlots.first, dayjs.utc("2024-08-09"));
      const expected = [
        { start: "2024-08-09T22:00:00.000Z", end: "2024-08-10T00:00:00.000Z" },
      ];

      expect(slots).to.be.of.length(1);

      slots.forEach((slot, idx) => {
        expect(slot.start).to.be.eq(expected[idx].start);
        expect(slot.end).to.be.eq(expected[idx].end);
      });
    });

    it("should unpack slot to a discrate date (4)", () => {
      expect(
        asDiscreteSlot(testSlots.first, dayjs.utc("2024-08-07"))
      ).to.be.of.length(0);
      expect(
        asDiscreteSlot(testSlots.first, dayjs.utc("2024-08-08"))
      ).to.be.of.length(0);
      expect(
        asDiscreteSlot(testSlots.first, dayjs.utc("2024-08-09"))
      ).to.be.of.length(1);
      expect(
        asDiscreteSlot(testSlots.first, dayjs.utc("2024-08-10"))
      ).to.be.of.length(2);
      expect(
        asDiscreteSlot(testSlots.first, dayjs.utc("2024-08-11"))
      ).to.be.of.length(2);
    });

    it("should unpack slot to a discrate date (5)", () => {
      expect(
        asDiscreteSlot(testSlots.second, dayjs.utc("2024-08-09"))
      ).to.be.of.length(0);
      expect(
        asDiscreteSlot(testSlots.second, dayjs.utc("2024-08-10"))
      ).to.be.of.length(1);
      expect(
        asDiscreteSlot(testSlots.second, dayjs.utc("2024-08-11"))
      ).to.be.of.length(1);
    });

    it("should unpack slot to a discrate date (6)", () => {
      const slots = asDiscreteSlot(testSlots.second, dayjs.utc("2024-08-10"));
      const expected = [
        { start: "2024-08-10T09:00:00.000Z", end: "2024-08-10T12:00:00.000Z" },
      ];

      expect(slots).to.be.of.length(1);

      slots.forEach((slot, idx) => {
        expect(slot.start).to.be.eq(expected[idx].start);
        expect(slot.end).to.be.eq(expected[idx].end);
      });
    });

    it.only("should unpack slot to a discrate date (7)", () => {
      const tests: Array<[string, number]> = [
        ["2024-08-08", 0],
        ["2024-08-09", 1],
        ["2024-08-10", 2],
        ["2024-08-11", 2],
        ["2024-08-12", 2],
        ["2024-08-13", 2],
        ["2024-08-14", 1],
        ["2024-08-15", 0],
        ["2024-08-16", 0],
      ];

      for (const [date, length] of tests) {
        const slots = asDiscreteSlot(testSlots.third, dayjs.utc(date));
        console.log(slots, testSlots.third, date);
        expect(slots).to.be.of.length(length);
      }

      // const slots = asDiscreteSlot(testSlots.third, dayjs.utc("2024-08-15"));
      // const expected = [
      //   { start: "2024-08-10T09:00:00.000Z", end: "2024-08-10T12:00:00.000Z" },
      // ];

      // console.log(testSlots.third, slots);

      // expect(slots).to.be.of.length(1);

      // slots.forEach((slot, idx) => {
      //   expect(slot.start).to.be.eq(expected[idx].start);
      //   expect(slot.end).to.be.eq(expected[idx].end);
      // });
    });
  });

  describe("Unpack daily slots", () => {
    it.skip("should unpack daily slots (case 1)", () => {
      const slot: ISlot.ModifiedSelf = {
        ...sharedSlot,
        start: dayjs("2024-08-10").utc().format(),
        end: null,
        time: Time.from("1am").utc().format(),
        duration: 180,
        weekday: -1,
        repeat: ISlot.Repeat.Daily,
      };

      const result = unpackSlots({
        slots: [slot],
        calls: [],
        start: "2024-08-10",
        window: 2,
      });
    });
  });
  // describe("Daily slots", () => {
  //   it("should unpack daily slots (case 1)", () => {
  //     const slot: ISlot.Self = {
  //       weekday: -1,
  //       time: { start: "10:00", end: "18:00" },
  //       date: { start: "2024-08-10" },
  //       repeat: ISlot.Repeat.Daily,
  //       ...sharedSlot,
  //     };
  //     const unpacked = unpackSlots([slot], [], {
  //       start: dayjs.utc("2024-08-10", "YYYY-MM-DD"),
  //       window: 2,
  //     });
  //     expect(unpacked).to.be.deep.eq([
  //       {
  //         day: "2024-08-10",
  //         slots: [
  //           {
  //             start: "2024-08-10T10:00:00.000Z",
  //             end: "2024-08-10T18:00:00.000Z",
  //             ...sharedSlot,
  //           },
  //         ],
  //       },
  //       {
  //         day: "2024-08-11",
  //         slots: [
  //           {
  //             start: "2024-08-11T10:00:00.000Z",
  //             end: "2024-08-11T18:00:00.000Z",
  //             ...sharedSlot,
  //           },
  //         ],
  //       },
  //     ]);
  //   });
  //   it.skip("should unpack daily slots (case 2)", () => {
  //     const slot: ISlot.Self = {
  //       weekday: -1,
  //       time: {
  //         start: Time.from("12am").utc().format(),
  //         end: Time.from("3am").utc().format(),
  //       },
  //       date: { start: "2024-08-10" },
  //       repeat: ISlot.Repeat.Daily,
  //       ...sharedSlot,
  //     };
  //     const unpacked = unpackSlots([slot], [], {
  //       start: dayjs.utc("2024-08-10", "YYYY-MM-DD"),
  //       window: 2,
  //     });
  //     expect(unpacked).to.be.deep.eq([
  //       {
  //         day: "2024-08-10",
  //         slots: [
  //           {
  //             start: "2024-08-10T10:00:00.000Z",
  //             end: "2024-08-10T18:00:00.000Z",
  //             ...sharedSlot,
  //           },
  //         ],
  //       },
  //       {
  //         day: "2024-08-11",
  //         slots: [
  //           {
  //             start: "2024-08-11T10:00:00.000Z",
  //             end: "2024-08-11T18:00:00.000Z",
  //             ...sharedSlot,
  //           },
  //         ],
  //       },
  //     ]);
  //   });
  //   it("should unpack daily slots with booked calls", () => {
  //     const slot: ISlot.Self = {
  //       weekday: -1,
  //       time: { start: "10:00", end: "18:00" },
  //       date: { start: "2024-08-10" },
  //       repeat: ISlot.Repeat.Daily,
  //       ...sharedSlot,
  //     };
  //     const calls: ICall.Self[] = [
  //       {
  //         start: "2024-08-10T10:30:00.000Z",
  //         duration: 30,
  //         ...sharedCall,
  //       },
  //       {
  //         start: "2024-08-10T12:00:00.000Z",
  //         duration: 30,
  //         ...sharedCall,
  //       },
  //       {
  //         start: "2024-08-11T11:30:00.000Z",
  //         duration: 30,
  //         ...sharedCall,
  //       },
  //     ];
  //     const unpacked = unpackSlots([slot], calls, {
  //       start: dayjs.utc("2024-08-10", "YYYY-MM-DD"),
  //       window: 2,
  //     });
  //     expect(unpacked).to.be.deep.eq([
  //       {
  //         day: "2024-08-10",
  //         slots: [
  //           {
  //             start: "2024-08-10T10:00:00.000Z",
  //             end: "2024-08-10T10:30:00.000Z",
  //             ...sharedSlot,
  //           },
  //           {
  //             start: "2024-08-10T11:00:00.000Z",
  //             end: "2024-08-10T12:00:00.000Z",
  //             ...sharedSlot,
  //           },
  //           {
  //             start: "2024-08-10T12:30:00.000Z",
  //             end: "2024-08-10T18:00:00.000Z",
  //             ...sharedSlot,
  //           },
  //         ],
  //       },
  //       {
  //         day: "2024-08-11",
  //         slots: [
  //           {
  //             start: "2024-08-11T10:00:00.000Z",
  //             end: "2024-08-11T11:30:00.000Z",
  //             ...sharedSlot,
  //           },
  //           {
  //             start: "2024-08-11T12:00:00.000Z",
  //             end: "2024-08-11T18:00:00.000Z",
  //             ...sharedSlot,
  //           },
  //         ],
  //       },
  //     ]);
  //   });
  // });
  // describe("Split slots", () => {
  //   it("should split slot into 30 minutes blocks", () => {
  //     const slot: ISlot.Self = {
  //       weekday: -1,
  //       time: { start: "10:00:00", end: "12:00:00" },
  //       date: { start: "2024-08-10" },
  //       repeat: ISlot.Repeat.Daily,
  //       ...sharedSlot,
  //     };
  //     const discrete = asDiscrateSlot(
  //       slot,
  //       dayjs.utc("2024-08-10", "YYYY-MM-DD")
  //     );
  //     const slots = splitSlot(discrete);
  //     expect(slots).to.be.deep.eq(
  //       [
  //         {
  //           start: "2024-08-10T10:00:00.000Z",
  //           end: "2024-08-10T10:30:00.000Z",
  //         },
  //         {
  //           start: "2024-08-10T10:30:00.000Z",
  //           end: "2024-08-10T11:00:00.000Z",
  //         },
  //         {
  //           start: "2024-08-10T11:00:00.000Z",
  //           end: "2024-08-10T11:30:00.000Z",
  //         },
  //         {
  //           start: "2024-08-10T11:30:00.000Z",
  //           end: "2024-08-10T12:00:00.000Z",
  //         },
  //       ].map(({ start, end }) => ({ ...discrete, start, end }))
  //     );
  //   });
  //   it("should split slot into 15 minutes blocks", () => {
  //     const slot: ISlot.Self = {
  //       weekday: -1,
  //       time: { start: "10:00:00", end: "10:50:00" },
  //       date: { start: "2024-08-10" },
  //       repeat: ISlot.Repeat.Daily,
  //       ...sharedSlot,
  //     };
  //     const discrete = asDiscrateSlot(
  //       slot,
  //       dayjs.utc("2024-08-10", "YYYY-MM-DD")
  //     );
  //     const slots = splitSlot(discrete, 15);
  //     expect(slots).to.be.deep.eq(
  //       [
  //         {
  //           start: "2024-08-10T10:00:00.000Z",
  //           end: "2024-08-10T10:15:00.000Z",
  //         },
  //         {
  //           start: "2024-08-10T10:15:00.000Z",
  //           end: "2024-08-10T10:30:00.000Z",
  //         },
  //         {
  //           start: "2024-08-10T10:30:00.000Z",
  //           end: "2024-08-10T10:45:00.000Z",
  //         },
  //       ].map(({ start, end }) => ({ ...discrete, start, end }))
  //     );
  //   });
  // });
});
