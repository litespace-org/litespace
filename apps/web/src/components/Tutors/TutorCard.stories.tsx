import React from "react";
import { StoryObj, Meta } from "@storybook/react";
import { TutorCard } from "@/components/Tutors/TutorCard";
import { faker } from "@faker-js/faker/locale/ar";
import { range } from "lodash";

const meta: Meta<typeof TutorCard> = {
  title: "TutorCard",
  component: TutorCard,
  decorators: [
    (Story): React.JSX.Element => (
      <div className="p-4">
        <div className="w-[373px]">
          <Story />
        </div>
      </div>
    ),
  ],
};

type Story = StoryObj<typeof TutorCard>;

export const Primary: Story = {
  args: {
    tutorId: 1,
    about: faker.lorem.words(145),
    name: faker.lorem.words(2),
    rating: 5,
    image: faker.image.urlPicsumPhotos(),
    free: true,
    topics: range(7).map((_) => faker.lorem.word()),
  },
};

export const NoRating: Story = {
  args: {
    tutorId: 1,
    about: faker.lorem.words(5),
    name: faker.lorem.words(2),
    image: faker.image.urlPicsumPhotos(),
  },
};

export const FractionalRating: Story = {
  args: {
    tutorId: 1,
    about: faker.lorem.words(5),
    name: faker.lorem.words(2),
    image: faker.image.urlPicsumPhotos(),
    rating: 3.988732,
  },
};

export const Free: Story = {
  args: {
    free: true,
    tutorId: 1,
    about: faker.lorem.words(5),
    name: faker.lorem.words(2),
    image: faker.image.urlPicsumPhotos(),
  },
};

export const Longabout: Story = {
  args: {
    tutorId: 1,
    about: faker.lorem.words(40),
    name: faker.lorem.words(2),
    rating: 5,
    image: faker.image.urlPicsumPhotos(),
  },
};

export const Noabout: Story = {
  args: {
    tutorId: 1,
    about: null,
    name: faker.lorem.words(2),
    rating: 5,
    image: faker.image.urlPicsumPhotos(),
  },
};

export default meta;
