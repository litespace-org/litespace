import {
  asSlices,
  compose,
  findBreakTimestamps,
  VideoSlice,
} from "@/lib/compose";
import { nameof } from "@litespace/utils/utils";
import dayjs from "@/lib/dayjs";
import ms from "ms";
import { expect } from "chai";
import { Dayjs } from "dayjs";
import { isArray } from "lodash";

const now = dayjs().startOf("hour");

function iso<T extends Dayjs | Dayjs[] | VideoSlice | VideoSlice[]>(input: T) {
  if (isArray(input))
    return input.map((slice) =>
      dayjs.isDayjs(slice)
        ? slice.toISOString()
        : { start: slice.start.toISOString(), end: slice.end.toISOString() }
    );

  if (input instanceof Dayjs) return input.toISOString();
  return {
    start: input.start.toISOString(),
    end: input.end.toISOString(),
  };
}

describe(nameof(findBreakTimestamps), () => {
  it("should return empty break points in case no other videos are provided", () => {
    expect(
      findBreakTimestamps(
        {
          id: 1,
          start: now,
          duration: ms("10m"),
        },
        []
      )
    ).to.be.empty;
  });

  it("should find the intersection of the provided video with the other videos", () => {
    const v = {
      id: 2,
      start: now.add(2, "minutes"),
      duration: ms("1m"),
    };

    expect(
      iso(
        findBreakTimestamps(
          {
            id: 1,
            start: now,
            duration: ms("10m"),
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
    };

    const v2 = {
      id: 3,
      start: now.add(2, "minutes"),
      duration: ms("2m"),
    };

    expect(
      iso(
        findBreakTimestamps(
          {
            id: 1,
            start: now,
            duration: ms("10m"),
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
    };

    const v2 = {
      id: 3,
      start: now.add(10, "minutes"),
      duration: ms("2m"),
    };

    expect(
      iso(
        findBreakTimestamps(
          {
            id: 1,
            start: now,
            duration: ms("10m"),
          },
          [v1, v2]
        )
      )
    ).to.be.deep.eq(iso([v1.start, v1.start.add(v1.duration)]));
  });
});

describe(nameof(asSlices), () => {
  it.only("should split the video by the provided timestamps", () => {
    expect(
      iso(
        asSlices(
          {
            id: 1,
            start: now,
            duration: ms("10m"),
          },
          [now.add(1, "minute"), now.add(2, "minutes")]
        )
      )
    ).to.be.deep.eq(
      iso([
        {
          start: now,
          end: now.add(1, "minute"),
        },
        {
          start: now.add(1, "minute"),
          end: now.add(2, "minute"),
        },
        {
          start: now.add(2, "minute"),
          end: now.add(10, "minutes"),
        },
      ])
    );
  });
});

describe(nameof(compose), () => {
  it("should compose layout", () => {});
});
