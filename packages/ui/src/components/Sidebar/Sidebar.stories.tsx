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
          tail: (
            <button
              onClick={() => alert("Not Implemented!")}
              className={cn(
                "flex flex-row justify-start md:justify-center lg:justify-start",
                "gap-2 md:gap-0 lg:gap-4 px-[14px] py-2 rounded-lg",
                "hover:text-destructive-400 hover:bg-destructive-100",
                "active:bg-destructive-400 [&_*]:active:text-natural-50",
                "[&_*]:active:stroke-natural-50 transition-all duration-200"
              )}
            >
              <Logout className="h-4 w-4 md:h-6 md:w-6" />
              <Typography
                tag="span"
                className={cn(
                  "text-destructive-400 active:bg-destructive-400 active:text-natural-50 text-tiny lg:text-caption",
                  "flex md:hidden lg:flex"
                )}
              >
                {ar["sidebar.logout"]}
              </Typography>
            </button>
          ),
        },
      ],
    },
  },
};

export default meta;
