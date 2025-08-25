import { StoryObj, Meta } from "@storybook/react";
import { SlotsList } from "@/components/SlotsList/SlotsList";
import dayjs from "dayjs";
import React from "react";
import { faker } from "@faker-js/faker/locale/ar";
import { range } from "lodash";

type Component = typeof SlotsList;
type Story = StoryObj<Component>;

const meta: Meta<Component> = {
  title: "SlotsList",
  component: SlotsList,
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

function makeMember() {
  return {
    id: Math.random(),
    name: faker.person.fullName(),
    image: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
  };
}

export const SlotsWithMultipleLessons: Story = {
  args: {
    slotActions: { onDelete: () => {}, onEdit: () => {} },
    slots: [
      {
        members: range(20).map(() => makeMember()),
        id: 1,
        start: dayjs().add(30, "minutes").toISOString(),
        end: dayjs().add(1, "hour").toISOString(),
      },
      {
        members: range(3).map(() => makeMember()),
        id: 2,
        start: dayjs().add(2, "hours").toISOString(),
        end: dayjs().add(3, "hours").toISOString(),
      },
      {
        members: range(1).map(() => makeMember()),
        id: 3,
        start: dayjs().add(4, "hours").toISOString(),
        end: dayjs().add(6, "hours").toISOString(),
      },
    ],
  },
};

export const SlotsWihtoutLessons: Story = {
  args: {
    slotActions: { onDelete: () => {}, onEdit: () => {} },
    slots: [
      {
        members: [],
        id: 3,
        start: dayjs().add(30, "minutes").toISOString(),
        end: dayjs().add(1, "hour").toISOString(),
      },
      {
        members: [],
        id: 3,
        start: dayjs().add(2, "hours").toISOString(),
        end: dayjs().add(3, "hours").toISOString(),
      },
    ],
  },
};

export default meta;
