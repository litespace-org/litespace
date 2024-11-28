import type { Meta, StoryObj } from "@storybook/react";
import { ChatBubble, ChatBubbleVariant } from "@/components/Chat/ChatBubble";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { faker } from "@faker-js/faker/locale/ar";
import React from "react";

type Component = typeof ChatBubble;

const meta: Meta<Component> = {
  component: ChatBubble,
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
    text: faker.lorem.words(10),
    variant: ChatBubbleVariant.CurrentUser,
  },
};

export const PrimaryLong: StoryObj<Component> = {
  args: {
    text: faker.lorem.words(40),
    variant: ChatBubbleVariant.CurrentUser,
  },
};

export const PrimaryOtherUser: StoryObj<Component> = {
  args: {
    text: faker.lorem.words(10),
    variant: ChatBubbleVariant.OtherUser,
  },
};

export const PrimaryOtherUserLong: StoryObj<Component> = {
  args: {
    text: faker.lorem.words(40),
    variant: ChatBubbleVariant.OtherUser,
  },
};

export default meta;
