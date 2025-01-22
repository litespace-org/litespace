import * as Tabs from "@radix-ui/react-tabs";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { ITutor } from "@litespace/types";
import React, { useMemo } from "react";
import { LocalId } from "@litespace/ui/locales";
import cn from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import ProfileInfo from "@/components/TutorProfile/ProfileInfo";
import Ratings from "@/components/TutorProfile/Ratings";
import { Animate } from "@/components/Common/Animate";
import { useSearchParams } from "react-router-dom";

type Tab = "profile" | "ratings";
const URL_TAB_KEY = "tab";

function isValidTab(tab: string): tab is Tab {
  return tab === "profile" || tab === "ratings";
}

export const TutorTabs: React.FC<{
  tutor: ITutor.FindTutorInfoApiResponse;
}> = ({ tutor }) => {
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
        label: "tutor.profile.tabs.profile",
      },
      {
        value: "ratings",
        label: "tutor.profile.tabs.reviews",
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
      <Tabs.List className="border-b border-natural-300 flex gap-14 px-4 md:px-10">
        {tabs.map(({ value, label }) => (
          <Tabs.Trigger
            key={value}
            value={value}
            className={cn("py-2 relative")}
          >
            <Typography
              element={{ default: "caption", md: "body" }}
              weight="semibold"
              className={cn(
                "transition-colors duration-300",
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
            <ProfileInfo
              about={tutor.about}
              topics={tutor.topics}
              video={tutor.video}
            />
          </Animate>
        ) : null}
        {tab === "ratings" ? (
          <Animate key="ratings">
            <Ratings tutorName={tutor.name} id={tutor.id} />
          </Animate>
        ) : null}
      </AnimatePresence>
    </Tabs.Root>
  );
};
