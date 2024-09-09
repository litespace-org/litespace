import {
  ArtifactSlice,
  asArtifactSlices,
  asFullScreenView,
  asSoloPersenterView,
  asSplitScreenView,
  findBreakPoints,
  groupArtifacts,
  asAccompaniedPersenterView,
  asMultiPersenterView,
  selectBestView,
  View,
  synchronizeArtifactsAudio,
  Artifact,
} from "@/lib/ffmpeg";
import dayjs from "@/lib/dayjs";
import { duration } from "@/lib/filter";
import { expect } from "chai";
import { nameof } from "@/lib/utils";

describe("FFmpeg", () => {
  const start = dayjs.utc().startOf("hour");
  const minute = (minute: number) => start.add(minute, "minutes").valueOf();

  describe(nameof(synchronizeArtifactsAudio), () => {
    const artifact = (id: number, start: number): Artifact => ({
      id,
      duration: 0,
      start,
      audio: false,
      screen: false,
      file: "",
    });

    it("should output blank audio in case of no artifacts", () => {
      const filters = synchronizeArtifactsAudio({
        anchor: minute(0),
        artifacts: [],
        output: "audio",
        template: 1,
        duration: 0,
      });

      const [first, second] = filters;
      expect(filters).to.be.of.length(2);
      expect(first.toString()).to.be.eq(
        "[1] atrim=start=0:end=0 [template-output]"
      );
      expect(second.toString()).to.be.eq(
        "[template-output] amix=inputs=1 [audio]"
      );
    });

    it("should output blank audio in case of no artifacts", () => {
      const filters = synchronizeArtifactsAudio({
        anchor: minute(0),
        artifacts: [
          artifact(0, minute(0)),
          artifact(1, minute(10)),
          artifact(2, minute(15)),
        ],
        output: "audio",
        template: 3,
        duration: 10_000,
      });

      expect(filters).to.be.of.length(5);
      const [first, second, third, forth, last] = filters;

      expect(first.toString()).to.be.eq(
        "[3] atrim=start=0:end=10 [template-output]"
      );
      expect(second.toString()).to.be.eq("[0] adelay=delays=0:all=1 [0-a]");
      expect(third.toString()).to.be.eq("[1] adelay=delays=600000:all=1 [1-a]");
      expect(forth.toString()).to.be.eq("[2] adelay=delays=900000:all=1 [2-a]");
      expect(last.toString()).to.be.eq(
        "[0-a][1-a][2-a][template-output] amix=inputs=4 [audio]"
      );
    });
  });

  describe(nameof(asFullScreenView), () => {
    it("should construct full screen artifact", () => {
      const slice: ArtifactSlice = { start: minute(0), end: minute(5) };
      const { cut, scale, overlay, output } = asFullScreenView({
        slice,
        start: { anchor: minute(0), artifact: minute(0) },
        ids: { artifact: "1", input: "bg" },
        index: 1,
      });

      expect(cut.toString()).to.be.eq(
        "[1] trim=start=0:end=300, setpts=PTS-STARTPTS [trim-1]"
      );
      expect(scale.toString()).to.be.eq(
        "[trim-1] setpts=PTS+0/TB, scale=1279x719:force_original_aspect_ratio=decrease, pad=1280:720:(ow-iw)/2:(oh-ih)/2, setsar=1 [scale-1]"
      );
      expect(overlay.toString()).to.be.eq(
        "[bg][scale-1] overlay=eof_action=pass [overlay-1]"
      );

      expect(output).to.be.eq("overlay-1");
    });

    it("should construct full screen artifact with a delay", () => {
      const slice: ArtifactSlice = { start: minute(5), end: minute(10) };
      const { cut, scale, overlay, output } = asFullScreenView({
        slice,
        start: { anchor: minute(0), artifact: minute(2) },
        ids: { artifact: "1", input: "bg" },
        index: 1,
      });

      expect(cut.toString()).to.be.eq(
        "[1] trim=start=180:end=480, setpts=PTS-STARTPTS [trim-1]"
      );
      expect(scale.toString()).to.be.eq(
        "[trim-1] setpts=PTS+300/TB, scale=1279x719:force_original_aspect_ratio=decrease, pad=1280:720:(ow-iw)/2:(oh-ih)/2, setsar=1 [scale-1]"
      );
      expect(overlay.toString()).to.be.eq(
        "[bg][scale-1] overlay=eof_action=pass [overlay-1]"
      );
      expect(output).to.be.eq("overlay-1");
    });
  });

  describe(nameof(asSplitScreenView), () => {
    it("should construct left and right half screen filters", () => {
      const { left, right } = asSplitScreenView({
        start: {
          anchor: minute(0),
          artifacts: { left: minute(0), right: minute(0) },
        },
        slice: { start: minute(5), end: minute(10) },
        ids: { artifacts: { left: "1", right: "2" }, input: "bg" },
        indices: { left: 1, right: 2 },
      });

      expect(left.cut.toString()).to.be.eq(
        "[1] trim=start=300:end=600, setpts=PTS-STARTPTS [trim-1]"
      );

      expect(left.scale.toString()).to.be.eq(
        "[trim-1] setpts=PTS+300/TB, scale=639x719:force_original_aspect_ratio=decrease, pad=640:720:(ow-iw)/2:(oh-ih)/2, setsar=1 [scale-1]"
      );

      expect(left.overlay.toString()).to.be.eq(
        "[bg][scale-1] overlay=eof_action=pass [overlay-1]"
      );

      expect(right.cut.toString()).to.be.eq(
        "[2] trim=start=300:end=600, setpts=PTS-STARTPTS [trim-2]"
      );

      expect(right.scale.toString()).to.be.eq(
        "[trim-2] setpts=PTS+300/TB, scale=639x719:force_original_aspect_ratio=decrease, pad=640:720:(ow-iw)/2:(oh-ih)/2, setsar=1 [scale-2]"
      );

      expect(right.overlay.toString()).to.be.eq(
        "[overlay-1][scale-2] overlay=eof_action=pass:x=640 [overlay-2]"
      );
    });
  });

  describe(nameof(asSoloPersenterView), () => {
    it("should construct full screen and the persenter should be rendered at the bottom right", () => {
      const { screen, presenter } = asSoloPersenterView({
        ids: { input: "bg", screen: "1", presenter: "0" },
        start: { anchor: minute(0), presenter: minute(0), screen: minute(0) },
        slice: { start: minute(5), end: minute(10) },
        indices: { screen: 1, presenter: 0 },
      });

      expect(screen.cut.toString()).to.be.eq(
        "[1] trim=start=300:end=600, setpts=PTS-STARTPTS [trim-1]"
      );

      expect(screen.scale.toString()).to.be.eq(
        "[trim-1] setpts=PTS+300/TB, scale=1279x719:force_original_aspect_ratio=decrease, pad=1280:720:(ow-iw)/2:(oh-ih)/2, setsar=1 [scale-1]"
      );

      expect(screen.overlay.toString()).to.be.eq(
        "[bg][scale-1] overlay=eof_action=pass [overlay-1]"
      );

      expect(presenter.cut.toString()).to.be.eq(
        "[0] trim=start=300:end=600, setpts=PTS-STARTPTS [trim-0]"
      );
      expect(presenter.scale.toString()).to.be.eq(
        "[trim-0] setpts=PTS+300/TB, scale=255x143:force_original_aspect_ratio=decrease, pad=256:144:(ow-iw)/2:(oh-ih)/2, setsar=1 [scale-0]"
      );

      expect(presenter.overlay.toString()).to.be.eq(
        "[overlay-1][scale-0] overlay=eof_action=pass:x=1014:y=566 [overlay-0]"
      );
    });
  });

  describe(nameof(asAccompaniedPersenterView), () => {
    it("should construct filters for two users and one screen", () => {
      const { screen, users, output } = asAccompaniedPersenterView({
        ids: { input: "bg", screen: "2", users: ["0", "1"] },
        start: {
          anchor: minute(0),
          users: [minute(0), minute(0)],
          screen: minute(0),
        },
        slice: { start: minute(5), end: minute(10) },
        indices: { screen: 2, users: [0, 1] },
      });

      expect(screen.cut.toString()).to.be.eq(
        "[2] trim=start=300:end=600, setpts=PTS-STARTPTS [trim-2]"
      );

      expect(screen.scale.toString()).to.be.eq(
        "[trim-2] setpts=PTS+300/TB, scale=959x719:force_original_aspect_ratio=decrease, pad=960:720:(ow-iw)/2:(oh-ih)/2, setsar=1 [scale-2]"
      );

      expect(screen.overlay.toString()).to.be.eq(
        "[bg][scale-2] overlay=eof_action=pass [overlay-2]"
      );

      expect(users.first.cut.toString()).to.be.eq(
        "[0] trim=start=300:end=600, setpts=PTS-STARTPTS [trim-0]"
      );
      expect(users.first.scale.toString()).to.be.eq(
        "[trim-0] setpts=PTS+300/TB, scale=319x359:force_original_aspect_ratio=decrease, pad=320:360:(ow-iw)/2:(oh-ih)/2, setsar=1 [scale-0]"
      );

      expect(users.first.overlay.toString()).to.be.eq(
        "[overlay-2][scale-0] overlay=eof_action=pass:x=960 [overlay-0]"
      );

      expect(users.second.cut.toString()).to.be.eq(
        "[1] trim=start=300:end=600, setpts=PTS-STARTPTS [trim-1]"
      );
      expect(users.second.scale.toString()).to.be.eq(
        "[trim-1] setpts=PTS+300/TB, scale=319x359:force_original_aspect_ratio=decrease, pad=320:360:(ow-iw)/2:(oh-ih)/2, setsar=1 [scale-1]"
      );

      expect(users.second.overlay.toString()).to.be.eq(
        "[overlay-0][scale-1] overlay=eof_action=pass:x=960:y=360 [overlay-1]"
      );

      expect(output).to.be.eq("overlay-1");
    });
  });

  describe(nameof(asMultiPersenterView), () => {
    it("should construct filters for two users and two screens", () => {
      const { screens, users, output } = asMultiPersenterView({
        ids: { input: "bg", screens: ["2", "3"], users: ["0", "1"] },
        indices: { screens: [2, 3], users: [0, 1] },
        start: {
          anchor: minute(0),
          users: [minute(0), minute(0)],
          screens: [minute(0), minute(0)],
        },
        slice: { start: minute(5), end: minute(10) },
      });

      expect(screens.first.cut.toString()).to.be.eq(
        "[2] trim=start=300:end=600, setpts=PTS-STARTPTS [trim-2]"
      );

      expect(screens.first.scale.toString()).to.be.eq(
        "[trim-2] setpts=PTS+300/TB, scale=639x359:force_original_aspect_ratio=decrease, pad=640:360:(ow-iw)/2:(oh-ih)/2, setsar=1 [scale-2]"
      );

      expect(screens.first.overlay.toString()).to.be.eq(
        "[bg][scale-2] overlay=eof_action=pass [overlay-2]"
      );

      expect(screens.second.cut.toString()).to.be.eq(
        "[3] trim=start=300:end=600, setpts=PTS-STARTPTS [trim-3]"
      );

      expect(screens.second.scale.toString()).to.be.eq(
        "[trim-3] setpts=PTS+300/TB, scale=639x359:force_original_aspect_ratio=decrease, pad=640:360:(ow-iw)/2:(oh-ih)/2, setsar=1 [scale-3]"
      );

      expect(screens.second.overlay.toString()).to.be.eq(
        "[overlay-2][scale-3] overlay=eof_action=pass:x=640 [overlay-3]"
      );

      expect(users.first.cut.toString()).to.be.eq(
        "[0] trim=start=300:end=600, setpts=PTS-STARTPTS [trim-0]"
      );
      expect(users.first.scale.toString()).to.be.eq(
        "[trim-0] setpts=PTS+300/TB, scale=639x359:force_original_aspect_ratio=decrease, pad=640:360:(ow-iw)/2:(oh-ih)/2, setsar=1 [scale-0]"
      );

      expect(users.first.overlay.toString()).to.be.eq(
        "[overlay-3][scale-0] overlay=eof_action=pass:y=360 [overlay-0]"
      );

      expect(users.second.cut.toString()).to.be.eq(
        "[1] trim=start=300:end=600, setpts=PTS-STARTPTS [trim-1]"
      );
      expect(users.second.scale.toString()).to.be.eq(
        "[trim-1] setpts=PTS+300/TB, scale=639x359:force_original_aspect_ratio=decrease, pad=640:360:(ow-iw)/2:(oh-ih)/2, setsar=1 [scale-1]"
      );

      expect(users.second.overlay.toString()).to.be.eq(
        "[overlay-0][scale-1] overlay=eof_action=pass:x=640:y=360 [overlay-1]"
      );

      expect(output).to.be.eq("overlay-1");
    });
  });

  describe(nameof(selectBestView), () => {
    const artifact = (id: number, screen: boolean = false): Artifact => ({
      id,
      duration: 0,
      start: 0,
      screen,
      audio: false,
      file: "",
    });

    it("should select full screen view incase of only one user", () => {
      expect(selectBestView([artifact(1)])).to.be.eq(View.FullScreen);
    });

    it("should select multi persenter view incase of two users and two screens", () => {
      expect(
        selectBestView([
          artifact(1),
          artifact(2, true),
          artifact(3),
          artifact(4, true),
        ])
      ).to.be.eq(View.MultiPersenter);
    });

    it("should select solo persenter view incase of one user and one screen", () => {
      expect(selectBestView([artifact(1), artifact(2, true)])).to.be.eq(
        View.SoloPersenter
      );
    });

    it("should select accompanied persenter view incase of two users and one screen", () => {
      expect(
        selectBestView([artifact(1), artifact(2), artifact(3, true)])
      ).to.be.eq(View.AccompaniedPersenter);
    });

    it("should select split screen view incase of two users and no screens", () => {
      expect(selectBestView([artifact(1), artifact(2)])).to.be.eq(
        View.SplitScreen
      );
    });

    it("should return null for all invlaid ids", () => {
      // empty artifacts
      expect(selectBestView([])).to.be.eq(null);
      // tree screens
      expect(
        selectBestView([
          artifact(1, true),
          artifact(2, true),
          artifact(3, true),
        ])
      ).to.be.eq(null);
      // one screen
      expect(selectBestView([artifact(1, true)])).to.be.eq(null);
    });
  });

  describe("Uitls", () => {
    const artifact = (artifact: Partial<Artifact>): Artifact => ({
      id: 0,
      audio: false,
      file: "",
      start: 0,
      duration: 0,
      screen: false,
      ...artifact,
    });

    it("should find recording breakpoints (1)", () => {
      const t1 = minute(0);
      const t2 = minute(5);

      expect(
        findBreakPoints(
          artifact({
            id: 1,
            start: t1,
            duration: duration("30min"),
          }),
          [
            artifact({
              id: 2,
              start: t2,
              duration: duration("1min"),
              screen: true,
            }),
          ]
        )
      ).to.be.deep.eq([minute(5), minute(6)]);
    });

    it("should find recording breakpoints (2)", () => {
      const t1 = minute(0);
      const t2 = minute(5);
      const t3 = minute(15);

      expect(
        findBreakPoints(
          artifact({ id: 1, start: t1, duration: duration("30min") }),
          [
            artifact({ id: 2, start: t2, duration: duration("1min") }),
            artifact({ id: 3, start: t3, duration: duration("10min") }),
          ]
        )
      ).to.be.deep.members([minute(5), minute(6), minute(15), minute(25)]);
    });

    it("should find recording breakpoints (3)", () => {
      const t1 = minute(0);
      const t2 = minute(5);
      const t3 = minute(15);

      expect(
        findBreakPoints(
          artifact({ id: 1, start: t1, duration: duration("30min") }),
          [
            artifact({ id: 2, start: t2, duration: duration("1min") }),
            artifact({ id: 3, start: t3, duration: duration("15min") }),
          ]
        )
      ).to.be.deep.eq([minute(5), minute(6), minute(15)]);
    });

    it("should find recording breakpoints (4)", () => {
      const t1 = minute(0);
      const t2 = minute(10);

      expect(
        findBreakPoints(
          artifact({ id: 1, start: t1, duration: duration("5min") }),
          [artifact({ id: 2, start: t2, duration: duration("30min") })]
        )
      ).to.be.deep.eq([]);
    });

    it("should find recording breakpoints (5)", () => {
      const t1 = minute(15);
      const t2 = minute(20);
      const a1 = artifact({ id: 2, start: t1, duration: duration("15min") });
      const a2 = artifact({ id: 2, start: t2, duration: duration("10min") });

      expect(findBreakPoints(a1, [a2])).to.be.deep.eq([minute(20)]);
      expect(findBreakPoints(a2, [a1])).to.be.deep.eq([]);
    });

    it("should convert breakpoints into artifact slices (1)", () => {
      const t1 = minute(0);
      const t2 = minute(5);
      const a = artifact({ id: 1, start: t1, duration: duration("30min") });
      const breakpoints = findBreakPoints(a, [
        artifact({ id: 2, start: t2, duration: duration("1min") }),
      ]);

      expect(asArtifactSlices(a, breakpoints)).to.be.deep.eq([
        { start: minute(0), end: minute(5) },
        { start: minute(5), end: minute(6) },
        { start: minute(6), end: minute(30) },
      ]);
    });

    it("should convert breakpoints into artifact slices (2)", () => {
      const t1 = minute(0);
      const a = artifact({ id: 1, start: t1, duration: duration("30min") });

      expect(asArtifactSlices(a, [])).to.be.deep.eq([
        { start: minute(0), end: minute(30) },
      ]);
    });

    it("should convert breakpoints into artifact slices (3)", () => {
      const t1 = minute(0);
      const t2 = minute(15);
      const a = artifact({ id: 1, start: t1, duration: duration("30min") });

      const breakpoints = findBreakPoints(a, [
        artifact({ id: 1, start: t2, duration: duration("15min") }),
      ]);

      expect(breakpoints).to.be.of.length(1);
      expect(asArtifactSlices(a, breakpoints)).to.be.deep.eq([
        { start: minute(0), end: minute(15) },
        { start: minute(15), end: minute(30) },
      ]);
    });

    it("should group similar artifact slices (1)", () => {
      const t1 = minute(0);
      const t2 = minute(10);
      const a1 = artifact({ id: 1, start: t1, duration: duration("30min") });
      const a2 = artifact({ id: 2, start: t2, duration: duration("15min") });
      const bp1 = findBreakPoints(a1, [a2]);
      const bp2 = findBreakPoints(a2, [a1]);
      const as1 = asArtifactSlices(a1, bp1);
      const as2 = asArtifactSlices(a2, bp2);

      expect(
        groupArtifacts([
          { slices: as1, artifact: a1 },
          { slices: as2, artifact: a2 },
        ])
      ).to.be.deep.eq([
        { start: minute(0), end: minute(10), artifacts: [a1] },
        { start: minute(10), end: minute(25), artifacts: [a1, a2] },
        { start: minute(25), end: minute(30), artifacts: [a1] },
      ]);
    });

    it("should group similar artifact slices (complex) (2)", () => {
      const t1 = minute(0);
      const t2 = minute(16);
      const t3 = minute(0);
      const t4 = minute(5);
      const t5 = minute(20);
      const a1 = artifact({ id: 1, start: t1, duration: duration("15min") }); // e.g., user-1 joined for the first 15 mins
      const a2 = artifact({ id: 2, start: t2, duration: duration("14min") }); // e.g., user-1 left and rejoined the last 15 mins
      const a3 = artifact({ id: 3, start: t3, duration: duration("30min") }); // e..g, user-2 joined the full 30 mins
      const a4 = artifact({ id: 4, start: t4, duration: duration("15min") }); // e.g., share screen
      const a5 = artifact({ id: 5, start: t5, duration: duration("10min") }); // e.g., user-1 share screen in the last 10 mins
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
        { slices: as1, artifact: a1 },
        { slices: as2, artifact: a2 },
        { slices: as3, artifact: a3 },
        { slices: as4, artifact: a4 },
        { slices: as5, artifact: a5 },
      ]);

      expect(groups).to.be.deep.members([
        { start: minute(0), end: minute(5), artifacts: [a1, a3] },
        { start: minute(5), end: minute(15), artifacts: [a1, a3, a4] },
        { start: minute(15), end: minute(16), artifacts: [a3, a4] },
        { start: minute(16), end: minute(20), artifacts: [a2, a3, a4] },
        { start: minute(20), end: minute(30), artifacts: [a2, a3, a5] },
      ]);
    });

    it("should group similar artifact slices (complex) (3)", () => {
      const t1 = minute(0);
      const t2 = minute(10);
      const t3 = minute(1);
      const a1 = artifact({ id: 1, start: t1, duration: duration("30min") }); // e.g., user-1 joined for the first 15 mins
      const a2 = artifact({ id: 2, start: t2, duration: duration("20min") }); // e.g., user-1 left and rejoined the last 15 mins
      const a3 = artifact({ id: 3, start: t3, duration: duration("28min") }); // e..g, user-2 joined the full 30 mins
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
        { slices: as1, artifact: a1 },
        { slices: as2, artifact: a2 },
        { slices: as3, artifact: a3 },
      ]);

      expect(groups).to.be.deep.members([
        { start: minute(0), end: minute(1), artifacts: [a1] },
        { start: minute(1), end: minute(10), artifacts: [a1, a3] },
        { start: minute(10), end: minute(29), artifacts: [a1, a2, a3] },
        { start: minute(29), end: minute(30), artifacts: [a1, a2] },
      ]);
    });
  });
});
