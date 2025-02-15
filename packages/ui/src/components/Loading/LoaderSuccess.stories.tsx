import type { Meta, StoryObj } from "@storybook/react";
import { LoaderSuccess } from "@/components/Loading/LoaderSuccess";
import React from "react";
import { Direction } from "@/components/Direction";
import { faker } from "@faker-js/faker/locale/ar";

type Component = typeof LoaderSuccess;

const meta: Meta<Component> = {
  title: "LoaderSuccess",
  component: LoaderSuccess,
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
    text: faker.lorem.words(8),
    action: {
      label: faker.lorem.words(2),
      onClick: () => alert("action"),
    },
  },
};

export default meta;
