import { Meta, StoryObj } from "@storybook/react";
import { Block } from "@/components/Lessons/ManageLesson/Block";
import { identity } from "lodash";

type Component = typeof Block;
type Story = StoryObj<Component>;

const meta: Meta<Component> = {
  title: "Lessons/ManageLessonDialog/Block",
  component: Block,
  parameters: {
    layout: "centered",
  },
};

export default meta;

export const Unverified: Story = {
  args: {
    type: "unverified",
    close: identity,
    submit: () => alert("Submit clicked"),
  },
};

export const HasBooked: Story = {
  args: {
    type: "has-booked",
    close: identity,
  },
};

