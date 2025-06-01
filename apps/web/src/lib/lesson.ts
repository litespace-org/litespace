import dayjs from "@/lib/dayjs";

type AsSlotBoundriesPayload = {
  start?: string;
  end?: string;
};

type AsSlotBoundries = {
  after: string;
  before: string;
};

export function asSlotBoundries(
  boundries: AsSlotBoundriesPayload
): AsSlotBoundries {
  if (boundries.start && boundries.end)
    return { after: boundries.start, before: boundries.end };

  const now = dayjs.utc();
  return {
    after: now.toISOString(),
    before: now.add(1, "week").toISOString(),
  };
}
