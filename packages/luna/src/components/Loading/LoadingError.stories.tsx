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
          <div className="tw-bg-background-200 tw-w-[30rem] tw-h-[30rem] tw-px-12 tw-flex tw-items-center tw-justify-center tw-shadow-xl tw-md">
            <Story />
          </div>
        </Direction>
      );
    },
  ],
};

export const Primary: StoryObj<Component> = {
  args: {
    error: faker.lorem.words(10),
    retry: () => {},
  },
};

export default meta;
