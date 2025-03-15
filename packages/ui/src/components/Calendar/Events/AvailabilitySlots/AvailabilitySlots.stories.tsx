import type { Meta, StoryObj } from "@storybook/react";
import { AvailabilitySlot } from "@/components/Calendar/Events/AvailabilitySlots/AvailabilitySlots";
import dayjs from "@/lib/dayjs";
import { faker } from "@faker-js/faker/locale/ar";
import { EventProps } from "@/components/Calendar/types";

type Component = typeof AvailabilitySlot;

const meta: Meta<Component> = {
  title: "Calendar/AvailabilitySlot",
  component: AvailabilitySlot,
  parameters: { layout: "centered" },
  decorators: [],
};

const actions = {
  onEdit: (slotInfo: EventProps) => alert(`Edit: ${slotInfo.id}`),
  onDelete: (id: number) => alert(`Delete: ${id}`),
};

export const OneMember: StoryObj<Component> = {
  args: {
    id: 1,
    start: dayjs().toISOString(),
    end: dayjs().add(1, "hours").toISOString(),
    members: [
      {
        id: 1,
        image: "https://picsum.photos/200",
        name: faker.person.fullName(),
      },
    ],
    ...actions,
  },
};

export const ManyMembers: StoryObj<Component> = {
  args: {
    id: 2,
    start: dayjs().toISOString(),
    end: dayjs().add(3, "hours").toISOString(),
    members: [
      {
        id: 2,
        image: "https://picsum.photos/200",
        name: faker.person.fullName(),
      },
      {
        id: 3,
        image: "https://picsum.photos/300",
        name: faker.person.fullName(),
      },
    ],
    ...actions,
  },
};

export const TooManyMembers: StoryObj<Component> = {
  args: {
    id: 2,
    start: dayjs().toISOString(),
    end: dayjs().add(6, "hours").toISOString(),
    members: [
      {
        id: 2,
        image: "https://picsum.photos/200",
        name: faker.person.fullName(),
      },
      {
        id: 3,
        image: "https://picsum.photos/300",
        name: faker.person.fullName(),
      },
      {
        id: 4,
        image: "https://picsum.photos/200",
        name: faker.person.fullName(),
      },
      {
        id: 5,
        image: "https://picsum.photos/300",
        name: faker.person.fullName(),
      },
      {
        id: 6,
        image: "https://picsum.photos/200",
        name: faker.person.fullName(),
      },
      {
        id: 7,
        image: "https://picsum.photos/300",
        name: faker.person.fullName(),
      },
    ],
    ...actions,
  },
};

export default meta;
