import type { Meta, StoryObj } from "@storybook/react";
import { TimePicker } from "@/components/TimePicker";
import { Direction } from "@/components/Direction";
import ar from "@/locales/ar-eg.json";
import { Form } from "@/components/Form";
import { Controller, useForm } from "react-hook-form";
import { Time } from "@litespace/utils/time";

type Component = typeof TimePicker;

const meta: Meta<Component> = {
  title: "TimePicker",
  component: TimePicker,
  decorators: [
    (Story: React.FC) => (
      <Direction>
        <div className="font-cairo text-foreground bg-dash-sidebar flex items-center justify-center w-full min-h-screen px-10 py-10">
          <div className="w-[400px]">
            <Story />
          </div>
        </div>
      </Direction>
    ),
  ],
};

export const Primary: StoryObj<Component> = {
  render() {
    const form = useForm<{ value: Time }>({
      defaultValues: { value: Time.from("3pm") },
    });

    return (
      <Form>
        <Controller
          control={form.control}
          name="value"
          render={({ field }) => {
            return (
              <TimePicker
                labels={{
                  am: ar["global.labels.am"],
                  pm: ar["global.labels.pm"],
                }}
                time={form.watch("value")}
                onChange={field.onChange}
              />
            );
          }}
        />
      </Form>
    );
  },
};

export default meta;
