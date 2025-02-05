import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/Button";
import ar from "@/locales/ar-eg.json";
import React from "react";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";

type Component = typeof Button;

const meta: Meta<Component> = {
  component: Button,
  parameters: { layout: "centered" },
  argTypes: {
    children: { control: "text" },
  },
  decorators: [DarkStoryWrapper],
};

export const LoadingOverHiddenText: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "main",
    size: "tiny",
    loading: true,
  },
  render(props: object & { children: React.ReactNode }) {
    return (
      <div>
        <Button {...props}>{props.children}</Button>
      </div>
    );
  },
};

export const MainPrimaryTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "main",
    variant: "primary",
    size: "tiny",
  },
};
export const MainPrimarySmall: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "main",
    variant: "primary",
    size: "small",
  },
};
export const MainPrimaryLarge: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "main",
    variant: "primary",
    size: "large",
  },
};

export const MainSecondaryTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "main",
    variant: "secondary",
    size: "tiny",
  },
};
export const MainSecondarySmall: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "main",
    variant: "secondary",
    size: "small",
  },
};
export const MainSecondaryLarge: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "main",
    variant: "secondary",
    size: "large",
  },
};

export const MainTertiaryTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "main",
    variant: "tertiary",
    size: "tiny",
  },
};
export const MainTertiarySmall: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "main",
    variant: "tertiary",
    size: "small",
  },
};
export const MainTertiaryLarge: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "main",
    variant: "tertiary",
    size: "large",
  },
};

export const WarningPrimaryTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "warning",
    variant: "primary",
    size: "tiny",
  },
};
export const WarningPrimarySmall: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "warning",
    variant: "primary",
    size: "small",
  },
};
export const WarningPrimaryLarge: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "warning",
    variant: "primary",
    size: "large",
  },
};

export const WarningSecondaryTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "warning",
    variant: "secondary",
    size: "tiny",
  },
};
export const WarningSecondarySmall: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "warning",
    variant: "secondary",
    size: "small",
  },
};
export const WarningSecondaryLarge: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "warning",
    variant: "secondary",
    size: "large",
  },
};

export const WarningTertiaryTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "warning",
    variant: "tertiary",
    size: "tiny",
  },
};
export const WarningTertiarySmall: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "warning",
    variant: "tertiary",
    size: "small",
  },
};
export const WarningTertiaryLarge: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "warning",
    variant: "tertiary",
    size: "large",
  },
};

export const SuccessPrimaryTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "success",
    variant: "primary",
    size: "tiny",
  },
};
export const SuccessPrimarySmall: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "success",
    variant: "primary",
    size: "small",
  },
};
export const SuccessPrimaryLarge: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "success",
    variant: "primary",
    size: "large",
  },
};

export const SuccessSecondaryTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "success",
    variant: "secondary",
    size: "tiny",
  },
};
export const SuccessSecondarySmall: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "success",
    variant: "secondary",
    size: "small",
  },
};
export const SuccessSecondaryLarge: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "success",
    variant: "secondary",
    size: "large",
  },
};

export const SuccessTertiaryTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "success",
    variant: "tertiary",
    size: "tiny",
  },
};
export const SuccessTertiarySmall: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "success",
    variant: "tertiary",
    size: "small",
  },
};
export const SuccessTertiaryLarge: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "success",
    variant: "tertiary",
    size: "large",
  },
};

export const ErrorPrimaryTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "error",
    variant: "primary",
    size: "tiny",
  },
};
export const ErrorPrimarySmall: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "error",
    variant: "primary",
    size: "small",
  },
};
export const ErrorPrimaryLarge: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "error",
    variant: "primary",
    size: "large",
  },
};

export const ErrorSecondaryTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "error",
    variant: "secondary",
    size: "tiny",
  },
};
export const ErrorSecondarySmall: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "error",
    variant: "secondary",
    size: "small",
  },
};
export const ErrorSecondaryLarge: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "error",
    variant: "secondary",
    size: "large",
  },
};

export const ErrorTertiaryTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "error",
    variant: "tertiary",
    size: "tiny",
  },
};
export const ErrorTertiarySmall: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "error",
    variant: "tertiary",
    size: "small",
  },
};
export const ErrorTertiaryLarge: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "error",
    variant: "tertiary",
    size: "large",
  },
};

export const DisabledMainPrimary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "main",
    variant: "primary",
    size: "tiny",
    disabled: true,
  },
};

export const DisabledMainSecondary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "main",
    variant: "secondary",
    size: "tiny",
    disabled: true,
  },
};

export const DisabledMainTertiary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "main",
    variant: "tertiary",
    size: "tiny",
    disabled: true,
  },
};

export const DisabledSuccessPrimary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "success",
    variant: "primary",
    size: "tiny",
    disabled: true,
  },
};

export const DisabledSuccessSecondary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "success",
    variant: "secondary",
    size: "tiny",
    disabled: true,
  },
};

export const DisabledSuccessTertiary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "success",
    variant: "tertiary",
    size: "tiny",
    disabled: true,
  },
};

export const DisabledWarningPrimary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "warning",
    variant: "primary",
    size: "tiny",
    disabled: true,
  },
};

export const DisabledWarningSecondary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "warning",
    variant: "secondary",
    size: "tiny",
    disabled: true,
  },
};

export const DisabledWarningTertiary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "warning",
    variant: "tertiary",
    size: "tiny",
    disabled: true,
  },
};

export const DisabledErrorPrimary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "error",
    variant: "primary",
    size: "tiny",
    disabled: true,
  },
};

export const DisabledErrorSecondary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "error",
    variant: "secondary",
    size: "tiny",
    disabled: true,
  },
};

export const DisabledErrorTertiary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "error",
    variant: "tertiary",
    size: "tiny",
    disabled: true,
  },
};

export const LoadingMainPrimary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "main",
    variant: "primary",
    size: "tiny",
    loading: true,
  },
};

export const LoadingMainSecondary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "main",
    variant: "secondary",
    size: "tiny",
    loading: true,
  },
};

export const LoadingMainTertiary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "main",
    variant: "tertiary",
    size: "tiny",
    loading: true,
  },
};

export const LoadingSuccessPrimary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "success",
    variant: "primary",
    size: "tiny",
    loading: true,
  },
};

export const LoadingSuccessSecondary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "success",
    variant: "secondary",
    size: "tiny",
    loading: true,
  },
};

export const LoadingSuccessTertiary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "success",
    variant: "tertiary",
    size: "tiny",
    loading: true,
  },
};

export const LoadingWarningPrimary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "warning",
    variant: "primary",
    size: "tiny",
    loading: true,
  },
};

export const LoadingWarningSecondary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "warning",
    variant: "secondary",
    size: "tiny",
    loading: true,
  },
};

export const LoadingWarningTertiary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "warning",
    variant: "tertiary",
    size: "tiny",
    loading: true,
  },
};

export const LoadingErrorPrimary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "error",
    variant: "primary",
    size: "tiny",
    loading: true,
  },
};

export const LoadingErrorSecondary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "error",
    variant: "secondary",
    size: "tiny",
    loading: true,
  },
};

export const LoadingErrorTertiary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: "error",
    variant: "tertiary",
    size: "tiny",
    loading: true,
  },
};
export default meta;
