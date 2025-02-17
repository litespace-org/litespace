import { IRoom, Void } from "@litespace/types";
import { first } from "lodash";
import React, { useMemo } from "react";
import dayjs from "@/lib/dayjs";
import cn from "classnames";
import { orUndefined } from "@litespace/utils/utils";

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
  //   const intl = useWebFormatMessage(); TODO: uncomment this when online status is implemented
  const member = useMemo(() => first(members), [members]);
  const status = useMemo(() => {
    if (!member) return Status.InActive;
    // TODO: use a hook to get user status from server cache
    // if (member.online) return Status.Active;
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
        "flex flex-row gap-2 items-center justify-center md:justify-start px-4 py-2 md:px-6 md:py-3 mr-1 cursor-pointer",
        "border-b border-border-strong",
        {
          "bg-background-selection": active,
          "hover:bg-surface-300": !active,
        }
      )}
      onClick={select}
    >
      <div className="relative flex items-center justify-center">
        <div className="w-10 h-10 overflow-hidden rounded-full md:w-14 md:h-14 ring ring-dash-sidebar">
          <img
            className="object-cover w-full h-full"
            src={orUndefined(member.image)}
          />
        </div>

        <span
          className={cn(
            "w-3 h-3 inline-block absolute z-10 bottom-0 left-0 md:bottom-0.5 md:left-0.5 rounded-full shadow-md ring ring-dash-sidebar",
            {
              "hidden bg-transparent": status === Status.InActive,
              "bg-amber-700 dark:bg-amber-900": status === Status.WasActive,
              // TODO: uncomment when online status impl is done.
              // "bg-brand-8 dark:bg-brand-9": status === Status.Active,
            }
          )}
        />
      </div>
      <div className="flex-col items-start hidden w-full md:flex">
        <p className="w-4/5 truncate">{member.name}</p>
        <span className="text-sm text-foreground-light">
          {
            // TODO: uncomment when online status impl is done.
            // status.active ? intl("chat.active") : dayjs(member.updatedAt).fromNow()
          }
        </span>
      </div>
    </button>
  );
};

export default Room;
