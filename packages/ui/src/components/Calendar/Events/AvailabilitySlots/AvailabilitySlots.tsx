import React, { useMemo } from "react";
import { motion } from "framer-motion";

import {
  AvailabilitySlotProps,
  SlotActions,
} from "@/components/Calendar/types";

import { MemberAvatar, EventSpan } from "@/components/Calendar/Events/shared";

import dayjs from "@/lib/dayjs";
import { Typography } from "@/components/Typography";
import {
  AVATAR_WIDTH,
  AVATARS_OVERLAPPING,
  HOUR_HEIGHT,
} from "@/components/Calendar/constants";

import { Menu, MenuAction } from "@/components/Menu";
import CalendarEdit from "@litespace/assets/CalendarEdit";
import CalendarRemove from "@litespace/assets/CalendarRemove";
import More from "@litespace/assets/More";
import { useFormatMessage } from "@/hooks";
import { Void } from "@litespace/types";

const VISIBLE_AVATAR_COUNT = 3;

type Props = AvailabilitySlotProps & Partial<SlotActions>;

export const AvailabilitySlot: React.FC<Props> = ({
  id,
  start,
  end,
  members,
  onEdit,
  onDelete,
}) => {
  const top = useMemo(() => {
    const startDay = dayjs(start);
    return startDay.diff(startDay.startOf("day"), "hours") * HOUR_HEIGHT + 4; // 4px padding form the top.
  }, [start]);

  const height = useMemo(() => {
    return dayjs(end).diff(start, "hours") * HOUR_HEIGHT - 8; // 4px padding from the bottom.
  }, [start, end]);

  return (
    <div
      className="absolute w-full px-1"
      style={{ top: top + "px", height: height + "px" }}
    >
      <div className="border px-[10px] py-2 rounded-lg bg-[rgba(29,124,78,0.04)] border-brand-700 h-full">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <EventSpan start={start} end={end} />
            {onEdit || onDelete ? (
              <OptionsMenu
                onEdit={() => onEdit && onEdit({ id, start, end })}
                onDelete={() => onDelete && onDelete(id)}
              />
            ) : null}
          </div>

          <div className="flex relative h-9">
            {members.slice(0, VISIBLE_AVATAR_COUNT + 1).map((member, idx) => (
              <motion.div
                key={idx}
                initial={{
                  x: idx >= 1 ? -idx * (AVATAR_WIDTH - AVATARS_OVERLAPPING) : 0,
                }}
                style={{
                  position: "absolute",
                  zIndex: idx === 0 ? 1 : 1,
                }}
                whileHover={{ zIndex: 2 }}
              >
                <div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="rounded-full border border-natural-50"
                  >
                    {idx !== VISIBLE_AVATAR_COUNT ? (
                      <MemberAvatar
                        src={member.image}
                        alt={member.name}
                        id={member.id}
                      />
                    ) : members.length > VISIBLE_AVATAR_COUNT ? (
                      <div className="flex items-center justify-center bg-natural-500 text-natural-50 shrink-0 w-9 h-9 rounded-full overflow-hidden">
                        <Typography tag="span" className="text-caption">
                          {members.length - VISIBLE_AVATAR_COUNT}+
                        </Typography>
                      </div>
                    ) : null}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const OptionsMenu: React.FC<{
  open?: boolean;
  setOpen?: (open: boolean) => void;
  onEdit: Void;
  onDelete: Void;
}> = ({ onEdit, onDelete, open, setOpen }) => {
  const intl = useFormatMessage();

  const actions = useMemo((): MenuAction[] => {
    return [
      {
        icon: <CalendarEdit />,
        label: intl("manage-schedule.slot.edit"),
        onClick: onEdit,
      },
      {
        icon: <CalendarRemove height={16} width={16} />,
        label: intl("manage-schedule.slot.delete"),
        onClick: onDelete,
      },
    ];
  }, [intl, onEdit, onDelete]);

  return (
    <Menu actions={actions} open={open} setOpen={setOpen}>
      <div className="p-2 z-10">
        <More className="[&>*]:fill-natural-800 w-4 h-1" />
      </div>
    </Menu>
  );
};
