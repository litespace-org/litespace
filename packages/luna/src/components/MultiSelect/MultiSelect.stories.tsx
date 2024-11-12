import type { Meta, StoryObj } from "@storybook/react";
import { MultiSelect } from "@/components/MultiSelect";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import ar from "@/locales/ar-eg.json";

type Component = typeof MultiSelect;

const meta: Meta<Component> = {
  title: "MultiSelect",
  component: MultiSelect,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const Primary: StoryObj<Component> = {
  args: {
    label: ar["global.days.sun"],
    placeholder: "الووو",
    maxSelection: 3,
    options: [
      { label: "Mostafa Kamar", value: "Mostafa" },
      { label: "Ahmed Kamar", value: "Ahmed" },
      { label: "Khloud Kamar", value: "Khloud" },
      { label: "Kamar AbdelFattah", value: "Kamar" },
      { label: "Ghada Mohamed", value: "ghada" },
      { label: "Mostafa Kamar1", value: "Mostafa 2" },
      { label: "Ahmed Kamar3", value: "Ahmed 2" },
      { label: "Kamar AbdelFattah 2", value: "Kamar 2" },
      { label: "Ghada Mohamed 2", value: "ghada 2" },
    ],
  },
};

export const PrimaryFilled: StoryObj<Component> = {
  args: {
    label: ar["global.days.sun"],
    placeholder: "الووو",
    initialValues: ["Mostafa"],
    options: [
      { label: "Mostafa", value: "Mostafa" },
      { label: "Ahmed", value: "Ahmed" },
    ],
  },
};

export const PrimaryDisabled: StoryObj<Component> = {
  args: {
    label: ar["global.days.sun"],
    placeholder: "الووو",
    disabled: true,
    options: [
      { label: "Mostafa", value: "Mostafa" },
      { label: "Ahmed", value: "Ahmed" },
    ],
  },
};

export default meta;
