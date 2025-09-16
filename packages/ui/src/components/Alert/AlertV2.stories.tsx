import { Meta, StoryObj } from "@storybook/react";
import { AlertType, AlertV2 } from "@/components/Alert";
import { faker } from "@faker-js/faker/locale/ar";
import React from "react";
import Close from "@litespace/assets/Close";
import { Button } from "@/components/Button";

const meta: Meta<typeof AlertV2> = {
  title: "AlertV2",
  component: AlertV2,
  args: {
    title: faker.lorem.words(6),
  },
};

type Story = StoryObj<typeof AlertV2>;

export const WithoutAction: Story = {
  args: {
    type: AlertType.Info,
  },
};

export const Info: Story = {
  args: {
    type: AlertType.Info,
    action: <Close className="icon w-4 h-4" />,
  },
};

export const WithIconAction: Story = {
  args: {
    type: AlertType.Info,
    action: <Close className="icon w-4 h-4" />,
  },
};

export const WithButtonAction: Story = {
  args: {
    type: AlertType.Info,
    action: (
      <Button variant="primary" type="natural">
        {faker.lorem.words(1)}
      </Button>
    ),
  },
};
export default meta;
