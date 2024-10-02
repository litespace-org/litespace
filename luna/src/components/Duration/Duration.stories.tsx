import type { Meta, StoryObj } from "@storybook/react";
import { Duration as DurationInput } from "@/components/Duration";
import { Duration } from "@litespace/sol";
import ar from "@/locales/ar-eg.json";
import { Form } from "@/components/Form";
import { Controller, useForm } from "react-hook-form";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";

type Component = typeof DurationInput;

const meta: Meta<Component> = {
  title: "Duration",
  component: DurationInput,
  decorators: [DarkStoryWrapper],
};

export const Primary: StoryObj<Component> = {
  render() {
    const form = useForm<{ value: Duration }>({
      defaultValues: { value: Duration.from("") },
    });

    return (
      <Form>
        <Controller
          control={form.control}
          name="value"
          render={({ field }) => {
            return (
              <DurationInput
                value={form.watch("value")}
                onChange={field.onChange}
                labels={{
                  long: {
                    hour: ar["global.duration.hour"],
                    hours: ar["global.duration.hours"],
                    pairHours: ar["global.duration.hours.pair"],
                    minute: ar["global.duration.minute"],
                    mintues: ar["global.duration.minutes"],
                    pairMinutes: ar["global.duration.minutes.pair"],
                    seperator: ar["global.duration.seperator"],
                  },
                  short: {
                    hour: ar["global.duration.hour.short"],
                    minute: ar["global.duration.minute.short"],
                  },
                }}
              />
            );
          }}
        />
      </Form>
    );
  },
};

export default meta;
