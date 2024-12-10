import { StoryObj, Meta } from "@storybook/react";
import { BookLesson } from "@/components/Lessons/BookLesson";
import React from "react";
import { identity } from "lodash";
import { faker } from "@faker-js/faker/locale/ar";
import { IRule } from "@litespace/types";

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

const makeRule = (): IRule.Self => ({
  id: faker.number.int(),
  userId: faker.number.int(),
  title: faker.lorem.words(),
  frequency: IRule.Frequency.Daily,
  start: faker.date.past().toISOString(),
  end: faker.date.future().toISOString(),
  duration: 8 * 60,
  time: "10:00",
  weekdays: [],
  monthday: null,
  activated: true,
  deleted: false,
  createAt: faker.date.past().toISOString(),
  updatedAt: faker.date.past().toISOString(),
});

export const Primary: Story = {
  args: {
    open: true,
    close: identity,
    tutorId: faker.number.int(),
    name: faker.person.fullName(),
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    rules: [makeRule()],
    slots: [],
    notice: 0,
    onBook() {
      alert("Lesson booked!!");
    },
  },
};

export default meta;
