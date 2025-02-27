import type { Meta, StoryObj } from "@storybook/react";
import { DatePicker } from "@/components/DatePicker";
import { Direction } from "@/components/Direction";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";

type Component = typeof DatePicker;

const meta: Meta<Component> = {
  title: "DatePicker",
  component: DatePicker,
  parameters: { layout: "centered" },
  decorators: [
    (Story: React.FC) => (
      <Direction>
        <div className="font-cairo text-foreground bg-dash-sidebar w-[500px] min-h-[500px] flex items-center justify-center">
          <Story />
        </div>
      </Direction>
    ),
  ],
};

export const Primary: StoryObj<Component> = {
  render() {
    const [day, setDay] = useState<Dayjs>();
    console.log(day?.format("YYYY-MM-DD"));
    return <DatePicker selected={day} onSelect={setDay} />;
  },
};

export const Bounded: StoryObj<Component> = {
  render() {
    const today = dayjs("2024-08-10", "YYYY-MM-DD");
    const [day, setDay] = useState<Dayjs>(today);
    console.log(day?.format("YYYY-MM-DD"));
    return (
      <DatePicker
        selected={day}
        onSelect={setDay}
        min={today.subtract(12, "days")}
        max={today.add(25, "days")}
      />
    );
  },
};

export const Compact: StoryObj<Component> = {
  render() {
    const [day, setDay] = useState<Dayjs>();
    console.log(day?.format("YYYY-MM-DD"));
    return <DatePicker selected={day} onSelect={setDay} compact />;
  },
};

export default meta;
