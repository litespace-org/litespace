import type { Meta, StoryObj } from "@storybook/react";
import { WeekdayPicker } from "@/components/WeekdayPicker";
import { DarkStoryWrapper } from "@/Internal/DarkWrapper";
import ar from "@/locales/ar-eg.json";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { IDate } from "@litespace/types";

type Component = typeof WeekdayPicker;
type Props = React.ComponentProps<Component>;

const meta: Meta<Component> = {
  title: "WeekdayPicker",
  component: WeekdayPicker,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const Primary: StoryObj<Component> = {
  args: {
    weekdayMap: {
      saturday: ar["global.days.sat"],
      sunday: ar["global.days.sun"],
      monday: ar["global.days.mon"],
      tuesday: ar["global.days.tue"],
      wednesday: ar["global.days.wed"],
      thursday: ar["global.days.thu"],
      friday: ar["global.days.fri"],
      all: ar["global.labels.all"],
      reset: ar["global.labels.cancel"],
    },
    placeholder: ar["global.days.wed"],
  },
  render(props: Props) {
    const form = useForm<{ weekdays: IDate.Weekday[] }>({
      defaultValues: {
        weekdays: [],
      },
    });

    return (
      <Controller
        control={form.control}
        name="weekdays"
        render={({ field }) => {
          return (
            <WeekdayPicker
              {...props}
              weekdays={form.watch("weekdays")}
              onChange={field.onChange}
            />
          );
        }}
      />
    );
  },
};

export default meta;
