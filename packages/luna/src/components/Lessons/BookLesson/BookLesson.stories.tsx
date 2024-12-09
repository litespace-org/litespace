import { StoryObj, Meta } from "@storybook/react";
import { BookLesson } from "@/components/Lessons/BookLesson";
import React from "react";
import { identity } from "lodash";
import { faker } from "@faker-js/faker/locale/ar";

type Component = typeof BookLesson;
type Story = StoryObj<Component>;

const meta: Meta<Component> = {
  title: "Lessons/BookLesson",
  component: BookLesson,
  parameters: {
    layout: null,
  },
  decorators: [
    (Story) => (
      <div className="tw-p-5">
        <Story />
      </div>
    ),
  ],
};

export const Primary: Story = {
  args: {
    open: true,
    close: identity,
    name: faker.person.fullName(),
  },
};

export default meta;
