import { IAvailabilitySlot } from "@litespace/types";
import { dayjs } from "@/dayjs";
import {
  canBook,
  getSubSlots,
  getSubSlotsBatch,
  isIntersecting,
  isSuperSlot,
  orderSlots,
  subtractSlotsBatch,
} from "@/availabilitySlots";
import { expect } from "chai";
import { range } from "lodash";

describe("AvailabilitySlot", () => {
  it("should divide a slot into discrete number of subslots", () => {
    const now = dayjs.utc();
    const slot: IAvailabilitySlot.Slot = {
      id: 1,
      start: now.toISOString(),
      end: now.add(2, "hours").toISOString(),
    };

    let subslots = getSubSlots(slot, 15);
    expect(subslots).to.have.length(8);
    expect(subslots).to.have.deep.members(
      range(0, 8).map((i) => ({
        parent: 1,
        start: now.add(15 * i, "minutes").toISOString(),
        end: now.add(15 * (i + 1), "minutes").toISOString(),
      }))
    );

    subslots = getSubSlots(slot, 30);
    expect(subslots).to.have.length(4);
    expect(subslots).to.have.deep.members(
      range(0, 4).map((i) => ({
        parent: 1,
        start: now.add(30 * i, "minutes").toISOString(),
        end: now.add(30 * (i + 1), "minutes").toISOString(),
      }))
    );

    subslots = getSubSlots(slot, 50);
    expect(subslots).to.have.length(2);
    expect(subslots).to.have.deep.members(
      range(0, 2).map((i) => ({
        parent: 1,
        start: now.add(50 * i, "minutes").toISOString(),
        end: now.add(50 * (i + 1), "minutes").toISOString(),
      }))
    );
  });

  it("should divide a batch of slots into discrete number of subslots", () => {
    const now = dayjs.utc();
    const slot1: IAvailabilitySlot.Slot = {
      id: 1,
      start: now.toISOString(),
      end: now.add(1, "hours").toISOString(),
    };
    const slot2: IAvailabilitySlot.Slot = {
      id: 2,
      start: now.add(1, "hours").toISOString(),
      end: now.add(2, "hours").toISOString(),
    };

    let subslots = getSubSlotsBatch([slot1, slot2], 15);
    expect(subslots).to.have.length(8);
    expect(subslots).to.have.deep.members(
      range(0, 8).map((i) => ({
        parent: i < 4 ? 1 : 2,
        start: now.add(15 * i, "minutes").toISOString(),
        end: now.add(15 * (i + 1), "minutes").toISOString(),
      }))
    );

    subslots = getSubSlotsBatch([slot1, slot2], 30);
    expect(subslots).to.have.length(4);
    expect(subslots).to.have.deep.members(
      range(0, 4).map((i) => ({
        parent: i < 2 ? 1 : 2,
        start: now.add(30 * i, "minutes").toISOString(),
        end: now.add(30 * (i + 1), "minutes").toISOString(),
      }))
    );

    subslots = getSubSlotsBatch([slot1, slot2], 50);
    expect(subslots).to.have.length(2);
    expect(subslots).to.have.deep.members([
      {
        parent: 1,
        start: now.toISOString(),
        end: now.add(50, "minutes").toISOString(),
      },
      {
        parent: 2,
        start: now.add(60, "minutes").toISOString(),
        end: now.add(110, "minutes").toISOString(),
      },
    ]);
  });

  it("should check if a a slot is a super slot of another or not", () => {
    const now = dayjs.utc();
    const a: IAvailabilitySlot.Slot = {
      id: 1,
      start: now.toISOString(),
      end: now.add(1, "hours").toISOString(),
    };
    const b: IAvailabilitySlot.Slot = {
      id: 2,
      start: now.add(15, "minutes").toISOString(),
      end: now.add(45, "minutes").toISOString(),
    };
    const c: IAvailabilitySlot.SubSlot = {
      parent: 3,
      start: now.add(30, "minutes").toISOString(),
      end: now.add(90, "minutes").toISOString(),
    };
    const d: IAvailabilitySlot.SubSlot = {
      parent: 4,
      start: now.add(2, "hours").toISOString(),
      end: now.add(3, "hours").toISOString(),
    };
    expect(isSuperSlot(a, a)).to.be.true;
    expect(isSuperSlot(a, b)).to.be.true;
    expect(isSuperSlot(a, c)).to.be.false;
    expect(isSuperSlot(a, d)).to.be.false;
  });

  it("should sort slots in ascending and descending orders", () => {
    const now = dayjs.utc();
    const a: IAvailabilitySlot.Slot = {
      id: 1,
      start: now.toISOString(),
      end: now.add(1, "hours").toISOString(),
    };
    const b: IAvailabilitySlot.Slot = {
      id: 2,
      start: now.add(15, "minutes").toISOString(),
      end: now.add(45, "minutes").toISOString(),
    };
    const c: IAvailabilitySlot.SubSlot = {
      parent: 3,
      start: now.add(30, "minutes").toISOString(),
      end: now.add(90, "minutes").toISOString(),
    };
    const d: IAvailabilitySlot.SubSlot = {
      parent: 4,
      start: now.add(2, "hours").toISOString(),
      end: now.add(3, "hours").toISOString(),
    };

    let sorted = orderSlots([b, a, d, c], "asc");
    expect(sorted).to.deep.eq([a, b, c, d]);

    sorted = orderSlots([b, a, d, c], "desc");
    expect(sorted).to.deep.eq([d, c, b, a]);
  });

  it("should check if a slot is intersecting a list of slots or not", () => {
    const now = dayjs.utc();
    const a: IAvailabilitySlot.Slot = {
      id: 1,
      start: now.toISOString(),
      end: now.add(1, "hours").toISOString(),
    };

    const b: IAvailabilitySlot.Slot = {
      id: 2,
      start: now.add(2, "hours").toISOString(),
      end: now.add(3, "hours").toISOString(),
    };

    const c: IAvailabilitySlot.Slot = {
      id: 3,
      start: now.add(3, "hours").toISOString(),
      end: now.add(4, "hours").toISOString(),
    };

    const target: IAvailabilitySlot.SubSlot = {
      parent: 4,
      start: now.add(30, "minutes").toISOString(),
      end: now.add(90, "minutes").toISOString(),
    };

    expect(isIntersecting(target, [a, b])).to.be.true;
    expect(isIntersecting(target, [b, c])).to.be.false;
  });

  it("should subtract a list of subslots from a list of slots", () => {
    const now = dayjs.utc();
    const a: IAvailabilitySlot.Slot = {
      id: 1,
      start: now.toISOString(),
      end: now.add(1, "hours").toISOString(),
    };
    const b: IAvailabilitySlot.Slot = {
      id: 2,
      start: now.add(1, "hours").toISOString(),
      end: now.add(2, "hours").toISOString(),
    };

    const s1: IAvailabilitySlot.SubSlot = {
      parent: 1,
      start: now.add(30, "minutes").toISOString(),
      end: now.add(60, "minutes").toISOString(),
    };
    const s2: IAvailabilitySlot.SubSlot = {
      parent: 2,
      start: now.add(70, "minutes").toISOString(),
      end: now.add(85, "minutes").toISOString(),
    };
    const s3: IAvailabilitySlot.SubSlot = {
      parent: 3,
      start: now.add(3, "hours").toISOString(),
      end: now.add(4, "hours").toISOString(),
    };

    const subslots = subtractSlotsBatch({
      slots: [a, b],
      subslots: [s1, s2, s3],
    });

    expect(subslots).to.have.length(3);
    expect(subslots[0]).to.deep.eq({
      parent: 1,
      start: now.toISOString(),
      end: now.add(30, "minutes").toISOString(),
    });
    expect(subslots[1]).to.deep.eq({
      parent: 2,
      start: now.add(60, "minutes").toISOString(),
      end: now.add(70, "minutes").toISOString(),
    });
    expect(subslots[2]).to.deep.eq({
      parent: 2,
      start: now.add(85, "minutes").toISOString(),
      end: now.add(120, "minutes").toISOString(),
    });
  });

  it("should check if a given time (subslot) of some slot can be booked or not", () => {
    const now = dayjs.utc();
    const mainSlot = {
      id: 1,
      start: now.toISOString(),
      end: now.add(1, "hour").toISOString(),
    };
    const s1 = {
      parent: 1,
      start: now.toISOString(),
      end: now.add(30, "minutes").toISOString(),
    };
    const s2 = {
      parent: 1,
      start: now.add(45, "minutes").toISOString(),
      end: now.add(60, "minutes").toISOString(),
    };

    expect(
      canBook({
        slot: mainSlot,
        bookedSubslots: [s1, s2],
        bookInfo: {
          start: now.add(30, "minutes").toISOString(),
          duration: 15,
        },
      })
    ).to.be.true;

    expect(
      canBook({
        slot: mainSlot,
        bookedSubslots: [s1, s2],
        bookInfo: {
          start: now.add(35, "minutes").toISOString(),
          duration: 20,
        },
      })
    ).to.be.false;
  });
});
