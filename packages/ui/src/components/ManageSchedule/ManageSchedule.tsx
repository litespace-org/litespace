import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { Loader, LoadingError } from "@/components/Loading";
import DaySlots from "@/components/ManageSchedule/DaySlots";
import { Slot } from "@/components/ManageSchedule/types";
import { Typography } from "@/components/Typography";
import dayjs from "@/lib/dayjs";
import ArrowLeft from "@litespace/assets/ArrowLeft";
import ArrowRight from "@litespace/assets/ArrowRight";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { IAvailabilitySlot, Void } from "@litespace/types";
import cn from "classnames";
import { concat, isEmpty, range, unionBy } from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const WEEK_DAYS = 7;

export type Props = {
  initialSlots: IAvailabilitySlot.Slot[];
  open: boolean;
  loading?: boolean;
  saving?: boolean;
  error?: boolean;
  retry: Void;
  date: string;
  nextWeek: Void;
  prevWeek: Void;
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

const Animate: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        height: 0,
      }}
      animate={{
        opacity: 1,
        height: "auto",
        transition: {
          type: "spring",
          stiffness: 900,
          damping: 40,
        },
      }}
      exit={{
        opacity: 0,
        height: 0,
      }}
    >
      {children}
    </motion.div>
  );
};

export const ManageSchedule: React.FC<Props> = ({
  date,
  open,
  loading,
  error,
  initialSlots,
  saving,
  singleDay,
  nextWeek,
  prevWeek,
  retry,
  save,
  close,
}) => {
  const intl = useFormatMessage();
  const [slots, setSlots] = useState<Slot[]>([]);
  const weekStart = useMemo(() => dayjs(date).startOf("week"), [date]);

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

  const isCurrentWeek = useMemo(
    () => today.isBetween(weekStart, weekStart.add(1, "week")),
    [weekStart, today]
  );

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
    ({ day, start, end }: { day: string; start?: string; end?: string }) => {
      const cloned = structuredClone(slots);
      const slot: Slot = {
        id: randomSlotId(),
        start: start || null,
        end: end || null,
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
    [setSlots, slots]
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
        final.push({ type: "create", start: slot.start, end: slot.end });

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
          tag="h1"
          className="text-natural-950 font-bold text-subtitle-2"
        >
          {intl(singleDay ? "manage-schedule.edit" : "manage-schedule.manage")}
        </Typography>
      }
      className="overflow-y-auto"
    >
      {!singleDay ? (
        <div className="pt-6">
          <div className="flex items-center justify-center gap-4">
            {!isCurrentWeek ? (
              <button
                type="button"
                onClick={prevWeek}
                disabled={loading}
                className="disabled:cursor-not-allowed disabled:opacity-50 w-6 h-6"
              >
                <ArrowRight className="[&>*]:stroke-brand-700" />
              </button>
            ) : null}
            <Typography
              tag="span"
              className="text-natural-950 text-body font-bold"
            >
              {weekStart.format("D MMMM")} -{" "}
              {weekStart.add(6, "days").format("D MMMM")}
            </Typography>
            <button
              type="button"
              onClick={nextWeek}
              disabled={loading}
              className="disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft className="[&>*]:stroke-brand-700" />
            </button>
          </div>
          <Typography
            tag="span"
            className="text-natural-950 mb-4 mt-6 font-bold text-body"
          >
            {intl("manage-schedule.manage-dialog.available-days")}
          </Typography>
        </div>
      ) : null}

      <div
        className={cn(
          "flex flex-col gap-4 mb-10",
          /**
           * 160px - the vertical space that should be around the dialog (80 at
           * the top and 80 at the bottom).
           *
           * 190px - the sum of the rest of the dialog elements (e.g., dialog title, dates, ...).
           */
          "max-h-[calc(100vh-160px-190px)] overflow-y-auto",
          "scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent",
          { "mt-6": singleDay }
        )}
      >
        <AnimatePresence initial={false} mode="wait">
          {loading ? (
            <Animate key="loading">
              <div className="w-[517px] mt-[42px] mb-[72px] flex justify-center items-center">
                <Loader
                  size="medium"
                  text={intl("manage-schedule.manage-dialog.loading.message")}
                />
              </div>
            </Animate>
          ) : null}

          {error ? (
            <Animate key="error">
              <div className="w-[342px] mx-[103px] mt-[42px] mb-[72px] flex justify-center items-center">
                <LoadingError
                  size="medium"
                  error={intl("manage-schedule.manage-dialog.error.message")}
                  retry={retry}
                />
              </div>
            </Animate>
          ) : null}

          {!loading && !error ? (
            <Animate key="days">
              <div className="flex flex-col gap-4 overflow-y-auto scrollbar-thin">
                {days.map(({ day, slots }) => {
                  const iso = day.toISOString();
                  const isDisabled = saving || day.isBefore(today, "day");

                  return (
                    <div className="flex gap-8" key={iso}>
                      <Typography
                        tag="span"
                        className="text-natural-950 w-[88px] font-medium text-caption"
                      >
                        {day.format("dddd M/D")}
                      </Typography>

                      <DaySlots
                        slots={isDisabled ? [] : slots}
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
            </Animate>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="flex gap-6 mt-auto">
        <Button
          className="grow basis-1/2"
          onClick={() => save(slotActions)}
          size="large"
          disabled={isEmpty(slotActions) || invalidSlots || saving}
          loading={saving}
        >
          <Typography
            tag="span"
            className="text-natural-50 font-semibold text-body"
          >
            {intl("manage-schedule.save")}
          </Typography>
        </Button>
        <Button
          onClick={onClose}
          variant="secondary"
          size="large"
          className="grow basis-1/2"
          disabled={saving}
        >
          <Typography
            tag="span"
            className="text-brand-700 font-semibold text-body"
          >
            {intl("global.labels.cancel")}
          </Typography>
        </Button>
      </div>
    </Dialog>
  );
};
