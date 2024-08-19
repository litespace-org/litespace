import { Meridiem, Time } from "@/time";
import { expect } from "chai";

describe("Time", () => {
  it("should parse railway time (raw)", () => {
    const tests: Array<[string, number, number]> = [
      // valid
      ["00:00", 0, 0],
      ["01:00", 1, 0],
      ["10:00", 10, 0],
      ["12:30", 12, 30],
      ["13:00", 13, 0],
      ["23:00", 23, 0],
      ["23:59", 23, 59],
      ["", 0, 0],
      // invalid
      ["24:00", -1, 0],
      ["-1:00", -1, 0],
      ["-2:00", -1, 0],
      ["12:99", 12, -1],
      [":", -1, -1],
      ["t:t", -1, -1],
    ];

    for (const [raw, hours, minutes] of tests) {
      const time = Time.from(raw);
      expect(time.hours()).to.be.eq(hours);
      expect(time.mintues()).to.be.eq(minutes);
    }
  });

  it("shoudl parse railway time (parts)", () => {
    const tests: Array<[[number, number], [number, number]]> = [
      // valid
      [
        [0, 0],
        [0, 0],
      ],
      [
        [1, 0],
        [1, 0],
      ],
      [
        [12, 30],
        [12, 30],
      ],
      [
        [-1, -1],
        [-1, -1],
      ],
      [
        [-100, 99],
        [-1, -1],
      ],
    ];

    for (const [parts, [hours, minutes]] of tests) {
      const time = Time.from(parts);
      expect(time.hours()).to.be.eq(hours);
      expect(time.mintues()).to.be.eq(minutes);
    }
  });

  it("should parse middday time", () => {
    const tests: Array<[string, Meridiem, number, number]> = [
      // valid
      ["01:00", Meridiem.AM, 1, 0],
      ["10:00", Meridiem.AM, 10, 0],
      ["12:30", Meridiem.AM, 12, 30],
      ["01:00", Meridiem.PM, 13, 0],
      ["11:00", Meridiem.PM, 23, 0],
      ["11:59", Meridiem.PM, 23, 59],
      // invalid
      ["00:00", Meridiem.AM, -1, 0],
      ["24:00", Meridiem.AM, -1, 0],
      ["-1:00", Meridiem.AM, -1, 0],
      ["-2:00", Meridiem.PM, -1, 0],
      ["12:99", Meridiem.AM, 12, -1],
      ["12:99", Meridiem.PM, 0, -1],
      [":", Meridiem.PM, -1, -1],
      ["t:t", Meridiem.PM, -1, -1],
    ];

    for (const [raw, meridiem, hours, minutes] of tests) {
      const time = Time.from([raw, meridiem]);
      expect(time.hours()).to.be.eq(hours);
      expect(time.mintues()).to.be.eq(minutes);
    }
  });

  it("should compare times (isSame)", () => {
    expect(Time.from("01:00").isSame("01:00")).to.be.true;
    expect(Time.from("01:30").isSame("01:00")).to.be.false;
    expect(Time.from("01:30").isSame("01:30")).to.be.true;
    expect(Time.from("01:00").isSame("01:30", "h")).to.be.true;
    expect(Time.from("01:00").isSame("01:30", "m")).to.be.false;
  });

  it("should compare times (isBefore)", () => {
    expect(Time.from(["01:00", Meridiem.AM]).isBefore(["02:00", Meridiem.AM]))
      .to.be.true;

    expect(Time.from(["02:00", Meridiem.AM]).isBefore(["02:00", Meridiem.AM]))
      .to.be.false;

    expect(Time.from(["02:00", Meridiem.PM]).isBefore(["02:00", Meridiem.AM]))
      .to.be.false;

    expect(Time.from(["12:00", Meridiem.PM]).isBefore(["02:00", Meridiem.AM]))
      .to.be.false;

    expect(Time.from(["11:00", Meridiem.PM]).isBefore(["12:00", Meridiem.PM]))
      .to.be.true;

    expect(Time.from(["11:05", Meridiem.PM]).isBefore(["11:10", Meridiem.PM]))
      .to.be.true;

    expect(
      Time.from(["11:05", Meridiem.PM]).isBefore(["11:10", Meridiem.PM], "h")
    ).to.be.false;
  });

  it("should compare times (isAfter)", () => {
    expect(Time.from(["01:00", Meridiem.AM]).isAfter(["02:00", Meridiem.AM])).to
      .be.false;

    expect(Time.from(["02:00", Meridiem.AM]).isAfter(["02:00", Meridiem.AM])).to
      .be.false;

    expect(Time.from(["02:00", Meridiem.PM]).isAfter(["02:00", Meridiem.AM])).to
      .be.true;

    expect(Time.from(["12:00", Meridiem.PM]).isAfter(["02:00", Meridiem.AM])).to
      .be.true;

    expect(Time.from(["11:00", Meridiem.PM]).isAfter(["12:00", Meridiem.PM])).to
      .be.false;

    expect(Time.from(["11:05", Meridiem.PM]).isAfter(["11:10", Meridiem.PM])).to
      .be.false;

    expect(
      Time.from(["11:05", Meridiem.PM]).isAfter(["11:10", Meridiem.PM], "h")
    ).to.be.false;
  });
});
