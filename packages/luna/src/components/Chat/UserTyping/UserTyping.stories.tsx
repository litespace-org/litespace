import type { Meta, StoryObj } from "@storybook/react";
import { UserTyping } from "@/components/Chat/UserTyping";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { faker } from "@faker-js/faker/locale/ar";
import { IUser } from "@litespace/types";

type Component = typeof UserTyping;

const meta: Meta<Component> = {
  component: UserTyping,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const Primary: StoryObj<Component> = {
  args: {
    id: faker.number.int(),
    name: faker.person.fullName({ sex: "male" }),
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    gender: null,
  },
};

export const Female: StoryObj<Component> = {
  args: {
    id: faker.number.int(),
    name: faker.person.fullName({ sex: "female" }),
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    gender: IUser.Gender.Female,
    offset: 1000,
  },
};

export default meta;
