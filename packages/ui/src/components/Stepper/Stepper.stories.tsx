import type { Meta, StoryObj } from "@storybook/react";
import { Stepper } from "@/components/Stepper";
import { Direction } from "@/components/Direction";
import ar from "@/locales/ar-eg.json";
import React from "react";

type Component = typeof Stepper;

const meta: Meta<Component> = {
  title: "Stepper",
  component: Stepper,
  parameters: { layout: "centered" },
  decorators: [
    (Story: React.FC) => (
      <Direction>
        <div className="w-[900px] h-[900px] flex items-center justify-center bg-dash-sidebar text-foreground font-cairo">
          <div className="max-w-[600px]">
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
      { label: ar["page.tutor.onboarding.steps.first"], value: 1 },
      { label: ar["page.tutor.onboarding.steps.second"], value: 2 },
      { label: ar["page.tutor.onboarding.steps.third"], value: 3 },
    ],
    value: 2,
  },
};

export default meta;
