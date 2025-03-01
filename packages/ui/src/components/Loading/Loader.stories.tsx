import type { Meta, StoryObj } from "@storybook/react";
import { Loader } from "@/components/Loading/Loader";
import React from "react";
import { Direction } from "@/components/Direction";
import { faker } from "@faker-js/faker/locale/ar";

type Component = typeof Loader;

const meta: Meta<Component> = {
  title: "Loader",
  component: Loader,
  parameters: { layout: "centered" },
  decorators: [
    (Story: React.FC) => {
      return (
        <Direction>
          <div className="bg-background-200 w-[30rem] h-[30rem] px-12 flex items-center justify-center shadow-xl md">
            <Story />
          </div>
        </Direction>
      );
    },
  ],
};

export const Small: StoryObj<Component> = {
  args: {
    size: "small",
  },
};

export const Medium: StoryObj<Component> = {
  args: {
    size: "medium",
  },
};

export const Large: StoryObj<Component> = {
  args: {
    size: "large",
  },
};

export const SmallWithText: StoryObj<Component> = {
  args: {
    text: faker.lorem.words(10),
    size: "small",
  },
};

export const MediumWithText: StoryObj<Component> = {
  args: {
    text: faker.lorem.words(10),
    size: "medium",
  },
};

export const LargeWithText: StoryObj<Component> = {
  args: {
    text: faker.lorem.words(10),
    size: "large",
  },
};

export default meta;
