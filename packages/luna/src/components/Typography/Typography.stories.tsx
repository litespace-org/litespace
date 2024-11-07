import type { Meta, StoryObj } from "@storybook/react";
import { Title } from "@/components/Typography";
import React from "react";
import ar from "@/locales/ar-eg.json";

type Component = typeof Title;

const meta: Meta<Component> = {
  title: "Title",
  component: Title,
  parameters: {
    layout: "centered",
  },
};

export const Primary: StoryObj<Component> = {
  args: {},
  render() {
    return (
      <div>
        <Title element="h1">{ar["notice.desc.1"]}</Title>
        <Title element="h1" weight="bold">
          {ar["notice.desc.1"]}
        </Title>
        <Title element="h1" weight="semibold">
          {ar["notice.desc.1"]}
        </Title>
        <Title element="h1" weight="medium">
          {ar["notice.desc.1"]}
        </Title>
        <Title element="h2">{ar["notice.desc.1"]}</Title>
        <Title element="h2">{ar["notice.desc.1"]}</Title>
        <Title element="h3">{ar["notice.desc.1"]}</Title>
        <Title element="h4">{ar["notice.desc.1"]}</Title>
        <Title element="subtitle-1">{ar["notice.desc.1"]}</Title>
        <Title element="subtitle-2">{ar["notice.desc.1"]}</Title>
        <Title element="body">{ar["notice.desc.1"]}</Title>
        <Title element="caption">{ar["notice.desc.1"]}</Title>
        <br />
        <Title element="tiny-text">{ar["notice.desc.1"]}</Title>
      </div>
    );
  },
};

export default meta;
