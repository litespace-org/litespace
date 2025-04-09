import type { Meta, StoryObj } from "@storybook/react";
import { ChatHeader } from "@/components/Chat/ChatHeader";
import React from "react";
import { faker } from "@faker-js/faker/locale/ar";
import dayjs from "@/lib/dayjs";

type Component = typeof ChatHeader;

const meta: Meta<Component> = {
  component: ChatHeader,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[450px] md:w-[800px] lg:w-[1000px]">
        <Story />
      </div>
    ),
  ],
};

export const PrimaryOnline: StoryObj<Component> = {
  args: {
    id: 1,
    name: faker.person.fullName(),
    image: "https://picsum.photos/400",
    online: true,
    lastSeen: dayjs.utc().subtract(1, "minute").toISOString(),
  },
};

export const Offline: StoryObj<Component> = {
  args: {
    id: 1,
    name: faker.person.fullName(),
    image: "https://picsum.photos/400",
    online: false,
    lastSeen: dayjs.utc().subtract(10, "minute").toISOString(),
  },
};

export const PrimaryInSessionOnline: StoryObj<Component> = {
  args: {
    id: 1,
    inSession: true,
    name: faker.person.fullName(),
    image: "https://picsum.photos/400",
    online: true,
    lastSeen: dayjs.utc().subtract(1, "minute").toISOString(),
  },
};

export const InSessionOffline: StoryObj<Component> = {
  args: {
    id: 1,
    inSession: true,
    name: faker.person.fullName(),
    image: "https://picsum.photos/400",
    online: false,
    lastSeen: dayjs.utc().subtract(10, "minute").toISOString(),
  },
};

export default meta;
