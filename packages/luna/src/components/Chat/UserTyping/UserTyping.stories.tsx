import type { Meta, StoryObj } from "@storybook/react";
import { UserTyping } from "@/components/Chat/UserTyping";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { faker } from "@faker-js/faker/locale/ar";
import { IUser } from "@litespace/types";
import { useEffect, useState } from "react";
import React from "react";

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
  render(props) {
    const [seed, setSeed] = useState(1);

    useEffect(() => {
      const interval = setInterval(() => {
        setSeed(seed + 1);
      }, faker.number.int({ min: 1, max: 3 }) * 1000);

      return () => {
        clearInterval(interval);
      };
    }, [seed]);

    return <UserTyping {...props} seed={seed} />;
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
