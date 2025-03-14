import React, { useMemo } from "react";
import { motion } from "framer-motion";

import {
  AvailabilitySlotProps,
  SlotActions,
} from "@/components/Calendar/types";

import {
  MemberAvatar,
  EventSpan,
  Card,
} from "@/components/Calendar/Events/shared";

import dayjs from "@/lib/dayjs";
import { Typography } from "@/components/Typography";
import {
  AVATAR_WIDTH,
  AVATARS_OVERLAPPING,
  CARD_PADDING,
  HOUR_HEIGHT,
} from "@/components/Calendar/constants";

import { Menu, MenuAction } from "@/components/Menu";
import CalendarEdit from "@litespace/assets/CalendarEdit";
import CalendarRemove from "@litespace/assets/CalendarRemove";
import More from "@litespace/assets/More";
import { useFormatMessage } from "@/hooks";
import { Void } from "@litespace/types";

const VISIBLE_AVATAR_COUNT = 3;

type Props = AvailabilitySlotProps &
  Partial<SlotActions> & {
    /**
     * margin top: used for presentation in luna
     */
    mt?: number;
  };

export const AvailabilitySlot: React.FC<Props> = ({
  id,
  start,
  end,
  members,
  mt,
  onEdit,
  onDelete,
}) => {
  const marginTop = useMemo(() => {
    const startDay = dayjs(start);
    return startDay.diff(startDay.startOf("day"), "hours") * HOUR_HEIGHT;
  }, [start]);

  const height = useMemo(() => {
    return dayjs(end).diff(start, "hours") * HOUR_HEIGHT - 2 * CARD_PADDING;
  }, [start, end]);

  return (
    <Card
      height={height}
      minHeight={HOUR_HEIGHT - 2 * CARD_PADDING}
      marginTop={mt !== undefined ? mt : marginTop}
    >
      <div className="absolute top-1 left-1">
        <OptionsMenu
          onEdit={() => onEdit && onEdit({ id, start, end })}
          onDelete={() => onDelete && onDelete(id)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-start">
          <EventSpan start={start} end={end} />
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
                      seed={member.id.toString()}
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
    </Card>
  );
};

const OptionsMenu: React.FC<{
  open?: boolean;
  setOpen?: (open: boolean) => void;
  onEdit: Void;
  onDelete: Void;
}> = ({ onEdit, onDelete, open, setOpen }) => {
  const intl = useFormatMessage();

  const actions: MenuAction[] = useMemo(() => {
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
        <More className="[&>*]:fill-natural-800" />
      </div>
    </Menu>
  );
};
