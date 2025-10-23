import { TrialSessionCard } from "@/components/Card/TrialSessionCard/TrialSessionCard";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof TrialSessionCard> = {
  title: "Components/TrialSessionCard",
  component: TrialSessionCard,
  tags: ["autodocs"],
  argTypes: {
    onClick: { action: "clicked" },
  },
};

export default meta;
type Story = StoryObj<typeof TrialSessionCard>;

export const Default: Story = {};
