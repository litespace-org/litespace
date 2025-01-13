import React, { useMemo } from "react";
import { motion } from "framer-motion";

import {
  AvailabilitySlotProps,
  SlotActions,
} from "@/components/Calendar/v2/types";

import {
  MemberAvatar,
  EventSpan,
  Card,
} from "@/components/Calendar/v2/Events/shared";

import dayjs from "@/lib/dayjs";
import { Typography } from "@/components/Typography";
import {
  AVATAR_WIDTH,
  AVATARS_OVERLAPPING,
  CARD_PADDING,
  HOUR_HEIGHT,
} from "@/components/Calendar/v2/constants";

import { Menu, MenuAction } from "@/components/Menu";
import CalendarEdit from "@litespace/assets/CalendarEdit";
import CalendarRemove from "@litespace/assets/CalendarRemove";
import More from "@litespace/assets/More";
import { useFormatMessage } from "@/hooks";

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
  avatarsCount,
  mt,
  ...actions
}) => {
  const marginTop = useMemo(() => {
    const startDay = dayjs(start);
    return startDay.diff(startDay.startOf("day"), "hours") * HOUR_HEIGHT;
  }, [start]);

  const cardHeight = useMemo(() => {
    return dayjs(end).diff(start, "hours") * HOUR_HEIGHT - 2 * CARD_PADDING;
  }, [start, end]);

  const visibleAvatarsCount = useMemo(() => {
    return avatarsCount || 3;
  }, []);

  if (dayjs(start).isSame(end)) return null;

  return (
    <Card
      height={cardHeight}
      minHeight={HOUR_HEIGHT - 2 * CARD_PADDING}
      marginTop={mt !== undefined ? mt : marginTop}
    >
      <div className="tw-absolute tw-top-1 tw-left-1">
        <OptionsMenu id={id} {...actions} />
      </div>
      <div className="tw-flex tw-flex-col tw-gap-2">
        <div className="tw-flex tw-items-center tw-justify-start">
          <EventSpan start={start} end={end} />
        </div>

        <div className="tw-flex tw-relative tw-h-9">
          {members.slice(0, visibleAvatarsCount + 1).map((member, idx) => (
            <motion.div
              key={start}
              initial={{
                x: idx >= 1 ? -idx * (AVATAR_WIDTH - AVATARS_OVERLAPPING) : 0,
              }}
              style={{
                position: "absolute",
                zIndex: idx === 0 ? 1 : 0,
              }}
              whileHover={{
                zIndex: 4,
              }}
            >
              <div>
                <motion.button
                  whileHover={{
                    scale: 1.05,
                  }}
                  type="button"
                  className="tw-rounded-full"
                >
                  {idx !== visibleAvatarsCount ? (
                    <MemberAvatar
                      src={member.image}
                      alt={member.name}
                      seed={member.id.toString()}
                    />
                  ) : (
                    <div className="tw-flex tw-items-center tw-justify-center tw-bg-natural-500 tw-text-natural-50 tw-shrink-0 tw-w-9 tw-h-9 tw-rounded-full tw-overflow-hidden">
                      <Typography className="tw-text-sm">
                        {members.length > visibleAvatarsCount
                          ? `${members.length - visibleAvatarsCount}+`
                          : null}
                      </Typography>
                    </div>
                  )}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
};

const OptionsMenu: React.FC<
  Partial<SlotActions> & {
    id: number;
    open?: boolean;
    setOpen?: (open: boolean) => void;
  }
> = ({ id, onEdit, onDelete, open, setOpen }) => {
  const intl = useFormatMessage();

  const actions: MenuAction[] = useMemo(() => {
    return [
      {
        icon: <CalendarEdit />,
        label: intl("schedule.slot.edit"),
        onClick: () => {
          if (onEdit) onEdit(id);
          else alert("Not Implemented!");
        },
      },
      {
        icon: <CalendarRemove />,
        label: intl("schedule.slot.delete"),
        onClick: () => {
          if (onDelete) onDelete(id);
          else alert("Not Implemented!");
        },
      },
    ];
  }, [intl, id, onEdit, onDelete]);

  return (
    <Menu actions={actions} open={open} setOpen={setOpen}>
      <div className="tw-p-2">
        <More className="[&>*]:tw-fill-natural-800" />
      </div>
    </Menu>
  );
};
