import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import type { Meta, StoryObj } from "@storybook/react";
import { DateInput } from "@/components/DateInput";
import { Form } from "@/components/Form";
import { useState } from "react";
import dayjs from "@/lib/dayjs";
import { faker } from "@faker-js/faker/locale/ar";

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
          placeholder={faker.lorem.words(4)}
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
      <Form className="tw-w-[200px]">
        <DateInput
          placeholder={faker.lorem.words(4)}
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
          placeholder={faker.lorem.words(4)}
          value={value}
          onChange={(value) => setValue(value)}
          min={dayjs().subtract(10, "days")}
          max={dayjs().add(10, "days")}
          today={faker.lorem.words(1)}
        />
      </Form>
    );
  },
};

export default meta;
