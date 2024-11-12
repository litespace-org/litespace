import type { Meta, StoryObj } from "@storybook/react";
import { MultiSelect } from "@/components/MultiSelect";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import ar from "@/locales/ar-eg.json";
import { IDate } from "@litespace/types";
import { useState } from "react";
import React from "react";

type Component = typeof MultiSelect;

const meta: Meta<Component> = {
  title: "MultiSelect",
  component: MultiSelect,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const Primary: StoryObj<Component> = {
  args: {
    placeholder: ar["global.days.mon"],
    options: [
      { label: ar["global.days.sat"], value: IDate.Weekday.Saturday },
      { label: ar["global.days.sun"], value: IDate.Weekday.Sunday },
      { label: ar["global.days.mon"], value: IDate.Weekday.Monday },
      { label: ar["global.days.tue"], value: IDate.Weekday.Tuesday },
      { label: ar["global.days.wed"], value: IDate.Weekday.Wednesday },
    ],
  },
  render(props) {
    const [values, setValues] = useState<IDate.Weekday[]>([]);
    return (
      <div>
        <MultiSelect
          {...props}
          values={values}
          setValues={(values) => setValues(values as IDate.Weekday[])}
        />
      </div>
    );
  },
};

export const Error: StoryObj<Component> = {
  args: {
    placeholder: ar["global.days.mon"],
    values: [IDate.Weekday.Saturday],
    error: true,
    options: [
      { label: ar["global.days.sat"], value: IDate.Weekday.Saturday },
      { label: ar["global.days.sun"], value: IDate.Weekday.Sunday },
      { label: ar["global.days.mon"], value: IDate.Weekday.Monday },
      { label: ar["global.days.tue"], value: IDate.Weekday.Tuesday },
      { label: ar["global.days.wed"], value: IDate.Weekday.Wednesday },
    ],
  },
};

export default meta;
