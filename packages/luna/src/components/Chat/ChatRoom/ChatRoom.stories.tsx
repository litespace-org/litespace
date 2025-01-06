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
    optionsEnabled: true,
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

export const Online: StoryObj<Component> = {
  args: {
    userId: 1,
    optionsEnabled: true,
    togglePin: () => {},
    toggleMute: () => {},
    select: () => {},
    name: faker.person.fullName(),
    message: faker.lorem.words(5),
    isTyping: false,
    unreadCount: 0,
    image: "https://picsum.photos/700",
    owner: true,
    messageState: "sent",
    online: true,
  },
};

export const FirstMessage: StoryObj<Component> = {
  args: {
    userId: 1,
    optionsEnabled: false,
    togglePin: () => {},
    toggleMute: () => {},
    select: () => {},
    name: faker.person.fullName(),
    message: faker.lorem.words(5),
    isTyping: false,
    unreadCount: 0,
    image: "https://picsum.photos/700",
    owner: true,
    messageState: "sent",
    online: true,
  },
};

export const FirstMessageActive: StoryObj<Component> = {
  args: {
    userId: 1,
    optionsEnabled: false,
    togglePin: () => {},
    toggleMute: () => {},
    select: () => {},
    name: faker.person.fullName(),
    message: faker.lorem.words(5),
    isTyping: false,
    unreadCount: 0,
    image: "https://picsum.photos/700",
    owner: true,
    isActive: true,
    messageState: "sent",
    online: true,
  },
};

export const Active: StoryObj<Component> = {
  args: {
    userId: 1,
    togglePin: () => {},
    optionsEnabled: true,
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
    optionsEnabled: true,
    name: faker.person.fullName(),
    message: faker.lorem.words(5),
    isTyping: true,
    isActive: true,
    unreadCount: 0,
    image: "https://picsum.photos/700",
  },
};

export const ActiveMuted: StoryObj<Component> = {
  args: {
    userId: 1,
    togglePin: () => {},
    toggleMute: () => {},
    select: () => {},
    optionsEnabled: true,
    name: faker.person.fullName(),
    message: faker.lorem.words(5),
    isTyping: true,
    isMuted: true,
    isActive: true,
    unreadCount: 0,
    image: "https://picsum.photos/700",
  },
};

export const Muted: StoryObj<Component> = {
  args: {
    userId: 1,
    togglePin: () => {},
    optionsEnabled: true,
    toggleMute: () => {},
    select: () => {},
    name: faker.person.fullName(),
    message: faker.lorem.words(5),
    isTyping: true,
    isActive: false,
    isMuted: true,
    unreadCount: 0,
    image: "https://picsum.photos/700",
  },
};

export const Typing: StoryObj<Component> = {
  args: {
    userId: 1,
    togglePin: () => {},
    optionsEnabled: true,
    toggleMute: () => {},
    select: () => {},
    name: faker.person.fullName(),
    message: faker.lorem.words(5),
    isTyping: true,
    isActive: false,
    unreadCount: 0,
    image: "https://picsum.photos/700",
  },
};

export const UnreadMessages: StoryObj<Component> = {
  args: {
    userId: 1,
    togglePin: () => {},
    optionsEnabled: true,
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

export const Sent: StoryObj<Component> = {
  args: {
    userId: 1,
    togglePin: () => {},
    optionsEnabled: true,
    toggleMute: () => {},
    select: () => {},
    name: faker.person.fullName(),
    message: faker.lorem.words(5),
    isTyping: false,
    unreadCount: 0,
    image: "https://picsum.photos/700",
    owner: true,
    messageState: "sent",
  },
};

export const Reached: StoryObj<Component> = {
  args: {
    userId: 1,
    optionsEnabled: true,
    togglePin: () => {},
    toggleMute: () => {},
    select: () => {},
    name: faker.person.fullName(),
    message: faker.lorem.words(5),
    isTyping: false,
    unreadCount: 0,
    image: "https://picsum.photos/700",
    owner: true,
    messageState: "reached",
  },
};

export const Seen: StoryObj<Component> = {
  args: {
    userId: 1,
    owner: true,
    optionsEnabled: true,
    messageState: "seen",
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

export const LongMessages1: StoryObj<Component> = {
  args: {
    userId: 1,
    optionsEnabled: true,
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
    optionsEnabled: true,
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
