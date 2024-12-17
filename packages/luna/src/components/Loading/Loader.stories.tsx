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
          <div className="tw-bg-background-200 tw-w-[30rem] tw-h-[30rem] tw-px-12 tw-flex tw-items-center tw-justify-center tw-shadow-xl tw-md">
            <Story />
          </div>
        </Direction>
      );
    },
  ],
};

export const SpinnerAlone: StoryObj<Component> = {};
export const WithText: StoryObj<Component> = {
  args: {
    text: faker.lorem.words(10),
  },
};

export const LargeLoader: StoryObj<Component> = {
  args: {
    text: faker.lorem.words(10),
    variant: "large",
  },
};
export const SmallLoader: StoryObj<Component> = {
  args: {
    text: faker.lorem.words(10),
    variant: "small",
  },
};

export default meta;
