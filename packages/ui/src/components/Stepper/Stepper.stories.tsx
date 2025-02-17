import type { Meta, StoryObj } from "@storybook/react";
import { Stepper } from "@/components/Stepper";
import { Direction } from "@/components/Direction";
import React from "react";
import { faker } from "@faker-js/faker/locale/ar";

type Component = typeof Stepper;

const meta: Meta<Component> = {
  title: "Stepper",
  component: Stepper,
  parameters: { layout: "centered" },
  decorators: [
    (Story: React.FC) => (
      <Direction>
        <div className="tw-w-[900px] tw-h-[900px] tw-flex tw-items-center tw-justify-center tw-bg-dash-sidebar tw-text-foreground tw-font-cairo">
          <div className="tw-max-w-[600px]">
            <Story />
          </div>
        </div>
      </Direction>
    ),
  ],
};

export const Primary: StoryObj<Component> = {
  args: {
    steps: [
      { label: faker.lorem.words(2), value: 1 },
      { label: faker.lorem.words(4), value: 2 },
      { label: faker.lorem.words(4), value: 3 },
    ],
    value: 2,
  },
};

export default meta;
