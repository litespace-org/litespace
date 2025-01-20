import React, { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "@/lib/dayjs";

import { useUserContext } from "@litespace/headless/context/user";
import {
  useFindAvailabilitySlots,
  useSetAvailabilitySlots,
} from "@litespace/headless/availabilitySlots";

import { Calendar, AvailabilitySlotProps } from "@litespace/luna/Calendar";
import { ManageSchedule } from "@litespace/luna/ManageSchedule";
import { DeleteSlotDialog } from "@litespace/luna/DeleteSlotDialog";
import { useToast } from "@litespace/luna/Toast";
import { useFormatMessage } from "@litespace/luna/hooks/intl";

import Header from "@/components/SlotSchedule/Header";
import { useInfiniteLessons } from "@litespace/headless/lessons";
import { isEmpty } from "lodash";
import { IAvailabilitySlot } from "@litespace/types";

const ScheduleManagement: React.FC = () => {
  const { user } = useUserContext();
  const [date, setDate] = useState(dayjs().startOf("week"));
  const toast = useToast();
  const intl = useFormatMessage();

  const [manageScheduleProps, setManageScheduleProps] = useState<{
    initialSlots: AvailabilitySlotProps[];
    date: string;
    singleDay: boolean;
    open: boolean;
  }>({
    initialSlots: [],
    date: date.toISOString(),
    singleDay: false,
    open: false,
  });

  const [deleteDialogProps, setDeleteDialogProps] = useState<{
    slotId: number;
    opened: boolean;
    severity: "normal" | "high";
  }>({
    slotId: 0,
    opened: false,
    severity: "normal",
  });

  const slotsQuery = useFindAvailabilitySlots({
    userId: user?.id || 0,
    after: date.toISOString(),
    before: date.add(1, "week").toISOString(),
    full: true,
  });

  const lessonsQuery = useInfiniteLessons({
    users: user ? [user.id] : [],
    userOnly: true,
    after: date.toISOString(),
    before: date.add(1, "week").toISOString(),
    full: true,
  });

  const mutateSlots = useSetAvailabilitySlots({
    onSuccess() {
      setDeleteDialogProps((prev) => ({ ...prev, opened: false }));
      setManageScheduleProps((prev) => ({ ...prev, open: false }));
      slotsQuery.refetch();
      lessonsQuery.query.refetch();
      toast.success({ title: intl("manage-schedule.update.success") });
    },
    onError(error) {
      setDeleteDialogProps((prev) => ({ ...prev, opened: false }));
      setManageScheduleProps((prev) => ({ ...prev, open: false }));
      toast.error({
        title: intl("manage-schedule.update.error"),
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const calendarSlots = useMemo(() => {
    const calendarSlots: AvailabilitySlotProps[] = [];
    if (!slotsQuery.data) return calendarSlots;

    for (const slot of slotsQuery.data.slots.list) {
      const withinLessons =
        lessonsQuery.list?.filter((obj) => {
          const start = dayjs(obj.lesson.start);
          return (
            start.isBetween(slot.start, slot.end) || start.isSame(slot.start)
          );
        }) || [];

      const members: AvailabilitySlotProps["members"] = [];
      withinLessons.forEach((obj) => {
        obj.members.forEach((member) => {
          if (member.userId !== user?.id)
            members.push({
              id: member.userId,
              image: member.image,
              name: member.name,
            });
        });
      });

      calendarSlots.push({
        id: slot.id,
        start: slot.start,
        end: slot.end,
        members,
      });
    }

    return calendarSlots;
  }, [slotsQuery.data, lessonsQuery.list, user]);

  useEffect(() => {
    setManageScheduleProps((prev) => ({
      ...prev,
      date: date.toISOString(),
      initialSlots: calendarSlots,
    }));
  }, [date, calendarSlots]);

  const onEdit = useCallback(
    (slotInfo: IAvailabilitySlot.Slot) =>
      setManageScheduleProps(() => ({
        initialSlots: calendarSlots,
        date: slotInfo.start,
        singleDay: true,
        open: true,
      })),
    [calendarSlots]
  );
  const onDelete = useCallback(
    (slotId: number) =>
      setDeleteDialogProps((prev) => {
        const slotMemebers = calendarSlots.find(
          (slot) => slot.id === slotId
        )?.members;
        return {
          ...prev,
          slotId,
          opened: true,
          severity: isEmpty(slotMemebers) ? "normal" : "high",
        };
      }),
    [calendarSlots]
  );

  return (
    <div className="w-full p-6 mx-auto overflow-hidden max-w-screen-3xl">
      <div className="mb-8">
        <Header
          date={date}
          nextWeek={() => {
            setDate((prev) => prev.add(1, "week"));
          }}
          prevWeek={() => {
            setDate((prev) => prev.subtract(1, "week"));
          }}
          manageSchedule={() =>
            setManageScheduleProps((prev) => ({
              ...prev,
              singleDay: false,
              open: true,
              initialSlots: calendarSlots,
            }))
          }
        />
      </div>

      <ManageSchedule
        initialSlots={manageScheduleProps.initialSlots}
        date={manageScheduleProps.date}
        open={manageScheduleProps.open}
        nextWeek={() => {
          setDate((prev) => prev.add(1, "week"));
        }}
        prevWeek={() => {
          setDate((prev) => prev.subtract(1, "week"));
        }}
        save={(actions) => mutateSlots.mutate(actions)}
        retry={() => slotsQuery.refetch()}
        close={() => {
          setManageScheduleProps((prev) => ({
            ...prev,
            open: false,
            initialSlots: [], // for better user experience
          }));
        }}
        loading={slotsQuery.isFetching}
        error={!!slotsQuery.error}
        singleDay={manageScheduleProps.singleDay}
      />

      <DeleteSlotDialog
        slotId={deleteDialogProps.slotId}
        opened={deleteDialogProps.opened}
        deleting={false}
        confirm={() =>
          mutateSlots.mutate([
            {
              type: "delete",
              id: deleteDialogProps.slotId,
            },
          ])
        }
        close={() =>
          setDeleteDialogProps((prev) => ({ ...prev, opened: false }))
        }
        severity={deleteDialogProps.severity}
      />

      <Calendar
        key="calendar"
        date={date}
        slots={calendarSlots}
        slotActions={{ onEdit, onDelete }}
      />
    </div>
  );
};

export default ScheduleManagement;
