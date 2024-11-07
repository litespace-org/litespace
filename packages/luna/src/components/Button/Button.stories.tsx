import type { Meta, StoryObj } from "@storybook/react";
import { Button, ButtonSize, ButtonType } from "@/components/Button";
import ar from "@/locales/ar-eg.json";
import React from "react";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { ButtonVariant } from "@/components/Button/types";

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
    type: ButtonType.Main,
    size: ButtonSize.Tiny,
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
    type: ButtonType.Main,
    variant: ButtonVariant.Primary,
    size: ButtonSize.Tiny,
  },
};
export const MainPrimarySmall: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Main,
    variant: ButtonVariant.Primary,
    size: ButtonSize.Small,
  },
};
export const MainPrimaryLarge: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Main,
    variant: ButtonVariant.Primary,
    size: ButtonSize.Large,
  },
};

export const MainSecondaryTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Main,
    variant: ButtonVariant.Secondary,
    size: ButtonSize.Tiny,
  },
};
export const MainSecondarySmall: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Main,
    variant: ButtonVariant.Secondary,
    size: ButtonSize.Small,
  },
};
export const MainSecondaryLarge: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Main,
    variant: ButtonVariant.Secondary,
    size: ButtonSize.Large,
  },
};

export const MainTertiaryTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Main,
    variant: ButtonVariant.Tertiary,
    size: ButtonSize.Tiny,
  },
};
export const MainTertiarySmall: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Main,
    variant: ButtonVariant.Tertiary,
    size: ButtonSize.Small,
  },
};
export const MainTertiaryLarge: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Main,
    variant: ButtonVariant.Tertiary,
    size: ButtonSize.Large,
  },
};

export const WarningPrimaryTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Warning,
    variant: ButtonVariant.Primary,
    size: ButtonSize.Tiny,
  },
};
export const WarningPrimarySmall: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Warning,
    variant: ButtonVariant.Primary,
    size: ButtonSize.Small,
  },
};
export const WarningPrimaryLarge: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Warning,
    variant: ButtonVariant.Primary,
    size: ButtonSize.Large,
  },
};

export const WarningSecondaryTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Warning,
    variant: ButtonVariant.Secondary,
    size: ButtonSize.Tiny,
  },
};
export const WarningSecondarySmall: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Warning,
    variant: ButtonVariant.Secondary,
    size: ButtonSize.Small,
  },
};
export const WarningSecondaryLarge: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Warning,
    variant: ButtonVariant.Secondary,
    size: ButtonSize.Large,
  },
};

export const WarningTertiaryTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Warning,
    variant: ButtonVariant.Tertiary,
    size: ButtonSize.Tiny,
  },
};
export const WarningTertiarySmall: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Warning,
    variant: ButtonVariant.Tertiary,
    size: ButtonSize.Small,
  },
};
export const WarningTertiaryLarge: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Warning,
    variant: ButtonVariant.Tertiary,
    size: ButtonSize.Large,
  },
};

export const SuccessPrimaryTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Success,
    variant: ButtonVariant.Primary,
    size: ButtonSize.Tiny,
  },
};
export const SuccessPrimarySmall: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Success,
    variant: ButtonVariant.Primary,
    size: ButtonSize.Small,
  },
};
export const SuccessPrimaryLarge: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Success,
    variant: ButtonVariant.Primary,
    size: ButtonSize.Large,
  },
};

export const SuccessSecondaryTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Success,
    variant: ButtonVariant.Secondary,
    size: ButtonSize.Tiny,
  },
};
export const SuccessSecondarySmall: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Success,
    variant: ButtonVariant.Secondary,
    size: ButtonSize.Small,
  },
};
export const SuccessSecondaryLarge: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Success,
    variant: ButtonVariant.Secondary,
    size: ButtonSize.Large,
  },
};

export const SuccessTertiaryTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Success,
    variant: ButtonVariant.Tertiary,
    size: ButtonSize.Tiny,
  },
};
export const SuccessTertiarySmall: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Success,
    variant: ButtonVariant.Tertiary,
    size: ButtonSize.Small,
  },
};
export const SuccessTertiaryLarge: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Success,
    variant: ButtonVariant.Tertiary,
    size: ButtonSize.Large,
  },
};

export const ErrorPrimaryTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Error,
    variant: ButtonVariant.Primary,
    size: ButtonSize.Tiny,
  },
};
export const ErrorPrimarySmall: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Error,
    variant: ButtonVariant.Primary,
    size: ButtonSize.Small,
  },
};
export const ErrorPrimaryLarge: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Error,
    variant: ButtonVariant.Primary,
    size: ButtonSize.Large,
  },
};

export const ErrorSecondaryTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Error,
    variant: ButtonVariant.Secondary,
    size: ButtonSize.Tiny,
  },
};
export const ErrorSecondarySmall: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Error,
    variant: ButtonVariant.Secondary,
    size: ButtonSize.Small,
  },
};
export const ErrorSecondaryLarge: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Error,
    variant: ButtonVariant.Secondary,
    size: ButtonSize.Large,
  },
};

export const ErrorTertiaryTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Error,
    variant: ButtonVariant.Tertiary,
    size: ButtonSize.Tiny,
  },
};
export const ErrorTertiarySmall: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Error,
    variant: ButtonVariant.Tertiary,
    size: ButtonSize.Small,
  },
};
export const ErrorTertiaryLarge: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Error,
    variant: ButtonVariant.Tertiary,
    size: ButtonSize.Large,
  },
};

export const DisabledMainPrimary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Main,
    variant: ButtonVariant.Primary,
    size: ButtonSize.Tiny,
    disabled: true,
  },
};

export const DisabledMainSecondary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Main,
    variant: ButtonVariant.Secondary,
    size: ButtonSize.Tiny,
    disabled: true,
  },
};

export const DisabledMainTertiary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Main,
    variant: ButtonVariant.Tertiary,
    size: ButtonSize.Tiny,
    disabled: true,
  },
};

export const DisabledSuccessPrimary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Success,
    variant: ButtonVariant.Primary,
    size: ButtonSize.Tiny,
    disabled: true,
  },
};

export const DisabledSuccessSecondary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Success,
    variant: ButtonVariant.Secondary,
    size: ButtonSize.Tiny,
    disabled: true,
  },
};

export const DisabledSuccessTertiary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Success,
    variant: ButtonVariant.Tertiary,
    size: ButtonSize.Tiny,
    disabled: true,
  },
};

export const DisabledWarningPrimary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Warning,
    variant: ButtonVariant.Primary,
    size: ButtonSize.Tiny,
    disabled: true,
  },
};

export const DisabledWarningSecondary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Warning,
    variant: ButtonVariant.Secondary,
    size: ButtonSize.Tiny,
    disabled: true,
  },
};

export const DisabledWarningTertiary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Warning,
    variant: ButtonVariant.Tertiary,
    size: ButtonSize.Tiny,
    disabled: true,
  },
};

export const DisabledErrorPrimary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Error,
    variant: ButtonVariant.Primary,
    size: ButtonSize.Tiny,
    disabled: true,
  },
};

export const DisabledErrorSecondary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Error,
    variant: ButtonVariant.Secondary,
    size: ButtonSize.Tiny,
    disabled: true,
  },
};

export const DisabledErrorTertiary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Error,
    variant: ButtonVariant.Tertiary,
    size: ButtonSize.Tiny,
    disabled: true,
  },
};

export const LoadingMainPrimary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Main,
    variant: ButtonVariant.Primary,
    size: ButtonSize.Tiny,
    loading: true,
  },
};

export const LoadingMainSecondary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Main,
    variant: ButtonVariant.Secondary,
    size: ButtonSize.Tiny,
    loading: true,
  },
};

export const LoadingMainTertiary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Main,
    variant: ButtonVariant.Tertiary,
    size: ButtonSize.Tiny,
    loading: true,
  },
};

export const LoadingSuccessPrimary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Success,
    variant: ButtonVariant.Primary,
    size: ButtonSize.Tiny,
    loading: true,
  },
};

export const LoadingSuccessSecondary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Success,
    variant: ButtonVariant.Secondary,
    size: ButtonSize.Tiny,
    loading: true,
  },
};

export const LoadingSuccessTertiary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Success,
    variant: ButtonVariant.Tertiary,
    size: ButtonSize.Tiny,
    loading: true,
  },
};

export const LoadingWarningPrimary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Warning,
    variant: ButtonVariant.Primary,
    size: ButtonSize.Tiny,
    loading: true,
  },
};

export const LoadingWarningSecondary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Warning,
    variant: ButtonVariant.Secondary,
    size: ButtonSize.Tiny,
    loading: true,
  },
};

export const LoadingWarningTertiary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Warning,
    variant: ButtonVariant.Tertiary,
    size: ButtonSize.Tiny,
    loading: true,
  },
};

export const LoadingErrorPrimary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Error,
    variant: ButtonVariant.Primary,
    size: ButtonSize.Tiny,
    loading: true,
  },
};

export const LoadingErrorSecondary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Error,
    variant: ButtonVariant.Secondary,
    size: ButtonSize.Tiny,
    loading: true,
  },
};

export const LoadingErrorTertiary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Error,
    variant: ButtonVariant.Tertiary,
    size: ButtonSize.Tiny,
    loading: true,
  },
};
export default meta;
