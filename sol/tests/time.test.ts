import { Level, Meridiem, Time } from "@/time";
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
      [":", 0, 0],
      // invalid
      ["24:00", -1, 0],
      ["-1:00", -1, 0],
      ["-2:00", -1, 0],
      ["12:99", 12, -1],
      ["t:t", -1, -1],
    ];

    for (const [raw, hours, minutes] of tests) {
      const time = Time.from(raw);
      expect(time.hours()).to.be.eq(hours);
      expect(time.minutes()).to.be.eq(minutes);
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
      expect(time.minutes()).to.be.eq(minutes);
    }
  });

  it("should parse middday time", () => {
    const tests: Array<[string, Meridiem, number, number]> = [
      // valid
      ["01:00", Meridiem.AM, 1, 0],
      ["10:00", Meridiem.AM, 10, 0],
      ["12:30", Meridiem.AM, 0, 30],
      ["01:00", Meridiem.PM, 13, 0],
      ["11:00", Meridiem.PM, 23, 0],
      ["11:59", Meridiem.PM, 23, 59],
      [":", Meridiem.PM, 0, 0],
      // invalid
      ["00:00", Meridiem.AM, -1, 0],
      ["24:00", Meridiem.AM, -1, 0],
      ["-1:00", Meridiem.AM, -1, 0],
      ["-2:00", Meridiem.PM, -1, 0],
      ["12:99", Meridiem.AM, 0, -1],
      ["12:99", Meridiem.PM, 12, -1],
      ["t:t", Meridiem.PM, -1, -1],
    ];

    for (const [raw, meridiem, hours, minutes] of tests) {
      const time = Time.from([raw, meridiem]);
      expect(time.hours()).to.be.eq(hours);
      expect(time.minutes()).to.be.eq(minutes);
    }
  });

  it("should parse raw middday time", () => {
    const tests: Array<[string, number, number]> = [
      // valid
      ["12:00 am", 0, 0],
      ["1 am", 1, 0],
      ["2:00am", 2, 0],
      ["3:05am", 3, 5],
      ["4:555am", 4, -1],
      ["5am", 5, 0],
      ["6am", 6, 0],
      ["7am", 7, 0],
      ["8am", 8, 0],
      ["9am", 9, 0],
      ["10am", 10, 0],
      ["11am", 11, 0],
      ["12pm", 12, 0],
      ["1pm", 13, 0],
      ["2pm", 14, 0],
      ["3pm", 15, 0],
      ["4pm", 16, 0],
      ["5pm", 17, 0],
      ["6pm", 18, 0],
      ["7pm", 19, 0],
      ["8pm", 20, 0],
      ["9pm", 21, 0],
      ["10pm", 22, 0],
      ["11pm", 23, 0],
      // invalid
      ["-1pm", -1, 0],
      ["-1:-1pm", -1, -1],
      ["-1:pm", -1, 0],
      ["-1:-1pm", -1, -1],
      ["-10:-20pm", -1, -1],
    ];

    for (const [raw, hours, minutes] of tests) {
      const time = Time.from(raw);
      expect(time.hours()).to.be.eq(hours);
      expect(time.minutes()).to.be.eq(minutes);
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
    const tests: Array<[string, string, Level, boolean]> = [
      ["1am", "2am", "h", true],
      ["2am", "2am", "h", false],
      ["3pm", "2am", "h", false],
      ["10pm", "11pm", "h", true],
      ["11pm", "10pm", "h", false],
      ["12:30pm", "12:10pm", "m", false],
      ["12:10pm", "12:11pm", "m", true],
      ["1am", "12am", "h", false],
      ["12am", "1am", "h", true],
      ["12pm", "12am", "h", false],
    ];

    for (const [base, target, level, isBefore] of tests) {
      expect(Time.from(base).isBefore(target, level)).to.be.eq(isBefore);
    }
  });

  it("should compare times (isAfter)", () => {
    const tests: Array<[string, string, Level, boolean]> = [
      ["1am", "2am", "h", false],
      ["2am", "2am", "h", false],
      ["3pm", "2am", "h", true],
      ["10pm", "11pm", "h", false],
      ["11pm", "10pm", "h", true],
      ["12:30pm", "12:10pm", "m", true],
      ["12:10pm", "12:11pm", "m", false],
      ["1am", "12am", "h", true],
      ["12pm", "12am", "h", true],
    ];

    for (const [base, target, level, isAfter] of tests) {
      expect(Time.from(base).isAfter(target, level)).to.be.eq(isAfter);
    }
  });

  it("should convert from railway time into midday", () => {
    const tests: Array<[string, number, number, Meridiem]> = [
      ["00:00", 12, 0, Meridiem.AM],
      ["01:00", 1, 0, Meridiem.AM],
      ["02:00", 2, 0, Meridiem.AM],
      ["10:00", 10, 0, Meridiem.AM],
      ["12:00", 12, 0, Meridiem.PM],
      ["13:00", 1, 0, Meridiem.PM],
      ["14:00", 2, 0, Meridiem.PM],
      ["23:00", 11, 0, Meridiem.PM],
      ["23:59", 11, 59, Meridiem.PM],
    ];

    for (const [time, hours, minutes, meridiem] of tests) {
      expect(Time.from(time).asMiddayParts()).to.be.deep.eq({
        hours,
        minutes,
        meridiem,
      });
    }
  });

  describe("Formatting", () => {
    it("Format using midday time with day segments", () => {
      const tests: Array<[string, string]> = [
        ["12am", "12:00 Midnight"],
        ["1am", "01:00 Midnight"],
        ["2am", "02:00 Midnight"],
        ["3am", "03:00 Morning"],
        ["5am", "05:00 Morning"],
        ["11am", "11:00 Morning"],
        ["12pm", "12:00 Noon"],
        ["1pm", "01:00 Noon"],
        ["3pm", "03:00 Afternoon"],
        ["4:30pm", "04:30 Afternoon"],
        ["6pm", "06:00 Night"],
        ["7pm", "07:00 Night"],
        ["11pm", "11:00 Night"],
        ["11:59pm", "11:59 Night"],
      ];

      for (const [time, formatted] of tests) {
        expect(Time.from(time).format("midday", {})).to.be.eq(formatted);
      }
    });

    it("Format using midday time using am/pm notation", () => {
      const tests: Array<[string, string]> = [
        ["12am", "12:00 am"],
        ["1am", "01:00 am"],
        ["2am", "02:00 am"],
        ["3am", "03:00 am"],
        ["5am", "05:00 am"],
        ["11am", "11:00 am"],
        ["12pm", "12:00 pm"],
        ["1pm", "01:00 pm"],
        ["3pm", "03:00 pm"],
        ["4:30pm", "04:30 pm"],
        ["6pm", "06:00 pm"],
        ["7pm", "07:00 pm"],
        ["11pm", "11:00 pm"],
        ["11:59pm", "11:59 pm"],
      ];

      for (const [time, formatted] of tests) {
        expect(Time.from(time).format("midday")).to.be.eq(formatted);
      }
    });

    it("Format using railway time", () => {
      const tests: Array<[string, string]> = [
        ["12am", "00:00"],
        ["1am", "01:00"],
        ["2am", "02:00"],
        ["3am", "03:00"],
        ["5am", "05:00"],
        ["11am", "11:00"],
        ["12pm", "12:00"],
        ["1pm", "13:00"],
        ["3pm", "15:00"],
        ["4:30pm", "16:30"],
        ["6pm", "18:00"],
        ["7pm", "19:00"],
        ["11pm", "23:00"],
        ["11:59pm", "23:59"],
        ["14:59pm", "-1"],
      ];

      for (const [time, formatted] of tests) {
        expect(Time.from(time).format("railway")).to.be.eq(formatted);
      }
    });
  });

  describe("Modify time", () => {
    it("should be able to set hours (railway)", () => {
      const tests: Array<[string, number, string]> = [
        ["12am", 1, "01:00"],
        ["1am", 2, "02:00"],
        ["2am", 3, "03:00"],
        ["3am", 4, "04:00"],
        ["5am", 5, "05:00"],
        ["11am", 6, "06:00"],
        ["12pm", 7, "07:00"],
        ["1pm", 8, "08:00"],
        ["4pm", 15, "15:00"],
        ["4:30pm", 10, "10:30"],
        ["6pm", 11, "11:00"],
        ["7pm", 19, "19:00"],
        ["11pm", 23, "23:00"],
        ["11:59pm", 0, "00:59"],
      ];

      for (const [time, hours, modified] of tests) {
        expect(Time.from(time).setHours(hours).format()).to.be.eq(modified);
      }
    });

    it("should be able to set hours (midday)", () => {
      const tests: Array<[string, number, string]> = [
        ["12am", 1, "01:00 am"],
        ["1am", 2, "02:00 am"],
        ["2am", 3, "03:00 am"],
        ["3am", 4, "04:00 am"],
        ["5am", 5, "05:00 am"],
        ["11am", 6, "06:00 am"],
        ["12pm", 7, "07:00 pm"],
        ["1pm", 8, "08:00 pm"],
        ["4pm", 12, "12:00 pm"],
        ["4:30pm", 3, "03:30 pm"],
        ["6pm", 11, "11:00 pm"],
        ["7pm", 12, "12:00 pm"],
        ["11pm", 11, "11:00 pm"],
        ["11:59pm", 0, "-1"],
      ];

      for (const [time, hours, modified] of tests) {
        expect(
          Time.from(time).setHours(hours, false).format("midday")
        ).to.be.eq(modified);
      }
    });

    it("should be able to set minutes", () => {
      const tests: Array<[string, number | string, string]> = [
        ["12am", 0, "12:00 am"],
        ["1am", 15, "01:15 am"],
        ["1am", "30", "01:30 am"],
        ["1am", "45", "01:45 am"],
        ["1am", "60", "-1"],
        ["1am", "-3", "-1"],
      ];

      for (const [time, minutes, modified] of tests) {
        expect(Time.from(time).setMintues(minutes).format("midday")).to.be.eq(
          modified
        );
      }
    });

    it("should be able to set meridiem", () => {
      const tests: Array<[string, Meridiem, string]> = [
        ["12am", Meridiem.PM, "12:00 pm"],
        ["1am", Meridiem.PM, "01:00 pm"],
        ["1am", Meridiem.AM, "01:00 am"],
      ];

      for (const [time, meridiem, modified] of tests) {
        expect(Time.from(time).setMeridiem(meridiem).format("midday")).to.be.eq(
          modified
        );
      }
    });
  });
});
