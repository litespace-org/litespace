import { StoryObj, Meta } from "@storybook/react";
import { IframeDialog } from "@/components/IframeDialog/IframeDialog";
import React from "react";

type Component = typeof IframeDialog;
type Story = StoryObj<Component>;

const meta: Meta<Component> = {
  title: "IframeDialog",
  component: IframeDialog,
  decorators: [
    (Story) => (
      <div>
        <Story />
      </div>
    ),
  ],
};

export const Primary: Story = {
  args: {
    open: true,
    url: "https://atfawry.fawrystaging.com/atfawry/plugin/card-token?accNo=770000020774&customerProfileId=4&returnUrl=https%3A%2F%2Fapp.staging.litespace.org%2Fsubscription&locale=ar",
    onOpenChange(open) {
      console.log({ open });
    },
  },
};

export default meta;
