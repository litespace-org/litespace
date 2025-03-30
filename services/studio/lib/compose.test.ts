import {
  asSlices,
  compose,
  findBreakTimestamps,
  getGroupLayoutType,
  groupSlices,
  Video,
  VideoSlice,
  VideoSliceGroup,
} from "@/lib/compose";
import { nameof } from "@litespace/utils/utils";
import dayjs from "@/lib/dayjs";
import ms from "ms";
import { expect } from "chai";
import { Dayjs } from "dayjs";
import { flattenDeep, isArray } from "lodash";

const now = dayjs().startOf("hour");

function iso<
  T extends
    | Dayjs
    | Dayjs[]
    | VideoSlice
    | VideoSlice[]
    | VideoSliceGroup
    | VideoSliceGroup[],
>(input: T) {
  if (isArray(input))
    return input.map((slice) =>
      dayjs.isDayjs(slice)
        ? slice.toISOString()
        : {
            ...slice,
            start: slice.start.toISOString(),
            end: slice.end.toISOString(),
          }
    );

  if (input instanceof Dayjs) return input.toISOString();

  return {
    ...input,
    start: input.start.toISOString(),
    end: input.end.toISOString(),
  };
}

/**
 * Timeline (30m):
 *
 * u1: =====_=================_======
 *
 * u2: _===============_=============
 *
 * s1: __________________==========__
 */
function timeline(start: Dayjs) {
  const v1: Video = {
    id: 1,
    start: start,
    duration: ms("5m"),
    userId: 1,
    src: "1.mp4",
  };

  const v2: Video = {
    id: 2,
    start: start.add(6, "minutes"),
    duration: ms("17m"),
    userId: 1,
    src: "2.mp4",
  };

  const v3: Video = {
    id: 3,
    start: start.add(24, "minute"),
    duration: ms("6m"),
    userId: 1,
    src: "3.mp4",
  };

  const v4: Video = {
    id: 4,
    start: start.add(1, "minute"),
    duration: ms("15m"),
    userId: 2,
    src: "4.mp4",
  };

  const v5: Video = {
    id: 5,
    start: start.add(17, "minutes"),
    duration: ms("13m"),
    userId: 2,
    src: "5.mp4",
  };

  const v6: Video = {
    id: 6,
    start: start.add(18, "minute"),
    duration: ms("10m"),
    userId: 1,
    src: "6.mp4",
    screen: true,
  };

  return [v1, v2, v3, v4, v5, v6];
}

describe(nameof(findBreakTimestamps), () => {
  it("should return empty break points in case no other videos are provided", () => {
    expect(
      findBreakTimestamps(
        {
          id: 1,
          start: now,
          duration: ms("10m"),
          userId: 1,
          src: "1.mp4",
        },
        []
      )
    ).to.be.empty;
  });

  it("should find the intersection of the provided video with the other videos", () => {
    const v: Video = {
      id: 2,
      start: now.add(2, "minutes"),
      duration: ms("1m"),
      userId: 2,
      src: "2.mp4",
    };

    expect(
      iso(
        findBreakTimestamps(
          {
            id: 1,
            start: now,
            duration: ms("10m"),
            userId: 1,
            src: "1.mp4",
          },
          [v]
        )
      )
    ).to.be.deep.eq(iso([v.start, v.start.add(v.duration)]));
  });

  it("should omit duplicated break points", () => {
    const v1 = {
      id: 2,
      start: now.add(2, "minutes"),
      duration: ms("1m"),
      userId: 2,
      src: "2.mp4",
    };

    const v2 = {
      id: 3,
      start: now.add(2, "minutes"),
      duration: ms("2m"),
      userId: 2,
      src: "2.mp4",
    };

    expect(
      iso(
        findBreakTimestamps(
          {
            id: 1,
            start: now,
            duration: ms("10m"),
            userId: 1,
            src: "1.mp4",
          },
          [v1, v2]
        )
      )
    ).to.be.deep.eq(
      iso([v1.start, v1.start.add(v1.duration), v2.start.add(v2.duration)])
    );
  });

  it("should omit break points the occurs outside the `target` video boundaries", () => {
    const v1 = {
      id: 2,
      start: now.add(2, "minutes"),
      duration: ms("1m"),
      userId: 2,
      src: "2.mp4",
    };

    const v2 = {
      id: 3,
      start: now.add(10, "minutes"),
      duration: ms("2m"),
      userId: 3,
      src: "3.mp4",
    };

    expect(
      iso(
        findBreakTimestamps(
          {
            id: 1,
            start: now,
            duration: ms("10m"),
            userId: 1,
            src: "1.mp4",
          },
          [v1, v2]
        )
      )
    ).to.be.deep.eq(iso([v1.start, v1.start.add(v1.duration)]));
  });
});

describe(nameof(asSlices), () => {
  it("should split the video by the provided timestamps", () => {
    expect(
      iso(
        asSlices(
          {
            id: 1,
            start: now,
            duration: ms("10m"),
            userId: 1,
            src: "1.mp4",
          },
          [now.add(1, "minute"), now.add(2, "minutes")]
        )
      )
    ).to.be.deep.eq(
      iso([
        {
          videoId: 1,
          start: now,
          end: now.add(1, "minute"),
        },
        {
          videoId: 1,
          start: now.add(1, "minute"),
          end: now.add(2, "minute"),
        },
        {
          videoId: 1,
          start: now.add(2, "minute"),
          end: now.add(10, "minutes"),
        },
      ])
    );
  });

  it("should ignore duplicate or zero timestamps", () => {
    expect(
      iso(
        asSlices(
          {
            id: 1,
            start: now,
            duration: ms("10m"),
            userId: 1,
            src: "1.mp4",
          },
          [
            now,
            now.add(1, "minute"),
            now.add(1, "minutes"), // duplicates
            now.add(2, "minutes"),
          ]
        )
      )
    ).to.be.deep.eq(
      iso([
        {
          videoId: 1,
          start: now,
          end: now.add(1, "minute"),
        },
        {
          videoId: 1,
          start: now.add(1, "minute"),
          end: now.add(2, "minute"),
        },
        {
          videoId: 1,
          start: now.add(2, "minute"),
          end: now.add(10, "minutes"),
        },
      ])
    );
  });
});

describe(nameof(groupSlices), () => {
  it("should group slices by start and end time", () => {
    const start = dayjs().set("year", 2025).startOf("year");
    const videos = timeline(start);
    const groups = groupSlices(
      flattenDeep(
        videos.map((video) => {
          const others = videos.filter((v) => v.id !== video.id);
          const timestamps = findBreakTimestamps(video, others);
          return asSlices(video, timestamps);
        })
      )
    );

    expect(groups).to.be.of.length(10);
    expect(iso(groups)).to.be.deep.eq([
      {
        start: "2024-12-31T22:00:00.000Z",
        end: "2024-12-31T22:01:00.000Z",
        videoIds: [1],
      },
      {
        start: "2024-12-31T22:01:00.000Z",
        end: "2024-12-31T22:05:00.000Z",
        videoIds: [1, 4],
      },
      {
        start: "2024-12-31T22:05:00.000Z",
        end: "2024-12-31T22:06:00.000Z",
        videoIds: [4],
      },
      {
        start: "2024-12-31T22:06:00.000Z",
        end: "2024-12-31T22:16:00.000Z",
        videoIds: [2, 4],
      },
      {
        start: "2024-12-31T22:16:00.000Z",
        end: "2024-12-31T22:17:00.000Z",
        videoIds: [2],
      },
      {
        start: "2024-12-31T22:17:00.000Z",
        end: "2024-12-31T22:18:00.000Z",
        videoIds: [2, 5],
      },
      {
        start: "2024-12-31T22:18:00.000Z",
        end: "2024-12-31T22:23:00.000Z",
        videoIds: [2, 5, 6],
      },
      {
        start: "2024-12-31T22:23:00.000Z",
        end: "2024-12-31T22:24:00.000Z",
        videoIds: [5, 6],
      },
      {
        start: "2024-12-31T22:24:00.000Z",
        end: "2024-12-31T22:28:00.000Z",
        videoIds: [3, 5, 6],
      },
      {
        start: "2024-12-31T22:28:00.000Z",
        end: "2024-12-31T22:30:00.000Z",
        videoIds: [3, 5],
      },
    ]);
  });
});

describe(nameof(getGroupLayoutType), () => {
  it("should recognize single user layout", () => {
    expect(
      getGroupLayoutType([
        {
          id: 1,
          start: now,
          duration: ms("10m"),
          src: "1.mp4",
          userId: 1,
        },
      ])
    ).to.be.eq("single-user");
  });

  it("should recognize two users layout", () => {
    expect(
      getGroupLayoutType([
        {
          id: 1,
          start: now,
          duration: ms("10m"),
          src: "1.mp4",
          userId: 1,
        },
        {
          id: 2,
          start: now,
          duration: ms("10m"),
          src: "2.mp4",
          userId: 2,
        },
      ])
    ).to.be.eq("dual-user");
  });

  it("should recognize one user and one screen", () => {
    expect(
      getGroupLayoutType([
        {
          id: 1,
          start: now,
          duration: ms("10m"),
          src: "1.mp4",
          userId: 1,
        },
        {
          id: 2,
          start: now,
          duration: ms("10m"),
          src: "2.mp4",
          userId: 1,
          screen: true,
        },
      ])
    ).to.be.eq("presenter-screen");
  });

  it("should recognize two users and one screen", () => {
    expect(
      getGroupLayoutType([
        {
          id: 1,
          start: now,
          duration: ms("10m"),
          src: "1.mp4",
          userId: 1,
        },
        {
          id: 2,
          start: now,
          duration: ms("10m"),
          src: "2.mp4",
          userId: 2,
        },
        {
          id: 2,
          start: now,
          duration: ms("10m"),
          src: "2.mp4",
          userId: 1,
          screen: true,
        },
      ])
    ).to.be.eq("co-presenter-screen");
  });

  it("should recognize unsupported layouts (e.g., 3 users, two screens, ...etc)", () => {
    expect(
      getGroupLayoutType([
        {
          id: 1,
          start: now,
          duration: ms("10m"),
          src: "1.mp4",
          userId: 1,
        },
        {
          id: 2,
          start: now,
          duration: ms("10m"),
          src: "2.mp4",
          userId: 2,
        },
        {
          id: 3,
          start: now,
          duration: ms("10m"),
          src: "2.mp4",
          userId: 3,
        },
      ])
    ).to.be.eq("unkown");

    expect(
      getGroupLayoutType([
        {
          id: 1,
          start: now,
          duration: ms("10m"),
          src: "1.mp4",
          userId: 1,
        },
        {
          id: 2,
          start: now,
          duration: ms("10m"),
          src: "2.mp4",
          userId: 1,
          screen: true,
        },
        {
          id: 3,
          start: now,
          duration: ms("10m"),
          src: "3.mp4",
          userId: 1,
          screen: true,
        },
      ])
    ).to.be.eq("unkown");
  });
});

describe(nameof(compose), () => {
  it("should compose video layout", () => {
    const start = dayjs();
    const videos = timeline(start);
    const fps = 1;

    const layouts = compose(videos, fps);
    expect(layouts).to.be.of.length(10);

    const [l1, l2, l3, l4] = layouts;

    expect(l1).to.be.deep.eq({
      type: "single-user",
      start: 0,
      videos: [{ id: 1, start: 0, end: 60 }],
    });

    expect(l2).to.be.deep.eq({
      type: "dual-user",
      start: 60,
      videos: [
        { id: 1, start: 60, end: 300 },
        { id: 4, start: 0, end: 240 },
      ],
    });

    expect(l3).to.be.deep.eq({
      type: "single-user",
      start: 300,
      videos: [{ id: 4, start: 240, end: 300 }],
    });

    expect(l4).to.be.deep.eq({
      type: "dual-user",
      start: 360,
      videos: [
        { id: 2, start: 0, end: 600 },
        { id: 4, start: 300, end: 900 },
      ],
    });
  });
});
