import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Sidebar } from "@/components/Sidebar";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import ar from "@/locales/ar-eg.json";
import { Web } from "@litespace/utils/routes";
import cn from "classnames";
import { Typography } from "@/components/Typography";

import Settings from "@litespace/assets/Settings";
import Home from "@litespace/assets/Home";
import Logout from "@litespace/assets/Logout";

type Component = typeof Sidebar;

const meta: Meta<Component> = {
  title: "Sidebar",
  component: Sidebar,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const Primary: StoryObj<Component> = {
  args: {
    hide: () => {},
    links: {
      [ar["sidebar.main"]]: [
        {
          label: ar["sidebar.dashboard"],
          route: Web.Tutors,
          Icon: Home,
          isActive: true,
        },
      ],
      [ar["sidebar.settings"]]: [
        {
          label: ar["sidebar.profile"],
          route: Web.Tutors,
          Icon: Settings,
          isActive: false,
          tail:           
            <button
              onClick={() => alert("Not Implemented!")}
              className={cn(
                "tw-flex tw-flex-row tw-justify-start md:tw-justify-center lg:tw-justify-start",
                "tw-gap-2 md:tw-gap-0 lg:tw-gap-4 tw-px-[14px] tw-py-2 tw-rounded-lg",
                "hover:tw-text-destructive-400 hover:tw-bg-destructive-100",
                "active:tw-bg-destructive-400 [&_*]:active:tw-text-natural-50",
                "[&_*]:active:tw-stroke-natural-50 tw-transition-all tw-duration-200"
              )}
            >
              <Logout className="tw-h-4 tw-w-4 md:tw-h-6 md:tw-w-6" />
              <Typography
                tag="span"
                className={cn(
                  "tw-text-destructive-400 tw-active:bg-destructive-400 tw-active:text-natural-50 tw-text-tiny tw-lg:text-caption",
                  "tw-flex md:tw-hidden lg:tw-flex"
                )}
              >
                {ar["sidebar.logout"]}
              </Typography>
            </button>
        },
      ],
    },
  }
};

export default meta;
