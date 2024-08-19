import type { Meta, StoryObj } from "@storybook/react";
import { DateInput } from "@/components/DateInput";
import { Direction } from "@/components/Direction";
import ar from "@/locales/ar-eg.json";
import { Form } from "@/components/Form";
import dayjs from "@/lib/dayjs";
import { useState } from "react";

type Component = typeof DateInput;

const meta: Meta<Comment> = {
  title: "Date Input",
  component: DateInput,
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
    const [value, setValue] = useState(dayjs());
    console.log({ value });
    return (
      <Form>
        <DateInput
          placeholder={ar["global.form.email.placeholder"]}
          value={value}
          onChange={(value) => setValue(dayjs(value))}
        />
      </Form>
    );
  },
};

export default meta;
