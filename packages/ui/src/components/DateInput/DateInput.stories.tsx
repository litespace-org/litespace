import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import type { Meta, StoryObj } from "@storybook/react";
import { DateInput } from "@/components/DateInput";
import ar from "@/locales/ar-eg.json";
import { Form } from "@/components/Form";
import { useState } from "react";
import dayjs from "@/lib/dayjs";

type Component = typeof DateInput;

const meta: Meta<Component> = {
  title: "Date Input",
  component: DateInput,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const Primary: StoryObj<Component> = {
  args: {},
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
  args: {},
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
  args: {},
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
