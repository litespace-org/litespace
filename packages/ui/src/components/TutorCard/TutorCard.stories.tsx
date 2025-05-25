import React from "react";
import { StoryObj, Meta } from "@storybook/react";
import { TutorCard } from "@/components/TutorCard";
import { faker } from "@faker-js/faker/locale/ar";

const meta: Meta<typeof TutorCard> = {
  title: "TutorCard",
  component: TutorCard,
  decorators: [
    (Story) => (
      <div className="w-[276px]">
        <Story />
      </div>
    ),
  ],
};

type Story = StoryObj<typeof TutorCard>;

export const Primary: Story = {
  args: {
    action: {
      label: faker.lorem.words(2),
      onClick: () => alert("book now"),
    },
    id: 1,
    bio: faker.lorem.words(5),
    name: faker.lorem.words(2),
    rating: 5,
    image: faker.image.urlPicsumPhotos(),
  },
};

export const NoRatings: Story = {
  args: {
    action: {
      label: faker.lorem.words(2),
      onClick: () => alert("book now"),
    },
    id: 1,
    bio: faker.lorem.words(5),
    name: faker.lorem.words(2),
    image: faker.image.urlPicsumPhotos(),
  },
};

export const Free: Story = {
  args: {
    free: true,
    action: {
      label: faker.lorem.words(2),
      onClick: () => alert("book now"),
    },
    id: 1,
    bio: faker.lorem.words(5),
    name: faker.lorem.words(2),
    image: faker.image.urlPicsumPhotos(),
  },
};

export const LongBio: Story = {
  args: {
    action: {
      label: faker.lorem.words(2),
      onClick: () => alert("book now"),
    },
    id: 1,
    bio: faker.lorem.words(40),
    name: faker.lorem.words(2),
    rating: 5,
    image: faker.image.urlPicsumPhotos(),
  },
};

export default meta;
