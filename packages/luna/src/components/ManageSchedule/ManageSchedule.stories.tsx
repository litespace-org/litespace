import { StoryObj, Meta } from "@storybook/react";
import { ManageSchedule } from "@/components/ManageSchedule/ManageSchedule";
import dayjs from "@/lib/dayjs";

type Component = typeof ManageSchedule;
type Story = StoryObj<Component>;

const meta: Meta<Component> = {
  title: "ManageSchedule",
  component: ManageSchedule,
};

function makeSlot(start: number, end: number) {
  return {
    id: Math.floor(Math.random() * 1_000_000),
    start: dayjs()
      .startOf("day")
      .set("hour", start)
      .set("minutes", 30)
      .toISOString(),
    end: dayjs()
      .startOf("day")
      .set("hour", end)
      .set("minutes", 30)
      .toISOString(),
  };
}

export const EmptySlots: Story = {
  args: {
    open: true,
    initialSlots: [],
    close: () => alert("closing..."),
    save: () => alert("saving..."),
  },
};

export const WithInitalSlots: Story = {
  args: {
    open: true,
    initialSlots: [
      {
        id: 1,
        start: dayjs()
          .startOf("day")
          .set("hour", 10)
          .set("minutes", 30)
          .toISOString(),
        end: dayjs()
          .startOf("day")
          .set("hour", 12)
          .set("minutes", 30)
          .toISOString(),
      },
    ],
    close: () => alert("closing..."),
    save: () => alert("saving..."),
  },
};

export const WithMultiRowSlots: Story = {
  args: {
    open: true,
    initialSlots: [makeSlot(10, 12), makeSlot(14, 15)],
    close: () => alert("closing..."),
    save: () => alert("saving..."),
  },
};

export const WithExcessRows: Story = {
  args: {
    open: true,
    initialSlots: [
      makeSlot(3, 4),
      makeSlot(7, 8),
      makeSlot(12, 14),
      makeSlot(16, 18),
      makeSlot(26, 28),
      makeSlot(28, 29),
      makeSlot(30, 32),
      makeSlot(36, 38),
      makeSlot(38, 39),
      makeSlot(56, 58),
      makeSlot(56, 58),
      makeSlot(56, 58),
    ],
    save: () => alert("saving..."),
    close: () => alert("closing..."),
  },
};

export const LoadingSchedule: Story = {
  args: {
    open: true,
    loading: true,
    initialSlots: [makeSlot(10, 12)],
    close: () => alert("closing..."),
    save: () => alert("saving..."),
  },
};

export const ScheduleWithError: Story = {
  args: {
    open: true,
    loading: false,
    error: true,
    initialSlots: [],
    close: () => alert("closing..."),
    save: () => alert("saving..."),
    retry: () => alert("retrying..."),
  },
};

export default meta;
