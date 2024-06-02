import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "@/components/Avatar";
import text from "@/data/text.json";

const meta: Meta<typeof Avatar> = {
  title: "Avatar",
  component: Avatar,
  argTypes: {
    src: { control: "text" },
    alt: { control: "text" },
    fallback: { control: "text" },
  },
  parameters: {
    layout: "centered",
  },
};

export const ImageBased: StoryObj<typeof Avatar> = {
  args: {
    src: "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/d4/d423168c5c9344a46468f5ef41ac1a2aa923dc08_full.jpg",
    alt: "My Avtar",
  },
};

export const TextBased: StoryObj<typeof Avatar> = {
  args: {
    fallback: text["stories.avatar.text"],
  },
};

export default meta;
