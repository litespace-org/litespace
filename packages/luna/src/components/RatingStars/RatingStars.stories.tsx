import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { RatingStars } from "@/components/RatingStars/RatingStars";

type Story = StoryObj<typeof RatingStars>;
const meta: Meta<typeof RatingStars> = {
  title: "RatingStars",
  component: RatingStars,
  decorators: [
    (Story) => (
      <div>
        <Story />
      </div>
    ),
  ],
};

export const Small: Story = {
  args: {
    rating: 3,
    readonly: true,
  },
};

export const Medium: Story = {
  args: {
    rating: 3,
    variant: "md",
    readonly: true,
  },
};

export const Large: Story = {
  args: {
    rating: 3,
    variant: "lg",
    readonly: true,
  },
};

export const Active: Story = {
  args: {
    rating: 0,
    variant: "lg",
    readonly: false,
  },
};

export default meta;
