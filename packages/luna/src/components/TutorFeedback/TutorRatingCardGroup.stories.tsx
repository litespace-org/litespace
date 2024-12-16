import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { TutorRatingCardGroup } from "@/components/TutorFeedback";
import { TutorRatingCardGroupProps } from "@/components/TutorFeedback/types";
import { faker } from "@faker-js/faker/locale/ar";
import { range } from "lodash";

type Story = StoryObj<TutorRatingCardGroupProps>;
const meta: Meta<TutorRatingCardGroupProps> = {
  title: "TutorFeedback/TutorRatingCardGroup",
  component: TutorRatingCardGroup,
  decorators: [
    (Story) => (
      <div className="tw-w-64">
        <Story />
      </div>
    ),
  ],
};

function makeRating() {
  return {
    name: faker.person.fullName(),
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    userId: faker.number.int(),
  };
}

export const OneRating: Story = {
  args: {
    ratings: range(1).map(() => makeRating()),
    value: 3,
  },
};

export const TwoRatings: Story = {
  args: {
    ratings: range(2).map(() => makeRating()),
    value: 3,
  },
};

export const ThreeRatings: Story = {
  args: {
    ratings: range(3).map(() => makeRating()),
    value: 3,
  },
};

export const FourRatings: Story = {
  args: {
    ratings: range(4).map(() => makeRating()),
    value: 3,
  },
};

export const FiveRatings: Story = {
  args: {
    ratings: range(5).map(() => makeRating()),
    value: 3,
  },
};

export const SevenRatings: Story = {
  args: {
    ratings: range(7).map(() => makeRating()),
    value: 3,
  },
};

export default meta;
