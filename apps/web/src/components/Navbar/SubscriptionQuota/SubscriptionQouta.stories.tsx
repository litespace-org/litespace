import { Meta, StoryObj } from "@storybook/react";
import SubscriptionQouta from "@/components/Navbar/SubscriptionQuota/SubscriptionQouta";

const meta: Meta<typeof SubscriptionQouta> = {
  title: "Navbar/SubscriptionQuota",
  component: SubscriptionQouta,
};

export default meta;

type Story = StoryObj<typeof SubscriptionQouta>;

export const Primary: Story = {
  args: {
    weeklyMinutes: 100,
    remainingMinutes: 5,
  },
};

export const LargeQuote: Story = {
  args: {
    weeklyMinutes: 1000,
    remainingMinutes: 100,
  },
};
