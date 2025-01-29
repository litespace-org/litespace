import React, { useCallback, useMemo, useState } from "react";
import { Dialog } from "@/components/Dialog";
import { ILesson, IRule, Void } from "@litespace/types";
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
import { Schedule, splitRuleEvent, unpackRules } from "@litespace/utils/rule";
import dayjs from "@/lib/dayjs";
import { Dayjs } from "dayjs";
import { concat, flattenDeep, isEmpty } from "lodash";
import cn from "classnames";
import CalendarEmpty from "@litespace/assets/CalendarEmpty";
import { Loader } from "@/components/Loading";

const Loading: React.FC<{ tutorName: string | null }> = ({ tutorName }) => {
  const intl = useFormatMessage();
  return (
    <div className="tw-w-[628px] tw-flex tw-flex-col tw-justify-center tw-items-center tw-gap-8 tw-mt-[134px] tw-mb-[146px]">
      <Loader
        size="medium"
        text={
          tutorName
            ? intl("book-lesson.loading-rules", { tutor: tutorName })
            : undefined
        }
      />
    </div>
  );
};

const BusyTutor: React.FC<{ tutorName: string | null }> = ({ tutorName }) => {
  const intl = useFormatMessage();
  return (
    <div
      className={cn(
        "tw-flex tw-items-center tw-flex-col tw-w-[22rem] tw-gap-8 tw-justify-center tw-mx-auto tw-mt-[82px] tw-mb-[148px]"
      )}
    >
      <CalendarEmpty />
      <Typography
        element="subtitle-2"
        weight="bold"
        className="tw-text-brand-700 tw-text-center"
      >
        {tutorName
          ? intl("book-lesson.empty-slots", { tutor: tutorName })
          : null}
      </Typography>
    </div>
  );
};

const Animation: React.FC<{
  id?: Step | "loading" | "busy-tutor";
  children: React.ReactNode;
}> = ({ id, children }) => {
  const duration = useMemo(() => {
    if (id === "date-selection" || id === "loading" || id === "busy-tutor")
      return 0.5;
    return 0.4;
  }, [id]);

  return (
    <motion.div
      key={id}
      initial={{
        opacity: 0,
        height: 0,
      }}
      animate={{
        opacity: 1,
        height: "auto",
        transition: {
          duration,
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

export const BookLessonDialog: React.FC<{
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
  confirmationLoading?: boolean;
  rules: IRule.Self[];
  slots: IRule.Slot[];
  notice: number | null;
  onBook: ({
    ruleId,
    slotId,
    start,
    duration,
  }: {
    ruleId: number;
    slotId: number;
    start: string;
    duration: ILesson.Duration;
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
  loading,
  confirmationLoading,
}) => {
  const intl = useFormatMessage();
  const [step, setStep] = useState<Step>("date-selection");
  const [duration, setDuration] = useState<number>(15);
  const [start, setStart] = useState<string | null>(null);
  const [ruleId, setRuleId] = useState<number | null>(null);
  const [slotId, setSlotId] = useState<number | null>(null);
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
        slotId: event.id,
        start: event.start,
        end: event.end,
        bookable: dayjs(event.start).isAfter(
          dayjs().add(notice || 0, "minutes")
        ),
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
        slotId: slot.ruleId,
        start: slot.start,
        end: dayjs(slot.start).add(slot.duration, "minutes").toISOString(),
        bookable: false,
      }))
      .filter(
        (slot) => date.isSame(slot.start, "day") || date.isSame(slot.end, "day")
      );
    return Schedule.order(concat(daySlots, bookedSlots), "asc");
  }, [selectDaySlots, date, slots]);

  const isTutorBusy = useMemo(() => {
    return (
      isEmpty(unpackedRules) ||
      isEmpty(
        unpackedRules.filter((slot) =>
          dayjs(slot.start).isAfter(dayjs().add(notice || 0))
        )
      )
    );
  }, [notice, unpackedRules]);

  return (
    <Dialog
      open={open}
      close={close}
      title={
        <Typography
          className="tw-text-natural-950"
          element="subtitle-2"
          weight="bold"
          tag="div"
        >
          {name
            ? intl("book-lesson.title", { tutor: name })
            : intl("book-lesson.title.placeholder")}
        </Typography>
      }
      className="!tw-p-0 !tw-pt-6 !tw-pb-3 [&>div:first-child]:!tw-px-6"
    >
      {!loading ? (
        <div className="tw-mt-6 tw-px-6">
          <Stepper step={step} />
        </div>
      ) : null}

      <div className="tw-mt-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <Animation key="loading" id="loading">
              <Loading tutorName={name} />
            </Animation>
          ) : null}

          {isTutorBusy && !loading ? (
            <Animation key="busy-tutor" id="busy-tutor">
              <BusyTutor tutorName={name} />
            </Animation>
          ) : null}

          {step === "date-selection" && !loading && !isTutorBusy ? (
            <Animation key="date-selection" id="date-selection">
              <DateSelection
                min={dateBounds.min}
                max={dateBounds.max}
                selected={date}
                onSelect={setDate}
                isSelectable={isValidDate}
              />
            </Animation>
          ) : null}

          {!isTutorBusy && step === "duration-selection" && !loading ? (
            <Animation key="duration-selection" id="duration-selection">
              <div className="tw-px-6 tw-mt-8 tw-mb-[58px]">
                <DurationSelection value={duration} onChange={setDuration} />
              </div>
            </Animation>
          ) : null}

          {!isTutorBusy && step === "time-selection" && !loading ? (
            <Animation key="time-selection" id="time-selection">
              <TimeSelection
                slots={allSlots}
                start={start}
                ruleId={ruleId}
                slotId={ruleId}
                select={({ slotId, ruleId, start }) => {
                  setStart(start);
                  setRuleId(ruleId);
                  setSlotId(slotId);
                }}
              />
            </Animation>
          ) : null}

          {!isTutorBusy &&
          step === "confirmation" &&
          start &&
          ruleId &&
          slotId &&
          !loading ? (
            <Animation key="confimration" id="confirmation">
              <div className="tw-px-6">
                <Confirmation
                  tutorId={tutorId}
                  name={name}
                  imageUrl={imageUrl}
                  start={start}
                  confirmationLoading={confirmationLoading}
                  duration={duration}
                  onConfrim={() => onBook({ ruleId, slotId, start, duration })}
                  onEdit={() => {
                    setStep("date-selection");
                  }}
                />
              </div>
            </Animation>
          ) : null}
        </AnimatePresence>
      </div>

      {step !== "confirmation" && !loading && !isTutorBusy ? (
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
