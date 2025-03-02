import { StoryObj, Meta } from "@storybook/react";
import {
  ManageSchedule,
  Props,
} from "@/components/ManageSchedule/ManageSchedule";
import dayjs from "@/lib/dayjs";
import { IAvailabilitySlot } from "@litespace/types";
import { useEffect, useState } from "react";
import { Dayjs } from "dayjs";
import React from "react";

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

const save = (actions: IAvailabilitySlot.Action[]) => console.log(actions);
const retry = () => console.log("retrying...");
const close = () => console.log("close....");

const render = (props: Props) => {
  const [date, setDate] = useState<Dayjs>(dayjs().startOf("week"));
  return (
    <ManageSchedule
      {...props}
      date={date.toISOString()}
      nextWeek={() => setDate(date.add(7, "days"))}
      prevWeek={() => setDate(date.subtract(7, "days"))}
    />
  );
};

export const EmptySlots: Story = {
  args: {
    open: true,
    initialSlots: [],
    close,
    save,
  },
  render,
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
    close,
    save,
  },
  render,
};

export const WithMultiRowSlots: Story = {
  args: {
    open: true,
    initialSlots: [makeSlot(10, 12), makeSlot(14, 15)],
    close,
    save,
  },
  render,
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
    save,
    close,
  },
  render,
};

export const Saving: Story = {
  args: {
    open: true,
    initialSlots: [makeSlot(10, 12)],
    saving: true,
    close,
    save,
  },
  render,
};

export const Loading: Story = {
  args: {
    open: true,
    loading: true,
    initialSlots: [makeSlot(10, 12)],
    close,
    save,
  },
  render,
};

export const Error: Story = {
  args: {
    open: true,
    loading: false,
    error: true,
    initialSlots: [],
    close,
    save,
    retry,
  },
  render,
};

export const Simulated: Story = {
  args: {
    open: true,
    loading: false,
    error: false,
    initialSlots: [],
    close,
    save,
    retry,
  },
  render(props: Props) {
    const [date, setDate] = useState<Dayjs>(dayjs().startOf("week"));
    const [loading, setLoading] = useState<boolean>(false);
    const [initialSlots, setInitialSlots] = useState<IAvailabilitySlot.Slot[]>(
      []
    );

    useEffect(() => {
      setLoading(true);
      const id = setTimeout(() => {
        const start = date.set("hour", 13);
        const end = start.add(2, "hours");

        setInitialSlots([
          {
            id: date.week(),
            start: start.toISOString(),
            end: end.toISOString(),
          },
        ]);
        setLoading(false);
      }, 1_000);

      return () => {
        clearTimeout(id);
      };
    }, [date]);

    return (
      <ManageSchedule
        {...props}
        initialSlots={initialSlots}
        loading={loading}
        date={date.toISOString()}
        nextWeek={() => setDate(date.add(7, "days"))}
        prevWeek={() => setDate(date.subtract(7, "days"))}
      />
    );
  },
};

export const SingleDay: Story = {
  args: {
    open: true,
    initialSlots: [],
    singleDay: true,
    date: dayjs().add(3, "day").toISOString(),
    close,
    save,
  },
};

export default meta;
