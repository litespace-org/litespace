import dayjs from "@/lib/dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  useFindAvailabilitySlots,
  useSetAvailabilitySlots,
} from "@litespace/headless/availabilitySlots";
import { useUser } from "@litespace/headless/context/user";

import { AvailabilitySlotProps, Calendar } from "@litespace/ui/Calendar";
import { DeleteSlotDialog } from "@litespace/ui/DeleteSlotDialog";
import { ManageSchedule } from "@litespace/ui/ManageSchedule";
import { SlotsList } from "@litespace/ui/SlotsList";
import { useToast } from "@litespace/ui/Toast";
import { useFormatMessage } from "@litespace/ui/hooks/intl";

import Header from "@/components/ScheduleManagement/Header";
import { capture } from "@/lib/sentry";
import { useInfiniteLessons } from "@litespace/headless/lessons";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { IAvailabilitySlot } from "@litespace/types";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import { isEmpty } from "lodash";
import { useCalendarController } from "@/hooks/calendar";
import { Optional } from "@litespace/ui/Optional";

const ScheduleManagement: React.FC = () => {
  const { md } = useMediaQuery();
  const { user } = useUser();
  const { start, end, next, prev } = useCalendarController();

  const toast = useToast();
  const intl = useFormatMessage();

  const [manageScheduleProps, setManageScheduleProps] = useState<{
    initialSlots: AvailabilitySlotProps[];
    date: string;
    singleDay: boolean;
    open: boolean;
  }>({
    initialSlots: [],
    date: start.toISOString(),
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
    userIds: [user?.id || 0],
    after: start.toISOString(),
    before: end.toISOString(),
    full: true,
  });

  const lessonsQuery = useInfiniteLessons({
    users: user ? [user.id] : [],
    userOnly: true,
    canceled: false,
    after: start.toISOString(),
    before: end.toISOString(),
    full: true,
  });

  console.log({ lessons: lessonsQuery.list });

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
      toast.error({
        title: intl("manage-schedule.update.error"),
        description: intl(getErrorMessageId(error)),
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
      date: start.toISOString(),
      initialSlots: calendarSlots,
    }));
  }, [calendarSlots, start]);

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
          start={start}
          end={end}
          next={next}
          prev={prev}
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

      <Optional unmount show={manageScheduleProps.open}>
        <ManageSchedule
          initialSlots={manageScheduleProps.initialSlots}
          scheduledLessons={lessonsQuery.list?.map((item) => item.lesson) || []}
          date={manageScheduleProps.date}
          open={manageScheduleProps.open}
          next={next}
          prev={prev}
          save={(actions) => mutateSlots.mutate(actions)}
          retry={slotsQuery.refetch}
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
      </Optional>

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
          date={start}
          slots={calendarSlots}
          slotActions={{ onEdit, onDelete }}
          loading={slotsQuery.isFetching}
          error={slotsQuery.isError}
          retry={slotsQuery.refetch}
        />
      ) : null}

      {!md ? (
        <SlotsList
          day={start}
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
