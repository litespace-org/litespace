import dayjs from "@/lib/dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  useFindAvailabilitySlots,
  useSetAvailabilitySlots,
} from "@litespace/headless/availabilitySlots";
import { useUserContext } from "@litespace/headless/context/user";

import { AvailabilitySlotProps, Calendar } from "@litespace/ui/Calendar";
import { DeleteSlotDialog } from "@litespace/ui/DeleteSlotDialog";
import { ManageSchedule, MobileDaySlots } from "@litespace/ui/ManageSchedule";
import { useToast } from "@litespace/ui/Toast";
import { useFormatMessage } from "@litespace/ui/hooks/intl";

import Header from "@/components/ScheduleManagement/Header";
import { capture } from "@/lib/sentry";
import { useInfiniteLessons } from "@litespace/headless/lessons";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { IAvailabilitySlot } from "@litespace/types";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import { isEmpty } from "lodash";

const ScheduleManagement: React.FC = () => {
  const { md, lg } = useMediaQuery();
  const { user } = useUserContext();
  const [date, setDate] = useState(
    () =>
      lg || !md
        ? dayjs().startOf("week")
        : dayjs().subtract(1, "day").startOf("day") // So the 4 represented days in tablet mood start from yesterday not today.
  );
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
    before:
      lg || !md
        ? date.add(1, "week").toISOString()
        : date.add(4, "days").toISOString(),
    full: true,
  });

  const lessonsQuery = useInfiniteLessons({
    users: user ? [user.id] : [],
    userOnly: true,
    after: date.toISOString(),
    before:
      lg || !md
        ? date.add(1, "week").toISOString()
        : date.add(4, "days").toISOString(),
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
      capture(error);
      const errorMessage = getErrorMessageId(error);
      toast.error({
        title: intl("manage-schedule.update.error"),
        description: errorMessage,
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
    <div className="w-full p-4 lg:p-6 mx-auto max-w-screen-3xl">
      <div className="mb-8">
        <Header
          date={date}
          nextWeek={() =>
            lg || !md
              ? setDate((prev) => prev.add(1, "week"))
              : setDate((prev) => prev.add(4, "days"))
          }
          prevWeek={() =>
            lg || !md
              ? setDate((prev) => prev.subtract(1, "week"))
              : setDate((prev) => prev.subtract(4, "days"))
          }
          manageSchedule={() =>
            setManageScheduleProps((prev) => ({
              ...prev,
              open: true,
              singleDay: false,
              initialSlots: calendarSlots,
            }))
          }
        />
      </div>

      <ManageSchedule
        initialSlots={manageScheduleProps.initialSlots}
        date={manageScheduleProps.date}
        open={manageScheduleProps.open}
        nextWeek={() =>
          lg || !md
            ? setDate((prev) => prev.add(1, "week"))
            : setDate((prev) => prev.add(4, "days"))
        }
        prevWeek={() =>
          lg || !md
            ? setDate((prev) => prev.subtract(1, "week"))
            : setDate((prev) => prev.subtract(5, "days"))
        }
        save={(actions) => mutateSlots.mutate(actions)}
        retry={() => slotsQuery.refetch()}
        close={() =>
          setManageScheduleProps((prev) => ({
            ...prev,
            open: false,
            initialSlots: [], // for better user experience
          }))
        }
        loading={slotsQuery.isFetching}
        error={!!slotsQuery.error}
        singleDay={manageScheduleProps.singleDay}
        saving={mutateSlots.isPending}
      />

      <DeleteSlotDialog
        slotId={deleteDialogProps.slotId}
        opened={deleteDialogProps.opened}
        deleting={mutateSlots.isPending}
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

      {md ? (
        <Calendar
          key="calendar"
          date={date}
          slots={calendarSlots}
          slotActions={{ onEdit, onDelete }}
          loading={slotsQuery.isFetching}
          error={slotsQuery.isError}
          retry={slotsQuery.refetch}
        />
      ) : null}

      {!md ? (
        <MobileDaySlots
          day={date}
          slots={calendarSlots}
          slotActions={{ onEdit, onDelete }}
          loading={slotsQuery.isFetching}
          error={slotsQuery.isError}
          retry={slotsQuery.refetch}
        />
      ) : null}
    </div>
  );
};

export default ScheduleManagement;
