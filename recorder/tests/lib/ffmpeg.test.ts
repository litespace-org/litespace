import {
  ArtifactSlice,
  ArtifactSliceGroup,
  asArtifactSlices,
  constructFullScreenFilter,
  constructGroupFilters,
  constructSplitScreenFilters,
  findBreakPoints,
  groupArtifacts,
} from "@/lib/ffmpeg";
import dayjs from "@/lib/dayjs";
import { duration } from "@/lib/filter";
import { expect } from "chai";

describe("FFmpeg", () => {
  const start = dayjs.utc().startOf("hour");
  const minute = (minute: number) => start.add(minute, "minutes").valueOf();

  describe("constructFullScreenArtifact", () => {
    it("should construct full screen artifact", () => {
      const slice: ArtifactSlice = { start: minute(0), end: minute(5) };
      const { cut, scale, overlay } = constructFullScreenFilter({
        slice,
        base: minute(0),
        artifactStart: minute(0),
        artifactId: 1,
        backgroundId: "bg",
      });

      expect(cut.toString()).to.be.eq(
        "[1] trim=start=0:end=300, setpts=PTS-STARTPTS [trim-1]"
      );
      expect(scale.toString()).to.be.eq(
        "[trim-1] setpts=PTS+0/TB, scale=1280x720 [scale-1]"
      );
      expect(overlay.toString()).to.be.eq(
        "[bg][scale-1] overlay=eof_action=pass [overlay-1]"
      );
    });

    it("should construct full screen artifact with a delay", () => {
      const slice: ArtifactSlice = { start: minute(5), end: minute(10) };
      const { cut, scale, overlay } = constructFullScreenFilter({
        slice,
        base: minute(0),
        artifactStart: minute(2),
        artifactId: 1,
        backgroundId: "bg",
      });

      expect(cut.toString()).to.be.eq(
        "[1] trim=start=180:end=480, setpts=PTS-STARTPTS [trim-1]"
      );
      expect(scale.toString()).to.be.eq(
        "[trim-1] setpts=PTS+300/TB, scale=1280x720 [scale-1]"
      );
      expect(overlay.toString()).to.be.eq(
        "[bg][scale-1] overlay=eof_action=pass [overlay-1]"
      );
    });
  });

  describe("constructSplitScreenFilters", () => {
    it("should construct left and right half screen filters", () => {
      const { left, right } = constructSplitScreenFilters({
        artifacts: [minute(0), minute(0)],
        backgroundId: "bg",
        base: minute(0),
        group: {
          start: minute(5),
          end: minute(10),
          ids: [1, 2],
        },
      });

      expect(left.cut.toString()).to.be.eq(
        "[1] trim=start=300:end=600, setpts=PTS-STARTPTS [trim-1]"
      );

      expect(left.scale.toString()).to.be.eq(
        "[trim-1] setpts=PTS+300/TB, scale=640x720 [scale-1]"
      );

      expect(left.overlay.toString()).to.be.eq(
        "[bg][scale-1] overlay=eof_action=pass [overlay-1]"
      );

      expect(right.cut.toString()).to.be.eq(
        "[2] trim=start=300:end=600, setpts=PTS-STARTPTS [trim-2]"
      );

      expect(right.scale.toString()).to.be.eq(
        "[trim-2] setpts=PTS+300/TB, scale=640x720 [scale-2]"
      );

      expect(right.overlay.toString()).to.be.eq(
        "[overlay-1][scale-2] overlay=eof_action=pass:x=640 [overlay-2]"
      );
    });
  });

  describe("Uitls", () => {
    it("should find recording breakpoints (1)", () => {
      const t1 = minute(0);
      const t2 = minute(5);

      expect(
        findBreakPoints({ id: 1, start: t1, duration: duration("30min") }, [
          { id: 2, start: t2, duration: duration("1min"), screen: true },
        ])
      ).to.be.deep.eq([minute(5), minute(6)]);
    });

    it("should find recording breakpoints (2)", () => {
      const t1 = minute(0);
      const t2 = minute(5);
      const t3 = minute(15);

      expect(
        findBreakPoints({ id: 1, start: t1, duration: duration("30min") }, [
          { id: 2, start: t2, duration: duration("1min") },
          { id: 3, start: t3, duration: duration("10min") },
        ])
      ).to.be.deep.members([minute(5), minute(6), minute(15), minute(25)]);
    });

    it("should find recording breakpoints (3)", () => {
      const t1 = minute(0);
      const t2 = minute(5);
      const t3 = minute(15);

      expect(
        findBreakPoints({ id: 1, start: t1, duration: duration("30min") }, [
          { id: 2, start: t2, duration: duration("1min") },
          { id: 3, start: t3, duration: duration("15min") },
        ])
      ).to.be.deep.eq([minute(5), minute(6), minute(15)]);
    });

    it("should find recording breakpoints (4)", () => {
      const t1 = minute(0);
      const t2 = minute(10);

      expect(
        findBreakPoints({ id: 1, start: t1, duration: duration("5min") }, [
          { id: 2, start: t2, duration: duration("30min") },
        ])
      ).to.be.deep.eq([]);
    });

    it("should find recording breakpoints (5)", () => {
      const t1 = minute(15);
      const t2 = minute(20);
      const a1 = { id: 2, start: t1, duration: duration("15min") };
      const a2 = { id: 2, start: t2, duration: duration("10min") };

      expect(findBreakPoints(a1, [a2])).to.be.deep.eq([minute(20)]);
      expect(findBreakPoints(a2, [a1])).to.be.deep.eq([]);
    });

    it("should convert breakpoints into artifact slices (1)", () => {
      const t1 = minute(0);
      const t2 = minute(5);
      const artifact = { id: 1, start: t1, duration: duration("30min") };
      const breakpoints = findBreakPoints(artifact, [
        { id: 2, start: t2, duration: duration("1min") },
      ]);

      expect(asArtifactSlices(artifact, breakpoints)).to.be.deep.eq([
        { start: minute(0), end: minute(5) },
        { start: minute(5), end: minute(6) },
        { start: minute(6), end: minute(30) },
      ]);
    });

    it("should convert breakpoints into artifact slices (2)", () => {
      const t1 = minute(0);
      const artifact = { id: 1, start: t1, duration: duration("30min") };

      expect(asArtifactSlices(artifact, [])).to.be.deep.eq([
        { start: minute(0), end: minute(30) },
      ]);
    });

    it("should convert breakpoints into artifact slices (3)", () => {
      const t1 = minute(0);
      const t2 = minute(15);
      const artifact = { id: 1, start: t1, duration: duration("30min") };

      const breakpoints = findBreakPoints(artifact, [
        { id: 1, start: t2, duration: duration("15min") },
      ]);

      expect(breakpoints).to.be.of.length(1);
      expect(asArtifactSlices(artifact, breakpoints)).to.be.deep.eq([
        { start: minute(0), end: minute(15) },
        { start: minute(15), end: minute(30) },
      ]);
    });

    it("should group similar artifact slices (1)", () => {
      const t1 = minute(0);
      const t2 = minute(10);
      const a1 = { id: 1, start: t1, duration: duration("30min") };
      const a2 = { id: 2, start: t2, duration: duration("15min") };
      const bp1 = findBreakPoints(a1, [a2]);
      const bp2 = findBreakPoints(a2, [a1]);
      const as1 = asArtifactSlices(a1, bp1);
      const as2 = asArtifactSlices(a2, bp2);

      expect(
        groupArtifacts([
          { id: a1.id, slices: as1 },
          { id: a2.id, slices: as2 },
        ])
      ).to.be.deep.eq([
        { start: minute(0), end: minute(10), ids: [1] },
        { start: minute(10), end: minute(25), ids: [1, 2] },
        { start: minute(25), end: minute(30), ids: [1] },
      ]);
    });

    it("should group similar artifact slices (complex) (2)", () => {
      const t1 = minute(0);
      const t2 = minute(16);
      const t3 = minute(0);
      const t4 = minute(5);
      const t5 = minute(20);
      const a1 = { id: 1, start: t1, duration: duration("15min") }; // e.g., user-1 joined for the first 15 mins
      const a2 = { id: 2, start: t2, duration: duration("14min") }; // e.g., user-1 left and rejoined the last 15 mins
      const a3 = { id: 3, start: t3, duration: duration("30min") }; // e..g, user-2 joined the full 30 mins
      const a4 = { id: 4, start: t4, duration: duration("15min") }; // e.g., share screen
      const a5 = { id: 5, start: t5, duration: duration("10min") }; // e.g., user-1 share screen in the last 10 mins
      const bp1 = findBreakPoints(a1, [a2, a3, a4, a5]);
      const bp2 = findBreakPoints(a2, [a1, a3, a4, a5]);
      const bp3 = findBreakPoints(a3, [a1, a2, a4, a5]);
      const bp4 = findBreakPoints(a4, [a1, a2, a3, a5]);
      const bp5 = findBreakPoints(a5, [a1, a2, a3, a4]);
      const as1 = asArtifactSlices(a1, bp1);
      const as2 = asArtifactSlices(a2, bp2);
      const as3 = asArtifactSlices(a3, bp3);
      const as4 = asArtifactSlices(a4, bp4);
      const as5 = asArtifactSlices(a5, bp5);

      expect(bp1).to.be.deep.members([minute(5)]);
      expect(bp2).to.be.deep.members([minute(20)]);
      expect(bp3).to.be.deep.members([
        minute(5),
        minute(15),
        minute(16),
        minute(20),
      ]);
      expect(bp4).to.be.deep.members([minute(15), minute(16)]);
      expect(bp5).to.be.deep.members([]);

      expect(as1).to.be.deep.members([
        { start: minute(0), end: minute(5) },
        { start: minute(5), end: minute(15) },
      ]);

      expect(as2).to.be.deep.members([
        { start: minute(16), end: minute(20) },
        { start: minute(20), end: minute(30) },
      ]);

      expect(as3).to.be.deep.eq([
        { start: minute(0), end: minute(5) },
        { start: minute(5), end: minute(15) },
        { start: minute(15), end: minute(16) },
        { start: minute(16), end: minute(20) },
        { start: minute(20), end: minute(30) },
      ]);

      const groups = groupArtifacts([
        { id: a1.id, slices: as1 },
        { id: a2.id, slices: as2 },
        { id: a3.id, slices: as3 },
        { id: a4.id, slices: as4 },
        { id: a5.id, slices: as5 },
      ]);

      expect(groups).to.be.deep.members([
        { start: minute(0), end: minute(5), ids: [1, 3] },
        { start: minute(5), end: minute(15), ids: [1, 3, 4] },
        { start: minute(15), end: minute(16), ids: [3, 4] },
        { start: minute(16), end: minute(20), ids: [2, 3, 4] },
        { start: minute(20), end: minute(30), ids: [2, 3, 5] },
      ]);
    });

    it("should group similar artifact slices (complex) (3)", () => {
      const t1 = minute(0);
      const t2 = minute(10);
      const t3 = minute(1);
      const a1 = { id: 1, start: t1, duration: duration("30min") }; // e.g., user-1 joined for the first 15 mins
      const a2 = { id: 2, start: t2, duration: duration("20min") }; // e.g., user-1 left and rejoined the last 15 mins
      const a3 = { id: 3, start: t3, duration: duration("28min") }; // e..g, user-2 joined the full 30 mins
      const bp1 = findBreakPoints(a1, [a2, a3]);
      const bp2 = findBreakPoints(a2, [a1, a3]);
      const bp3 = findBreakPoints(a3, [a1, a2]);
      const as1 = asArtifactSlices(a1, bp1);
      const as2 = asArtifactSlices(a2, bp2);
      const as3 = asArtifactSlices(a3, bp3);

      expect(bp1).to.be.deep.members([minute(1), minute(10), minute(29)]);
      expect(bp2).to.be.deep.members([minute(29)]);
      expect(bp3).to.be.deep.members([minute(10)]);

      expect(as1).to.be.deep.members([
        { start: minute(0), end: minute(1) },
        { start: minute(1), end: minute(10) },
        { start: minute(10), end: minute(29) },
        { start: minute(29), end: minute(30) },
      ]);

      expect(as2).to.be.deep.members([
        { start: minute(10), end: minute(29) },
        { start: minute(29), end: minute(30) },
      ]);

      expect(as3).to.be.deep.eq([
        { start: minute(1), end: minute(10) },
        { start: minute(10), end: minute(29) },
      ]);

      const groups = groupArtifacts([
        { id: a1.id, slices: as1 },
        { id: a2.id, slices: as2 },
        { id: a3.id, slices: as3 },
      ]);

      expect(groups).to.be.deep.members([
        { start: minute(0), end: minute(1), ids: [1] },
        { start: minute(1), end: minute(10), ids: [1, 3] },
        { start: minute(10), end: minute(29), ids: [1, 2, 3] },
        { start: minute(29), end: minute(30), ids: [1, 2] },
      ]);
    });
  });
});
