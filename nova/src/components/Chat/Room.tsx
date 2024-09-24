import { asFullAssetUrl } from "@/lib/atlas";
import { IRoom, Void } from "@litespace/types";
import { first } from "lodash";
import React, { useMemo } from "react";
import dayjs from "@/lib/dayjs";
import cn from "classnames";
import { useFormatMessage } from "@litespace/luna";

enum Status {
  Active,
  WasActive,
  InActive,
}

const Room: React.FC<{
  members: IRoom.PopulatedMember[];
  active: boolean;
  select: Void;
}> = ({ members, active, select }) => {
  const intl = useFormatMessage();
  const member = useMemo(() => first(members), [members]);
  const status = useMemo(() => {
    if (!member) return Status.InActive;
    if (member.online) return Status.Active;
    const now = dayjs();
    const recently = dayjs(member.updatedAt).isBetween(
      now,
      now.subtract(1, "hour")
    );
    if (recently) return Status.WasActive;
    return Status.InActive;
  }, [member]);

  if (!member) return null;

  return (
    <button
      className={cn(
        "flex flex-row gap-2 items-center px-6 py-3 mr-1 cursor-pointer",
        "border-b border-border-strong",
        {
          "bg-background-selection": active,
          "hover:bg-surface-300": !active,
        }
      )}
      onClick={select}
    >
      <div className="relative">
        <div className="w-14 h-14 overflow-hidden rounded-full">
          <img
            className="object-cover w-full h-full"
            src={member.photo ? asFullAssetUrl(member.photo) : "/avatar-1.png"}
          />
        </div>

        <span
          className={cn(
            "w-3 h-3 inline-block absolute z-10 bottom-0.5 left-0.5 rounded-full shadow-md",
            {
              "hidden bg-transparent": status === Status.InActive,
              "bg-amber-700 dark:bg-amber-900": status === Status.WasActive,
              "bg-brand-8 dark:bg-brand-9": status === Status.Active,
            }
          )}
        />
      </div>
      <div className="flex flex-col items-start">
        <p>{member.name}</p>
        <span className="text-foreground-light text-sm">
          {status === Status.Active
            ? intl("chat.active")
            : dayjs(member.updatedAt).fromNow()}
        </span>
      </div>
    </button>
  );
};

export default Room;
