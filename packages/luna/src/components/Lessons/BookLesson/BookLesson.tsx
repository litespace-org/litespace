import React, { useCallback, useMemo, useState } from "react";
import { Dialog } from "@/components/Dialog/V2";
import { IRule, Void } from "@litespace/types";
import { useFormatMessage } from "@/hooks";
import { Typography } from "@/components/Typography";
import { Stepper } from "@/components/Lessons/BookLesson/Stepper";
import { Step, AttributedSlot } from "@/components/Lessons/BookLesson/types";
import { DateSelection } from "@/components/Lessons/BookLesson/DateSelection";
import { DurationSelection } from "@/components/Lessons/BookLesson/DurationSelection";
import { TimeSelection } from "@/components/Lessons/BookLesson/TimeSelection";
import { Confirmation } from "@/components/Lessons/BookLesson/Confirmation";
import { Button, ButtonSize } from "@/components/Button";
import LongRightArrow from "@litespace/assets/LongRightArrow";
import LongLeftArrow from "@litespace/assets/LongLeftArrow";
import { AnimatePresence, motion } from "framer-motion";
import { Schedule, splitRuleEvent, unpackRules } from "@litespace/sol/rule";
import dayjs from "@/lib/dayjs";
import { Dayjs } from "dayjs";
import { concat, flattenDeep, isEmpty } from "lodash";
import cn from "classnames";

const Animation: React.FC<{ step: Step; children: React.ReactNode }> = ({
  step,
  children,
}) => {
  const duration = useMemo(() => {
    if (step === "date-selection" || step === "time-selection") return 0.5;
    return 0.4;
  }, [step]);

  const delay = useMemo(() => {
    if (step === "date-selection" || step === "time-selection") return 0.4;
    return 0.2;
  }, [step]);

  return (
    <motion.div
      key={step}
      initial={{
        opacity: 0,
        height: 0,
      }}
      animate={{
        opacity: 1,
        height: "auto",
        transition: {
          duration,
          delay,
          ease: "linear",
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

export const BookLesson: React.FC<{
  /**
   * Flag to show or hide the dialog
   */
  open: boolean;
  /**
   * Handler to close the dialog.
   */
  close: Void;
  tutorId: number;
  /**
   * Tutor name.
   */
  name: string | null;
  /**
   * Tutor image url.
   */
  imageUrl: string | null;
  loading?: boolean;
  rules: IRule.Self[];
  slots: IRule.Slot[];
  notice: number;
  onBook: (payload: {
    ruleId: number;
    start: string;
    duration: number;
  }) => void;
}> = ({
  open,
  close,
  tutorId,
  name,
  imageUrl,
  rules,
  slots,
  notice,
  onBook,
}) => {
  const intl = useFormatMessage();
  const [step, setStep] = useState<Step>("date-selection");
  const [duration, setDuration] = useState<number>(15);
  const [start, setStart] = useState<string | null>(null);
  const [ruleId, setRuleId] = useState<number | null>(null);
  const [date, setDate] = useState<Dayjs>(dayjs());

  const dateBounds = useMemo(() => {
    const min = dayjs();
    const max = dayjs().add(2, "months");
    return { min, max };
  }, []);

  const unpackedRules = useMemo(() => {
    return unpackRules({
      rules,
      slots,
      /**
       * ! update {@link unpackRules} logic and make `start` date inclusive.
       */
      start: dateBounds.min.subtract(1, "day").toISOString(),
      end: dateBounds.max.add(1, "day").toISOString(),
    });
  }, [dateBounds.max, dateBounds.min, rules, slots]);

  const selectDaySlots = useCallback(
    (day: Dayjs) => {
      const daySlots = unpackedRules.filter(
        (event) =>
          day.isSame(event.start, "day") || day.isSame(event.end, "day")
      );

      const unpackedSlots: AttributedSlot[] = flattenDeep(
        daySlots.map((rule) => splitRuleEvent(rule, duration))
      ).map((event) => ({
        ruleId: event.id,
        start: event.start,
        end: event.end,
        bookable: dayjs(event.start).isAfter(dayjs().add(notice, "minutes")),
      }));

      return unpackedSlots;
    },
    [duration, notice, unpackedRules]
  );

  /**
   * Date is considered valid incase it has at least one bookable (free) slot.
   */
  const isValidDate = useCallback(
    (date: Dayjs) =>
      !isEmpty(selectDaySlots(date).filter((slot) => slot.bookable)),
    [selectDaySlots]
  );

  /**
   * List of all slots including booked and not-yet-booked slots.
   */
  const allSlots = useMemo(() => {
    const daySlots = selectDaySlots(date);
    const bookedSlots: AttributedSlot[] = slots
      .map((slot) => ({
        ruleId: slot.ruleId,
        start: slot.start,
        end: dayjs(slot.start).add(slot.duration, "minutes").toISOString(),
        bookable: false,
      }))
      .filter(
        (slot) => date.isSame(slot.start, "day") || date.isSame(slot.end, "day")
      );
    return Schedule.order(concat(daySlots, bookedSlots), "asc");
  }, [selectDaySlots, date, slots]);

  return (
    <Dialog
      open={open}
      close={close}
      title={
        <Typography
          element="subtitle-2"
          weight="bold"
          className="tw-text-natural-950"
          tag="div"
        >
          {name
            ? intl("book-lesson.title", { tutor: name })
            : intl("book-lesson.title.placeholder")}
        </Typography>
      }
      className="!tw-p-0 !tw-pt-6 !tw-pb-3 [&>div:first-child]:!tw-px-6"
    >
      <div className="tw-mt-6 tw-px-6">
        <Stepper step={step} />
      </div>

      <div className="tw-mt-6">
        <AnimatePresence>
          {step === "date-selection" ? (
            <Animation step="date-selection">
              <DateSelection
                min={dateBounds.min}
                max={dateBounds.max}
                selected={date}
                onSelect={setDate}
                isSelectable={isValidDate}
              />
            </Animation>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {step === "duration-selection" ? (
            <Animation step="duration-selection">
              <div className="tw-px-6 tw-mt-8 tw-mb-[58px]">
                <DurationSelection value={duration} onChange={setDuration} />
              </div>
            </Animation>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {step === "time-selection" ? (
            <Animation step="time-selection">
              <TimeSelection
                slots={allSlots}
                start={start}
                ruleId={ruleId}
                select={({ ruleId, start }) => {
                  setStart(start);
                  setRuleId(ruleId);
                }}
              />
            </Animation>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {step === "confirmation" && start && ruleId ? (
            <Animation step="confirmation">
              <div className="tw-px-6">
                <Confirmation
                  tutorId={tutorId}
                  name={name}
                  imageUrl={imageUrl}
                  start={start}
                  duration={duration}
                  onConfrim={() => onBook({ ruleId, start, duration })}
                  onEdit={() => {
                    setStep("date-selection");
                  }}
                />
              </div>
            </Animation>
          ) : null}
        </AnimatePresence>
      </div>

      {step !== "confirmation" ? (
        <div className="tw-flex tw-flex-row tw-gap-6 tw-ms-auto tw-w-fit tw-mt-6 tw-px-6 tw-pb-3">
          {step !== "date-selection" ? (
            <Button
              startIcon={<LongRightArrow />}
              size={ButtonSize.Small}
              onClick={() => {
                if (step === "time-selection") setStep("duration-selection");
                if (step === "duration-selection") setStep("date-selection");
              }}
              className={cn({
                "tw-w-[128px]": step === "duration-selection",
              })}
            >
              {intl("book-lesson.steps.prev")}
            </Button>
          ) : null}

          <Button
            endIcon={<LongLeftArrow />}
            size={ButtonSize.Small}
            onClick={() => {
              if (step === "date-selection") setStep("duration-selection");
              if (step === "duration-selection") setStep("time-selection");
              if (step === "time-selection") setStep("confirmation");
            }}
            disabled={
              (step === "time-selection" && !start) || !isValidDate(date)
            }
            className={cn({
              "tw-w-[196px]": step === "date-selection",
              "tw-w-[128px]": step === "duration-selection",
            })}
          >
            {intl("book-lesson.steps.next")}
          </Button>
        </div>
      ) : null}
    </Dialog>
  );
};
