import type { Meta, StoryObj } from "@storybook/react";
import { Typography } from "@/components/Typography";
import React from "react";
import { faker } from "@faker-js/faker/locale/ar";

type Component = typeof Typography;

const meta: Meta<Component> = {
  title: "Typography",
  component: Typography,
  parameters: {
    layout: "centered",
  },
};

export const Primary: StoryObj<Component> = {
  args: {},
  render() {
    return (
      <div>
        <Typography element="h1">{faker.lorem.words()}</Typography>
        <Typography element="h1" weight="bold">
          {faker.lorem.words()}
        </Typography>
        <Typography element="h1" weight="semibold">
          {faker.lorem.words()}
        </Typography>
        <Typography element="h1" weight="medium">
          {faker.lorem.words()}
        </Typography>
        <Typography element="h2">{faker.lorem.words()}</Typography>
        <Typography element="h2">{faker.lorem.words()}</Typography>
        <Typography element="h3">{faker.lorem.words()}</Typography>
        <Typography element="h4">{faker.lorem.words()}</Typography>
        <Typography element="subtitle-1">{faker.lorem.words()}</Typography>
        <Typography element="subtitle-2">{faker.lorem.words()}</Typography>
        <Typography element="body">{faker.lorem.words()}</Typography>
        <Typography element="caption">{faker.lorem.words()}</Typography>
        <br />
        <Typography element="tiny-text">{faker.lorem.words()}</Typography>
      </div>
    );
  },
};

export const WithMediaQuery: StoryObj<Component> = {
  args: {},
  render() {
    return (
      <div>
        <Typography
          element={{
            default: "h1",
            sm: "caption",
            md: "body",
            lg: "h3",
            xl: "h2",
          }}
        >
          {faker.lorem.words()}
        </Typography>
      </div>
    );
  },
};

export default meta;
