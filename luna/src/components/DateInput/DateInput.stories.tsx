import type { Meta, StoryObj } from "@storybook/react";
import { DateInput } from "@/components/DateInput";
import { Direction } from "@/components/Direction";
import ar from "@/locales/ar-eg.json";
import { Form } from "@/components/Form";
import { useState } from "react";
import dayjs from "@/lib/dayjs";

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
    const [value, setValue] = useState("");
    return (
      <Form>
        <DateInput
          placeholder={ar["global.form.email.placeholder"]}
          value={value}
          onChange={(value) => setValue(value)}
        />
      </Form>
    );
  },
};

export const Small: StoryObj<Component> = {
  render() {
    const [value, setValue] = useState("");
    return (
      <Form className="w-[200px]">
        <DateInput
          placeholder={ar["global.form.email.placeholder"]}
          value={value}
          onChange={(value) => setValue(value)}
        />
      </Form>
    );
  },
};

export const Bounded: StoryObj<Component> = {
  render() {
    const [value, setValue] = useState("");
    return (
      <Form>
        <DateInput
          placeholder={ar["global.form.email.placeholder"]}
          value={value}
          onChange={(value) => setValue(value)}
          min={dayjs().subtract(10, "days")}
          max={dayjs().add(10, "days")}
          today={ar["global.labels.today"]}
        />
      </Form>
    );
  },
};

export default meta;
