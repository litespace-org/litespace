import type { Meta, StoryObj } from "@storybook/react";
import { ChatHeader } from "@/components/Chat/ChatHeader";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { faker } from "@faker-js/faker/locale/ar";
import dayjs from "@/lib/dayjs";

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
    image: "https://picsum.photos/400",
    online: true,
    lastSeen: dayjs.utc().subtract(1, "minute").toISOString(),
  },
};

export const Offline: StoryObj<Component> = {
  args: {
    id: 1,
    name: faker.person.firstName(),
    image: "https://picsum.photos/400",
    online: false,
    lastSeen: dayjs.utc().subtract(10, "minute").toISOString(),
  },
};

export default meta;
