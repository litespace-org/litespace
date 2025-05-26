import React from "react";
import { StoryObj, Meta } from "@storybook/react";
import { TutorCard } from "@/components/Tutors/TutorCard";
import { faker } from "@faker-js/faker/locale/ar";

const meta: Meta<typeof TutorCard> = {
  title: "TutorCard",
  component: TutorCard,
  decorators: [
    (Story): React.JSX.Element => (
      <div className="p-4">
        <div className="w-[276px]">
          <Story />
        </div>
      </div>
    ),
  ],
};

type Story = StoryObj<typeof TutorCard>;

export const Primary: Story = {
  args: {
    id: 1,
    bio: faker.lorem.words(5),
    name: faker.lorem.words(2),
    rating: 5,
    image: faker.image.urlPicsumPhotos(),
  },
};

export const NoRating: Story = {
  args: {
    id: 1,
    bio: faker.lorem.words(5),
    name: faker.lorem.words(2),
    image: faker.image.urlPicsumPhotos(),
  },
};

export const FractionalRating: Story = {
  args: {
    id: 1,
    bio: faker.lorem.words(5),
    name: faker.lorem.words(2),
    image: faker.image.urlPicsumPhotos(),
    rating: 3.988732,
  },
};

export const Free: Story = {
  args: {
    free: true,
    id: 1,
    bio: faker.lorem.words(5),
    name: faker.lorem.words(2),
    image: faker.image.urlPicsumPhotos(),
  },
};

export const LongBio: Story = {
  args: {
    id: 1,
    bio: faker.lorem.words(40),
    name: faker.lorem.words(2),
    rating: 5,
    image: faker.image.urlPicsumPhotos(),
  },
};

export const NoBio: Story = {
  args: {
    id: 1,
    bio: null,
    name: faker.lorem.words(2),
    rating: 5,
    image: faker.image.urlPicsumPhotos(),
  },
};

export default meta;
