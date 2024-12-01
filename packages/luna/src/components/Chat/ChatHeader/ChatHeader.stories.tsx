import type { Meta, StoryObj } from "@storybook/react";
import { ChatHeader } from "@/components/Chat/ChatHeader";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { faker } from "@faker-js/faker/locale/ar";
import { Duration } from "@litespace/sol/duration";

type Component = typeof ChatHeader;

const meta: Meta<Component> = {
  component: ChatHeader,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const PrimaryOnline: StoryObj<Component> = {
  args: {
    id: 1,
    name: faker.person.firstName(),
    image: "541",
    online: true,
    lastSeen: "2:40 am",
  },
};

export const Offline: StoryObj<Component> = {
  args: {
    id: 1,
    name: faker.person.firstName(),
    image: "541",
    online: false,
    lastSeen: "2:40 am",
  },
};

export default meta;
