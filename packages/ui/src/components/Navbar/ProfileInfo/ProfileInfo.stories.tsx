import { Meta, StoryObj } from "@storybook/react";
import ProfileInfo from "@/components/Navbar/ProfileInfo/ProfileInfo";
import { faker } from "@faker-js/faker/locale/ar";

const meta: Meta<typeof ProfileInfo> = {
  title: "Navbar/ProfileInfo",
  component: ProfileInfo,
};

export default meta;

type Story = StoryObj<typeof ProfileInfo>;

const url = "https://picsum.photos/400";

export const Primary: Story = {
  args: {
    id: 1,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    imageUrl: url,
  },
};

export const WithoutNameAndImage: Story = {
  args: {
    id: 1,
    name: null,
    email: faker.internet.email(),
    imageUrl: null,
  },
};
