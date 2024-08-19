import type { Meta, StoryObj } from "@storybook/react";
import { Dialog } from "@/components/Dialog";
import { Direction } from "@/components/Direction";
import ar from "@/locales/ar-eg.json";
import { Button } from "@/components/Button";

const meta: Meta<typeof Dialog> = {
  title: "Dialog",
  component: Dialog,
  decorators: [
    (Story: React.FC) => (
      <Direction>
        <div className="font-cairo text-foreground bg-dash-sidebar w-full min-h-screen px-10 py-10">
          <Story />
        </div>
      </Direction>
    ),
  ],
};

export const Primary: StoryObj<typeof Dialog> = {
  args: {
    trigger: (
      <div className="w-20">
        <Button> {ar["global.labels.edit"]} </Button>{" "}
      </div>
    ),
    children: (
      <div className="text-foreground-light">
        {ar["error.tutor.bio.arabic.only"]}
      </div>
    ),
    title: ar["error.update.data"],
  },
};

export default meta;
