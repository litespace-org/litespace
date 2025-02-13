import type { Meta, StoryObj } from "@storybook/react";
import { Accordion } from "@/components/Accordion";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { faker } from "@faker-js/faker/locale/ar";

type Component = typeof Accordion;

const meta: Meta<Component> = {
  title: "Accordion",
  component: Accordion,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const SingleItem: StoryObj<Component> = {
  args: {
    items: [
      {
        id: 1,
        title: faker.lorem.words(3),
        content: faker.lorem.words(25),
      },
    ],
  },
};

export const WithLongTitle: StoryObj<Component> = {
  args: {
    items: [
      {
        id: 1,
        title: faker.lorem.words(10),
        content: faker.lorem.words(30),
      },
    ],
  },
};

export const WithLongContent: StoryObj<Component> = {
  args: {
    items: [
      {
        id: 1,
        title: faker.lorem.words(5),
        content: faker.lorem.words(100),
      },
    ],
  },
};

export const MultipleItems: StoryObj<Component> = {
  args: {
    items: [
      {
        id: 1,
        title: faker.lorem.words(5),
        content: faker.lorem.words(25),
      },
      {
        id: 2,
        title: faker.lorem.words(5),
        content: faker.lorem.words(50),
      },
    ],
  },
};

export const ManyItems: StoryObj<Component> = {
  args: {
    items: [
      {
        id: 1,
        title: faker.lorem.words(5),
        content: faker.lorem.words(25),
      },
      {
        id: 2,
        title: faker.lorem.words(5),
        content: faker.lorem.words(50),
      },
      {
        id: 3,
        title: faker.lorem.words(10),
        content: faker.lorem.words(75),
      },
      {
        id: 4,
        title: faker.lorem.words(8),
        content: faker.lorem.words(35),
      },
      {
        id: 5,
        title: faker.lorem.words(7),
        content: faker.lorem.words(50),
      },
      {
        id: 6,
        title: faker.lorem.words(3),
        content: faker.lorem.words(15),
      },
    ],
  },
};

export default meta;
