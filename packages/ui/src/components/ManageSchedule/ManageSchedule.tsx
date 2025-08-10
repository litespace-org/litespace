import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { Loading, LoadingError } from "@/components/Loading";
import DaySlots from "@/components/ManageSchedule/DaySlots";
import { Slot } from "@/components/ManageSchedule/types";
import { Typography } from "@/components/Typography";
import dayjs from "@/lib/dayjs";
import ChevronLeft from "@litespace/assets/ChevronLeft";
import ChevronRight from "@litespace/assets/ChevronRight";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { IAvailabilitySlot, ILesson, Void } from "@litespace/types";
import cn from "classnames";
import { concat, isEmpty, range, unionBy } from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { Dayjs } from "dayjs";
import { Optional } from "@/components/Optional";
import { isLessonsOutOfRange } from "@/lib/schedule";
import { useToast } from "@/components/Toast";

const WEEK_DAYS = 7;

export type Props = {
  initialSlots: IAvailabilitySlot.Slot[];
  scheduledLessons: ILesson.Self[];
  open: boolean;
  loading?: boolean;
  saving?: boolean;
  error?: boolean;
  retry: Void;
  date: string;
  next: Void;
  prev: Void;
  /**
   * `true` in case user is about to manage a single-day slots.
   * the data at the `date` prop will be taken as the desired date.
   */
  singleDay?: boolean;
  save: (actions: IAvailabilitySlot.Action[]) => void;
  close: Void;
};

function randomSlotId(): number {
  return -Math.floor(Math.random() * 1_000_000);
}

export const ManageSchedule: React.FC<Props> = ({
  date,
  open,
  loading,
  error,
  initialSlots,
  scheduledLessons,
  saving,
  singleDay,
  next,
  prev,
  retry,
  save,
  close,
}) => {
  const intl = useFormatMessage();
  const toast = useToast();
  const [slots, setSlots] = useState<Slot[]>([]);
  const weekStart = useMemo(() => dayjs(date).startOf("week"), [date]);
  const { md } = useMediaQuery();

  const days = useMemo(() => {
    if (singleDay) {
      const day = dayjs(date).startOf("day");
      const daySlots = slots.filter((slot) => day.isSame(slot.day, "day"));
      return [{ day, slots: daySlots }];
    }

    return range(WEEK_DAYS).map((index) => {
      const day = weekStart.add(index, "day").startOf("day");
      const daySlots = slots.filter((slot) => day.isSame(slot.day, "day"));
      return { day, slots: daySlots };
    });
  }, [date, singleDay, slots, weekStart]);

  const today = useMemo(() => dayjs(), []);

  useEffect(() => {
    setSlots((prev) => {
      const cloned = structuredClone(prev);
      const slots: Slot[] = initialSlots.map((slot) => ({
        ...slot,
        day: dayjs(slot.start).startOf("day").toISOString(),
        original: { start: slot.start, end: slot.end },
        state: "unchanged",
      }));
      return unionBy(concat(cloned, slots), (slot) => slot.id);
    });
  }, [initialSlots]);

  const onClose = useCallback(() => {
    setSlots([]);
    close();
  }, [close]);

  const addSlot = useCallback(
    ({ day, start, end }: { day: string; start: string; end: string }) => {
      const cloned = structuredClone(slots);
      const slot: Slot = {
        id: randomSlotId(),
        start: start,
        end: end,
        day: day,
        state: "created",
      };
      const final = concat(cloned, slot);
      setSlots(final);
    },
    [setSlots, slots]
  );

  const removeSlot = useCallback(
    (id: number) => {
      const cloned = structuredClone(slots);
      const filtered = cloned.filter((slot) => slot.id !== id);
      setSlots(filtered);
    },
    [setSlots, slots]
  );

  const updateSlot = useCallback(
    ({ id, start, end }: { id: number; start?: string; end?: string }) => {
      const cloned = structuredClone(slots);
      const slot = cloned.find((slot) => slot.id === id);

      if (!slot) return;

      if (start) slot.start = start;
      if (end) slot.end = end;

      if (
        isLessonsOutOfRange({
          slot,
          lessons: scheduledLessons.filter(
            (lesson) => dayjs(lesson.start).date() === dayjs(slot.start).date()
          ),
        })
      ) {
        toast.warning({
          title: intl("manage-schedule.manage-dialog.has-lesson-error.title"),
          description: intl(
            "manage-schedule.manage-dialog.has-lesson-error.description"
          ),
        });
        return;
      }

      const created = slot.state === "created";

      if (
        slot.start === slot.original?.start &&
        slot.end === slot.original?.end &&
        !created
      )
        slot.state = "unchanged";
      else if (!created) slot.state = "updated";

      setSlots(cloned);
    },
    [setSlots, slots, toast, intl, scheduledLessons]
  );

  const slotActions = useMemo(() => {
    const final: IAvailabilitySlot.Action[] = [];
    const allSlotIds = slots.map((slot) => slot.id);
    // Slot that are in the inital slots but not the final slots are considered
    // deleted.
    const deletedSlots = initialSlots.filter(
      (slot) => !allSlotIds.includes(slot.id)
    );

    for (const slot of deletedSlots) {
      final.push({ type: "delete", id: slot.id });
    }

    // NOTE: `unchnaged` slots are not added to the final slots actions.
    for (const slot of slots) {
      if (slot.state === "created" && slot.start && slot.end)
        final.push({
          type: "create",
          start: slot.start,
          end: slot.end,
          // TODO: this should be dynamic in future
          purpose: IAvailabilitySlot.Purpose.Lesson,
        });

      if (slot.state === "updated" && slot.start && slot.end) {
        final.push({
          type: "update",
          id: slot.id,
          start: slot.start,
          end: slot.end,
        });
      }
    }
    return final;
  }, [initialSlots, slots]);

  const invalidSlots = useMemo(() => {
    return !!slots.find((slot) => {
      const startOnly = slot.start && !slot.end;
      const endOnly = slot.end && !slot.start;
      return startOnly || endOnly;
    });
  }, [slots]);

  return (
    <Dialog
      open={open}
      close={onClose}
      title={
        <Typography
          tag="p"
          className="text-natural-950 font-bold text-caption lg:text-subtitle-2"
        >
          {intl(singleDay ? "manage-schedule.edit" : "manage-schedule.manage")}
        </Typography>
      }
      className="overflow-y-auto w-full md:w-[548px]"
      position={md ? "center" : "bottom"}
    >
      <Optional show={!singleDay}>
        <Header
          weekStart={weekStart}
          loading={loading}
          prev={prev}
          next={next}
        />
      </Optional>

      <Content
        singleDay={singleDay}
        loading={loading}
        saving={saving}
        error={error}
        addSlot={addSlot}
        removeSlot={removeSlot}
        updateSlot={updateSlot}
        days={days}
        retry={retry}
        today={today}
      />

      <Actions
        disabled={isEmpty(slotActions) || invalidSlots || saving}
        save={() => save(slotActions)}
        saving={saving}
        close={onClose}
      />
    </Dialog>
  );
};

const Header: React.FC<{
  loading?: boolean;
  prev: Void;
  next: Void;
  weekStart: Dayjs;
}> = ({ loading, prev, next, weekStart }) => {
  const intl = useFormatMessage();
  return (
    <div className="pt-4 lg:pt-6 pb-3">
      <div className="flex items-center justify-center gap-4 mb-4 lg:mb-6">
        <Button
          type="natural"
          variant="secondary"
          endIcon={<ChevronRight className="icon" />}
          htmlType="button"
          disabled={loading}
          onClick={prev}
        />

        <Typography
          tag="span"
          className="text-natural-950 text-caption lg:text-body font-semibold lg:font-bold"
        >
          {weekStart.format("D MMMM")}
          {" - "}
          {weekStart.add(6, "days").format("D MMMM")}
        </Typography>

        <Button
          type="natural"
          variant="secondary"
          endIcon={<ChevronLeft className="icon" />}
          htmlType="button"
          disabled={loading}
          onClick={next}
        />
      </div>

      <Typography
        tag="span"
        className="text-natural-950 mb-4 mt-6 font-semibold lg:font-bold text-caption lg:text-body"
      >
        {intl("manage-schedule.manage-dialog.available-days")}
      </Typography>
    </div>
  );
};

const Content: React.FC<{
  singleDay?: boolean;
  loading?: boolean;
  saving?: boolean;
  error?: boolean;
  retry: Void;
  days: Array<{
    day: dayjs.Dayjs;
    slots: Slot[];
  }>;
  updateSlot(payload: { id: number; start?: string; end?: string }): void;
  addSlot(payload: { day: string; start?: string; end?: string }): void;
  removeSlot(id: number): void;
  today: Dayjs;
}> = ({
  singleDay,
  loading,
  error,
  retry,
  days,
  updateSlot,
  addSlot,
  removeSlot,
  saving,
  today,
}) => {
  const intl = useFormatMessage();
  return (
    <div
      className={cn(
        "flex flex-col gap-4 mb-6",
        /**
         * 160px - the vertical space that should be around the dialog (80 at
         * the top and 80 at the bottom).
         *
         * 190px - the sum of the rest of the dialog elements (e.g., dialog title, dates, ...).
         */
        "max-h-[min(calc(100vh-160px-190px),350px)] overflow-y-auto",
        "scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent",
        { "mt-6": singleDay }
      )}
    >
      <Optional show={!!loading}>
        <div className="mt-[42px] mb-[72px] flex justify-center items-center">
          <Loading size="large" />
        </div>
      </Optional>

      <Optional show={!!error}>
        <div className="mt-[42px] mb-[72px] flex justify-center items-center">
          <LoadingError
            size="medium"
            error={intl("manage-schedule.manage-dialog.error.message")}
            retry={retry}
          />
        </div>
      </Optional>

      <Optional show={!loading && !error}>
        <div className="flex flex-col gap-2 overflow-y-auto scrollbar-thin w-full">
          {days.map(({ day, slots }) => {
            const iso = day.toISOString();
            const isDisabled = saving || day.isBefore(today, "day");

            return (
              <div className="flex gap-2" key={iso}>
                <Typography
                  tag="span"
                  className="inline-block shrink-0 text-natural-950 w-[76px] lg:w-[88px] font-medium text-tiny lg:text-caption py-1"
                >
                  {day.format("dddd M/D")}
                </Typography>

                <DaySlots
                  slots={slots}
                  iso={iso}
                  add={addSlot}
                  update={updateSlot}
                  remove={removeSlot}
                  disabled={isDisabled}
                />
              </div>
            );
          })}
        </div>
      </Optional>
    </div>
  );
};

const Actions: React.FC<{
  save: Void;
  saving?: boolean;
  disabled?: boolean;
  close: Void;
}> = ({ save, saving, disabled, close }) => {
  const intl = useFormatMessage();
  return (
    <div className="flex gap-6 mt-auto">
      <Button
        className="grow basis-1/2"
        onClick={save}
        size="large"
        disabled={disabled}
        loading={saving}
      >
        <Typography
          tag="span"
          className="text-natural-50 font-medium lg:font-semibold text-body"
        >
          {intl("manage-schedule.save")}
        </Typography>
      </Button>
      <Button
        onClick={close}
        variant="secondary"
        size="large"
        className="grow basis-1/2"
        disabled={saving}
      >
        <Typography
          tag="span"
          className="text-brand-700 font-medium lg:font-semibold text-body"
        >
          {intl("global.labels.cancel")}
        </Typography>
      </Button>
    </div>
  );
};
