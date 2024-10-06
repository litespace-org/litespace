import { Duration } from "@/duration";
import { expect } from "chai";

describe("Duration", () => {
  it("should parse duration string and convert it into minutes", () => {
    expect(Duration.from("").minutes()).to.be.eq(0);
    expect(Duration.from("2").minutes()).to.be.eq(2);
    expect(Duration.from("2min").minutes()).to.be.eq(2);
    expect(Duration.from("2 min").minutes()).to.be.eq(2);
    expect(Duration.from("2 mins").minutes()).to.be.eq(2);
    expect(Duration.from("0 mins").minutes()).to.be.eq(0);
    expect(Duration.from("mins").minutes()).to.be.eq(1);
    expect(Duration.from("m").minutes()).to.be.eq(1);
    expect(Duration.from("minutes").minutes()).to.be.eq(1);
    expect(Duration.from("د").minutes()).to.be.eq(1);
    expect(Duration.from("1hr 30min").minutes()).to.be.eq(90);
    expect(Duration.from("1.5hr").minutes()).to.be.eq(90);
    expect(Duration.from("1.hr").minutes()).to.be.eq(60);
    expect(Duration.from(".5hr").minutes()).to.be.eq(30);
    expect(Duration.from(".0001hr").minutes()).to.be.eq(0);
    expect(Duration.from("0.01hr").minutes()).to.be.eq(1);
    expect(Duration.from("1.2hr").minutes()).to.be.eq(72);
    expect(Duration.from("1.2").minutes()).to.be.eq(1);
    expect(Duration.from("1.2").minutes()).to.be.eq(1);
    expect(Duration.from("-1.2").minutes()).to.be.eq(0);
  });

  it("should format durations (long)", () => {
    expect(Duration.from("").format()).to.be.eq("");
    expect(Duration.from("2").format()).to.be.eq("2 Minutes");
    expect(Duration.from("2min").format()).to.be.eq("2 Minutes");
    expect(Duration.from("0 mins").format()).to.be.eq("");
    expect(Duration.from("mins").format()).to.be.eq("Minute");
    expect(Duration.from("د").format()).to.be.eq("Minute");
    expect(Duration.from("1hr 30min").format()).to.be.eq("Hour and 30 Minutes");
    expect(Duration.from("1.5hr").format()).to.be.eq("Hour and 30 Minutes");
    expect(Duration.from("2.5hr").format()).to.be.eq("2 Hours and 30 Minutes");
    expect(Duration.from("1.hr").format()).to.be.eq("Hour");
    expect(Duration.from(".5hr").format()).to.be.eq("30 Minutes");
  });

  it("should format durations (long)", () => {
    expect(Duration.from("").formatShort()).to.be.eq("");
    expect(Duration.from("2").formatShort()).to.be.eq("2m");
    expect(Duration.from("2min").formatShort()).to.be.eq("2m");
    expect(Duration.from("0 mins").formatShort()).to.be.eq("");
    expect(Duration.from("mins").formatShort()).to.be.eq("1m");
    expect(Duration.from("د").formatShort()).to.be.eq("1m");
    expect(Duration.from("1hr 30min").formatShort()).to.be.eq("1h 30m");
    expect(Duration.from("1.5hr").formatShort()).to.be.eq("1h 30m");
    expect(Duration.from("2.5hr").formatShort()).to.be.eq("2h 30m");
    expect(Duration.from("1.hr").formatShort()).to.be.eq("1h");
    expect(Duration.from(".5hr").formatShort()).to.be.eq("30m");
  });
});
