import * as Tabs from "@radix-ui/react-tabs";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Typography } from "@litespace/luna/Typography";
import { ITutor } from "@litespace/types";
import React, { useMemo, useState } from "react";
import { LocalId } from "@litespace/luna/locales";
import cn from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import ProfileInfo from "@/components/TutorProfile/ProfileInfo";
import Ratings from "@/components/TutorProfile/Ratings";
import { Animate } from "@/components/Common/Animate";

type Tab = "profile" | "ratings";

export const TutorTabs: React.FC<{
  tutor: ITutor.FindTutorInfoApiResponse;
}> = ({ tutor }) => {
  const intl = useFormatMessage();
  const [tab, setTab] = useState<Tab>("profile");

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
      onValueChange={(value: string) => setTab(value as Tab)}
    >
      <Tabs.List className="border-b border-natural-300 flex gap-[56px] px-10 ">
        {tabs.map(({ value, label }) => (
          <Tabs.Trigger
            key={value}
            value={value}
            className={cn("py-2 relative")}
          >
            <Typography
              element="body"
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
          <Animate name="profile">
            <ProfileInfo
              about={tutor.about}
              topics={tutor.topics}
              video={tutor.video}
            />
          </Animate>
        ) : null}
        {tab === "ratings" ? (
          <Animate name="ratings">
            <Ratings tutorName={tutor.name} id={tutor.id} />
          </Animate>
        ) : null}
      </AnimatePresence>
    </Tabs.Root>
  );
};
