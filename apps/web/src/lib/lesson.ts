import dayjs from "@/lib/dayjs";

type SlotBoundriesPayload = {
  start?: string;
  end?: string;
};

type SlotBoundriesResponse = {
  after: string;
  before: string;
};

export function asSlotBoundries(
  boundries: SlotBoundriesPayload
): SlotBoundriesResponse {
  if (boundries.start && boundries.end)
    return { after: boundries.start, before: boundries.end };

  const now = dayjs.utc();
  return {
    after: now.toISOString(),
    before: now.add(1, "week").toISOString(),
  };
}
