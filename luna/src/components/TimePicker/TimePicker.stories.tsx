import type { Meta, StoryObj } from "@storybook/react";
import { TimePicker } from "@/components/TimePicker";
import { Direction } from "@/components/Direction";
import ar from "@/locales/ar-eg.json";
import { Form } from "@/components/Form";
import { useState } from "react";

type Component = typeof TimePicker;

const meta: Meta<Comment> = {
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
    const [value, setValue] = useState("13:00");
    return (
      <Form>
        <TimePicker
          labels={{ am: ar["global.labels.am"], pm: ar["global.labels.pm"] }}
          value={value}
          onChange={setValue}
        />
      </Form>
    );
  },
};

export default meta;
