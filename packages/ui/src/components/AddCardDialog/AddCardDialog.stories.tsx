import { StoryObj, Meta } from "@storybook/react";
import { AddCardDialog } from "@/components/AddCardDialog/AddCardDialog";
import React from "react";

type Component = typeof AddCardDialog;
type Story = StoryObj<Component>;

const meta: Meta<Component> = {
  title: "AddCardDialog",
  component: AddCardDialog,
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
    addCardUrl:
      "https://atfawry.fawrystaging.com/atfawry/plugin/card-token?accNo=770000020774&customerProfileId=4&returnUrl=https%3A%2F%2Fapp.staging.litespace.org%2Fsubscription&locale=ar",
    onOpenChange(open) {
      console.log({ open });
    },
  },
};

export default meta;
