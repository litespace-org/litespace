import { Button, ButtonVariant } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { Loader, LoadingError } from "@/components/Loading";
import DaySlots from "@/components/ManageSchedule/DaySlots";
import { Slot } from "@/components/ManageSchedule/types";
import { Typography } from "@/components/Typography";
import dayjs from "@/lib/dayjs";
import ArrowLeft from "@litespace/assets/ArrowLeft";
import ArrowRight from "@litespace/assets/ArrowRight";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
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
      className="tw-overflow-hidden"
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
    return range(WEEK_DAYS).map((index) => {
      const day = weekStart.add(index, "day").startOf("day");
      const daySlots = slots.filter((slot) => day.isSame(slot.day, "day"));
      return { day, slots: daySlots };
    });
  }, [slots, weekStart]);

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
      final.push({ action: "delete", id: slot.id });
    }

    // NOTE: `unchnaged` slots are not added to the final slots actions.
    for (const slot of slots) {
      if (slot.state === "created" && slot.start && slot.end)
        final.push({ action: "create", start: slot.start, end: slot.end });

      if (slot.state === "updated" && slot.start && slot.end) {
        final.push({
          action: "update",
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
      close={close}
      title={<DialogTitle />}
      className="tw-overflow-y-auto"
    >
      <div className="tw-pt-6">
        <div className="tw-flex tw-items-center tw-justify-center tw-gap-4">
          <button
            type="button"
            onClick={prevWeek}
            disabled={loading}
            className="disabled:tw-cursor-not-allowed disabled:tw-opacity-50"
          >
            <ArrowRight className="[&>*]:tw-stroke-brand-700" />
          </button>
          <Typography
            element="body"
            weight="bold"
            className="tw-text-natural-950"
          >
            {weekStart.format("D MMMM")} -{" "}
            {weekStart.add(6, "days").format("D MMMM")}
          </Typography>
          <button
            type="button"
            onClick={nextWeek}
            disabled={loading}
            className="disabled:tw-cursor-not-allowed disabled:tw-opacity-50"
          >
            <ArrowLeft className="[&>*]:tw-stroke-brand-700" />
          </button>
        </div>
        <Typography
          element="body"
          weight="bold"
          className="tw-text-natural-950 tw-mb-4 tw-mt-6"
        >
          {intl("tutors.schedule.available-days")}
        </Typography>
      </div>

      <div
        className={cn(
          "tw-flex tw-flex-col tw-gap-4 tw-mb-10",
          /**
           * 160px - the vertical space that should be around the dialog (80 at
           * the top and 80 at the bottom).
           *
           * 190px - the sum of the rest of the dialog elements (e.g., dialog title, dates, ...).
           */
          "tw-max-h-[calc(100vh-160px-190px)] tw-overflow-y-auto",
          "tw-scrollbar-thin tw-scrollbar-thumb-neutral-200 tw-scrollbar-track-transparent"
        )}
      >
        <AnimatePresence initial={false} mode="wait">
          {loading ? (
            <Animate key="loading">
              <div className="tw-w-[517px] tw-mt-[42px] tw-mb-[72px] tw-flex tw-justify-center tw-items-center">
                <Loader
                  size="medium"
                  text={intl("tutors.schedule.loading.message")}
                />
              </div>
            </Animate>
          ) : null}

          {error ? (
            <Animate key="error">
              <div className="tw-w-[342px] tw-mx-[103px] tw-mt-[42px] tw-mb-[72px] tw-flex tw-justify-center tw-items-center">
                <LoadingError
                  size="medium"
                  error={intl("tutors.schedule.error.message")}
                  retry={retry}
                />
              </div>
            </Animate>
          ) : null}

          {!loading && !error ? (
            <Animate key="days">
              <div className="tw-flex tw-flex-col tw-gap-4">
                {days.map(({ day, slots }) => {
                  const iso = day.toISOString();
                  return (
                    <div className="tw-flex tw-gap-8" key={iso}>
                      <Typography
                        element="caption"
                        weight="medium"
                        className="tw-text-natural-950 tw-w-[88px]"
                      >
                        {day.format("dddd M/D")}
                      </Typography>

                      <DaySlots
                        slots={slots}
                        iso={iso}
                        add={addSlot}
                        update={updateSlot}
                        remove={removeSlot}
                        disabled={saving}
                      />
                    </div>
                  );
                })}
              </div>
            </Animate>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="tw-flex tw-gap-6 tw-mt-auto">
        <Button
          className="tw-grow tw-basis-1/2"
          onClick={() => save(slotActions)}
          disabled={isEmpty(slotActions) || invalidSlots || saving}
          loading={saving}
        >
          <Typography
            element="body"
            weight="semibold"
            className="tw-text-natural-50"
          >
            {intl("tutors.schedule.buttons.save")}
          </Typography>
        </Button>
        <Button
          onClick={close}
          variant={ButtonVariant.Secondary}
          className="tw-grow tw-basis-1/2"
          disabled={saving}
        >
          <Typography
            element="body"
            weight="semibold"
            className="text-brand-700"
          >
            {intl("global.labels.cancel")}
          </Typography>
        </Button>
      </div>
    </Dialog>
  );
};

const DialogTitle: React.FC = () => {
  const intl = useFormatMessage();
  return (
    <Typography
      element="subtitle-2"
      tag="div"
      weight="bold"
      className="tw-text-natural-950"
    >
      {intl("tutors.schedule.manage")}
    </Typography>
  );
};
