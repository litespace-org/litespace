import type { Meta, StoryObj } from "@storybook/react";
import { LoadingError } from "@/components/Loading/LoadingError";
import React from "react";
import { Direction } from "@/components/Direction";
import { faker } from "@faker-js/faker/locale/ar";

type Component = typeof LoadingError;

const meta: Meta<Component> = {
  title: "LoadingError",
  component: LoadingError,
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
    error: faker.lorem.words(10),
    retry: () => {},
    size: "small",
  },
};

export const Medium: StoryObj<Component> = {
  args: {
    error: faker.lorem.words(10),
    retry: () => {},
    size: "medium",
  },
};

export const Large: StoryObj<Component> = {
  args: {
    error: faker.lorem.words(10),
    retry: () => {},
    size: "large",
  },
};

export default meta;
