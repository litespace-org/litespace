import { duration, FilterChain } from "@/lib/filter";
import { expect } from "chai";

describe("Filter Chain", () => {
  it("should create a black filter for a given duration", () => {
    expect(
      FilterChain.init().black({ w: 1280, h: 720 }, duration("2min")).toString()
    ).to.be.eq("color=color=black:size=1280x720:duration=120");

    expect(
      FilterChain.init()
        .black({ w: 1280, h: 720 }, duration("2min"))
        .withOutput("base")
        .toString()
    ).to.be.eq("color=color=black:size=1280x720:duration=120 [base]");
  });

  it("should create amix filter", () => {
    expect(
      FilterChain.init()
        .amix(2)
        .withInput(["a", "b"])
        .withOutput("audio")
        .toString()
    ).to.be.eq("[a][b] amix=inputs=2 [audio]");
  });

  it("should create mul", () => {
    expect(
      FilterChain.init()
        .amix(2)
        .withInput(["a", "b"])
        .withOutput("audio")
        .toString()
    ).to.be.eq("[a][b] amix=inputs=2 [audio]");
  });

  it("should apply video delay and scale it in the same filter chain", () => {
    expect(
      FilterChain.init()
        .vdelay(duration("2min"))
        .scale({ w: 1280, h: 720 })
        .withInput("0:v")
        .withOutput("vid")
        .toString()
    ).to.be.eq("[0:v] setpts=PTS+120/TB, scale=1280x720 [vid]");
  });
});
