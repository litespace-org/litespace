import MobileUploadPhoto from "@/components/StudentSettings/MobileUploadPhoto";
import { ITab, Tab } from "@/components/StudentSettings/types";
import LeftArrowHead from "@litespace/assets/LeftArrowHead";
import { IUser } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { Typography } from "@litespace/ui/Typography";
import cn from "classnames";
import React from "react";

export const MobileSettingsPages: React.FC<{
  user: IUser.Self;
  tabs: Tab[];
  setTab: (tab: ITab) => void;
}> = ({ user, tabs, setTab }) => {
  return (
    <div className="flex flex-col gap-6 flex-1 justify-center">
      <MobileUploadPhoto
        id={user.id}
        name={user.name}
        image={user.image}
        email={user.email}
      />
      <div
        className={cn(
          "bg-natural-0 rounded-lg border border-natural-100",
          "flex flex-col p-4"
        )}
      >
        {tabs.map(({ id, Icon, label }) => {
          if (id === "settings") return;
          return (
            <div
              key={id}
              className="flex items-center py-2 first-of-type:pt-0 last-of-type:pb-0 border-b border-natural-100 last-of-type:border-none"
              onClick={() => setTab(id)}
            >
              {Icon ? (
                <Icon className="w-6 h-6 [&>*]:stroke-natural-700 [&>*]:fill-transparent me-4" />
              ) : null}

              <Typography
                tag="span"
                className="text-caption font-semibold text-natural-700 me-auto"
              >
                {label}
              </Typography>
              <Button
                variant="secondary"
                className="!bg-transparent !border-none"
                startIcon={
                  <LeftArrowHead className="w-6 h-6 [&>*]:stroke-natural-700" />
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MobileSettingsPages;
