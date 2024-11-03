import type { Meta, StoryObj } from "@storybook/react";
import { Duration as DurationInput } from "@/components/Duration";
import { Duration } from "@litespace/sol/duration";
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
              />
            );
          }}
        />
      </Form>
    );
  },
};

export default meta;
