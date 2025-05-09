import type { Meta, StoryObj } from "@storybook/react";
import { EditMessage } from "@/components/Chat/EditMessage";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { faker } from "@faker-js/faker/locale/ar";
import React from "react";

type Component = typeof EditMessage;

const meta: Meta<Component> = {
  title: "EditMessage",
  component: EditMessage,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => {
      return <Story />;
    },
    DarkStoryWrapper,
  ],
};

export const Primary: StoryObj<Component> = {
  args: {
    open: true,
    message: { text: faker.lorem.words(10), id: 1 },
    onUpdateMessage: () => {},
  },
};

export default meta;
