import React, { useMemo } from "react";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import * as Tabs from "@radix-ui/react-tabs";
import { Typography } from "@litespace/ui/Typography";
import { LocalId } from "@litespace/ui/locales";
import cn from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { Animate } from "@/components/Common/Animate";
import { UseFormReturn } from "react-hook-form";
import { ITutorSettingsForm } from "@/components/TutorSettings/types";
import PersonalSettings from "@/components/TutorSettings/Tabs/Personal";
import PublicSettings from "@/components/TutorSettings/Tabs/Public";
import { useSearchParams } from "react-router-dom";

type Tab = "profile" | "settings";
const URL_TAB_KEY = "tab";

function isValidTab(tab: string): tab is Tab {
  return tab === "profile" || tab === "settings";
}

export const TutorSettingsTabs: React.FC<{
  form: UseFormReturn<ITutorSettingsForm, unknown, undefined>;
  video: string | null;
}> = ({ video, form }) => {
  const intl = useFormatMessage();
  const [params, setParams] = useSearchParams();

  const tab = useMemo((): Tab => {
    const tab = params.get(URL_TAB_KEY);
    if (!tab || !isValidTab(tab)) return "profile";
    return tab;
  }, [params]);

  const tabs = useMemo((): Array<{ value: Tab; label: LocalId }> => {
    return [
      {
        value: "profile",
        label: "tutor-settings.tabs.profile-settings",
      },
      {
        value: "settings",
        label: "tutor-settings.tabs.personal-settings",
      },
    ];
  }, []);

  return (
    <Tabs.Root
      value={tab}
      onValueChange={(value: string) => {
        if (!isValidTab(value)) return;
        setParams({ [URL_TAB_KEY]: value });
      }}
    >
      <Tabs.List className="border-b border-natural-300 flex gap-[56px] md:px-10">
        {tabs.map(({ value, label }) => (
          <Tabs.Trigger
            key={value}
            value={value}
            className={cn("py-2 relative")}
          >
            <Typography
              tag="span"
              className={cn(
                "transition-colors duration-300 text-body font-semibold",
                value === tab ? "text-brand-700" : "text-natural-500"
              )}
            >
              {intl(label)}
            </Typography>
            <AnimatePresence>
              {tab === value ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: {
                      duration: 0.3,
                    },
                  }}
                  exit={{ opacity: 0 }}
                  className="absolute -bottom-[1px] left-0 w-full h-[3px] bg-brand-700 rounded-t-[10px]"
                />
              ) : null}
            </AnimatePresence>
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <AnimatePresence initial={false} mode="wait">
        {tab === "profile" ? (
          <Animate key="profile">
            <PublicSettings video={video} form={form} />
          </Animate>
        ) : null}

        {tab === "settings" ? (
          <Animate key="settings">
            <PersonalSettings form={form} />
          </Animate>
        ) : null}
      </AnimatePresence>
    </Tabs.Root>
  );
};
