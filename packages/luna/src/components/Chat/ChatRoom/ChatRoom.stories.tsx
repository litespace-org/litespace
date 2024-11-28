import type { Meta, StoryObj } from "@storybook/react";
import { ChatRoom } from "@/components/Chat/ChatRoom";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { faker } from "@faker-js/faker/locale/ar";
import React from "react";

type Component = typeof ChatRoom;

const meta: Meta<Component> = {
  component: ChatRoom,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => {
      return (
        <div className="tw-max-w-[352px]">
          <Story />
        </div>
      );
    },
    DarkStoryWrapper,
  ],
};

export const Primary: StoryObj<Component> = {
  args: {
    userId: 1,
    togglePin: () => {},
    toggleMute: () => {},
    select: () => {},
    name: faker.person.fullName(),
    message: faker.lorem.words(5),
    isTyping: false,
    unreadCount: 0,
    image: "https://picsum.photos/700",
  },
};

export const Active: StoryObj<Component> = {
  args: {
    userId: 1,
    togglePin: () => {},
    toggleMute: () => {},
    select: () => {},
    name: faker.person.fullName(),
    message: faker.lorem.words(5),
    isTyping: false,
    isActive: true,
    unreadCount: 0,
    image: "https://picsum.photos/700",
  },
};

export const ActiveTyping: StoryObj<Component> = {
  args: {
    userId: 1,
    togglePin: () => {},
    toggleMute: () => {},
    select: () => {},
    name: faker.person.fullName(),
    message: faker.lorem.words(5),
    isTyping: true,
    isActive: true,
    unreadCount: 0,
    image: "https://picsum.photos/700",
  },
};

export const UnreadMessages: StoryObj<Component> = {
  args: {
    userId: 1,
    togglePin: () => {},
    toggleMute: () => {},
    select: () => {},
    name: faker.person.fullName(),
    message: faker.lorem.words(5),
    isTyping: false,
    isActive: false,
    unreadCount: 20,
    image: "https://picsum.photos/700",
  },
};

export const LongMessages1: StoryObj<Component> = {
  args: {
    userId: 1,
    togglePin: () => {},
    toggleMute: () => {},
    select: () => {},
    name: faker.person.fullName(),
    message: faker.lorem.words(20),
    isTyping: false,
    isActive: false,
    unreadCount: 20,
    image: "https://picsum.photos/700",
  },
};

export const LongMessages2: StoryObj<Component> = {
  args: {
    userId: 1,
    togglePin: () => {},
    toggleMute: () => {},
    select: () => {},
    name: faker.person.fullName(),
    message: faker.lorem.words(20),
    isTyping: false,
    isActive: false,
    unreadCount: 0,
    image: "https://picsum.photos/700",
  },
};

export default meta;
