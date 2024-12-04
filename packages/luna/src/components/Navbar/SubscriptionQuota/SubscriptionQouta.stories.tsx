import { Meta, StoryObj } from "@storybook/react";
import SubscriptionQouta from "@/components/Navbar/SubscriptionQuota/SubscriptionQouta";

const meta: Meta<typeof SubscriptionQouta> = {
  title: "Navbar/SubscriptionQuota",
  component: SubscriptionQouta,
};

export default meta;

type Story = StoryObj<typeof SubscriptionQouta>;

export const Default: Story = {
  args: {
    progress: 80,
    rest: 4,
  },
};
