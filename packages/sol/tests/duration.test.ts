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
    expect(Duration.from("0.01hr").minutes()).to.be.eq(0);
    expect(Duration.from("1.2hr").minutes()).to.be.eq(72);
    expect(Duration.from("1.2").minutes()).to.be.eq(1);
    expect(Duration.from("1.2").minutes()).to.be.eq(1);
    expect(Duration.from("-1.2").minutes()).to.be.eq(0);
  });

  it("should format durations in Arabic", () => {
    expect(Duration.from("").format("ar")).to.be.eq("");
    expect(Duration.from("2").format("ar")).to.be.eq("دقيقتان");
    expect(Duration.from("2min").format("ar")).to.be.eq("دقيقتان");
    expect(Duration.from("0 mins").format("ar")).to.be.eq("");
    expect(Duration.from("mins").format("ar")).to.be.eq("1 دقيقة");
    expect(Duration.from("د").format("ar")).to.be.eq("1 دقيقة");
    expect(Duration.from("1hr 30min").format("ar")).to.be.eq(
      "1 ساعة ﻭ 30 دقيقة"
    );
    expect(Duration.from("1.5hr").format("ar")).to.be.eq("1 ساعة ﻭ 30 دقيقة");
    expect(Duration.from("2.5hr").format("ar")).to.be.eq("ساعتين ﻭ 30 دقيقة");
    expect(Duration.from("1.hr").format("ar")).to.be.eq("1 ساعة");
    expect(Duration.from(".5hr").format("ar")).to.be.eq("30 دقيقة");
  });

  it("should format durations in English", () => {
    expect(Duration.from("").format("en")).to.be.eq("");
    expect(Duration.from("2").format("en")).to.be.eq("2 minutes");
    expect(Duration.from("2min").format("en")).to.be.eq("2 minutes");
    expect(Duration.from("0 mins").format("en")).to.be.eq("");
    expect(Duration.from("mins").format("en")).to.be.eq("1 minute");
    expect(Duration.from("د").format("en")).to.be.eq("1 minute");
    expect(Duration.from("1hr 30min").format("en")).to.be.eq(
      "1 hour, 30 minutes"
    );
    expect(Duration.from("1.5hr").format("en")).to.be.eq("1 hour, 30 minutes");
    expect(Duration.from("2.5hr").format("en")).to.be.eq("2 hours, 30 minutes");
    expect(Duration.from("1.hr").format("en")).to.be.eq("1 hour");
    expect(Duration.from(".5hr").format("en")).to.be.eq("30 minutes");
  });
});
