import { asFullAssetUrl } from "@/lib/atlas";
import { IRoom, Void } from "@litespace/types";
import { first } from "lodash";
import React, { useMemo } from "react";
import dayjs from "@/lib/dayjs";
import cn from "classnames";

const Room: React.FC<{
  members: IRoom.PopulatedMember[];
  active: boolean;
  select: Void;
}> = ({ members, active, select }) => {
  const member = useMemo(() => first(members), [members]);
  if (!member) return null;
  return (
    <button
      className={cn(
        "flex flex-row gap-2 items-center px-6 py-3 mr-1 cursor-pointer",
        "border-b border-border-strong",
        "w-[300px]",
        {
          "hover:bg-surface-100 bg-background-button": active,
          "hover:bg-surface-200": !active,
        }
      )}
      onClick={select}
    >
      <div className="w-14 h-14 overflow-hidden rounded-full">
        <img
          className="object-cover w-full h-full"
          src={member.photo ? asFullAssetUrl(member.photo) : "/avatar-1.png"}
        />
      </div>
      <div className="flex flex-col items-start">
        <p>{member.name}</p>
        <span className="text-foreground-light text-sm">
          {dayjs(member.updatedAt).fromNow()}
        </span>
      </div>
    </button>
  );
};

export default Room;
